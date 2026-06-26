"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { apiAuthed, apiEnrollPartner, apiUpdateCobrand } from "@/lib/api";
import { isHexColor } from "@/lib/cobrand";

type Dict = Record<string, string>;
type Referral = {
  referred_email: string | null;
  status: string;
  reward_amount: number | null;
  created_at: string;
  converted_at: string | null;
};
type Offer = { code: string | null; kind: string; value_type: string; value: number; currency: string | null };
type Brand = { logo_url: string | null; primary_color: string | null; secondary_color: string | null; domain: string | null };
type Data = {
  is_referrer: boolean;
  code: string | null;
  brand_name: string | null;
  status: string | null;
  reward_type: string | null;
  reward_value: number | null;
  currency: string | null;
  reward_total: number;
  referrals: Referral[];
  applied_offers: Offer[];
  brand: Brand | null;
};

const INPUT = "w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-sky";

function offerValue(value: number, valueType: string, currency: string | null): string {
  return valueType === "percent" ? `${value}%` : `${value} ${currency ?? ""}`.trim();
}

// Inline enrolment: turn the current account into a partner (a capability — no separate
// login/identity). On success the parent re-fetches and the full partner UI shows in place.
function EnrollPartner({ dict, onDone }: { dict: Dict; onDone: () => void }) {
  const [code, setCode] = useState("");
  const [brand, setBrand] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const slug = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  async function submit() {
    if (slug.length < 3) {
      setErr(dict.refEnrollErr);
      return;
    }
    setBusy(true);
    setErr(null);
    const res = await apiEnrollPartner({ code: slug, brand_name: brand.trim() });
    setBusy(false);
    if (res.ok) onDone();
    else setErr(res.error || dict.refEnrollErr);
  }

  return (
    <div className="rounded-xl border border-line bg-mist p-6">
      <p className="mx-auto max-w-md text-center text-muted">{dict.refNotPartner}</p>
      <div className="mx-auto mt-5 max-w-sm space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink">{dict.refEnrollCode}</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={dict.refEnrollCodePh} className={INPUT} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink">{dict.refEnrollBrand}</span>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} className={INPUT} />
        </label>
        {err && <p className="text-sm text-err-fg">{err}</p>}
        <button
          type="button"
          onClick={submit}
          disabled={busy || slug.length < 3}
          className="w-full rounded-full bg-sky-strong px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#08607f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? dict.refEnrolling : dict.refBecomePartner}
        </button>
      </div>
    </div>
  );
}

