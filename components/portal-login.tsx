"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiLogin, apiLoginOAuth, getToken } from "@/lib/api";

type Dict = Record<string, string>;

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "skyrh.app";
const INPUT = "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-sky";
// Dev: show the social buttons (mock OAuth). In prod, wire the real Google/Microsoft SDK + client ID.
const OAUTH_MOCK = process.env.NEXT_PUBLIC_OAUTH_MOCK === "1";

// Client portal login. Tenants live on per-workspace subdomains, so we collect the
// workspace slug (scopes the tenant) + the account owner's credentials, authenticate
// against the backend, and land on the billing/account dashboard.
export function PortalLogin({ lang, dict }: { lang: string; dict: Dict }) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in (token present) → straight to the account portal, so the header
  // "account" link and re-visiting /login don't show the form pointlessly.
  useEffect(() => {
    if (getToken()) router.replace(`/${lang}/account`);
  }, [lang, router]);

  const slug = workspace.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const canSubmit = !!slug && !!email.trim() && !!password;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const res = await apiLogin(slug, email.trim(), password);
    setSubmitting(false);
    if (res.ok) router.push(`/${lang}/account`);
    else setError(dict.error);
  }

  // Social login. The real Google/Microsoft SDK is wired when client IDs exist; in dev mock mode
  // the entered email is sent as a `mock:<email>` token (no password).
  async function social(provider: "google" | "microsoft") {
    if (!slug || !email.trim()) {
      setError(dict.error);
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await apiLoginOAuth(slug, provider, `mock:${email.trim()}`);
    setSubmitting(false);
    if (res.ok) router.push(`/${lang}/account`);
    else setError(dict.error);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">{dict.title}</h1>
      <p className="mt-1 text-muted">{dict.lead}</p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">{dict.workspaceLabel}</span>
          <div className="flex items-stretch overflow-hidden rounded-lg border border-line focus-within:border-sky">
            <input
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              placeholder={dict.placeholder}
              autoFocus
              className="w-full px-3 py-2.5 text-sm outline-none"
            />
            <span className="flex items-center whitespace-nowrap bg-mist px-3 text-sm text-muted">
              .{APP_DOMAIN}
            </span>
          </div>
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
          canSubmit && !submitting ? "bg-sky-strong text-white" : "cursor-not-allowed bg-mist text-muted"
        }`}
      >
        {submitting ? "…" : dict.cta}
      </button>

      {OAUTH_MOCK && (
        <div className="mt-4">
          <div className="flex items-center gap-3 text-xs uppercase text-muted">
            <span className="h-px flex-1 bg-line" />
            {dict.socialOr}
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-3 grid gap-2">
            <button
              type="button"
              onClick={() => social("google")}
              disabled={!slug || !email.trim() || submitting}
              className="w-full rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-heading hover:border-sky disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dict.socialGoogle}
            </button>
            <button
              type="button"
              onClick={() => social("microsoft")}
              disabled={!slug || !email.trim() || submitting}
              className="w-full rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-heading hover:border-sky disabled:cursor-not-allowed disabled:opacity-50"
            >
              {dict.socialMicrosoft}
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        {dict.noWorkspace}{" "}
        <Link href={`/${lang}/signup`} className="font-semibold text-sky-text hover:underline">
          {dict.signupCta}
        </Link>
      </p>
    </div>
  );
}
