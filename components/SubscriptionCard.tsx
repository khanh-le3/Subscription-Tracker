import { View, Text } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from "@/lib/utils";
import clsx from "clsx";
import { Pressable } from "react-native";


const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  renewalDate,
  category,
  plan,
  onPress,
  onDelete,
  expanded,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image
            source={typeof icon === "string" ? { uri: icon } : icon}
            style={{ width: 64, height: 64, borderRadius: 8 }}
            contentFit="contain"
          />
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() || plan?.trim() || (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Payment:</Text>
                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                  {paymentMethod?.trim()}
                </Text>
              </View>
            </View>

            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Category:</Text>
                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                  {category?.trim() || plan?.trim()}
                </Text>
              </View>
            </View>

            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Start Date:</Text>
                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                  {startDate ? formatSubscriptionDateTime(startDate) : ""}
                </Text>
              </View>
            </View>

            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Renewal Date:</Text>
                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                  {renewalDate ? formatSubscriptionDateTime(renewalDate) : ""}
                </Text>
              </View>
            </View>

            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Status:</Text>
                <Text className="sub-value" numberOfLines={1} ellipsizeMode="tail">
                  {status ? formatStatusLabel(status) : ""}
                </Text>
              </View>
            </View>

            {onDelete ? (
              <Pressable
                className="sub-cancel"
                onPress={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                <Text className="sub-cancel-text">Delete Subscription</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;