// Co-brand editor — the account edits its OWN referrer brand (backend resolves the referrer
// from the billing token's company). Live-ish preview via scoped CSS vars. Submit → update_referrer_cobrand.
function CobrandEditor({ dict, initialBrandName, initialBrand }: { dict: Dict; initialBrandName: string | null; initialBrand: Brand | null }) {
  const [brandName, setBrandName] = useState(initialBrandName ?? "");
  const [logoUrl, setLogoUrl] = useState(initialBrand?.logo_url ?? "");
  const [primary, setPrimary] = useState(initialBrand?.primary_color ?? "#0F9ED5");
  const [secondary, setSecondary] = useState(initialBrand?.secondary_color ?? "#0E2841");
  const [domain, setDomain] = useState(initialBrand?.domain ?? "");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setErr(null);
    if (logoUrl.trim() && !/^https?:\/\//.test(logoUrl.trim())) {
      setErr(dict.refCbErrLogo);
      return;
    }
    if ((primary && !isHexColor(primary)) || (secondary && !isHexColor(secondary))) {
      setErr(dict.refCbErrColor);
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
      setErr(res.error || dict.refCbErr);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const previewVars = {
    ...(isHexColor(primary) ? { ["--brand-sky" as string]: primary } : {}),
    ...(isHexColor(secondary) ? { ["--brand-navy" as string]: secondary } : {}),
  } as CSSProperties;

  return (
    <div className="rounded-xl border border-line p-5">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 text-left">
        <span className="text-xs uppercase tracking-wide text-muted">{dict.refCbTitle}</span>
        <span className="flex items-center gap-2 text-sm font-semibold text-sky-text">
          {isHexColor(primary) && <span className="inline-block h-5 w-5 rounded-full border border-line" style={{ backgroundColor: primary }} />}
          {open ? dict.refCbHide : dict.refCbEdit}
        </span>
      </button>

      {open && (
        <div className="mt-4 grid gap-6 md:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink">{dict.refCbBrand}</span>
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} className={INPUT} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink">{dict.refCbLogo}</span>
              <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder={dict.refCbLogoPh} className={INPUT} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([["primary", primary, setPrimary, dict.refCbPrimary, "#0F9ED5"], ["secondary", secondary, setSecondary, dict.refCbSecondary, "#0E2841"]] as const).map(
                ([key, val, setter, label, fallback]) => (
                  <label key={key} className="block">
                    <span className="mb-1 block text-xs font-medium text-ink">{label}</span>
                    <div className="flex items-stretch gap-2">
                      <input
                        type="color"
                        value={isHexColor(val) ? val : fallback}
                        onChange={(e) => setter(e.target.value)}
                        className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-line bg-surface p-1"
                        aria-label={label}
                      />
                      <input value={val} onChange={(e) => setter(e.target.value)} className={INPUT} />
                    </div>
                  </label>
                ),
              )}
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink">{dict.refCbDomain}</span>
              <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder={dict.refCbDomainPh} className={INPUT} />
            </label>
          </div>

          <div className="md:w-56" style={previewVars}>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">{dict.refCbPreview}</p>
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="flex items-center gap-2 px-4 py-3 text-white" style={{ backgroundColor: "var(--brand-navy, #0E2841)" }}>
                {logoUrl.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl.trim()} alt="" className="h-6 w-6 rounded object-contain" />
                ) : (
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold" style={{ backgroundColor: "var(--brand-sky, #0F9ED5)" }}>
                    {(brandName.trim()[0] || "S").toUpperCase()}
                  </span>
                )}
                <span className="truncate text-sm font-semibold">{brandName.trim() || dict.refCbPreviewBrand}</span>
              </div>
              <div className="space-y-2 bg-surface p-4">
                <div className="h-2 w-3/4 rounded bg-mist" />
                <div className="h-2 w-1/2 rounded bg-mist" />
                <button type="button" className="mt-1 w-full rounded-full px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: "var(--brand-sky, #0F9ED5)" }}>
                  {dict.refCbPreviewCta}
                </button>
              </div>
            </div>
          </div>

          {err && <p className="text-sm text-err-fg md:col-span-2">{err}</p>}
          <div className="flex items-center gap-3 md:col-span-2">
            <button type="button" onClick={save} disabled={saving} className="rounded-full bg-sky-strong px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? dict.refCbSaving : dict.refCbSave}
            </button>
            {saved && <span className="text-sm font-medium text-ok-fg">{dict.refCbSaved}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// Parrainage tab — the partner capability lives HERE, in the account (no separate /partner
// login/session). Not a referrer → inline enrolment; referrer → code + referrals + rewards
// + co-brand editor. Read-only bits (offer creation / payout) stay operator-side.
export function ReferralsSection({ dict }: { dict: Dict }) {
  const [d, setD] = useState<Data | null>(null);
  const [state, setState] = useState<"loading" | "error" | "ready">("loading");

  function load() {
    apiAuthed("my_referrals").then((res) => {
      if (!res.ok) {
        setState("error");
        return;
      }
      setD(res.data as Data);
      setState("ready");
    });
  }
  useEffect(() => {
    load();
  }, []);

  if (state === "loading") return <p className="text-muted">{dict.loading}</p>;
  if (state === "error" || !d) return <p className="text-sm text-err-fg">{dict.payError}</p>;

  if (!d.is_referrer) {
    return <EnrollPartner dict={dict} onDone={load} />;
  }

  return (
    <div className="space-y-6">
      {d.status === "pending" && (
        <p className="rounded-xl border border-warn-border bg-warn-bg px-4 py-2.5 text-sm text-warn-fg">{dict.refPending}</p>
      )}
      <div className="rounded-xl border border-line p-5">
        <p className="text-xs uppercase tracking-wide text-muted">{dict.refCode}</p>
        <p className="mt-1 font-mono text-lg font-bold text-heading">{d.code}</p>
        {d.reward_value != null && (
          <p className="mt-2 text-sm text-muted">
            {dict.refReward}: {offerValue(d.reward_value, d.reward_type === "percent" ? "percent" : "amount", d.currency)}
            {d.reward_total > 0 ? ` · ${dict.refRewardTotal}: ${d.reward_total} ${d.currency ?? ""}` : ""}
          </p>
        )}
      </div>

      <CobrandEditor dict={dict} initialBrandName={d.brand_name} initialBrand={d.brand} />

      <div>
        <h3 className="text-sm font-bold text-heading">
          {dict.refReferrals} ({d.referrals.length})
        </h3>
        {d.referrals.length === 0 ? (
          <p className="mt-2 text-muted">{dict.refNone}</p>
        ) : (
          <div className="mt-2 overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-sm">
              <thead className="bg-mist text-left text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">{dict.refEmail}</th>
                  <th className="px-4 py-2.5 font-semibold">{dict.colStatus}</th>
                  <th className="px-4 py-2.5 text-right font-semibold">{dict.refRewardCol}</th>
                </tr>
              </thead>
              <tbody>
                {d.referrals.map((r, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-4 py-2.5">{r.referred_email || "—"}</td>
                    <td className="px-4 py-2.5">{r.status}</td>
                    <td className="px-4 py-2.5 text-right">{r.reward_amount ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {d.applied_offers.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-heading">{dict.refOffers}</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {d.applied_offers.map((o, i) => (
              <li key={i}>
                {(o.code || o.kind) + ": "}
                {offerValue(o.value, o.value_type, o.currency)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
