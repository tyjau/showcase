import type { Locale } from "./i18n";

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  fr: () => import("@/dictionaries/fr.json").then((m) => m.default),
} as const;

export const getDictionary = async (locale: Locale) =>
  (dictionaries[locale] ?? dictionaries.en)();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
