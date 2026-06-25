"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check } from "lucide-react";
import { apiPost, storeSession } from "@/lib/api";

type Dict = Record<string, string>;

const INPUT_CLS =
  "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-sky";
const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

export function SignupConfirm({
  lang,
  dict,
}: {
  lang: string;
  dict: Dict;
}) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setToken(sp.get("token") ?? "");
    setReady(true);
  }, []);

  async function submit() {
    if (!token) {
      setError(dict.noToken);
      return;
    }
    if (pw !== pw2) {
      setError(dict.mismatch);
      return;
    }
    if (!STRONG.test(pw)) {
      setError(dict.weak);
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await apiPost("signup_confirm", { token, new_password: pw });
    if (res.ok) {
      // Auto-login: signup_confirm mints a billing session for pay_first signups. Land the
      // customer straight on /account (the pay screen) instead of bouncing through login.
      const d = res.data || {};
      if (d.access_token) {
        storeSession(
          (d.subdomain as string) ?? "",
          d.access_token as string,
          (d.refresh_token as string) ?? null,
        );
        router.replace(`/${lang}/account`);
        return;
      }
      setSubmitting(false);
      setDone((res.data?.subdomain as string) ?? "");
    } else {
      setSubmitting(false);
      setError(res.error ?? "Something went wrong");
    }
  }

  if (done !== null) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-ok-bg text-ok-fg">
          <Check size={28} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-heading">
          {dict.successTitle}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-muted">{dict.successBody}</p>
        {done && (
          <div className="mt-3 text-sm">
            <span className="text-muted">{done}</span>
            <span className="font-semibold text-ink">.skyrh.app</span>
          </div>
        )}
        <Link
          href={`/${lang}/login`}
          className="mt-6 inline-flex rounded-full bg-sky-strong px-6 py-3 text-sm font-semibold text-white"
        >
          {dict.successCta}
        </Link>
      </div>
    );
  }

  // Magic-link landing reached without a (valid) token → a clean dead-end instead
  // of a greyed-out form. `ready` gates this until the client has read the URL, so
  // the common (token present) case renders the form without a flash.
  if (ready && !token) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-err-bg text-err-fg">
          <AlertCircle size={28} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-heading">{dict.invalidTitle}</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">{dict.invalidBody}</p>
        <Link
          href={`/${lang}/signup`}
          className="mt-6 inline-flex rounded-full bg-sky-strong px-6 py-3 text-sm font-semibold text-white"
        >
          {dict.invalidCta}
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
          <span className="mb-1 block text-sm font-medium text-ink">
            {dict.password}
          </span>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className={INPUT_CLS}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">
            {dict.passwordConfirm}
          </span>
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className={INPUT_CLS}
          />
        </label>
        <p className="text-xs text-muted">{dict.hint}</p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-err-border bg-err-bg px-4 py-2.5 text-sm text-err-fg">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={submitting || !token}
        onClick={submit}
        className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-semibold ${!submitting && token ? "bg-sky-strong text-white" : "cursor-not-allowed bg-mist text-muted"}`}
      >
        {submitting ? "…" : dict.cta}
      </button>
    </div>
  );
}
