import { colors } from "@/constants/theme";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path } from "react-native-svg";

const Insights = () => {
  const { subscriptions, isHydrated } = useSubscriptions();

  const analytics = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(
      (subscription) => subscription.status?.toLowerCase() !== "cancelled",
    );

    const monthlyEquivalentBySubscription = activeSubscriptions.map((subscription) => {
      const billing = subscription.billing?.toLowerCase();
      const monthlyEquivalent = billing === "yearly" ? subscription.price / 12 : subscription.price;
      return {
        ...subscription,
        monthlyEquivalent,
      };
    });

    const totalMonthlyEquivalent = monthlyEquivalentBySubscription.reduce(
      (sum, subscription) => sum + subscription.monthlyEquivalent,
      0,
    );

    const averagePerService =
      monthlyEquivalentBySubscription.length > 0
        ? totalMonthlyEquivalent / monthlyEquivalentBySubscription.length
        : 0;

    const highestSpending = monthlyEquivalentBySubscription.reduce<
      (Subscription & { monthlyEquivalent: number }) | null
    >((currentHighest, subscription) => {
      if (!currentHighest || subscription.monthlyEquivalent > currentHighest.monthlyEquivalent) {
        return subscription;
      }
      return currentHighest;
    }, null);

    const monthStart = dayjs().startOf("year");
    const monthlySeries = Array.from({ length: 12 }, (_, index) => {
      const monthDate = monthStart.add(index, "month");
      const monthEnd = monthDate.endOf("month");

      const monthTotal = activeSubscriptions.reduce((sum, subscription) => {
        const billing = subscription.billing?.toLowerCase();
        const anchorDate = dayjs(subscription.renewalDate || subscription.startDate);
        if (!anchorDate.isValid()) return sum;
        if (monthEnd.isBefore(anchorDate, "day")) return sum;

        if (billing === "yearly") {
          return anchorDate.month() === monthDate.month() ? sum + subscription.price : sum;
        }

        return sum + subscription.price;
      }, 0);

      return {
        label: monthDate.format("MMM"),
        value: Number(monthTotal.toFixed(2)),
      };
    });

    const categoryTotals = monthlyEquivalentBySubscription.reduce<Record<string, number>>(
      (accumulator, subscription) => {
        const category = subscription.category || "Other";
        accumulator[category] = (accumulator[category] ?? 0) + subscription.monthlyEquivalent;
        return accumulator;
      },
      {},
    );

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalMonthlyEquivalent > 0 ? (amount / totalMonthlyEquivalent) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalMonthlyEquivalent,
      averagePerService,
      highestSpending,
      monthlySeries,
      categoryBreakdown,
    };
  }, [subscriptions]);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  const chartWidth = Math.max(Dimensions.get("window").width - 72, 260);
  const chartHeight = 200;
  const chartPadding = 20;
  const drawableWidth = chartWidth - chartPadding * 2;
  const drawableHeight = chartHeight - chartPadding * 2;
  const maxPointValue = Math.max(...analytics.monthlySeries.map((item) => item.value), 1);

  const points = analytics.monthlySeries.map((item, index) => {
    const x = chartPadding + (index / Math.max(analytics.monthlySeries.length - 1, 1)) * drawableWidth;
    const y = chartPadding + (1 - item.value / maxPointValue) * drawableHeight;
    return { ...item, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>
            Spending trends and category distribution
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.kpiLabel}>Highest Spending</Text>
          {analytics.highestSpending ? (
            <>
              <Text style={styles.kpiTitle}>
                {analytics.highestSpending.name}
              </Text>
              <Text style={styles.kpiValue}>
                {formatCurrency(analytics.highestSpending.monthlyEquivalent)} / month
              </Text>
            </>
          ) : (
            <Text style={styles.kpiEmpty}>
              Add subscriptions to see this metric
            </Text>
          )}
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiSmallLabel}>Average per Service</Text>
            <Text style={styles.kpiSmallValue}>
              {formatCurrency(analytics.averagePerService)}
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiSmallLabel}>Monthly Equivalent</Text>
            <Text style={styles.kpiSmallValue}>
              {formatCurrency(analytics.totalMonthlyEquivalent)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Spending by Month</Text>
          <Text style={styles.sectionSubtitle}>
            Estimated charges across the current year
          </Text>
          <Svg width={chartWidth} height={chartHeight}>
            {[0, 1, 2, 3, 4].map((ruleIndex) => {
              const y = chartPadding + (ruleIndex / 4) * drawableHeight;
              return (
                <Line
                  key={`rule-${ruleIndex}`}
                  x1={chartPadding}
                  y1={y}
                  x2={chartWidth - chartPadding}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={1}
                />
              );
            })}
            <Path d={linePath} stroke={colors.accent} strokeWidth={3} fill="none" />
            {points.map((point) => (
              <Circle key={point.label} cx={point.x} cy={point.y} r={4} fill={colors.accent} />
            ))}
          </Svg>
          <View style={styles.monthLabels}>
            {analytics.monthlySeries.map((item) => (
              <Text key={item.label} style={styles.monthLabelText}>
                {item.label}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <Text style={styles.sectionSubtitle}>
            Share of monthly-equivalent spend
          </Text>

          {analytics.categoryBreakdown.length === 0 ? (
            <Text style={styles.kpiEmpty}>
              No category data yet.
            </Text>
          ) : (
            analytics.categoryBreakdown.map((item) => (
              <View key={item.category} style={styles.categoryRow}>
                <View style={styles.categoryRowHeader}>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <Text style={styles.categoryAmount}>
                    {formatCurrency(item.amount)} ({item.percentage.toFixed(0)}%)
                  </Text>
                </View>
                <View style={styles.categoryTrack}>
                  <View
                    style={[
                      styles.categoryFill,
                      { width: `${Math.max(item.percentage, 3)}%`, backgroundColor: colors.accent },
                    ]}
                  />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 14,
  },
  title: {
    color: colors.foreground,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 6,
    color: colors.mutedForeground,
    fontSize: 15,
    fontWeight: "500",
  },
  card: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "#2c2c2c",
  },
  kpiLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
  },
  kpiTitle: {
    marginTop: 4,
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },
  kpiValue: {
    marginTop: 4,
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  kpiEmpty: {
    marginTop: 4,
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    fontWeight: "500",
  },
  kpiRow: {
    flexDirection: "row",
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 24,
    padding: 14,
    backgroundColor: "#2c2c2c",
  },
  kpiSmallLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "600",
  },
  kpiSmallValue: {
    marginTop: 4,
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: "700",
  },
  sectionSubtitle: {
    marginBottom: 16,
    color: colors.mutedForeground,
    fontSize: 14,
    fontWeight: "500",
  },
  monthLabels: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthLabelText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "500",
  },
  categoryRow: {
    marginBottom: 12,
  },
  categoryRowHeader: {
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryName: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  categoryAmount: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
  },
  categoryTrack: {
    height: 8,
    width: "100%",
    borderRadius: 9999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  categoryFill: {
    height: 8,
    borderRadius: 9999,
  },
});
