"use client";

import { usePathname } from "next/navigation";
import { type Money } from "@/lib/catalog";
import { useCurrency } from "./currency-provider";
import { formatRate } from "@/lib/money";

/**
 * A single per-employee rate that follows the app-wide currency chosen in the
 * header. Falls back to the first available monthly price if the selected
 * currency is not seeded for this item (labelled with its real currency).
 * Formatting follows the active UI language (symbol placement per locale).
 */
export function Price({
  prices,
  className,
}: {
  prices: Money[];
  className?: string;
}) {
  const { currency } = useCurrency();
  const lang = (usePathname() || "").split("/")[1] === "en" ? "en" : "fr";
  const monthly = prices.filter((p) => p.cycle === "monthly");
  const p = monthly.find((x) => x.currency === currency) ?? monthly[0];
  if (!p) return null;
  return <span className={className}>{formatRate(p.amount, p.currency, lang)}</span>;
}
