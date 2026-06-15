"use client";

import { CURRENCIES, useCurrency } from "./currency-provider";

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();

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
              : "text-muted hover:text-navy"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
