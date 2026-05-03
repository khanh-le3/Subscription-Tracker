import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";
import { tabs } from "@/constants/data";
import { ActivityIndicator, Image, View } from "react-native";
import { components, colors } from "@/constants/theme";
import cn from "clsx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SubscriptionsProvider } from "@/context/SubscriptionsContext";

const tabBar = components.tabBar;

export default function TabsLayout() {
    const { isLoaded, isSignedIn } = useAuth();
    const insets = useSafeAreaInsets();

    if (!isLoaded) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign_in" />;
    }

    const TabIcon = ({ focused, icon }: TabIconProps) => {
        return (
            <View className="tabs-icon">
                <View className={cn("tabs-pill", focused && "tabs-active")}>
                    <Image
                        source={icon}
                        resizeMode="contain"
                        className="tabs-glyph"
                        style={{ tintColor: focused ? colors.foreground : "rgba(245, 245, 247, 0.7)" }}
                    />
                </View>
            </View>
        );
    };

    return (
        <SubscriptionsProvider>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarShowLabel: false,
                    sceneStyle: {
                        backgroundColor: colors.background,
                    },
                    tabBarStyle: {
                        position: "absolute",
                        bottom: Math.max(insets.bottom, tabBar.horizontalInset),
                        height: tabBar.height,
                        marginHorizontal: tabBar.horizontalInset,
                        borderRadius: tabBar.radius,
                        backgroundColor: colors.background,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderTopWidth: 0,
                        elevation: 0,
                    },
                    tabBarItemStyle: {
                        paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
                    },
                    tabBarIconStyle: {
                        width: tabBar.iconFrame,
                        height: tabBar.iconFrame,
                        alignItems: "center",
                    },
                }}
            >
                {tabs.map((tab) => (
                    <Tabs.Screen
                        key={tab.name}
                        name={tab.name}
                        options={{
                            title: tab.title,
                            tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={tab.icon} />,
                        }}
                    />
                ))}
            </Tabs>
        </SubscriptionsProvider>
    );
}
