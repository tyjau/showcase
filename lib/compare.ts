// Registre des comparatifs (SEO-06). Porte uniquement la LISTE des concurrents ; tout le contenu
// (libellés, valeurs SkyRH, textes) vit dans les dictionnaires (éditable, i18n). La colonne SkyRH est
// factuelle ; les cellules concurrentes ne sont PAS préremplies — un comparatif nominatif est un
// terrain juridique (publicité comparative, Code conso art. L122-1 s.) : l'équipe renseigne les faits
// vérifiés avant publication (bannière rappel dev-only sur la page).
export const COMPETITORS = ["payfit", "lucca", "factorial", "sage"] as const;

export type CompetitorSlug = (typeof COMPETITORS)[number];

export function isCompetitor(slug: string): slug is CompetitorSlug {
  return (COMPETITORS as readonly string[]).includes(slug);
}
