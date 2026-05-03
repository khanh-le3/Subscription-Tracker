import { getSubscriptionIconSource } from "@/lib/brandIcons";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { colors } from "@/constants/theme";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type BillingFrequency = "Monthly" | "Yearly";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
}

const CATEGORY_OPTIONS = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<(typeof CATEGORY_OPTIONS)[number], string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#f3d9fa",
  Cloud: "#c7d2fe",
  Music: "#fecdd3",
  Other: "#d1d5db",
};

const parseDdMmYyyyDate = (value: string) => {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  const parsedDate = dayjs(`${year}-${month}-${day}`);

  // Reject invalid calendar dates (e.g. 31/02/2026).
  if (!parsedDate.isValid() || parsedDate.format("DD/MM/YYYY") !== `${day}/${month}/${year}`) {
    return null;
  }

  return parsedDate;
};

const CreateSubscriptionModal = ({ visible, onClose, onCreate }: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [startDateInput, setStartDateInput] = useState(dayjs().format("DD/MM/YYYY"));
  const [frequency, setFrequency] = useState<BillingFrequency>("Monthly");
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>("Entertainment");
  const [nameError, setNameError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [startDateError, setStartDateError] = useState("");

  const resetForm = () => {
    setName("");
    setPrice("");
    setStartDateInput(dayjs().format("DD/MM/YYYY"));
    setFrequency("Monthly");
    setCategory("Entertainment");
    setNameError("");
    setPriceError("");
    setStartDateError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const submitDisabled = useMemo(() => {
    const parsed = Number.parseFloat(price);
    const parsedStartDate = parseDdMmYyyyDate(startDateInput);
    return !name.trim() || !Number.isFinite(parsed) || parsed <= 0 || !parsedStartDate;
  }, [name, price, startDateInput]);

  const handleCreate = () => {
    const parsedPrice = Number.parseFloat(price);
    const trimmedName = name.trim();
    const parsedStartDate = parseDdMmYyyyDate(startDateInput);

    let valid = true;
    setNameError("");
    setPriceError("");
    setStartDateError("");

    if (!trimmedName) {
      setNameError("Name is required.");
      valid = false;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setPriceError("Enter a valid price greater than zero.");
      valid = false;
    }

    if (!parsedStartDate) {
      setStartDateError("Enter a valid start date (DD/MM/YYYY).");
      valid = false;
    }

    if (!valid) return;

    const validatedStartDate = parsedStartDate as dayjs.Dayjs;
    const startDate = validatedStartDate.toISOString();
    const renewalDate = validatedStartDate
      .add(1, frequency === "Monthly" ? "month" : "year")
      .toISOString();

    const newSubscription: Subscription = {
      id: `${trimmedName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      name: trimmedName,
      icon: getSubscriptionIconSource(trimmedName),
      price: parsedPrice,
      plan: `${frequency} Plan`,
      category,
      paymentMethod: "Card on file",
      status: "active",
      startDate,
      renewalDate,
      billing: frequency,
      frequency,
      currency: "USD",
      color: CATEGORY_COLORS[category],
    };

    onCreate(newSubscription);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        className="modal-overlay"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable className="flex-1" onPress={handleClose} />

        <View className="modal-container">
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable onPress={handleClose} className="modal-close">
              <Text className="modal-close-text">x</Text>
            </Pressable>
          </View>

          <View className="modal-body">
            <View className="auth-field">
              <Text className="auth-label" style={{ color: colors.foreground }}>
                Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Spotify"
                placeholderTextColor="rgba(0, 0, 0, 0.35)"
                style={{ color: colors.ink }}
                className={clsx("auth-input", nameError && "auth-input-error")}
              />
              {nameError ? <Text className="auth-error">{nameError}</Text> : null}
            </View>

            <View className="auth-field">
              <Text className="auth-label" style={{ color: colors.foreground }}>
                Price
              </Text>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor="rgba(0, 0, 0, 0.35)"
                style={{ color: colors.ink }}
                keyboardType="decimal-pad"
                className={clsx("auth-input", priceError && "auth-input-error")}
              />
              {priceError ? <Text className="auth-error">{priceError}</Text> : null}
            </View>

            <View className="auth-field">
              <Text className="auth-label" style={{ color: colors.foreground }}>
                Start Date
              </Text>
              <TextInput
                value={startDateInput}
                onChangeText={setStartDateInput}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="rgba(0, 0, 0, 0.35)"
                style={{ color: colors.ink }}
                className={clsx("auth-input", startDateError && "auth-input-error")}
              />
              {startDateError ? <Text className="auth-error">{startDateError}</Text> : null}
            </View>

            <View className="auth-field">
              <Text className="auth-label" style={{ color: colors.foreground }}>
                Frequency
              </Text>
              <View className="picker-row">
                {(["Monthly", "Yearly"] as const).map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setFrequency(option)}
                    className={clsx("picker-option", frequency === option && "picker-option-active")}
                  >
                    <Text
                      className={clsx(
                        "picker-option-text",
                        frequency === option && "picker-option-text-active",
                      )}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="auth-field">
              <Text className="auth-label" style={{ color: colors.foreground }}>
                Category
              </Text>
              <View className="category-scroll">
                {CATEGORY_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setCategory(option)}
                    className={clsx("category-chip", category === option && "category-chip-active")}
                  >
                    <Text
                      className={clsx(
                        "category-chip-text",
                        category === option && "category-chip-text-active",
                      )}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleCreate}
              disabled={submitDisabled}
              className={clsx("auth-button", submitDisabled && "auth-button-disabled")}
            >
              <Text className="auth-button-text">Create Subscription</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
