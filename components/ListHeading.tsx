import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

const ListHeading = ({ title, actionLabel, onActionPress }: ListHeadingProps) => {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      {actionLabel && onActionPress ? (
        <TouchableOpacity className="list-action" onPress={onActionPress}>
          <Text className="list-action-text">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default ListHeading;