"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { apiSendResetLink } from "@/lib/api";

type Dict = Record<string, string>;

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "skyrh.app";
const INPUT = "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-sky";

// Password-reset REQUEST screen for the billing portal. Collects the workspace slug
// (the reset is tenant-scoped, like login) + the email, then calls send_reset_link. The
// backend emails a one-time link to the canonical reset page; this screen only confirms
// the request was accepted (anti-enumeration — same message whether or not the account exists).
export function ForgotPassword({ lang, dict }: { lang: string; dict: Dict }) {
  const [workspace, setWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const slug = workspace.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  const canSubmit = !!slug && !!email.trim();

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const res = await apiSendResetLink(slug, email.trim());
    setSubmitting(false);
    if (res.ok) setSent(true);
    else setError(dict.error);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-ok-bg text-ok-fg">
          <MailCheck size={28} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-heading">{dict.sentTitle}</h1>
        <p className="mx-auto mt-2 max-w-sm text-muted">{dict.sentBody}</p>
        <div className="mt-3 text-sm">
          <span className="text-muted">{slug}</span>
          <span className="font-semibold text-ink">.{APP_DOMAIN}</span>
        </div>
        <Link
          href={`/${lang}/login`}
          className="mt-6 inline-flex rounded-full bg-sky-strong px-6 py-3 text-sm font-semibold text-white"
        >
          {dict.backToLogin}
        </Link>
      </div>
    );
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
            <span className="flex items-center whitespace-nowrap bg-mist px-3 text-sm text-muted">.{APP_DOMAIN}</span>
          </div>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">{dict.email}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={dict.emailPh}
            className={INPUT}
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-err-border bg-err-bg px-4 py-2.5 text-sm text-err-fg">{error}</p>
      )}

      <button
        type="button"
        disabled={!canSubmit || submitting}
        onClick={submit}
        className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-semibold ${
          canSubmit && !submitting ? "bg-sky-strong text-white" : "cursor-not-allowed bg-mist text-muted"
        }`}
      >
        {submitting ? dict.sending : dict.cta}
      </button>

      <p className="mt-6 text-center text-sm">
        <Link href={`/${lang}/login`} className="font-semibold text-sky-text hover:underline">
          {dict.backToLogin}
        </Link>
      </p>
    </div>
  );
}
