"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiLogin, apiLoginOAuth, apiOauthResolve, apiVerifyMfa, getToken, type OauthSpace } from "@/lib/api";
import { availableProviders, getIdToken, type OauthProvider } from "@/lib/oauth";

type Dict = Record<string, string>;

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "skyrh.app";
const INPUT = "w-full rounded-lg border border-line px-3 py-2.5 text-sm outline-none focus:border-sky";
// Mock de DÉV : le jeton est `mock:<email>` (le back ne l'accepte que hors production ET avec
// OAUTH_ALLOW_MOCK). En prod, les vrais SDK sont utilisés — cf. lib/oauth.ts.
const OAUTH_MOCK = process.env.NEXT_PUBLIC_OAUTH_MOCK === "1";
// Providers réellement utilisables : un client id absent MASQUE le bouton plutôt que de le laisser
// échouer au clic. En mode mock on montre les deux, puisqu'aucun client id n'est requis.
const PROVIDERS: OauthProvider[] = OAUTH_MOCK ? ["google", "microsoft"] : availableProviders();

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
  // 2FA : quand le back exige un second facteur, le login renvoie un challenge (mfa_token) au lieu
  // d'une session -> on bascule sur l'étape « code » (verify_mfa).
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  // Connexion sociale : espaces résolus pour l'identité (sélecteur si plusieurs) + ticket à usage
  // unique émis par le back. null = parcours social non engagé.
  const [spaces, setSpaces] = useState<OauthSpace[] | null>(null);
  const [ticket, setTicket] = useState<{ provider: OauthProvider; value: string } | null>(null);

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
    if (res.mfaRequired && res.mfaToken) { setMfaToken(res.mfaToken); return; }
    if (res.ok) router.push(`/${lang}/account`);
    // 403 = garde owner-family du portail billing (back) : message actionnable localisé plutôt que le
    // générique. Sûr : le back ne renvoie ce 403 qu'APRÈS identifiants valides (aucune énumération).
    else setError(res.code === 403 ? (dict.notAdmin ?? dict.error) : dict.error);
  }

  /**
   * Connexion sociale, en DEUX temps — un provider prouve QUI est l'utilisateur, pas OÙ il entre :
   * on obtient un id_token, le back le valide et renvoie les espaces de cette identité avec un
   * ticket à usage unique. UN SEUL espace ⇒ on enchaîne sans rien demander (le clic unique promis) ;
   * plusieurs ⇒ sélecteur. Le slug n'est donc PAS saisi au préalable, contrairement au mot de passe.
   */
  async function social(provider: OauthProvider) {
    setSubmitting(true);
    setError(null);
    setSpaces(null);
    try {
      // En mock, l'identité est l'email saisi ; sinon le vrai SDK du provider.
      const token = OAUTH_MOCK ? `mock:${email.trim()}` : await getIdToken(provider);
      const res = await apiOauthResolve(provider, token);
      if (!res.ok || !res.ticket) {
        setSubmitting(false);
        setError(dict.error);
        return;
      }
      const list = res.spaces ?? [];
      if (list.length === 0) {
        // Identité valide, mais aucun compte ici : on n'en crée PAS un au passage.
        setSubmitting(false);
        setError(dict.socialNoWorkspace ?? dict.error);
        return;
      }
      if (list.length === 1) {
        await finishSocial(provider, res.ticket, list[0].slug);
        return;
      }
      setTicket({ provider, value: res.ticket });
      setSpaces(list);
      setSubmitting(false);
    } catch (e) {
      setSubmitting(false);
      // Fenêtre fermée par l'utilisateur = ANNULATION, pas échec d'authentification : ne rien
      // afficher d'alarmant. Une popup bloquée, elle, mérite un message actionnable.
      const reason = e instanceof Error ? e.message : "";
      if (reason === "cancelled") return;
      setError(reason === "popup_blocked" ? (dict.socialPopupBlocked ?? dict.error) : dict.error);
    }
  }

  /** 2e temps : le ticket (usage unique) ouvre la session sur l'espace choisi. */
  async function finishSocial(provider: OauthProvider, value: string, chosenSlug: string) {
    setSubmitting(true);
    setError(null);
    const res = await apiLoginOAuth(chosenSlug, provider, value);
    setSubmitting(false);
    if (res.ok) {
      router.push(`/${lang}/account`);
      return;
    }
    // Le ticket est CONSOMMÉ même en échec : il faut relancer le parcours, pas re-cliquer.
    setSpaces(null);
    setTicket(null);
    setError(dict.error);
  }

  async function verifyCode() {
    if (!mfaToken || !code.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await apiVerifyMfa(slug, mfaToken, code.trim());
    setSubmitting(false);
    if (res.ok) router.push(`/${lang}/account`);
    else setError(dict.mfaError ?? dict.error);
  }

  // Étape 2FA : saisie du code (TOTP ou code de secours) après un mot de passe valide qui exige un 2e facteur.
  if (mfaToken) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-heading">{dict.mfaTitle ?? "Vérification en deux étapes"}</h1>
        <p className="mt-1 text-muted">{dict.mfaLead ?? "Entrez le code de votre application d'authentification (ou un code de secours)."}</p>
        <div className="mt-6">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">{dict.mfaCodeLabel ?? "Code"}</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && verifyCode()}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="123456"
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
          disabled={!code.trim() || submitting}
          onClick={verifyCode}
          className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-semibold ${
            code.trim() && !submitting ? "bg-sky-strong text-white" : "cursor-not-allowed bg-mist text-muted"
          }`}
        >
          {submitting ? "…" : (dict.mfaVerify ?? "Vérifier")}
        </button>
        <p className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={() => { setMfaToken(null); setCode(""); setError(null); }}
            className="text-muted hover:text-sky-text hover:underline"
          >
            {dict.mfaBack ?? "← Revenir"}
          </button>
        </p>
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
        {dict.forgotPassword && (
          <p className="text-right text-sm">
            <Link
              href={`/${lang}/forgot-password`}
              className="text-muted hover:text-sky-text hover:underline"
            >
              {dict.forgotPassword}
            </Link>
          </p>
        )}
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

      {PROVIDERS.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-3 text-xs uppercase text-muted">
            <span className="h-px flex-1 bg-line" />
            {dict.socialOr}
            <span className="h-px flex-1 bg-line" />
          </div>

          {/* Sélecteur d'espace : n'apparaît que si l'identité en dessert PLUSIEURS. Le cas
              nominal (un seul espace) ne l'affiche jamais — la connexion s'enchaîne. */}
          {spaces && ticket ? (
            <div className="mt-3">
              <p className="mb-2 text-sm text-muted">{dict.socialPickWorkspace ?? dict.socialOr}</p>
              <div className="grid gap-2">
                {spaces.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => finishSocial(ticket.provider, ticket.value, s.slug)}
                    disabled={submitting}
                    className="w-full rounded-full border border-line px-6 py-2.5 text-left text-sm font-semibold text-heading hover:border-sky disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {s.name}
                    <span className="ml-2 font-normal text-muted">{s.slug}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-3 grid gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => social(p)}
                  // Le slug n'est PAS requis : c'est oauth_resolve qui le découvre. Seul le mode
                  // mock a besoin de l'email, puisqu'il en fait l'identité.
                  disabled={submitting || (OAUTH_MOCK && !email.trim())}
                  className="w-full rounded-full border border-line px-6 py-2.5 text-sm font-semibold text-heading hover:border-sky disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {p === "google" ? dict.socialGoogle : dict.socialMicrosoft}
                </button>
              ))}
            </div>
          )}
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
