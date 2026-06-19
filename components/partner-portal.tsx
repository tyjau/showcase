"use client";

import { type CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiAuthed, apiUpdateCobrand, getToken, clearSession } from "@/lib/api";

type Dict = Record<string, string>;
type Referral = {
  referred_email: string | null;
  status: string;
  reward_amount: number | null;
  created_at: string;
  converted_at: string | null;
};
type Data = {
  is_referrer: boolean;
  code: string | null;
  brand_name: string | null;
  reward_type: string | null;
  reward_value: number | null;
  currency: string | null;
  reward_total: number;
  referrals: Referral[];
  brand: { logo_url: string | null; primary_color: string | null; secondary_color: string | null; domain: string | null } | null;
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-heading">{value}</p>
    </div>
  );
}

const COBRAND_INPUT = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-sky";
const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

type Brand = { logo_url: string | null; primary_color: string | null; secondary_color: string | null; domain: string | null };

// Co-brand editor — the logged-in partner edits their OWN referrer co-brand (the backend
// resolves the referrer from the JWT owner_user_id). Live preview reuses the partner-provider
// CSS-var contract: we set --brand-sky / --brand-navy on a scoped preview wrapper so the
// themed swatch updates as you type, without repainting the whole portal. Submit →
// update_referrer_cobrand. `brand_name` comes from the form; the others mirror partner-provider.
function CobrandEditor({
  dict,
  initialBrandName,
  initialBrand,
}: {
  dict: Dict;
  initialBrandName: string | null;
  initialBrand: Brand | null;
}) {
  const [brandName, setBrandName] = useState(initialBrandName ?? "");
  const [logoUrl, setLogoUrl] = useState(initialBrand?.logo_url ?? "");
  const [primary, setPrimary] = useState(initialBrand?.primary_color ?? "#2563eb");
  const [secondary, setSecondary] = useState(initialBrand?.secondary_color ?? "#0f172a");
  const [domain, setDomain] = useState(initialBrand?.domain ?? "");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setError(null);
    if (logoUrl.trim() && !/^https?:\/\//.test(logoUrl.trim())) {
      setError(dict.cbErrLogo);
      return;
    }
    if ((primary && !HEX.test(primary)) || (secondary && !HEX.test(secondary))) {
      setError(dict.cbErrColor);
      return;
    }
    setSaving(true);
    const res = await apiUpdateCobrand({
      brand_name: brandName.trim(),
      logo_url: logoUrl.trim(),
      primary_color: primary,
      secondary_color: secondary,
      domain: domain.trim(),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error || dict.cbErrGeneric);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Scoped CSS vars → exactly the contract partner-provider injects globally (--brand-sky / --brand-navy).
  const previewVars = {
    ...(HEX.test(primary) ? { ["--brand-sky" as string]: primary } : {}),
    ...(HEX.test(secondary) ? { ["--brand-navy" as string]: secondary } : {}),
  } as CSSProperties;

  return (
    <div className="mt-4 rounded-xl border border-line p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-xs uppercase tracking-wide text-muted">{dict.cbTitle}</span>
        <span className="text-sm font-semibold text-sky">{open ? dict.cbHide : dict.cbEdit}</span>
      </button>

      {/* Collapsed: the current co-brand at a glance (swatches + domain). */}
      {!open && (
        <div className="mt-2 flex items-center gap-3 text-sm text-muted">
          {HEX.test(primary) && (
            <span className="inline-block h-6 w-6 rounded-full border border-line" style={{ backgroundColor: primary }} />
          )}
          {HEX.test(secondary) && (
            <span className="inline-block h-6 w-6 rounded-full border border-line" style={{ backgroundColor: secondary }} />
          )}
          {domain ? <span>{domain}</span> : <span className="italic">{dict.cbEmpty}</span>}
        </div>
      )}

      {open && (
        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink">{dict.cbBrandName}</span>
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} className={COBRAND_INPUT} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink">{dict.cbLogo}</span>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder={dict.cbLogoPh}
                className={COBRAND_INPUT}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink">{dict.cbPrimary}</span>
                <div className="flex items-stretch gap-2">
                  <input
                    type="color"
                    value={HEX.test(primary) ? primary : "#2563eb"}
                    onChange={(e) => setPrimary(e.target.value)}
                    className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-line bg-surface p-1"
                    aria-label={dict.cbPrimary}
                  />
                  <input value={primary} onChange={(e) => setPrimary(e.target.value)} className={COBRAND_INPUT} />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink">{dict.cbSecondary}</span>
                <div className="flex items-stretch gap-2">
                  <input
                    type="color"
                    value={HEX.test(secondary) ? secondary : "#0f172a"}
                    onChange={(e) => setSecondary(e.target.value)}
                    className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-line bg-surface p-1"
                    aria-label={dict.cbSecondary}
                  />
                  <input value={secondary} onChange={(e) => setSecondary(e.target.value)} className={COBRAND_INPUT} />
                </div>
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink">{dict.cbDomain}</span>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder={dict.cbDomainPh}
                className={COBRAND_INPUT}
              />
            </label>
          </div>

          {/* Live preview — themed by --brand-sky / --brand-navy (the partner-provider contract). */}
          <div className="md:w-60" style={previewVars}>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">{dict.cbPreview}</p>
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="flex items-center gap-2 px-4 py-3 text-white" style={{ backgroundColor: "var(--brand-navy, #0f172a)" }}>
                {logoUrl.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl.trim()} alt="" className="h-6 w-6 rounded object-contain" />
                ) : (
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
                    style={{ backgroundColor: "var(--brand-sky, #2563eb)" }}
                  >
                    {(brandName.trim()[0] || "S").toUpperCase()}
                  </span>
                )}
                <span className="truncate text-sm font-semibold">{brandName.trim() || dict.cbPreviewBrand}</span>
              </div>
              <div className="space-y-2 bg-surface p-4">
                <div className="h-2 w-3/4 rounded bg-mist" />
                <div className="h-2 w-1/2 rounded bg-mist" />
                <button
                  type="button"
                  className="mt-1 w-full rounded-full px-3 py-2 text-xs font-semibold text-white"
                  style={{ backgroundColor: "var(--brand-sky, #2563eb)" }}
                >
                  {dict.cbPreviewCta}
                </button>
              </div>
            </div>
            {domain.trim() && <p className="mt-2 truncate text-xs text-muted">{domain.trim()}</p>}
          </div>

          {error && <p className="text-sm text-err-fg md:col-span-2">{error}</p>}
          <div className="flex items-center gap-3 md:col-span-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-sky px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? dict.cbSaving : dict.cbSave}
            </button>
            {saved && <span className="text-sm font-medium text-ok-fg">{dict.cbSaved}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// Dedicated partner/reseller surface (distinct from the account portal's Parrainage tab):
// referral code + shareable link, reward config, referrals + commissions. Reuses my_referrals.
export function PartnerPortal({ lang, dict }: { lang: string; dict: Dict }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "out" | "ready">("loading");
  const [d, setD] = useState<Data | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      setState("out");
      return;
    }
    apiAuthed("my_referrals").then((res) => {
      if (!res.ok) {
        if (res.status === 401) clearSession();
        setState("out");
        return;
      }
      setD(res.data as Data);
      setState("ready");
    });
  }, []);

  function logout() {
    clearSession();
    router.push(`/${lang}/partner/login`);
  }

  if (state === "loading") return <p className="text-muted">{dict.loading}</p>;
  if (state === "out") {
    return (
      <div>
        <p className="text-muted">{dict.signedOut}</p>
        <Link href={`/${lang}/partner/login`} className="mt-4 inline-flex rounded-full bg-sky px-6 py-3 text-sm font-semibold text-white">
          {dict.signin}
        </Link>
      </div>
    );
  }

  const link = typeof window !== "undefined" && d?.code ? `${window.location.origin}/${lang}/signup?ref=${d.code}` : "";
  const referrals = d?.referrals ?? [];
  const converted = referrals.filter((r) => r.status === "converted").length;

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">{dict.title}</h1>
          <p className="text-muted">{dict.subtitle}</p>
        </div>
        <button onClick={logout} className="shrink-0 text-sm text-muted hover:text-ink">
          {dict.logout}
        </button>
      </div>

      {!d?.is_referrer ? (
        <div className="mt-8 rounded-xl border border-line p-6">
          <p className="text-muted">{dict.notPartner}</p>
          <Link href={`/${lang}/become-partner`} className="mt-4 inline-flex rounded-full bg-sky px-6 py-2.5 text-sm font-semibold text-white">
            {dict.becomePartner}
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Metric label={dict.mReferrals} value={String(referrals.length)} />
            <Metric label={dict.mConverted} value={String(converted)} />
            <Metric label={dict.mEarned} value={`${d.reward_total ?? 0} ${d.currency ?? ""}`.trim()} />
          </div>

          <div className="mt-6 rounded-xl border border-line p-5">
            <p className="text-xs uppercase tracking-wide text-muted">{dict.codeLabel}</p>
            <p className="mt-1 font-mono text-lg font-bold text-heading">{d.code}</p>
            {d.reward_value != null && (
              <p className="mt-2 text-sm text-muted">
                {dict.rewardLabel}: {d.reward_value}
                {d.reward_type === "percent" ? "%" : ` ${d.currency ?? ""}`}
              </p>
            )}
            <div className="mt-4">
              <p className="mb-1 text-xs font-medium text-ink">{dict.shareLabel}</p>
              <div className="flex items-stretch gap-2">
                <input readOnly value={link} className="w-full rounded-lg border border-line px-3 py-2 text-sm text-muted" />
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="shrink-0 rounded-full bg-sky px-4 py-2 text-sm font-semibold text-white"
                >
                  {copied ? dict.copied : dict.copy}
                </button>
              </div>
            </div>
          </div>

          <CobrandEditor dict={dict} initialBrandName={d.brand_name} initialBrand={d.brand} />

          <h2 className="mt-8 text-lg font-bold text-heading">{dict.referralsTitle}</h2>
          {referrals.length === 0 ? (
            <p className="mt-3 text-muted">{dict.noReferrals}</p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-sm">
                <thead className="bg-mist text-left text-xs uppercase text-muted">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">{dict.colEmail}</th>
                    <th className="px-4 py-2.5 font-semibold">{dict.colStatus}</th>
                    <th className="px-4 py-2.5 font-semibold">{dict.colDate}</th>
                    <th className="px-4 py-2.5 text-right font-semibold">{dict.colReward}</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="px-4 py-2.5">{r.referred_email || "—"}</td>
                      <td className="px-4 py-2.5">{r.status}</td>
                      <td className="px-4 py-2.5 text-muted">{(r.converted_at || r.created_at || "").slice(0, 10)}</td>
                      <td className="px-4 py-2.5 text-right">{r.reward_amount ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
