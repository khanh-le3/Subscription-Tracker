import { useAuth, useClerk, useSignIn } from "@clerk/expo";
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

const COLORS = {
  background: "#202020",
  card: "#fff8e7",
  primary: "#f5f5f7",
  accent: "#ea7a53",
  border: "rgba(255, 255, 255, 0.12)",
  muted: "rgba(255, 255, 255, 0.6)",
  destructive: "#dc2626",
  ink: "#081126",
  cardText: "#081126",
  cardMuted: "rgba(0, 0, 0, 0.6)",
  cardBorder: "rgba(0, 0, 0, 0.1)",
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

export default function SignIn() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace("/(tabs)" as Href);
    }
  }, [authLoaded, isSignedIn, router]);

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [codeError, setCodeError] = useState("");

  const isSubmitting = fetchStatus === "fetching";
  const needsEmailCode = signIn?.status === "needs_client_trust";

  const canSubmitCredentials = useMemo(() => {
    return Boolean(emailAddress.trim() && password && !isSubmitting);
  }, [emailAddress, password, isSubmitting]);

  const canSubmitCode = useMemo(() => {
    return Boolean(code.trim() && !isSubmitting);
  }, [code, isSubmitting]);

  const navigateToApp = async () => {
    try {
      await signIn?.finalize({
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

  const validateCredentials = (): boolean => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

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
    }

    return valid;
  };

  const validateCode = (): boolean => {
    setCodeError("");
    if (!/^\d{6}$/.test(code.trim())) {
      setCodeError("Enter the 6-digit verification code.");
      return false;
    }
    return true;
  };

  const isSessionExistsError = (error: unknown): boolean => {
    if (typeof error !== "object" || error === null) return false;
    const errors = (error as { errors?: { code?: string; message?: string }[] }).errors;
    if (!Array.isArray(errors)) return false;
    return errors.some(
      (e) =>
        e?.code === "session_exists" ||
        (typeof e?.message === "string" && e.message.toLowerCase().includes("already signed in")),
    );
  };

  const handleSignIn = async () => {
    if (!signIn || !validateCredentials()) return;

    if (isSignedIn) {
      router.replace("/(tabs)" as Href);
      return;
    }

    setSubmitError("");

    try {
      const { error } = await signIn.password({
        emailAddress: emailAddress.trim().toLowerCase(),
        password,
      });

      if (error) {
        if (isSessionExistsError(error)) {
          router.replace("/(tabs)" as Href);
          return;
        }
        setSubmitError(getErrorMessage(error, "Sign in failed. Please try again."));
        return;
      }

      if (signIn.status === "complete") {
        await navigateToApp();
        return;
      }

      if (signIn.status === "needs_client_trust") {
        await signIn.mfa.sendEmailCode();
        return;
      }

      setSubmitError("Additional verification is required. Please follow the prompts.");
    } catch (error) {
      if (isSessionExistsError(error)) {
        router.replace("/(tabs)" as Href);
        return;
      }
      setSubmitError(getErrorMessage(error, "Unable to sign in right now. Please try again."));
    }
  };

  const handleSignOutAndRetry = async () => {
    try {
      await signOut();
      setSubmitError("");
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Unable to sign out. Please try again."));
    }
  };

  const handleVerifyCode = async () => {
    if (!signIn || !validateCode()) return;

    setSubmitError("");

    try {
      await signIn.mfa.verifyEmailCode({ code: code.trim() });

      if (signIn.status === "complete") {
        await navigateToApp();
        return;
      }

      setSubmitError("Verification is not complete yet. Request a new code and retry.");
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Could not verify code. Please try again."));
    }
  };

  const handleResendCode = async () => {
    if (!signIn || isSubmitting) return;
    setSubmitError("");
    try {
      await signIn.mfa.sendEmailCode();
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
              {needsEmailCode ? "Check your inbox" : "Welcome back"}
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
              {needsEmailCode
                ? "Enter the verification code sent to your email to finish signing in."
                : "Sign in to manage renewals, control spend, and stay ahead of every charge."}
            </Text>
          </View>

          <View
            style={{
              marginTop: 32,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: COLORS.cardBorder,
              backgroundColor: COLORS.card,
              padding: 20,
            }}
          >
            {isSignedIn ? (
              <View style={{ gap: 16 }}>
                <Text style={{ color: COLORS.cardText, fontSize: 16, fontWeight: "600" }}>
                  You are already signed in.
                </Text>
                <Text style={{ color: COLORS.cardMuted, fontSize: 14 }}>
                  Continue to the app or sign out to use a different account.
                </Text>
                <Pressable
                  onPress={() => router.replace("/(tabs)" as Href)}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Continue to app</Text>
                </Pressable>
                <Pressable onPress={handleSignOutAndRetry} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Sign out</Text>
                </Pressable>
              </View>
            ) : needsEmailCode ? (
              <View style={{ gap: 16 }}>
                <View style={{ gap: 8 }}>
                  <Text style={{ color: COLORS.cardText, fontSize: 14, fontWeight: "600" }}>
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
                  onPress={handleVerifyCode}
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

                <Pressable onPress={() => signIn?.reset()} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Start over</Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                <View style={{ gap: 8 }}>
                  <Text style={{ color: COLORS.cardText, fontSize: 14, fontWeight: "600" }}>
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
                  <Text style={{ color: COLORS.cardText, fontSize: 14, fontWeight: "600" }}>
                    Password
                  </Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(0, 0, 0, 0.35)"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    style={[styles.input, passwordError ? styles.inputError : null]}
                  />
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

                <Pressable
                  onPress={handleSignIn}
                  disabled={!canSubmitCredentials}
                  style={[
                    styles.primaryButton,
                    !canSubmitCredentials ? styles.primaryButtonDisabled : null,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {isSubmitting ? "Signing in..." : "Sign in"}
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
              <Text style={{ color: COLORS.muted, fontSize: 14 }}>New to SubManager?</Text>
              <Link href="/(auth)/sign_up" asChild>
                <Pressable>
                  <Text style={{ color: COLORS.accent, fontSize: 14, fontWeight: "700" }}>
                    Create account
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
    borderColor: COLORS.cardBorder,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.cardText,
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
    color: COLORS.ink,
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
