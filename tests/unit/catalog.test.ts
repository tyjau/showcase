import { describe, it, expect } from "vitest";
import {
  priceFor,
  moduleText,
  modulesByCategory,
  packageText,
  type CatalogModule,
  type Money,
} from "@/lib/catalog";

const prices: Money[] = [
  { currency: "EUR", cycle: "monthly", amount: 10 },
  { currency: "EUR", cycle: "yearly", amount: 100 },
  { currency: "USD", cycle: "monthly", amount: 12 },
];

function mod(partial: Partial<CatalogModule>): CatalogModule {
  return {
    code: "x",
    gate: "x",
    category: "core",
    icon: null,
    cover: null,
    isAddon: false,
    sort: 0,
    text: {},
    prices: [],
    requires: [],
    ...partial,
  };
}

describe("priceFor", () => {
  it("returns the amount for a currency at the default (monthly) cycle", () => {
    expect(priceFor(prices, "EUR")).toBe(10);
  });

  it("honours an explicit cycle", () => {
    expect(priceFor(prices, "EUR", "yearly")).toBe(100);
  });

  it("returns null when the currency/cycle pair is absent", () => {
    expect(priceFor(prices, "XAF")).toBeNull();
    expect(priceFor(prices, "USD", "yearly")).toBeNull();
  });
});

describe("moduleText", () => {
  const m = mod({
    code: "payroll",
    text: {
      en: { headline: "Payroll", tagline: null, description: null },
      fr: { headline: "Paie", tagline: null, description: null },
    },
  });

  it("returns the requested language", () => {
    expect(moduleText(m, "fr").headline).toBe("Paie");
  });

  it("falls back to English for an unknown language", () => {
    expect(moduleText(m, "de").headline).toBe("Payroll");
  });

  it("falls back to the module code when no text exists at all", () => {
    expect(moduleText(mod({ code: "ghost", text: {} }), "fr").headline).toBe("ghost");
  });
});

describe("packageText (i18n fallback)", () => {
  const fallback = { name: "Free", description: "Self-serve HR. No payroll." };
  const fr = { FREE: { name: "Free", description: "RH en self-service. Sans paie." } };

  it("prefers the locale map when present", () => {
    expect(packageText("FREE", fr, fallback).description).toBe("RH en self-service. Sans paie.");
  });

  it("falls back to the catalogue value when the code is absent", () => {
    expect(packageText("FREE", {}, fallback)).toEqual(fallback);
    expect(packageText("FREE", undefined, fallback)).toEqual(fallback);
  });

  it("fills missing fields individually from the fallback", () => {
    const partial = { FREE: { name: "Gratuit" } }; // description missing
    const r = packageText("FREE", partial, fallback);
    expect(r.name).toBe("Gratuit");
    expect(r.description).toBe(fallback.description);
  });
});

describe("modulesByCategory", () => {
  it("groups by category and orders each group by sort", () => {
    const out = modulesByCategory([
      mod({ code: "b2", category: "b", sort: 2 }),
      mod({ code: "a2", category: "a", sort: 2 }),
      mod({ code: "a1", category: "a", sort: 1 }),
      mod({ code: "b1", category: "b", sort: 1 }),
    ]);
    expect(out.a.map((m) => m.code)).toEqual(["a1", "a2"]);
    expect(out.b.map((m) => m.code)).toEqual(["b1", "b2"]);
  });
});
