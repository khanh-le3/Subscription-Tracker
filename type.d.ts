import type { ImageSourcePropType } from "react-native";

declare global {
    interface AppTab{
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }

    interface TabIconProps{
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface Subscription{
        id: string;
        name: string;
        icon: ImageSourcePropType;
        price: number;
        frequency?: string;
        startDate?: string;
        status?: string;
        currency?: string;
        billing: string;
        renewalDate?: string;
        color?: string;
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onPressCancel?: () => void;
        isCancelling?: boolean;
    }

    interface UpcomingSubscrition {
        id: string;
        name: string;
        icon: ImageSourcePropType;
        currency?: string;
        price: number;
        daysLeft: number;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> {}

    interface ListHeadingProps {
        title: string;
    }
}

export {};
