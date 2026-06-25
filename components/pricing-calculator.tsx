"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import {
  type Catalog,
  type Money,
  type PackageText,
  moduleText,
  packageText,
} from "@/lib/catalog";
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
  // Whole rates stay clean (€4); fractional rates carry both decimals (€3.20, not €3.2).
  const str = Number.isInteger(v) ? String(v) : v.toFixed(2);
  return `${currency === "EUR" ? "€" : "$"}${str}`;
}

type Dict = Record<string, string>;

export function PricingCalculator({
  catalog,
  lang,
  dict,
  packages,
}: {
  catalog: Catalog;
  lang: string;
  dict: Dict;
  packages?: Record<string, Partial<PackageText>>;
}) {
  const { currency } = useCurrency();
  const [annual, setAnnual] = useState(false);
  const [employees, setEmployees] = useState(25);
  const [mode, setMode] = useState<"packages" | "compare" | "custom">("packages");
  const pkgName = (code: string, fallbackName: string) =>
    packageText(code, packages, { name: fallbackName, description: "" }).name;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [optionsOpen, setOptionsOpen] = useState<string | null>(null);
  const [packAddons, setPackAddons] = useState<Record<string, Set<string>>>({});
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

  // Union of every module appearing in any package, ordered by the module sort — the
  // rows of the comparison matrix.
  const compareModuleCodes = useMemo(() => {
    const codes = new Set<string>();
    for (const p of catalog.packages) for (const c of p.modules) codes.add(c);
    return Array.from(codes).sort((a, b) => {
      const sa = catalog.modules.find((m) => m.code === a)?.sort ?? 0;
      const sb = catalog.modules.find((m) => m.code === b)?.sort ?? 0;
      return sa - sb;
    });
  }, [catalog]);

  function toggleModule(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function togglePackAddon(packCode: string, code: string) {
    setPackAddons((prev) => {
      const cur = new Set(prev[packCode] ?? []);
      if (cur.has(code)) cur.delete(code);
      else cur.add(code);
      return { ...prev, [packCode]: cur };
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex overflow-hidden rounded-md border border-line text-sm">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`px-3 py-1.5 transition ${!annual ? "bg-sky-strong font-semibold text-white" : "text-muted hover:text-heading"}`}
          >
            {dict.monthly}
          </button>
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 transition ${annual ? "bg-sky-strong font-semibold text-white" : "text-muted hover:text-heading"}`}
          >
            {dict.annual}
            <span className="rounded-full bg-ok-bg px-1.5 text-[11px] text-ok-fg">
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
            aria-label={dict.employees}
            aria-valuenow={employees}
            className="w-28 accent-sky sm:w-44"
          />
          <span className="w-10 font-semibold text-ink">{employees}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="inline-flex overflow-hidden rounded-full border border-line text-sm">
          <button
            type="button"
            onClick={() => setMode("packages")}
            className={`px-4 py-2 transition ${mode === "packages" ? "bg-navy font-semibold text-white" : "text-muted hover:text-heading"}`}
          >
            {dict.tabPackages}
          </button>
          <button
            type="button"
            onClick={() => setMode("compare")}
            className={`px-4 py-2 transition ${mode === "compare" ? "bg-navy font-semibold text-white" : "text-muted hover:text-heading"}`}
          >
            {dict.tabCompare}
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`px-4 py-2 transition ${mode === "custom" ? "bg-navy font-semibold text-white" : "text-muted hover:text-heading"}`}
          >
            {dict.tabCustom}
          </button>
        </div>
      </div>

      {mode === "packages" ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {catalog.packages.map((p) => {
            const base = unitPrice(p.prices, currency);
            const sel = packAddons[p.code] ?? new Set<string>();
            const addonMods = catalog.modules.filter(
              (m) => m.isAddon && !p.modules.includes(m.code),
            );
            const addonSum = addonMods.reduce(
              (s, m) => (sel.has(m.code) ? s + unitPrice(m.prices, currency) : s),
              0,
            );
            const rate = (base + addonSum) * factor;
            const isFree = base === 0 && addonSum === 0;
            const popular = p.code === "BUSINESS";
            return (
              <div
                key={p.code}
                className={`flex flex-col rounded-xl bg-surface p-5 ${popular ? "border-2 border-sky" : "border border-line"}`}
              >
                {popular && (
                  <div className="mb-2 inline-block self-start rounded-full bg-tint-sky px-2 py-0.5 text-[11px] font-semibold text-sky-text">
                    {dict.popular}
                  </div>
                )}
                <div className="text-sm font-semibold text-ink">{pkgName(p.code, p.name)}</div>
                <div className="mt-2">
                  {isFree ? (
                    <span className="text-2xl font-bold text-heading">
                      {dict.free}
                    </span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-heading">
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
                        <Check size={13} className="shrink-0 text-sky-text" />
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
                      className="inline-flex items-center gap-1 pt-0.5 font-semibold text-sky-text"
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
                {addonMods.length > 0 && (
                  <div className="mt-3 border-t border-line pt-3">
                    <button
                      type="button"
                      onClick={() =>
                        setOptionsOpen(optionsOpen === p.code ? null : p.code)
                      }
                      className="flex w-full items-center justify-between text-xs font-semibold text-heading"
                    >
                      <span>
                        {dict.addOptions}
                        {sel.size > 0 ? ` (${sel.size})` : ""}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition ${optionsOpen === p.code ? "rotate-180" : ""}`}
                      />
                    </button>
                    {optionsOpen === p.code && (
                      <div className="mt-2 space-y-1">
                        {addonMods.map((m) => {
                          const on = sel.has(m.code);
                          const arate = unitPrice(m.prices, currency) * factor;
                          return (
                            <button
                              key={m.code}
                              type="button"
                              onClick={() => togglePackAddon(p.code, m.code)}
                              className="flex w-full items-center gap-2 text-left text-xs"
                            >
                              <span
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${on ? "bg-sky-strong text-white" : "border border-line"}`}
                              >
                                {on && <Check size={11} />}
                              </span>
                              <span className="flex-1 truncate text-ink">
                                {moduleText(m, lang).headline}
                              </span>
                              <span className="shrink-0 text-muted">
                                +{fmtRate(arate, currency)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                <Link
                  href={`/${lang}/signup?plan=${p.code}${sel.size ? `&addons=${Array.from(sel).join(",")}` : ""}`}
                  className={`mt-4 block rounded-full px-4 py-2 text-center text-sm font-semibold ${popular ? "bg-sky-strong text-white" : "border border-line text-heading hover:border-sky"}`}
                >
                  {p.code === "ENTERPRISE" ? dict.contact : dict.startTrial}
                </Link>
              </div>
            );
          })}
        </div>
      ) : mode === "compare" ? (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="px-3 py-3 text-left font-semibold text-heading">
                  {dict.compareModule}
                </th>
                {catalog.packages.map((p) => (
                  <th key={p.code} className="px-3 py-3 text-center font-semibold text-heading">
                    <span className={p.code === "BUSINESS" ? "text-sky-text" : ""}>
                      {pkgName(p.code, p.name)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareModuleCodes.map((code) => {
                const m = catalog.modules.find((x) => x.code === code);
                return (
                  <tr key={code} className="border-b border-line">
                    <td className="px-3 py-2.5 text-ink">
                      {m ? moduleText(m, lang).headline : code}
                    </td>
                    {catalog.packages.map((p) => (
                      <td key={p.code} className="px-3 py-2.5 text-center">
                        {p.modules.includes(code) ? (
                          <Check size={16} className="mx-auto text-sky-text" />
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td className="px-3 py-4" />
                {catalog.packages.map((p) => (
                  <td key={p.code} className="px-3 py-4 text-center">
                    <Link
                      href={`/${lang}/signup?plan=${p.code}`}
                      className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${p.code === "BUSINESS" ? "bg-sky-strong text-white" : "border border-line text-heading hover:border-sky"}`}
                    >
                      {p.code === "ENTERPRISE" ? dict.contact : dict.startTrial}
                    </Link>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
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
                      ? "border-sky bg-tint-sky-strong"
                      : auto
                        ? "border-line bg-mist"
                        : "border-line bg-surface hover:border-sky"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${checked || auto ? "bg-sky-strong text-white" : "border border-line"}`}
                  >
                    {(checked || auto) && <Check size={13} />}
                  </span>
                  <ModuleIcon
                    name={m.icon}
                    size={18}
                    className="shrink-0 text-sky-text"
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
          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-line bg-surface p-5 text-center">
            <div className="text-xs uppercase tracking-wide text-muted">
              {dict.estTotal}
            </div>
            <div className="mt-1 text-3xl font-bold text-heading">
              {fmtMoney(periodTotal(customRate), currency)}
              <span className="text-sm font-normal text-muted"> {periodLabel}</span>
            </div>
            <div className="mt-1 text-xs text-muted">
              {fmtRate(customRate, currency)} {dict.perEmployee} × {employees}
            </div>
            <Link
              href={`/${lang}/signup`}
              className="mt-4 block rounded-full bg-sky-strong px-4 py-2 text-sm font-semibold text-white"
            >
              {dict.startTrial}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
