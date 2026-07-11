"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Check } from "lucide-react";
import { apiPost, storeSession } from "@/lib/api";

type Dict = Record<string, string>;

const INPUT_CLS =
  "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-sky";
const STRONG = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

type Phase = "loading" | "password" | "done" | "error";

/**
 * Page d'activation (lien email). CONV-01 : le mot de passe est désormais choisi AU WIZARD, donc on
 * tente une ACTIVATION 1-CLIC (token seul) au chargement — plus d'étape « définir le mot de passe ».
 * Deux replis : une demande legacy (sans hash stocké) fait remonter le formulaire mot de passe ; un
 * lien invalide / déjà utilisé / expiré affiche une impasse claire.
 */
export function SignupConfirm({ lang, dict }: { lang: string; dict: Dict }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [subdomain, setSubdomain] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenRef = useRef("");
  const started = useRef(false);

  // Applique une réponse signup_confirm réussie : auto-login (session billing pour les signups
  // pay_first) sinon écran de succès.
  function onConfirmed(data: Record<string, unknown>): void {
    if (data.access_token) {
      storeSession(
        (data.subdomain as string) ?? "",
        data.access_token as string,
        (data.refresh_token as string) ?? null,
      );
      router.replace(`/${lang}/account`);
      return;
    }
    setSubdomain((data.subdomain as string) ?? "");
    setPhase("done");
  }

  useEffect(() => {
    if (started.current) return; // garde contre le double-run du StrictMode
    started.current = true;
    const token = new URLSearchParams(window.location.search).get("token") ?? "";
    tokenRef.current = token;
    if (!token) {
      setPhase("error");
      setError(dict.invalidBody);
      return;
    }
    // Activation 1-clic : token seul. Le back active si le mot de passe a été posé au wizard.
    (async () => {
      const res = await apiPost("signup_confirm", { token });
      if (res.ok) {
        onConfirmed(res.data || {});
        return;
      }
      // Demande legacy sans mot de passe pré-choisi → on le demande ici (repli).
      if (/password|mot de passe/i.test(res.error ?? "")) {
        setPhase("password");
        return;
      }
      // Lien invalide / déjà utilisé / expiré → impasse.
      setPhase("error");
      setError(res.error ?? dict.invalidBody);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Repli legacy : activation avec un mot de passe saisi ici.
  async function submitWithPassword() {
    if (pw !== pw2) return setError(dict.mismatch);
    if (!STRONG.test(pw)) return setError(dict.weak);
    setSubmitting(true);
    setError(null);
    const res = await apiPost("signup_confirm", { token: tokenRef.current, new_password: pw });
    setSubmitting(false);
    if (res.ok) onConfirmed(res.data || {});
    else setError(res.error ?? "Something went wrong");
  }

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-10 text-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-sky-strong" />
        <p className="text-muted">{dict.activating}</p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-ok-bg text-ok-fg">
          <Check size={28} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-heading">{dict.successTitle}</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">{dict.successBody}</p>
        {subdomain && (
          <div className="mt-3 text-sm">
            <span className="text-muted">{subdomain}</span>
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

  if (phase === "error") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-err-bg text-err-fg">
          <AlertCircle size={28} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-heading">{dict.invalidTitle}</h1>
        <p className="mx-auto mt-2 max-w-md text-muted">{error ?? dict.invalidBody}</p>
        <Link
          href={`/${lang}/signup`}
          className="mt-6 inline-flex rounded-full bg-sky-strong px-6 py-3 text-sm font-semibold text-white"
        >
          {dict.invalidCta}
        </Link>
      </div>
    );
  }

  // phase === "password" — repli legacy (demande sans mot de passe pré-choisi)
  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">{dict.title}</h1>
      <p className="mt-1 text-muted">{dict.lead}</p>

      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">{dict.password}</span>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className={INPUT_CLS}
            autoComplete="new-password"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">{dict.passwordConfirm}</span>
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className={INPUT_CLS}
            autoComplete="new-password"
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
        disabled={submitting}
        onClick={submitWithPassword}
        className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-semibold ${!submitting ? "bg-sky-strong text-white" : "cursor-not-allowed bg-mist text-muted"}`}
      >
        {submitting ? "…" : dict.cta}
      </button>
    </div>
  );
}
