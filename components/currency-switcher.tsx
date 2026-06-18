"use client";

import { usePathname } from "next/navigation";
import { CURRENCIES, useCurrency } from "./currency-provider";

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();
  // Currency is irrelevant on auth / portal screens (nothing priced there) — hide it.
  if (/\/(login|account|partner)(\/|$)/.test(pathname || "")) return null;

  return (
    <div
      className={`inline-flex overflow-hidden rounded-md border border-line text-xs ${className}`}
      role="group"
      aria-label="Currency"
    >
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={`px-2 py-1 transition ${
            currency === c
              ? "bg-navy font-semibold text-white"
              : "text-muted hover:text-heading"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
