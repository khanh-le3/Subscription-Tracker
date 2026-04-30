import { useClerk, useUser } from "@clerk/expo";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as SafeAreaViewRN } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(SafeAreaViewRN);

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff9e3" }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 24 }}>
        <View>
          <Text style={{ color: "#081126", fontSize: 28, fontWeight: "800" }}>Settings</Text>
          <Text style={{ color: "rgba(0,0,0,0.6)", fontSize: 15, marginTop: 6 }}>
            Manage your account and session.
          </Text>
        </View>

        <View
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.1)",
            backgroundColor: "#fff8e7",
            padding: 16,
            gap: 6,
          }}
        >
          <Text style={{ color: "rgba(0,0,0,0.6)", fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
            Signed in as
          </Text>
          <Text style={{ color: "#081126", fontSize: 16, fontWeight: "700" }}>
            {user?.primaryEmailAddress?.emailAddress ?? "Unknown user"}
          </Text>
        </View>

        <Pressable
          onPress={() => signOut()}
          style={{
            alignItems: "center",
            borderRadius: 16,
            backgroundColor: "#ea7a53",
            paddingVertical: 16,
          }}
        >
          <Text style={{ color: "#081126", fontSize: 16, fontWeight: "700" }}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
