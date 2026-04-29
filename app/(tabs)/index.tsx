
import { Text, View, StyleSheet } from "react-native";
import {styled} from "nativewind";
import { Link } from "expo-router";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView as SafeAreaViewRN } from "react-native-safe-area-context";

const SafeAreaView = styled(SafeAreaViewRN);
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background ">
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Nativewind!
      </Text>

      <Link href="./onboarding" className="mt-4 rounded bg-primary text-blue-500 p-4">
        <Text className="mt-4 rounded bg-primary text-blue-500 p-4">Go to Onboarding</Text>
      </Link>

      <Link href="./(auth)/sign_in" className="mt-4 rounded bg-primary text-blue-500  p-4">
        <Text className="mt-4 rounded bg-primary text-blue-500 p-4">Go to Sign In</Text>
      </Link>
      
      <Link href="./(auth)/sign_up" className="mt-4 rounded bg-primary text-blue-500  p-4">
        <Text className="mt-4 rounded bg-primary text-blue-500 p-4">Go to Sign Up</Text>
      </Link>

      <Link href="./subscription/spotify" className="mt-4 rounded bg-primary text-blue-500  p-4">
        <Text className="mt-4 rounded bg-primary text-blue-500  p-4">Spotify Subscription </Text>
      </Link>
      <Link href = {{
        pathname: "./subscriptions/[id]",
        params: { id: "claude" },
      }}>
        Claude Max Subscription
      </Link>
    </SafeAreaView>
  );
}

