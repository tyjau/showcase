"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { type Catalog, type Money, moduleText } from "@/lib/catalog";
import { ModuleIcon } from "./module-icon";
import { useCurrency } from "./currency-provider";

function unitPrice(prices: Money[], currency: string): number {
  const p = prices.find((x) => x.currency === currency && x.cycle === "monthly");
  return p ? p.amount : 0;
}

function fmtMoney(amount: number, currency: string): string {
  const v = Math.round(amount).toLocaleString("en-US");
  if (currency === "XAF") return `${v} XAF`;
  return `${currency === "EUR" ? "€" : "$"}${v}`;
}

function fmtRate(amount: number, currency: string): string {
  const v = Math.round(amount * 100) / 100;
  if (currency === "XAF") return `${v.toLocaleString("en-US")} XAF`;
  return `${currency === "EUR" ? "€" : "$"}${v}`;
}

type Dict = Record<string, string>;

export function PricingCalculator({
  catalog,
  lang,
  dict,
}: {
  catalog: Catalog;
  lang: string;
  dict: Dict;
}) {
  const { currency } = useCurrency();
  const [annual, setAnnual] = useState(false);
  const [employees, setEmployees] = useState(25);
  const [mode, setMode] = useState<"packages" | "custom">("packages");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(["WAGE-GEN00"]),
  );

  const factor = annual ? 0.8 : 1;
  const periodTotal = (rate: number) => rate * employees * (annual ? 12 : 1);
  const periodLabel = annual ? dict.annualTotal : dict.monthlyTotal;

  const resolved = useMemo(() => {
    const set = new Set(selected);
    let changed = true;
    while (changed) {
      changed = false;
      for (const code of Array.from(set)) {
        const m = catalog.modules.find((x) => x.code === code);
        m?.requires
          .filter((r) => r.kind === "required")
          .forEach((r) => {
            if (!set.has(r.code)) {
              set.add(r.code);
              changed = true;
            }
          });
      }
    }
    return set;
  }, [selected, catalog]);

  const customRate = useMemo(() => {
    let sum = 0;
    for (const code of Array.from(resolved)) {
      const m = catalog.modules.find((x) => x.code === code);
      if (m) sum += unitPrice(m.prices, currency);
    }
    return sum * factor;
  }, [resolved, currency, factor, catalog]);

  function toggleModule(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex overflow-hidden rounded-md border border-line text-sm">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`px-3 py-1.5 transition ${!annual ? "bg-sky font-semibold text-white" : "text-muted hover:text-navy"}`}
          >
            {dict.monthly}
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 transition ${annual ? "bg-sky font-semibold text-white" : "text-muted hover:text-navy"}`}
          >
            {dict.annual}
            <span className="rounded-full bg-[#e6f5ec] px-1.5 text-[11px] text-[#2e7d4f]">
              {dict.annualSave}
            </span>
          </button>
        </div>
        <div className="inline-flex items-center gap-2 text-sm">
          <span className="text-muted">{dict.employees}</span>
          <input
            type="range"
            min={1}
            max={500}
            step={1}
            value={employees}
            onChange={(e) => setEmployees(Number(e.target.value))}
            className="w-40 accent-sky"
          />
          <span className="w-10 font-semibold text-ink">{employees}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="inline-flex overflow-hidden rounded-full border border-line text-sm">
          <button
            type="button"
            onClick={() => setMode("packages")}
            className={`px-4 py-2 transition ${mode === "packages" ? "bg-navy font-semibold text-white" : "text-muted hover:text-navy"}`}
          >
            {dict.tabPackages}
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`px-4 py-2 transition ${mode === "custom" ? "bg-navy font-semibold text-white" : "text-muted hover:text-navy"}`}
          >
            {dict.tabCustom}
          </button>
        </div>
      </div>

      {mode === "packages" ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {catalog.packages.map((p) => {
            const base = unitPrice(p.prices, currency);
            const rate = base * factor;
            const isFree = base === 0;
            const popular = p.code === "BUSINESS";
            return (
              <div
                key={p.code}
                className={`flex flex-col rounded-xl p-5 ${popular ? "border-2 border-sky" : "border border-line"}`}
              >
                {popular && (
                  <div className="mb-2 inline-block self-start rounded-full bg-[#e7f4fb] px-2 py-0.5 text-[11px] font-semibold text-sky">
                    {dict.popular}
                  </div>
                )}
                <div className="text-sm font-semibold text-ink">{p.name}</div>
                <div className="mt-2">
                  {isFree ? (
                    <span className="text-2xl font-bold text-navy">
                      {dict.free}
                    </span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-navy">
                        {fmtRate(rate, currency)}
                      </span>
                      <span className="text-xs text-muted"> {dict.perEmployee}</span>
                    </>
                  )}
                </div>
                {!isFree && (
                  <div className="mt-1 text-xs text-muted">
                    ≈ {fmtMoney(periodTotal(rate), currency)} {periodLabel}
                  </div>
                )}
                <div className="mt-3 flex-1 space-y-1.5 text-xs text-muted">
                  {(expanded === p.code
                    ? p.modules
                    : p.modules.slice(0, 5)
                  ).map((code) => {
                    const m = catalog.modules.find((x) => x.code === code);
                    return (
                      <div key={code} className="flex items-center gap-1.5">
                        <Check size={13} className="shrink-0 text-sky" />
                        {m ? moduleText(m, lang).headline : code}
                      </div>
                    );
                  })}
                  {p.modules.length > 5 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded(expanded === p.code ? null : p.code)
                      }
                      className="inline-flex items-center gap-1 pt-0.5 font-semibold text-sky"
                    >
                      {expanded === p.code
                        ? dict.showLess
                        : `${dict.showAll} (${p.modules.length})`}
                      <ChevronDown
                        size={13}
                        className={`transition ${expanded === p.code ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                <Link
                  href={`/${lang}/signup`}
                  className={`mt-4 block rounded-full px-4 py-2 text-center text-sm font-semibold ${popular ? "bg-sky text-white" : "border border-line text-navy"}`}
                >
                  {p.code === "ENTERPRISE" ? dict.contact : dict.startTrial}
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8">
          <p className="mb-4 text-center text-sm text-muted">
            {dict.selectModules}
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {catalog.modules.map((m) => {
              const checked = selected.has(m.code);
              const auto = resolved.has(m.code) && !checked;
              const rate = unitPrice(m.prices, currency) * factor;
              return (
                <button
                  key={m.code}
                  type="button"
                  onClick={() => toggleModule(m.code)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    checked
                      ? "border-sky bg-[#f4fbfe]"
                      : auto
                        ? "border-line bg-mist"
                        : "border-line hover:border-sky"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${checked || auto ? "bg-sky text-white" : "border border-line"}`}
                  >
                    {(checked || auto) && <Check size={13} />}
                  </span>
                  <ModuleIcon
                    name={m.icon}
                    size={18}
                    className="shrink-0 text-sky"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {moduleText(m, lang).headline}
                    </span>
                    <span className="text-[11px] text-muted">
                      {auto
                        ? dict.autoIncluded
                        : `${fmtRate(rate, currency)} ${dict.perEmployee}`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-line bg-white p-5 text-center">
            <div className="text-xs uppercase tracking-wide text-muted">
              {dict.estTotal}
            </div>
            <div className="mt-1 text-3xl font-bold text-navy">
              {fmtMoney(periodTotal(customRate), currency)}
              <span className="text-sm font-normal text-muted"> {periodLabel}</span>
            </div>
            <div className="mt-1 text-xs text-muted">
              {fmtRate(customRate, currency)} {dict.perEmployee} × {employees}
            </div>
            <Link
              href={`/${lang}/signup`}
              className="mt-4 block rounded-full bg-sky px-4 py-2 text-sm font-semibold text-white"
            >
              {dict.startTrial}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
