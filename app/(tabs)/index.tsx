
import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background ">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>

      <Link href="./onboarding">
        <Text className="mt-4 rounded bg-primary text-blue-500 underline p-4">Go to Onboarding</Text>
      </Link>

      <Link href="./(auth)/sign_in" className="mt-4 rounded text-blue-500 underline p-4">
        Go to Sign In
      </Link>
      
      <Link href="./(auth)/sign_up" className="mt-4 rounded text-blue-500 underline p-4">
        Go to Sign Up
      </Link>

      <Link href="./subscription/spotify">
        Spotify Subscription
      </Link>
      <Link href = {{
        pathname: "./subscriptions/[id]",
        params: { id: "claude" },
      }}>
        Claude Max Subscription
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});