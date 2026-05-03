import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SubscriptionsContextValue {
  subscriptions: Subscription[];
  isHydrated: boolean;
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(null);
const SUBSCRIPTIONS_STORAGE_KEY = "submanager.subscriptions";

export const SubscriptionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadSubscriptions = async () => {
      try {
        const storedSubscriptions = await AsyncStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
        if (!storedSubscriptions) return;

        const parsedSubscriptions: unknown = JSON.parse(storedSubscriptions);
        if (Array.isArray(parsedSubscriptions) && !cancelled) {
          setSubscriptions(parsedSubscriptions as Subscription[]);
        }
      } catch {
        if (!cancelled) {
          setSubscriptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    };

    void loadSubscriptions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void AsyncStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(subscriptions));
  }, [isHydrated, subscriptions]);

  const value = useMemo(
    () => ({
      subscriptions,
      isHydrated,
      setSubscriptions,
    }),
    [isHydrated, subscriptions],
  );

  return <SubscriptionsContext.Provider value={value}>{children}</SubscriptionsContext.Provider>;
};

export const useSubscriptions = (): SubscriptionsContextValue => {
  const context = useContext(SubscriptionsContext);
  if (!context) {
    throw new Error("useSubscriptions must be used within a SubscriptionsProvider");
  }
  return context;
};
