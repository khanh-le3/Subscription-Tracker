import { useClerk, useUser } from "@clerk/expo";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ backgroundColor: colors.background }}>
      <View className="px-5 pt-6 gap-6">
        <View>
          <Text className="text-3xl font-sans-extrabold text-foreground">Settings</Text>
          <Text className="mt-1.5 text-base font-sans-medium text-muted-foreground">
            Manage your account and session.
          </Text>
        </View>

        <View className="rounded-3xl border border-ink/10 bg-card p-4 gap-1.5">
          <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-ink/60">
            Signed in as
          </Text>
          <Text className="text-base font-sans-bold text-ink">
            {user?.primaryEmailAddress?.emailAddress ?? "Unknown user"}
          </Text>
        </View>

        <Pressable
          onPress={() => signOut()}
          className="items-center rounded-2xl bg-accent py-4"
        >
          <Text className="text-base font-sans-bold text-ink">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
