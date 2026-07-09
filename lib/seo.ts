import type { Metadata } from "next";
import { i18n } from "@/lib/i18n";

// URL publique canonique du site (domaine de prod), indépendante du basePath de déploiement
// (/showcase en staging). Base des canonical/hreflang et des URLs des données structurées.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyrh.app"
).replace(/\/+$/, "");

/**
 * Canonical + hreflang pour la page courante. `path` est le chemin *relatif à la locale*
 * ("" pour l'accueil, "/pricing", `/features/${code}`…).
 *
 * Chaque page DOIT poser ses propres alternates : sinon, en App Router, les champs de metadata
 * non redéfinis sont hérités du layout parent — ce qui ferait canoniquer TOUTES les pages vers
 * l'accueil (bug SEO-01). Résolu contre `metadataBase` (domaine de prod), donc jamais préfixé
 * par le basePath de staging.
 */
export function buildAlternates(lang: string, path = ""): Metadata["alternates"] {
  const rel = path && !path.startsWith("/") ? `/${path}` : path;
  const languages: Record<string, string> = {};
  for (const l of i18n.locales) languages[l] = `/${l}${rel}`;
  languages["x-default"] = `/${i18n.defaultLocale}${rel}`;
  return { canonical: `/${lang}${rel}`, languages };
}

// Directive robots pour les pages non indexables (auth / utilitaires) : hors index, liens suivis.
export const NOINDEX: Metadata["robots"] = { index: false, follow: true };

// Données structurées site-wide (marque). Renforce le panneau de connaissances / la SERP de marque.
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SkyRH",
    url: SITE_URL,
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SkyRH",
    url: SITE_URL,
  };
}
