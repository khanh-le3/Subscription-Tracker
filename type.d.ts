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
        icon: ImageSourcePropType | string;
        price: number;
        plan: string;
        category: string;
        paymentMethod: string;
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
        onDelete?: () => void;
        onPressCancel?: () => void;
        isCancelling?: boolean;
    }

    interface UpcomingSubscription {
        id: string;
        name: string;
        icon: ImageSourcePropType | string;
        currency?: string;
        price: number;
        daysLeft: number;
        color?: string;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> {}

    interface ListHeadingProps {
        title: string;
        actionLabel?: string;
        onActionPress?: () => void;
    }
}

export {};
