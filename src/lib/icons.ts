/*
 * Icon names editors can choose in the admin panel. Components map each name
 * to a Lucide icon (or a brand mark) when the homepage sections are built.
 * Add a name here to make it selectable.
 */
export const ICON_NAMES = [
  // Services
  "bar-chart",
  "megaphone",
  "code",
  "search",
  "bot",
  "line-chart",
  "compass",
  "palette",
  // Industries
  "heart-pulse",
  "building",
  "graduation-cap",
  "landmark",
  "shopping-cart",
  "factory",
  "bed",
  "rocket",
  // Stats
  "users",
  "trending-up",
  "coins",
  "star",
  // Why AdPulse
  "cpu",
  "zap",
  "target",
  "users-round",
] as const;

export type IconName = (typeof ICON_NAMES)[number];
