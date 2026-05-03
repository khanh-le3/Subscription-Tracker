export const colors = {
    background: "#202020",
    foreground: "#f5f5f7",
    card: "#fff8e7",
    muted: "#1f1f27",
    mutedForeground: "rgba(255, 255, 255, 0.6)",
    primary: "#ffffff",
    accent: "#ea7a53",
    border: "rgba(255, 255, 255, 0.12)",
    success: "#16a34a",
    destructive: "#dc2626",
    subscription: "#8fd1bd",
    ink: "#081126",
} as const;

export const spacing = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    18: 72,
    20: 80,
    24: 96,
    30: 120,
} as const;

export const components = {
    tabBar: {
        height: spacing[18],
        horizontalInset: spacing[5],
        radius: spacing[8],
        iconFrame: spacing[12],
        itemPaddingVertical: spacing[2],
    },
} as const;

export const theme = {
    colors,
    spacing,
    components,
} as const;