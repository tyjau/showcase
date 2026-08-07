// Acquisition d'un `id_token` OIDC côté navigateur (Google, Microsoft).
//
// Le back (Guardian, docs/SPEC-oauth-multi-provider.md) vérifie ce jeton LOCALEMENT : signature
// RS256 contre le JWKS du provider, iss/aud/exp, et `email_verified` EXIGÉ. Ce module ne fait donc
// qu'obtenir le jeton — il ne décide RIEN sur l'identité, ce qui serait invérifiable côté client.
//
// Les client ids sont PUBLICS par construction (ils vivent dans le navigateur) : les inliner au
// build est normal, contrairement à une clé secrète. Absents ⇒ le provider est simplement masqué.

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
export const MICROSOFT_CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID ?? "";

export type OauthProvider = "google" | "microsoft";

/** Providers réellement utilisables : un client id manquant masque le bouton (pas d'échec au clic). */
export function availableProviders(): OauthProvider[] {
  const out: OauthProvider[] = [];
  if (GOOGLE_CLIENT_ID) out.push("google");
  if (MICROSOFT_CLIENT_ID) out.push("microsoft");
  return out;
}

/** Nonce anti-rejeu, lié à la demande. Le back sait le contrôler (OidcVerifier). */
function makeNonce(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

let gisLoading: Promise<void> | null = null;

/** Charge Google Identity Services une seule fois (idempotent, même si deux boutons le demandent). */
function loadGis(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if ((window as unknown as { google?: unknown }).google) return Promise.resolve();
  if (gisLoading) return gisLoading;

  gisLoading = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      gisLoading = null; // permet un nouvel essai après un échec réseau
      reject(new Error("gis_load_failed"));
    };
    document.head.appendChild(s);
  });
  return gisLoading;
}

type GisCredentialResponse = { credential?: string };
type GisId = {
  initialize: (o: Record<string, unknown>) => void;
  prompt: (cb?: (n: unknown) => void) => void;
  cancel: () => void;
};

/**
 * id_token Google via GIS. `prompt()` ouvre le sélecteur de compte ; si l'utilisateur le ferme ou
 * si le navigateur bloque la fenêtre, la promesse est REJETÉE — l'appelant doit traiter ce cas
 * comme une annulation, pas comme une erreur d'authentification.
 */
export async function getGoogleIdToken(): Promise<string> {
  if (!GOOGLE_CLIENT_ID) throw new Error("google_not_configured");
  await loadGis();

  const g = (window as unknown as { google?: { accounts?: { id?: GisId } } }).google;
  const id = g?.accounts?.id;
  if (!id) throw new Error("gis_unavailable");

  return new Promise<string>((resolve, reject) => {
    let settled = false;
    id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      nonce: makeNonce(),
      // FedCM : le chemin que Chrome pousse à mesure que les cookies tiers disparaissent.
      use_fedcm_for_prompt: true,
      callback: (res: GisCredentialResponse) => {
        if (settled) return;
        settled = true;
        res?.credential ? resolve(res.credential) : reject(new Error("no_credential"));
      },
    });
    id.prompt(() => {
      // Notification de fermeture/indisponibilité : sans credential, c'est une annulation.
      if (!settled) {
        settled = true;
        reject(new Error("cancelled"));
      }
    });
  });
}

/**
 * id_token Microsoft via une POPUP sur l'endpoint d'autorisation (`response_type=id_token`,
 * `response_mode=fragment`). On évite MSAL : une seule dépendance de plus pour un besoin qui tient
 * en une fenêtre et une lecture de fragment. Le `state` est vérifié au retour (anti-CSRF), et le
 * fragment n'atteint jamais le serveur — c'est tout l'intérêt de `response_mode=fragment`.
 */
export async function getMicrosoftIdToken(): Promise<string> {
  if (!MICROSOFT_CLIENT_ID) throw new Error("microsoft_not_configured");
  if (typeof window === "undefined") throw new Error("ssr");

  const redirectUri = `${window.location.origin}${window.location.pathname}`;
  const state = makeNonce();
  const url =
    "https://login.microsoftonline.com/common/oauth2/v2.0/authorize" +
    `?client_id=${encodeURIComponent(MICROSOFT_CLIENT_ID)}` +
    "&response_type=id_token" +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    "&response_mode=fragment" +
    "&scope=openid%20email%20profile" +
    `&nonce=${encodeURIComponent(makeNonce())}` +
    `&state=${encodeURIComponent(state)}`;

  const popup = window.open(url, "skyrh_ms_login", "width=520,height=640");
  if (!popup) throw new Error("popup_blocked");

  return new Promise<string>((resolve, reject) => {
    const started = Date.now();
    const timer = window.setInterval(() => {
      // Fenêtre fermée par l'utilisateur : annulation, pas échec d'authentification.
      if (popup.closed) {
        window.clearInterval(timer);
        reject(new Error("cancelled"));
        return;
      }
      if (Date.now() - started > 120_000) {
        window.clearInterval(timer);
        popup.close();
        reject(new Error("timeout"));
        return;
      }
      let hash = "";
      try {
        // Tant que la popup est sur le domaine Microsoft, l'accès lève (same-origin) : on
        // attend simplement le retour sur NOTRE origine.
        hash = popup.location.hash;
      } catch {
        return;
      }
      if (!hash) return;

      window.clearInterval(timer);
      const p = new URLSearchParams(hash.replace(/^#/, ""));
      popup.close();

      if (p.get("state") !== state) {
        reject(new Error("state_mismatch")); // réponse non sollicitée : on jette
        return;
      }
      const token = p.get("id_token");
      token ? resolve(token) : reject(new Error(p.get("error") || "no_id_token"));
    }, 300);
  });
}

/** Point d'entrée unique : renvoie l'id_token du provider demandé. */
export function getIdToken(provider: OauthProvider): Promise<string> {
  return provider === "google" ? getGoogleIdToken() : getMicrosoftIdToken();
}
