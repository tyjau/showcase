"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import {
  type Catalog,
  type Money,
  type PackageText,
  moduleText,
  packageText,
} from "@/lib/catalog";
import { useCurrency } from "./currency-provider";
import { formatMoney, formatRate } from "@/lib/money";

function unitPrice(prices: Money[], currency: string): number {
  const p = prices.find((x) => x.currency === currency && x.cycle === "monthly");
  return p ? p.amount : 0;
}

// Default à-la-carte selection ≈ the mockup's 3 starter modules (records + time-off + payroll).
function defaultCustomCodes(catalog: Catalog): Set<string> {
  const codes = new Set<string>();
  for (const cat of ["people", "time-off", "payroll"]) {
    const m = catalog.modules.find((x) => x.category === cat && !x.isAddon);
    if (m) codes.add(m.code);
  }
  if (codes.size === 0) {
    const first = catalog.modules.find((x) => !x.isAddon);
    if (first) codes.add(first.code);
  }
  return codes;
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
  // Locale-aware formatters (capture the active lang so FR shows "1 234 $US").
  const fmtMoney = (amount: number, cur: string) => formatMoney(amount, cur, lang);
  const fmtRate = (amount: number, cur: string) => formatRate(amount, cur, lang);
  const [annual, setAnnual] = useState(false);
  const [employees, setEmployees] = useState(25);
  const [mode, setMode] = useState<"packages" | "compare" | "custom">("packages");
  const pkgName = (code: string, fallbackName: string) =>
    packageText(code, packages, { name: fallbackName, description: "" }).name;
  const pkgDesc = (code: string) =>
    packageText(code, packages, { name: "", description: "" }).description;
  const [packAddons, setPackAddons] = useState<Record<string, Set<string>>>({});
  const [selected, setSelected] = useState<Set<string>>(() => defaultCustomCodes(catalog));

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

  const tabCls = (on: boolean) =>
    `rounded-[9px] px-4 py-2 font-semibold transition ${on ? "bg-white text-[#156082]" : "text-hero-fg-muted hover:text-white"}`;

  return (
    <div>
      {/* HERO + controls (dark) */}
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(820px_360px_at_80%_-12%,rgba(15,158,213,0.20),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center">
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-[42px]">
            {dict.heading}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-hero-fg-muted">{dict.sub}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-full bg-white/[0.08] p-1 text-sm">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`rounded-full px-3.5 py-1.5 font-semibold transition ${!annual ? "bg-sky-strong text-white" : "text-hero-fg-muted hover:text-white"}`}
              >
                {dict.monthly}
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold transition ${annual ? "bg-sky-strong text-white" : "text-hero-fg-muted hover:text-white"}`}
              >
                {dict.annual}
                <span className={`text-[11px] font-bold ${annual ? "text-white/85" : "text-[#7fe3b0]"}`}>
                  {dict.annualSave}
                </span>
              </button>
            </div>
            <div className="inline-flex items-center gap-2 text-sm">
              <span className="text-hero-fg-muted">{dict.employees}</span>
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
              <span className="w-10 font-semibold text-white">{employees}</span>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-xl bg-white/[0.06] p-1 text-sm">
              <button type="button" onClick={() => setMode("packages")} className={tabCls(mode === "packages")}>
                {dict.tabPackages}
              </button>
              <button type="button" onClick={() => setMode("compare")} className={tabCls(mode === "compare")}>
                {dict.tabCompare}
              </button>
              <button type="button" onClick={() => setMode("custom")} className={tabCls(mode === "custom")}>
                {dict.tabCustom}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-12">
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
                className={`relative flex flex-col rounded-xl bg-surface p-5 ${popular ? "border-2 border-sky" : "border border-line"}`}
              >
                {popular && (
                  <span className="absolute -top-3 left-5 rounded-full bg-sky-strong px-3 py-1 text-[11px] font-bold text-white">
                    {dict.popular}
                  </span>
                )}
                <div className="text-sm font-semibold text-ink">{pkgName(p.code, p.name)}</div>
                <div className="mt-2">
                  {isFree ? (
                    <span className="text-[34px] font-extrabold text-heading">
                      {dict.free}
                    </span>
                  ) : (
                    <>
                      <span className="text-[34px] font-extrabold text-heading">
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
                {pkgDesc(p.code) && (
                  <p className="mt-2 min-h-[34px] text-xs leading-relaxed text-muted">{pkgDesc(p.code)}</p>
                )}
                <div className="mt-3 flex-1 space-y-1.5 text-xs text-muted">
                  {p.modules.map((code) => {
                    const m = catalog.modules.find((x) => x.code === code);
                    return (
                      <div key={code} className="flex items-center gap-1.5">
                        <Check size={13} className="shrink-0 text-sky-text" />
                        {m ? moduleText(m, lang).headline : code}
                      </div>
                    );
                  })}
                </div>
                {addonMods.length > 0 && (
                  <div className="mt-3 border-t border-line pt-3">
                    <div className="mb-2 text-xs font-semibold text-heading">{dict.addonsLabel}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {addonMods.map((m) => {
                        const on = sel.has(m.code);
                        const arate = unitPrice(m.prices, currency) * factor;
                        return (
                          <button
                            key={m.code}
                            type="button"
                            onClick={() => togglePackAddon(p.code, m.code)}
                            aria-pressed={on}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition ${on ? "border-sky bg-sky-strong text-white" : "border-line text-ink hover:border-sky"}`}
                          >
                            {moduleText(m, lang).headline}
                            <span className={on ? "text-white/85" : "text-muted"}>+{fmtRate(arate, currency)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Link
                  href={p.code === "ENTERPRISE" ? `/${lang}/enterprise` : `/${lang}/signup?plan=${p.code}${sel.size ? `&addons=${Array.from(sel).join(",")}` : ""}`}
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
                {catalog.packages.map((p) => {
                  const pBase = unitPrice(p.prices, currency);
                  return (
                    <th key={p.code} className="px-3 py-3 text-center font-semibold text-heading">
                      <div className={p.code === "BUSINESS" ? "text-sky-text" : ""}>
                        {pkgName(p.code, p.name)}
                      </div>
                      <div className="mt-0.5 text-xs font-normal text-muted">
                        {pBase === 0 ? dict.free : `${fmtRate(pBase * factor, currency)} ${dict.perEmployee}`}
                      </div>
                    </th>
                  );
                })}
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
                          <span className="mx-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-tint-sky text-sky-text">
                            <Check size={14} strokeWidth={3} />
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-8">
          <p className="mb-4 text-sm text-muted">
            {dict.selectModules}
          </p>
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div className="grid gap-3 sm:grid-cols-2">
            {catalog.modules.map((m) => {
              const checked = selected.has(m.code);
              const auto = resolved.has(m.code) && !checked;
              const rate = unitPrice(m.prices, currency) * factor;
              const reqNames = m.requires
                .filter((r) => r.kind === "required")
                .map((r) => {
                  const dep = catalog.modules.find((x) => x.code === r.code);
                  return dep ? moduleText(dep, lang).headline : r.code;
                });
              return (
                <button
                  key={m.code}
                  type="button"
                  onClick={() => toggleModule(m.code)}
                  className={`flex items-start gap-3 rounded-[14px] border p-4 text-left transition ${
                    checked
                      ? "border-sky bg-tint-sky-strong"
                      : auto
                        ? "border-line bg-mist"
                        : "border-line bg-surface hover:border-sky"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md ${checked || auto ? "bg-sky-strong text-white" : "border-2 border-line"}`}
                  >
                    {(checked || auto) && <Check size={13} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[14.5px] font-bold text-ink">
                        {moduleText(m, lang).headline}
                      </span>
                      <span className="shrink-0 text-[13px] font-extrabold text-sky-text">
                        {rate === 0 ? dict.free : `+${fmtRate(rate, currency)}`}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">
                      {moduleText(m, lang).tagline}
                    </span>
                    {reqNames.length > 0 && (
                      <span className="mt-1.5 block text-[11px] text-muted">
                        {dict.requires} : {reqNames.join(", ")}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="rounded-2xl border border-line bg-surface p-[22px] lg:sticky lg:top-24">
            <div className="text-[13px] font-bold uppercase tracking-[0.05em] text-muted">
              {dict.selectionTitle}
            </div>
            <div className="mt-3.5 flex flex-col gap-2 text-[13.5px]">
              {Array.from(resolved).length === 0 ? (
                <p className="text-muted">{dict.emptySelection}</p>
              ) : (
                Array.from(resolved).map((code) => {
                  const m = catalog.modules.find((x) => x.code === code);
                  if (!m) return null;
                  const auto = !selected.has(code);
                  const rate = unitPrice(m.prices, currency) * factor;
                  return (
                    <div key={code} className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate text-ink">
                        {moduleText(m, lang).headline}
                        {auto && <span className="ml-1 text-[11px] text-muted">({dict.autoTag})</span>}
                      </span>
                      <span className="shrink-0 font-semibold text-ink">
                        {rate === 0 ? dict.free : `+${fmtRate(rate, currency)}`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 border-t border-line pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">{dict.perEmployeeShort}</span>
                <span className="font-bold text-ink">{fmtRate(customRate, currency)}</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-xs uppercase tracking-wide text-muted">
                  {dict.estTotal} ({employees})
                </span>
                <span className="text-2xl font-extrabold text-heading">
                  {fmtMoney(periodTotal(customRate), currency)}
                  <span className="text-xs font-normal text-muted"> {periodLabel}</span>
                </span>
              </div>
              <Link
                href={`/${lang}/signup`}
                className="mt-4 block rounded-full bg-sky-strong py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#08607f]"
              >
                {dict.startTrial}
              </Link>
            </div>
          </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
