// Locale-aware currency formatting. English places the symbol before the amount
// ($1,234); French (and most locales) place it after with a non-breaking space and
// a comma decimal (1 234 $US / 1 234 €). Intl.NumberFormat handles both per locale,
// so the displayed format follows the active UI language — not a hardcoded en-US style.

function bcp47(lang: string): string {
  return lang === "fr" ? "fr-FR" : "en-US";
}

/** Whole-currency amount (totals): no decimals. e.g. en "$1,234" · fr "1 234 $US". */
export function formatMoney(amount: number, currency: string, lang: string): string {
  return new Intl.NumberFormat(bcp47(lang), {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

/** Per-unit rate: keeps up to 2 decimals, drops them when whole (€4, not €4.00). */
export function formatRate(amount: number, currency: string, lang: string): string {
  const v = Math.round(amount * 100) / 100;
  return new Intl.NumberFormat(bcp47(lang), {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(v) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(v);
}
