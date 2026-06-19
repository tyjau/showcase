"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiLoginPartner, getToken } from "@/lib/api";

type Dict = Record<string, string>;

const INPUT = "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-sky";

// Partner (referrer) login. Unlike the tenant portal login there is NO workspace slug:
// a partner is a user linked to a referrer (owner_user_id) with no tenant. We authenticate
// with scope=partner, store the partner JWT, then land on the /partner dashboard.
export function PartnerLogin({ lang, dict }: { lang: string; dict: Dict }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in → straight to /partner (don't show the form pointlessly).
  useEffect(() => {
    if (getToken()) router.replace(`/${lang}/partner`);
  }, [lang, router]);

  const canSubmit = !!email.trim() && !!password;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const res = await apiLoginPartner(email.trim(), password);
    setSubmitting(false);
    if (res.ok) router.push(`/${lang}/partner`);
    else setError(dict.error);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">{dict.title}</h1>
      <p className="mt-1 text-muted">{dict.lead}</p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">{dict.email}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={dict.emailPh}
            autoFocus
            className={INPUT}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">{dict.password}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className={INPUT}
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-err-border bg-err-bg px-4 py-2.5 text-sm text-err-fg">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={submit}
        className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-semibold ${
          canSubmit && !submitting ? "bg-sky text-white" : "cursor-not-allowed bg-mist text-muted"
        }`}
      >
        {submitting ? "…" : dict.cta}
      </button>

      <p className="mt-6 text-center text-sm text-muted">
        {dict.noAccount}{" "}
        <Link href={`/${lang}/become-partner`} className="font-semibold text-sky hover:underline">
          {dict.becomeCta}
        </Link>
      </p>
    </div>
  );
}
