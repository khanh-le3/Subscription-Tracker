import { useAuth, useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_NUMBER = /\d/;

const COLORS = {
  background: "#fff9e3",
  card: "#fff8e7",
  primary: "#081126",
  accent: "#ea7a53",
  border: "rgba(0, 0, 0, 0.1)",
  muted: "rgba(0, 0, 0, 0.6)",
  destructive: "#dc2626",
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "errors" in error &&
    Array.isArray((error as { errors?: unknown[] }).errors) &&
    (error as { errors: { longMessage?: string; message?: string }[] }).errors[0]
  ) {
    const firstError = (error as { errors: { longMessage?: string; message?: string }[] }).errors[0];
    return firstError.longMessage || firstError.message || fallback;
  }

  return fallback;
};

export default function SignUp() {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace("/(tabs)" as Href);
    }
  }, [authLoaded, isSignedIn, router]);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [codeError, setCodeError] = useState("");

  const isSubmitting = fetchStatus === "fetching";
  const requiresVerification =
    signUp?.status === "missing_requirements" &&
    signUp?.unverifiedFields?.includes("email_address") &&
    signUp?.missingFields?.length === 0;

  const canSubmitRegistration = useMemo(() => {
    return Boolean(emailAddress.trim() && password && confirmPassword && !isSubmitting);
  }, [emailAddress, password, confirmPassword, isSubmitting]);

  const canSubmitCode = useMemo(() => {
    return Boolean(code.trim() && !isSubmitting);
  }, [code, isSubmitting]);

  const navigateToApp = async () => {
    try {
      await signUp?.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/(tabs)");
          if (typeof window !== "undefined" && url.startsWith("http")) {
            window.location.href = url;
            return;
          }
          router.replace(url as Href);
        },
      });
    } finally {
      router.replace("/(tabs)" as Href);
    }
  };

  const validateRegistration = (): boolean => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!emailAddress.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!EMAIL_REGEX.test(emailAddress.trim().toLowerCase())) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else if (!HAS_UPPERCASE.test(password) || !HAS_LOWERCASE.test(password) || !HAS_NUMBER.test(password)) {
      setPasswordError("Use uppercase, lowercase, and a number for stronger security.");
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      valid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    }

    return valid;
  };

  const validateCode = (): boolean => {
    setCodeError("");
    if (!/^\d{6}$/.test(code.trim())) {
      setCodeError("Enter the 6-digit code from your email.");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!signUp || !validateRegistration()) return;

    setSubmitError("");

    try {
      const { error } = await signUp.password({
        emailAddress: emailAddress.trim().toLowerCase(),
        password,
      });

      if (error) {
        setSubmitError(getErrorMessage(error, "Account creation failed. Please try again."));
        return;
      }

      await signUp.verifications.sendEmailCode();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Unable to create your account right now."));
    }
  };

  const handleVerify = async () => {
    if (!signUp || !validateCode()) return;

    setSubmitError("");

    try {
      await signUp.verifications.verifyEmailCode({ code: code.trim() });

      if (signUp.status === "complete") {
        await navigateToApp();
        return;
      }

      setSubmitError("Verification is not complete yet. Please request a new code.");
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Could not verify code. Please try again."));
    }
  };

  const handleResendCode = async () => {
    if (!signUp || isSubmitting) return;
    setSubmitError("");
    try {
      await signUp.verifications.sendEmailCode();
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Unable to resend code right now."));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 28,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: COLORS.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: COLORS.background, fontSize: 24, fontWeight: "800" }}>S</Text>
              </View>
              <View>
                <Text style={{ color: COLORS.primary, fontSize: 28, fontWeight: "800" }}>
                  SubManager
                </Text>
                <Text
                  style={{
                    color: COLORS.muted,
                    fontSize: 11,
                    fontWeight: "600",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginTop: -2,
                  }}
                >
                  Subscription Intelligence
                </Text>
              </View>
            </View>

            <Text style={{ color: COLORS.primary, fontSize: 28, fontWeight: "700" }}>
              {requiresVerification ? "Verify your email" : "Create your account"}
            </Text>
            <Text
              style={{
                color: COLORS.muted,
                fontSize: 15,
                fontWeight: "500",
                textAlign: "center",
                marginTop: 8,
                maxWidth: 320,
              }}
            >
              {requiresVerification
                ? "We sent a code to your inbox. Enter it below to activate your account."
                : "Set up secure access to track every subscription and protect your monthly budget."}
            </Text>
          </View>

          <View
            style={{
              marginTop: 32,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: COLORS.border,
              backgroundColor: COLORS.card,
              padding: 20,
            }}
          >
            {requiresVerification ? (
              <View style={{ gap: 16 }}>
                <View style={{ gap: 8 }}>
                  <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: "600" }}>
                    Verification code
                  </Text>
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="rgba(0, 0, 0, 0.35)"
                    keyboardType="number-pad"
                    maxLength={6}
                    autoComplete="one-time-code"
                    style={[styles.input, codeError ? styles.inputError : null]}
                  />
                  {codeError ? <Text style={styles.errorText}>{codeError}</Text> : null}
                </View>

                {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

                <Pressable
                  onPress={handleVerify}
                  disabled={!canSubmitCode}
                  style={[styles.primaryButton, !canSubmitCode ? styles.primaryButtonDisabled : null]}
                >
                  <Text style={styles.primaryButtonText}>
                    {isSubmitting ? "Verifying..." : "Verify and continue"}
                  </Text>
                </Pressable>

                <Pressable onPress={handleResendCode} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Resend code</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                <View style={{ gap: 8 }}>
                  <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: "600" }}>
                    Email
                  </Text>
                  <TextInput
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="you@company.com"
                    placeholderTextColor="rgba(0, 0, 0, 0.35)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    style={[styles.input, emailError ? styles.inputError : null]}
                  />
                  {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                </View>

                <View style={{ gap: 8 }}>
                  <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: "600" }}>
                    Password
                  </Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 8 characters"
                    placeholderTextColor="rgba(0, 0, 0, 0.35)"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    style={[styles.input, passwordError ? styles.inputError : null]}
                  />
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                  <Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: "500" }}>
                    Include uppercase, lowercase, and a number for better account security.
                  </Text>
                </View>

                <View style={{ gap: 8 }}>
                  <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: "600" }}>
                    Confirm password
                  </Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter your password"
                    placeholderTextColor="rgba(0, 0, 0, 0.35)"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[styles.input, confirmPasswordError ? styles.inputError : null]}
                  />
                  {confirmPasswordError ? (
                    <Text style={styles.errorText}>{confirmPasswordError}</Text>
                  ) : null}
                </View>

                {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

                <Pressable
                  onPress={handleSignUp}
                  disabled={!canSubmitRegistration}
                  style={[
                    styles.primaryButton,
                    !canSubmitRegistration ? styles.primaryButtonDisabled : null,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Text>
                </Pressable>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                marginTop: 20,
              }}
            >
              <Text style={{ color: COLORS.muted, fontSize: 14 }}>Already have an account?</Text>
              <Link href="/(auth)/sign_in" asChild>
                <Pressable>
                  <Text style={{ color: COLORS.accent, fontSize: 14, fontWeight: "700" }}>
                    Sign in
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.destructive,
  },
  errorText: {
    color: COLORS.destructive,
    fontSize: 12,
    fontWeight: "500" as const,
  },
  primaryButton: {
    marginTop: 4,
    alignItems: "center" as const,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
  },
  primaryButtonDisabled: {
    backgroundColor: "rgba(234, 122, 83, 0.45)",
  },
  primaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700" as const,
  },
  secondaryButton: {
    alignItems: "center" as const,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(234, 122, 83, 0.3)",
    backgroundColor: "rgba(234, 122, 83, 0.1)",
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: "600" as const,
  },
};
