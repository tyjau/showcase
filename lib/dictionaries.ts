import type { Locale } from "./i18n";

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  fr: () => import("@/dictionaries/fr.json").then((m) => m.default),
} as const;

// Accepts a plain string (Next 15 types dynamic route params as string); an unknown
// locale falls back to English.
export const getDictionary = async (locale: string) =>
  (dictionaries[locale as Locale] ?? dictionaries.en)();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
