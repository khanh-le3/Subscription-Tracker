
import { Text, View, StyleSheet } from "react-native";
import {styled} from "nativewind";
import { Link } from "expo-router";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView as SafeAreaViewRN } from "react-native-safe-area-context";

const SafeAreaView = styled(SafeAreaViewRN);
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background  ">
      <Text className="text-5xl font-bold text-blue-500">
        HomePage
      </Text>

      <Link href="./onboarding" className="mt-4 font-sans-bold rounded bg-primary text-white p-4">
        Go to Onboarding
      </Link>

      <Link href="./(auth)/sign_in" className="mt-4 font-sans-bold rounded bg-primary text-white p-4">
        Go to Sign In
      </Link>
      
      <Link href="./(auth)/sign_up" className="mt-4 font-sans-bold rounded bg-primary text-white  p-4">
        Go to Sign Up
      </Link>

      
    </SafeAreaView>
  );
}

