// Lien + libellé de l'espace « Harmony » (l'app SIRH du tenant) depuis le showcase.
//
// Piloté par NEXT_PUBLIC_HARMONY_URL, bakée depuis le snapshot (cf. scripts/forge-config.mjs) — deux
// modèles de déploiement :
//   - URL de base contenant `{workspace}` → sous-domaine par tenant (prod : https://{workspace}.skyrh.app).
//   - URL de base SANS `{workspace}`      → chemin fixe partagé, le tenant est résolu au login
//                                            (staging : https://rh.ikwhat.com/harmony).
// Absente (dev / build sans snapshot) → fallback historique <workspace>.<NEXT_PUBLIC_APP_DOMAIN|skyrh.app>.
const HARMONY_URL = process.env.NEXT_PUBLIC_HARMONY_URL ?? "";
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "skyrh.app";

function resolve(workspace?: string | null): string {
  if (HARMONY_URL) {
    return HARMONY_URL.includes("{workspace}")
      ? HARMONY_URL.replace("{workspace}", workspace ?? "")
      : HARMONY_URL;
  }
  return workspace ? `https://${workspace}.${APP_DOMAIN}` : "";
}

/** URL cliquable vers l'espace Harmony du tenant ("#" si aucun workspace en mode sous-domaine). */
export function harmonyHref(workspace?: string | null): string {
  return resolve(workspace) || "#";
}

/** Libellé lisible de l'espace (host + chemin, sans protocole ni slash final). */
export function harmonyLabel(workspace?: string | null): string {
  return resolve(workspace).replace(/^https?:\/\//, "").replace(/\/+$/, "") || "—";
}
