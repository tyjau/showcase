"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const CURRENCIES = ["EUR", "USD", "XAF"] as const;
export type Currency = (typeof CURRENCIES)[number];

const STORAGE_KEY = "skyrh.currency";

// Default currency is configurable at build time via NEXT_PUBLIC_DEFAULT_CURRENCY
// (one of EUR | USD | XAF), falling back to EUR. It is build-time inlined, so the
// server and the client agree on the first render (no hydration mismatch);
// localStorage then overrides it on mount for returning visitors.
const ENV_DEFAULT = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY;
const DEFAULT_CURRENCY: Currency =
  ENV_DEFAULT && (CURRENCIES as readonly string[]).includes(ENV_DEFAULT)
    ? (ENV_DEFAULT as Currency)
    : "EUR";

const CurrencyContext = createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
}>({ currency: DEFAULT_CURRENCY, setCurrency: () => {} });

/**
 * App-wide currency, chosen from the header and shared by every price on the
 * site (pricing calculator, module pages…). Defaults to DEFAULT_CURRENCY on first
 * render (server + client agree, so no hydration mismatch), then rehydrates from
 * localStorage on mount and persists subsequent changes.
 */
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (CURRENCIES as readonly string[]).includes(saved)) {
      setCurrencyState(saved as Currency);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* storage unavailable (private mode) — keep in-memory value */
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
