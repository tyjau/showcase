"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Mail } from "lucide-react";
import { apiRequestPartner, getToken } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { isHexColor, isHttpUrl } from "@/lib/cobrand";

type Dict = Record<string, string>;

const INPUT = "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-sky";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// A referrer code is a URL-safe slug (shared as ?ref=<code>) — letters/digits/dash/underscore.
const CODE = /^[a-z0-9][a-z0-9_-]{1,30}$/;

// Self-service "become a partner" tunnel — replaces the old mailto in partner-portal.
// Captures brand basics (name/email/desired code + optional logo & colours) and POSTs
// request_partner (public, rate-limited). On success the backend provisions a pending
// referrer + a user with a magic link, so we show a "check your email" state.
export function BecomePartner({ lang, dict }: { lang: string; dict: Dict }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primary, setPrimary] = useState("#2563eb");
  const [secondary, setSecondary] = useState("#0f172a");
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  // Already signed in → become a partner is a capability of the account now: send them to
  // the account's Parrainage tab (inline enrolment), not a separate application. This public
  // form stays for signed-OUT acquisition (request_partner provisions an account + magic link).
  useEffect(() => {
    if (getToken()) {
      setSignedIn(true);
      router.replace(`/${lang}/account#referrals`);
    }
  }, [lang, router]);

  // Signed-in visitors are being redirected (above) — render nothing to avoid flashing the
  // public application form.
  const slug = code.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

  function validate(): string | null {
    if (!name.trim()) return dict.errRequired;
    if (!EMAIL.test(email.trim())) return dict.errEmail;
    if (!CODE.test(slug)) return dict.errCode;
    if (logoUrl.trim() && !isHttpUrl(logoUrl.trim())) return dict.errLogo;
    if (!isHexColor(primary) || !isHexColor(secondary)) return dict.errColor;
    return null;
  }

  async function submit() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    setError(null);

    // Public application (signed-out acquisition) — provisions a pending partner + emails a
    // magic link. Signed-in visitors are redirected to the account's Parrainage tab instead.
    const res = await apiRequestPartner({
      name: name.trim(),
      email: email.trim(),
      code: slug,
      ...(logoUrl.trim() ? { logo_url: logoUrl.trim() } : {}),
      primary_color: primary,
      secondary_color: secondary,
    });
    setSubmitting(false);
    if (res.ok) {
      trackEvent("generate_lead", { form: "become_partner" }); // acquisition partenaire (co-brand)
      setDone(true);
      return;
    }
    // 409 = desired code already taken; surface a specific hint, else the generic error.
    setError(/409|taken|exist/i.test(res.error ?? "") ? dict.errCodeTaken : dict.errGeneric);
  }

  // Signed-in → redirected to the account's Parrainage tab; render nothing meanwhile.
  if (signedIn) return null;

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-ok-bg text-ok-fg">
          <Mail size={28} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-heading">{dict.doneTitle}</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">{dict.doneBody}</p>
        <p className="mt-1 text-sm font-medium text-ink">{email.trim()}</p>
        <Link
          href={`/${lang}/login`}
          className="mt-6 inline-flex rounded-full bg-sky-strong px-6 py-3 text-sm font-semibold text-white"
        >
          {dict.doneCta}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">{dict.title}</h1>
      <p className="mt-1 text-muted">{dict.lead}</p>

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">{dict.name}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={dict.namePh} className={INPUT} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">{dict.email}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={dict.emailPh}
              className={INPUT}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">{dict.code}</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={dict.codePh}
              className={INPUT}
            />
            <span className="mt-1 block text-xs text-muted">
              {dict.codeHint} <span className="font-mono text-ink">?ref={slug || dict.codePh}</span>
            </span>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">{dict.logo}</span>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder={dict.logoPh}
              className={INPUT}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">{dict.primary}</span>
              <div className="flex items-stretch gap-2">
                <input
                  type="color"
                  value={isHexColor(primary) ? primary : "#2563eb"}
                  onChange={(e) => setPrimary(e.target.value)}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-surface p-1"
                  aria-label={dict.primary}
                />
                <input value={primary} onChange={(e) => setPrimary(e.target.value)} className={INPUT} />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">{dict.secondary}</span>
              <div className="flex items-stretch gap-2">
                <input
                  type="color"
                  value={isHexColor(secondary) ? secondary : "#0f172a"}
                  onChange={(e) => setSecondary(e.target.value)}
                  className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-surface p-1"
                  aria-label={dict.secondary}
                />
                <input value={secondary} onChange={(e) => setSecondary(e.target.value)} className={INPUT} />
              </div>
            </label>
          </div>
        </div>

        {/* Live brand preview — a mini co-branded card themed by the chosen colours. */}
        <div className="md:w-64">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">{dict.previewLabel}</p>
          <div
            className="overflow-hidden rounded-xl border border-line"
            style={{ borderColor: isHexColor(primary) ? primary : undefined }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3 text-white"
              style={{ backgroundColor: isHexColor(secondary) ? secondary : "#0f172a" }}
            >
              {logoUrl.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl.trim()} alt="" className="h-6 w-6 rounded object-contain" />
              ) : (
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
                  style={{ backgroundColor: isHexColor(primary) ? primary : "#2563eb" }}
                >
                  {(name.trim()[0] || "S").toUpperCase()}
                </span>
              )}
              <span className="truncate text-sm font-semibold">{name.trim() || dict.previewBrand}</span>
            </div>
            <div className="space-y-2 bg-surface p-4">
              <div className="h-2 w-3/4 rounded bg-mist" />
              <div className="h-2 w-1/2 rounded bg-mist" />
              <button
                type="button"
                className="mt-1 w-full rounded-full px-3 py-2 text-xs font-semibold text-white"
                style={{ backgroundColor: isHexColor(primary) ? primary : "#2563eb" }}
              >
                {dict.previewCta}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-err-border bg-err-bg px-4 py-2.5 text-sm text-err-fg">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-full bg-sky-strong px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "…" : <>{dict.cta} <Check size={16} /></>}
        </button>
        <Link href={`/${lang}/partner/login`} className="text-sm text-muted hover:text-ink">
          {dict.haveAccount}
        </Link>
      </div>
      <p className="mt-3 text-xs text-muted">{dict.rewardNote}</p>
    </div>
  );
}
