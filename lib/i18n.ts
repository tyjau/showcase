export const i18n = {
  defaultLocale: "en",
  locales: ["en", "fr"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}
