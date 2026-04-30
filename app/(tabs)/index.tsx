
import { Image, Text, View, StyleSheet } from "react-native";
import {styled} from "nativewind";
import { Link } from "expo-router";
import images from "@/constants/images";
import { HOME_USER } from "@/constants/data";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView as SafeAreaViewRN } from "react-native-safe-area-context";
import { icons } from "@/constants/icon";
import { formatCurrency } from "@/lib/utils";
import { HOME_BALANCE } from "@/constants/data";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import { FlatList } from "react-native";  
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import SubscriptionCard from "@/components/SubscriptionCard";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { useState } from "react";

const SafeAreaView = styled(SafeAreaViewRN);

export default function App() {
  const [ExpandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-background  ">
        <FlatList 
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          ListHeaderComponent = { () => (
            <>
              <View className = "home-header">
                <View className = "home-user">
                  <Image source = {images.avatar} className = "home-avatar" />
                  <Text className = "home-user-name">{HOME_USER.name}</Text>
                </View>
                <Image source = {icons.add} className = "home-add-icon" />
              </View>

              <View className = "home-balance-card">
                <Text className = "home-balance-label">Your Balance</Text>
                <View className = "home-balance-row">
                  <Text className = "home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                  <Text className = "home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format("MMM D, YYYY")}</Text>
                </View> 
              </View>
      
              <View className = "mb-5">
                <ListHeading title = "Upcoming Subscriptions" />
                <FlatList 
                data = {UPCOMING_SUBSCRIPTIONS} 
                renderItem = {({item}) => <UpcomingSubscriptionCard {... item} />} 
                keyExtractor={(item) => item.id}
                horizontal 
                showsHorizontalScrollIndicator = {false}
                ListEmptyComponent = {() => <Text className = "home-empty-state">No upcoming renewals</Text>}
                />
              </View>

              <ListHeading title = "All Subscriptions" />
            </>
          )
          
          }
          data = {HOME_SUBSCRIPTIONS} 
          keyExtractor={(item) => item.id}
          renderItem = {({item}) => (
            <SubscriptionCard {... item} expanded = {ExpandedSubscriptionId === item.id} 
            onPress = {() => setExpandedSubscriptionId((currentId) => currentId === item.id ? null : item.id)} />
          )}
          extraData = {ExpandedSubscriptionId}
          ItemSeparatorComponent = {() => <View className = "h-4" />}
          showsVerticalScrollIndicator = {false}
          ListEmptyComponent = {() => <Text className = "home-empty-state">No subscriptions found</Text>}
        />
    </SafeAreaView>
  );
}

