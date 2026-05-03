import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import images from "@/constants/images";
import { colors } from "@/constants/theme";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  const [ExpandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const { subscriptions, isHydrated, setSubscriptions } = useSubscriptions();
  const { user } = useUser();
  const userDisplayName =
    user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? "Subscriber";

  const { totalMonthly, totalYearly, upcomingSubscriptions } = useMemo(() => {
    const now = dayjs();

    const monthlySubscriptions = subscriptions.filter(
      ({ billing }) => billing?.toLowerCase() === "monthly",
    );
    const yearlySubscriptions = subscriptions.filter(({ billing }) => billing?.toLowerCase() === "yearly");

    const computedUpcoming = subscriptions
      .filter(({ renewalDate, status }) => {
        if (!renewalDate || status?.toLowerCase() === "cancelled") return false;
        const parsedRenewal = dayjs(renewalDate);
        return parsedRenewal.isValid() && !parsedRenewal.isBefore(now, "day");
      })
      .map((subscription) => {
        const renewal = dayjs(subscription.renewalDate);
        return {
          id: subscription.id,
          icon: subscription.icon,
          name: subscription.name,
          price: subscription.price,
          currency: subscription.currency,
          daysLeft: renewal.diff(now, "day"),
          color: subscription.color,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10);

    return {
      totalMonthly: monthlySubscriptions.reduce((sum, { price }) => sum + price, 0),
      totalYearly: yearlySubscriptions.reduce((sum, { price }) => sum + price, 0),
      upcomingSubscriptions: computedUpcoming,
    };
  }, [subscriptions]);

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
          ListHeaderComponent = { () => (
            <>
              <View className = "home-header">
                <View className = "home-user">
                  <Image source = {images.avatar} className = "home-avatar" />
                  <Text className = "home-user-name">{userDisplayName}</Text>
                </View>
              </View>

              <View className = "home-balance-card" style={{ backgroundColor: "#3b82f6" }}>
                <Text className = "home-balance-label">Total Expenditure</Text>
                <Text className = "home-balance-amount">{formatCurrency(totalMonthly)} / month</Text>
                <Text className = "home-balance-date">{formatCurrency(totalYearly)} / year</Text>
              </View>
      
              <View className = "mb-5">
                <ListHeading title = "Upcoming Subscriptions" />
                <FlatList 
                data = {upcomingSubscriptions} 
                renderItem = {({item}) => <UpcomingSubscriptionCard {... item} />} 
                keyExtractor={(item) => item.id}
                horizontal 
                showsHorizontalScrollIndicator = {false}
                ListEmptyComponent = {() => <Text className = "home-empty-state">No upcoming renewals</Text>}
                />
              </View>

              <ListHeading
                title="Active Subscriptions"
                actionLabel="+"
                onActionPress={() => setCreateModalVisible(true)}
              />
            </>
          )
          
          }
          data = {subscriptions} 
          keyExtractor={(item) => item.id}
          renderItem = {({item}) => (
            <SubscriptionCard {... item} expanded = {ExpandedSubscriptionId === item.id} 
            onPress = {() => setExpandedSubscriptionId((currentId) => currentId === item.id ? null : item.id)}
            onDelete={() => {
              setSubscriptions((current) => current.filter((subscription) => subscription.id !== item.id));
              setExpandedSubscriptionId((currentId) => (currentId === item.id ? null : currentId));
            }}
            />
          )}
          extraData = {ExpandedSubscriptionId}
          ItemSeparatorComponent = {() => <View className = "h-4" />}
          showsVerticalScrollIndicator = {false}
          ListEmptyComponent = {() => <Text className = "home-empty-state">No subscriptions found</Text>}
        />

      <CreateSubscriptionModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={(newSubscription) => {
          setSubscriptions((current) => [newSubscription, ...current]);
          setExpandedSubscriptionId(newSubscription.id);
        }}
      />
    </SafeAreaView>
  );
}

