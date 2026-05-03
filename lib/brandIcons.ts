import * as simpleIcons from "simple-icons";
import { icons } from "@/constants/icon";

type SimpleIconRecord = {
  title: string;
  slug: string;
};

const SIMPLE_ICON_ENTRIES = Object.values(simpleIcons).filter(
  (icon): icon is SimpleIconRecord =>
    typeof icon === "object" &&
    icon !== null &&
    "slug" in icon &&
    "title" in icon &&
    typeof (icon as { slug?: unknown }).slug === "string" &&
    typeof (icon as { title?: unknown }).title === "string",
);

const BRAND_ALIASES: Record<string, string> = {
  "google drive": "googledrive",
  "apple tv": "appletv",
  "apple music": "applemusic",
  "youtube premium": "youtube",
  "youtube music": "youtubemusic",
  "microsoft 365": "microsoft",
  "office 365": "microsoft",
  "amazon prime": "primevideo",
  "prime video": "primevideo",
  "chatgpt plus": "openai",
  "claude pro": "anthropic",
  "x premium": "x",
};

const normalize = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const toSimpleIconsUrl = (slug: string): string => `https://cdn.simpleicons.org/${slug}`;

export const getSubscriptionIconSource = (subscriptionName: string): Subscription["icon"] => {
  const trimmed = subscriptionName.trim();
  if (!trimmed) return icons.wallet;

  const rawLower = trimmed.toLowerCase();
  const normalizedInput = normalize(trimmed);
  const aliasSlug = BRAND_ALIASES[rawLower] ?? BRAND_ALIASES[normalizedInput];
  const targetNormalized = normalize(aliasSlug ?? trimmed);

  const exactMatch =
    SIMPLE_ICON_ENTRIES.find((icon) => normalize(icon.slug) === targetNormalized) ??
    SIMPLE_ICON_ENTRIES.find((icon) => normalize(icon.title) === targetNormalized);

  if (exactMatch) return toSimpleIconsUrl(exactMatch.slug);

  const partialMatch = SIMPLE_ICON_ENTRIES.find(
    (icon) =>
      normalize(icon.slug).includes(targetNormalized) ||
      normalize(icon.title).includes(targetNormalized),
  );

  if (partialMatch) return toSimpleIconsUrl(partialMatch.slug);

  return icons.wallet;
};
