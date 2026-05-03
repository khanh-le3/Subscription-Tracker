import React, { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SubscriptionCard from "@/components/SubscriptionCard";
import { colors } from "@/constants/theme";
import { useSubscriptions } from "@/context/SubscriptionsContext";

const Subscriptions = () => {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { subscriptions, isHydrated, setSubscriptions } = useSubscriptions();

  const filteredSubscriptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return subscriptions;

    return subscriptions.filter(({ name, category, plan }) => {
      return (
        name.toLowerCase().includes(trimmed) ||
        category?.toLowerCase().includes(trimmed) ||
        plan?.toLowerCase().includes(trimmed)
      );
    });
  }, [query, subscriptions]);

  if (!isHydrated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      <FlatList
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View className="pt-2 pb-4 gap-4">
            <View>
              <Text className="text-3xl font-sans-extrabold text-foreground">
                Subscriptions
              </Text>
              <Text className="mt-1.5 text-base font-sans-medium text-muted-foreground">
                {subscriptions.length} total · {filteredSubscriptions.length} shown
              </Text>
            </View>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name, category, or plan"
              placeholderTextColor="rgba(0,0,0,0.4)"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              clearButtonMode="while-editing"
              className="rounded-2xl border border-ink/10 bg-card px-4 py-4 text-base font-sans-medium text-ink"
              selectionColor={colors.accent}
            />
          </View>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedId === item.id}
            onPress={() =>
              setExpandedId((current) => (current === item.id ? null : item.id))
            }
            onDelete={() => {
              setSubscriptions((current) => current.filter((subscription) => subscription.id !== item.id));
              setExpandedId((current) => (current === item.id ? null : current));
            }}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        extraData={expandedId}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text className="home-empty-state">
            No subscriptions match &ldquo;{query}&rdquo;.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
