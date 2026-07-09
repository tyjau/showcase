"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import {
  type Catalog,
  type CatalogModule,
  type Money,
  moduleText,
} from "@/lib/catalog";
import { useCurrency } from "./currency-provider";
import { usePartner } from "./partner-provider";
import { apiPost } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { formatMoney, formatRate } from "@/lib/money";
import { TurnstileWidget } from "@/components/turnstile-widget";

const TURNSTILE_ON = !!process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY;

type Dict = {
  steps: Record<string, string>;
  planTitle: string;
  planLead: string;
  employees: string;
  addOptions: string;
  perEmployee: string;
  estTotal: string;
  monthlyTotal: string;
  free: string;
  popular: string;
  workspaceTitle: string;
  workspaceLead: string;
  companyName: string;
  companyNamePh: string;
  subdomain: string;
  subdomainTaken: string;
  country: string;
  countryPh: string;
  countryDefault: string;
  countryHelp: string;
  accountTitle: string;
  accountLead: string;
  firstName: string;
  lastName: string;
  email: string;
  emailPh: string;
  reviewTitle: string;
  reviewLead: string;
  rPlan: string;
  rOptions: string;
  rWorkspace: string;
  rAdmin: string;
  termsPre: string;
  termsAnd: string;
  create: string;
  back: string;
  next: string;
  successTitle: string;
  successBody: string;
  successCta: string;
  none: string;
};

