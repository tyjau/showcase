// Lien + libellé de l'espace « Harmony » (l'app SIRH du tenant) depuis le showcase.
//
// Piloté par NEXT_PUBLIC_HARMONY_URL, bakée depuis le snapshot (cf. scripts/forge-config.mjs) — deux
// modèles de déploiement :
//   - URL de base contenant `{workspace}` → sous-domaine par tenant (prod : https://{workspace}.skyrh.app).
//   - URL de base SANS `{workspace}`      → chemin fixe partagé, le tenant est résolu au login
//                                            (staging : https://rh.ikwhat.com/harmony).
// Absente (dev / build sans snapshot) → fallback historique <workspace>.<NEXT_PUBLIC_APP_DOMAIN|skyrh.app>.
// DEUX applications distinctes du produit, liées depuis le portail vitrine (deux URLs bakées depuis le
// snapshot par forge-config.mjs) :
//   - app skyrh (produit RH du tenant)  → NEXT_PUBLIC_APP_URL. Défaut = sous-domaine {workspace}.skyrh.app.
//   - CRM Harmony (app séparée)          → NEXT_PUBLIC_HARMONY_URL. PAS de fallback sous-domaine — URL/chemin
//                                          dédié (ex. staging rh.ikwhat.com/harmony) ; vide ⇒ aucun lien CRM.
// {workspace} est remplacé par le slug du tenant. APP_DOMAIN = base du fallback sous-domaine skyrh.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
const HARMONY_URL = process.env.NEXT_PUBLIC_HARMONY_URL ?? "";
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "skyrh.app";

function fill(base: string, workspace?: string | null): string {
  return base.includes("{workspace}") ? base.replace("{workspace}", workspace ?? "") : base;
}

function skyrh(workspace?: string | null): string {
  if (APP_URL) return fill(APP_URL, workspace);
  return workspace ? `https://${workspace}.${APP_DOMAIN}` : ""; // fallback historique sous-domaine
}

const clean = (u: string): string => u.replace(/^https?:\/\//, "").replace(/\/+$/, "");

/** URL de l'app skyrh (produit RH) du tenant ("#" si indéterminable). */
export function appHref(workspace?: string | null): string {
  return skyrh(workspace) || "#";
}
/** Libellé lisible de l'app skyrh (host + chemin, sans protocole ni slash final). */
export function appLabel(workspace?: string | null): string {
  return clean(skyrh(workspace)) || "—";
}

/** URL du CRM Harmony (app séparée) — "#" si non configuré (pas de fallback sous-domaine). */
export function harmonyHref(workspace?: string | null): string {
  return (HARMONY_URL ? fill(HARMONY_URL, workspace) : "") || "#";
}
export function harmonyLabel(workspace?: string | null): string {
  return clean(HARMONY_URL ? fill(HARMONY_URL, workspace) : "") || "—";
}
/** Le CRM Harmony est-il configuré (lien à afficher dans le portail) ? */
export function harmonyConfigured(): boolean {
  return HARMONY_URL !== "";
}
