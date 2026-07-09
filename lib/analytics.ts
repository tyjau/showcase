// Google Analytics 4 — intégration démo pour le showcase (static export).
//
// Piloté par NEXT_PUBLIC_GA_ID (bakée depuis le snapshot au build, cf. forge-config.mjs) : vide →
// no-op complet (dev / démo sans clé). Consent Mode v2 : le consentement analytics démarre `denied`
// (RGPD — cible FR + Afrique francophone) ; le bandeau cookies (components/cookie-consent) le passe à
// `granted` à l'acceptation. Sans consentement, GA collecte des pings anonymisés (cookieless) — jamais
// de cookie ni d'identifiant tant que l'utilisateur n'a pas accepté.
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const GA_ENABLED = !!GA_ID;

// Clé localStorage du choix de consentement (persisté pour ne pas re-demander à chaque visite).
export const CONSENT_KEY = "skyrh.consent.analytics";

type GtagArgs = [string, ...unknown[]];
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: GtagArgs) => void;
  }
}

/** Envoie un événement GA4. No-op si GA est désactivé (pas d'ID) ou si gtag n'est pas chargé. */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

/** Met à jour le consentement analytics (appelé par le bandeau cookies) + le persiste. */
export function setAnalyticsConsent(granted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  } catch {
    /* storage indisponible */
  }
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", { analytics_storage: granted ? "granted" : "denied" });
  }
}

/** Le choix de consentement déjà enregistré ("granted" | "denied"), ou null si jamais répondu. */
export function storedConsent(): "granted" | "denied" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}