function unitPrice(prices: Money[], currency: string): number {
  const p = prices.find((x) => x.currency === currency && x.cycle === "monthly");
  return p ? p.amount : 0;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

const STEP_KEYS = ["plan", "workspace", "account", "review"] as const;
const INPUT_CLS =
  "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-sky";

// Curated list — countries where SkyRH compliance is available (France + francophone Africa + core EU).
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

export function SignupWizard({
  catalog,
  countries,
  lang,
  dict,
  legal,
}: {
  catalog: Catalog;
  countries: string[];
  lang: string;
  dict: Dict;
  legal: { terms: string; privacy: string };
}) {
  const { currency } = useCurrency();
  // Locale-aware money formatters (FR places the symbol after: "1 234 $US").
  const fmtRate = (amount: number, cur: string) => formatRate(amount, cur, lang);
  const fmtMoney = (amount: number, cur: string) => formatMoney(amount, cur, lang);
  const { partner, refCode, utm } = usePartner();
  const [step, setStep] = useState(0);
  const [planCode, setPlanCode] = useState("BUSINESS");
  const [addons, setAddons] = useState<Set<string>>(() => new Set());
  const [employees, setEmployees] = useState(25);
  const [company, setCompany] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [subTouched, setSubTouched] = useState(false);
  const [country, setCountry] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const plan = sp.get("plan");
    if (plan && catalog.packages.some((p) => p.code === plan)) setPlanCode(plan);
    const ad = sp.get("addons");
    if (ad) setAddons(new Set(ad.split(",").filter(Boolean)));
  }, [catalog]);

  useEffect(() => {
    if (!subTouched) setSubdomain(slugify(company));
  }, [company, subTouched]);

  const pkg =
    catalog.packages.find((p) => p.code === planCode) ?? catalog.packages[0];
  const addonMods = catalog.modules.filter(
    (m) => m.isAddon && pkg && !pkg.modules.includes(m.code),
  );
  const base = pkg ? unitPrice(pkg.prices, currency) : 0;
  const addonSum = addonMods.reduce(
    (s, m) => (addons.has(m.code) ? s + unitPrice(m.prices, currency) : s),
    0,
  );
  const rate = base + addonSum;
  const isFree = rate === 0;
  // Co-brand: configurable billing unit (default per-employee) + partner success domain.
  const billingUnit = partner?.pricing?.billing_unit ?? "per_employee";
  const monthlyTotal = billingUnit === "per_company" ? rate : rate * employees;
  const domainBase = partner?.domain ?? "skyrh.app";

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const subOk = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(subdomain);
  const canNext =
    step === 0
      ? !!pkg
      : step === 1
        ? company.trim().length > 1 && subOk && country.trim().length > 1
        : step === 2
          ? firstName.trim().length > 0 && lastName.trim().length > 0 && emailOk
          : agree && (!TURNSTILE_ON || !!captcha);

  function toggleAddon(code: string) {
    setAddons((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await apiPost("signup_request", {
      email,
      company_name: company,
      subdomain,
      plan_code: planCode,
      addons: Array.from(addons),
      employees,
      first_name: firstName,
      last_name: lastName,
      country,
      currency,
      lang,
      turnstile_token: captcha,
      // Attribution partenaire (funnels co-brandés) — referrers/referrals (back migr.112)
      ...(refCode ? { referral_code: refCode } : {}),
      ...(utm.source ? { utm_source: utm.source } : {}),
      ...(utm.campaign ? { utm_campaign: utm.campaign } : {}),
      ...(utm.medium ? { utm_medium: utm.medium } : {}),
    });
    setSubmitting(false);
    if (res.ok) {
      trackEvent("sign_up", { method: "email", plan: planCode }); // conversion clé du funnel showcase
      setDone(true);
    } else {
      setError(res.error ?? "Something went wrong");
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-ok-bg text-ok-fg">
          <Check size={28} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-heading">
          {dict.successTitle}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-muted">{dict.successBody}</p>
        <div className="mt-3 text-sm">
          <span className="text-muted">{subdomain}</span>
          <span className="font-semibold text-ink">.{domainBase}</span>
        </div>
        <Link
          href={`/${lang}`}
          className="mt-6 inline-flex rounded-full bg-sky-strong px-6 py-3 text-sm font-semibold text-white"
        >
          {dict.successCta}
        </Link>
      </div>
    );
  }

  const addonNames = Array.from(addons)
    .map((c) => catalog.modules.find((m) => m.code === c))
    .filter((m): m is CatalogModule => !!m)
    .map((m) => moduleText(m, lang).headline);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-[0_24px_60px_-40px_rgba(8,24,40,0.5)] sm:p-8">
      <div className="mb-8 flex items-center justify-center">
        {STEP_KEYS.map((k, i) => (
          <div key={k} className="flex items-center">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${i <= step ? "bg-sky-strong text-white" : "bg-mist text-muted"}`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </span>
            <span
              className={`ml-2 hidden text-sm sm:inline ${i === step ? "font-semibold text-heading" : "text-muted"}`}
            >
              {dict.steps[k]}
            </span>
            {i < STEP_KEYS.length - 1 && (
              <span className="mx-3 h-px w-6 bg-line sm:w-10" />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <h1 className="text-2xl font-bold text-heading">{dict.planTitle}</h1>
          <p className="mt-1 text-muted">{dict.planLead}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {catalog.packages.map((p) => {
              const pBase = unitPrice(p.prices, currency);
              const active = p.code === planCode;
              const pop = p.code === "BUSINESS";
              return (
                <button
                  key={p.code}
                  type="button"
                  onClick={() => setPlanCode(p.code)}
                  className={`rounded-xl p-4 text-left transition ${active ? "border-2 border-sky bg-tint-sky-strong" : "border border-line bg-surface hover:border-sky"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink">{p.name}</span>
                    {pop && (
                      <span className="rounded-full bg-tint-sky px-2 py-0.5 text-[11px] font-semibold text-sky-text">
                        {dict.popular}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {pBase === 0 ? (
                      dict.free
                    ) : (
                      <>
                        <span className="font-semibold text-heading">
                          {fmtRate(pBase, currency)}
                        </span>{" "}
                        {dict.perEmployee}
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm">
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
              className="flex-1 accent-sky"
            />
            <span className="w-10 font-semibold text-ink">{employees}</span>
          </div>

          {addonMods.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 text-sm font-semibold text-ink">
                {dict.addOptions}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {addonMods.map((m) => {
                  const on = addons.has(m.code);
                  const ar = unitPrice(m.prices, currency);
                  return (
                    <button
                      key={m.code}
                      type="button"
                      onClick={() => toggleAddon(m.code)}
                      className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition ${on ? "border-sky bg-tint-sky-strong" : "border-line bg-surface hover:border-sky"}`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${on ? "bg-sky-strong text-white" : "border border-line"}`}
                      >
                        {on && <Check size={11} />}
                      </span>
                      <span className="flex-1 truncate text-ink">
                        {moduleText(m, lang).headline}
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        +{fmtRate(ar, currency)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 rounded-xl bg-mist p-4 text-center">
            <span className="text-xs uppercase tracking-wide text-muted">
              {dict.estTotal}
            </span>
            <div className="mt-1 text-2xl font-bold text-heading">
              {isFree ? (
                dict.free
              ) : (
                <>
                  {fmtMoney(monthlyTotal, currency)}
                  <span className="text-sm font-normal text-muted">
                    {" "}
                    {dict.monthlyTotal}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold text-heading">
            {dict.workspaceTitle}
          </h1>
          <p className="mt-1 text-muted">{dict.workspaceLead}</p>
          <div className="mt-6 space-y-4">
            <Field label={dict.companyName}>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={dict.companyNamePh}
                className={INPUT_CLS}
              />
            </Field>
            <Field label={dict.subdomain}>
              <div className="flex items-center rounded-lg border border-line focus-within:border-sky">
                <input
                  value={subdomain}
                  onChange={(e) => {
                    setSubTouched(true);
                    setSubdomain(slugify(e.target.value));
                  }}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                />
                <span className="px-3 text-sm text-muted">.{domainBase}</span>
              </div>
              {subdomain.length > 0 && !subOk && (
                <p className="mt-1 text-xs text-err-fg">
                  {dict.subdomainTaken}
                </p>
              )}
            </Field>
            <Field label={dict.country}>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={`${INPUT_CLS} cursor-pointer ${country ? "text-ink" : "text-muted"}`}
              >
                <option value="">{dict.countryDefault}</option>
                {countries.map((c) => (
                  <option key={c} value={c} className="text-ink">
                    {c}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted">{dict.countryHelp}</p>
            </Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold text-heading">{dict.accountTitle}</h1>
          <p className="mt-1 text-muted">{dict.accountLead}</p>
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={dict.firstName}>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={INPUT_CLS}
                />
              </Field>
              <Field label={dict.lastName}>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={INPUT_CLS}
                />
              </Field>
            </div>
            <Field label={dict.email}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={dict.emailPh}
                className={INPUT_CLS}
              />
            </Field>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold text-heading">{dict.reviewTitle}</h1>
          <p className="mt-1 text-muted">{dict.reviewLead}</p>
          <dl className="mt-6 divide-y divide-line rounded-xl border border-line">
            <Row
              label={dict.rPlan}
              value={
                isFree
                  ? `${pkg?.name ?? planCode} · ${dict.free}`
                  : billingUnit === "per_company"
                    ? `${pkg?.name ?? planCode} · ${fmtMoney(monthlyTotal, currency)} ${dict.monthlyTotal}`
                    : `${pkg?.name ?? planCode} · ${fmtRate(rate, currency)} ${dict.perEmployee} × ${employees}`
              }
            />
            <Row
              label={dict.rOptions}
              value={addonNames.length ? addonNames.join(", ") : dict.none}
            />
            <Row label={dict.rWorkspace} value={`${subdomain}.${domainBase}`} />
            <Row
              label={dict.rAdmin}
              value={`${firstName} ${lastName} · ${email}`}
            />
          </dl>
          <label className="mt-5 flex items-start gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 accent-sky"
            />
            <span>
              {dict.termsPre}{" "}
              <Link
                href={`/${lang}/legal/terms`}
                className="text-sky-text underline"
              >
                {legal.terms}
              </Link>{" "}
              {dict.termsAnd}{" "}
              <Link
                href={`/${lang}/legal/privacy`}
                className="text-sky-text underline"
              >
                {legal.privacy}
              </Link>
              .
            </span>
          </label>
          <TurnstileWidget onToken={setCaptcha} />
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-lg border border-err-border bg-err-bg px-4 py-2.5 text-sm text-err-fg">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="inline-flex items-center gap-1 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-heading transition hover:border-sky"
          >
            <ChevronLeft size={16} /> {dict.back}
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => canNext && setStep(step + 1)}
            className={`inline-flex items-center gap-1 rounded-full px-6 py-2.5 text-sm font-semibold ${canNext ? "bg-sky-strong text-white" : "cursor-not-allowed bg-mist text-muted"}`}
          >
            {dict.next} <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            disabled={!canNext || submitting}
            onClick={submit}
            className={`rounded-full px-6 py-2.5 text-sm font-semibold ${canNext && !submitting ? "bg-sky-strong text-white" : "cursor-not-allowed bg-mist text-muted"}`}
          >
            {submitting ? "…" : dict.create}
          </button>
        )}
      </div>
    </div>
  );
}
