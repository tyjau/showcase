"use client";

import { type Money } from "@/lib/catalog";
import { useCurrency } from "./currency-provider";

function formatRate(amount: number, currency: string): string {
  const v = Math.round(amount * 100) / 100;
  if (currency === "XAF") return `${v.toLocaleString("en-US")} XAF`;
  return `${currency === "EUR" ? "€" : "$"}${v}`;
}

/**
 * A single per-employee rate that follows the app-wide currency chosen in the
 * header. Falls back to the first available monthly price if the selected
 * currency is not seeded for this item (labelled with its real currency).
 */
export function Price({
  prices,
  className,
}: {
  prices: Money[];
  className?: string;
}) {
  const { currency } = useCurrency();
  const monthly = prices.filter((p) => p.cycle === "monthly");
  const p = monthly.find((x) => x.currency === currency) ?? monthly[0];
  if (!p) return null;
  return <span className={className}>{formatRate(p.amount, p.currency)}</span>;
}
