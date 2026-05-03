import { View, Text } from "react-native";
import React from "react";
import { formatCurrency } from "@/lib/utils";
import { Image } from "expo-image";


const UpcomingSubscriptionCard = ({
  name,
  icon,
  price,
  currency,
  daysLeft,
  color,
}: UpcomingSubscriptionCardProps) => {
  return (
    <View className="upcoming-card" style={color ? { backgroundColor: color } : undefined}>
      <View className="upcoming-row">
        <Image
          source={typeof icon === "string" ? { uri: icon } : icon}
          style={{ width: 56, height: 56, borderRadius: 8 }}
          contentFit="contain"
        />

        <View>
          <Text className="upcoming-price">{formatCurrency(price, currency)}</Text>
          <Text className="upcoming-meta">{daysLeft} days left</Text>
        </View>
      </View>

      <Text className="upcoming-name" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};

export default UpcomingSubscriptionCard;