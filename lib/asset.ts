// Préfixe un asset public absolu (ex. "/img/hero.png") par le basePath de déploiement, exposé au build
// via NEXT_PUBLIC_BASE_PATH (cf. next.config.mjs). Nécessaire car Next préfixe automatiquement les
// <Link> et /_next avec basePath, mais PAS les <img src="/…"> / background url(…) bruts : servi sous
// un sous-chemin (ex. /showcase/), un "/img/…" taperait la racine du domaine → 404.
//
// Idempotent et sans effet quand base est vide (dev / prod à la racine), sur les URLs externes
// (http…, //…), les data: et les chemins déjà préfixés. Passe-plat pour null/undefined → "".
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBase(path: string | null | undefined): string {
  if (!path) return "";
  if (!BASE) return path;
  if (!path.startsWith("/")) return path; // externe, relatif, data:, protocol-relative
  if (path === BASE || path.startsWith(BASE + "/")) return path; // déjà préfixé
  return BASE + path;
}
