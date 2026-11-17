/**
 * Pays proposés à l'inscription : interprétation PURE de la réponse du back
 * (`auth.php?c=countries`), sans réseau ni dépendance, pour être testable seule.
 */

/**
 * Nom du champ additif, par pays, qui dit « règles de paie relues deux fois ».
 * UNE seule constante : si le back le nomme autrement, on ne change que cette ligne.
 * Nom fixé par la spec F-0063 (booléen, sur chaque élément de data.countries[]) ; lecture défensive : seul `true` compte.
 */
export const REVIEWED_FIELD = "lawRulesReadTwice";

export type CountryOption = { name: string; reviewed: boolean };

/**
 * - ok : le back a répondu, la liste est la sienne (chaque pays porte son état de relecture) ;
 * - empty : le back a répondu 200 avec une liste vide — aucun pays n'est proposé, rien n'est inventé ;
 * - degraded : le back est injoignable, en erreur ou illisible — liste statique de secours, aucun pays
 *   n'y est présenté comme relu.
 */
export type CountriesStatus = "ok" | "empty" | "degraded";
export type CountriesResult = { status: CountriesStatus; countries: CountryOption[] };

/** Liste statique de secours (noms français, triés). N'est JAMAIS « les pays couverts ». */
export const FALLBACK_COUNTRY_NAMES: string[] = [
  "Allemagne", "Belgique", "Bénin", "Burkina Faso", "Cameroun", "Centrafrique",
  "Comores", "Congo-Brazzaville", "Côte d'Ivoire", "Espagne", "France", "Gabon",
  "Guinée", "Guinée Équatoriale", "Guinée-Bissau", "Italie", "Luxembourg", "Mali",
  "Niger", "Pays-Bas", "Portugal", "Sénégal", "Suisse", "Togo",
];

/**
 * Lit `data.countries[]`. Renvoie `null` si la forme est illisible (pas un tableau), `[]` pour une liste
 * vide. Un champ de relecture absent ou non booléen vaut « non relu ».
 */
export function interpretCountriesPayload(json: unknown): CountryOption[] | null {
  const data = (json as { data?: { countries?: unknown } } | null | undefined)?.data;
  const raw = data?.countries;
  if (!Array.isArray(raw)) return null;
  const out: CountryOption[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const name = typeof rec.name === "string" ? rec.name.trim() : "";
    if (!name) continue;
    out.push({ name, reviewed: rec[REVIEWED_FIELD] === true });
  }
  return out;
}

/** Liste de secours : tous les pays « non relus ». */
export function degradedResult(): CountriesResult {
  return {
    status: "degraded",
    countries: FALLBACK_COUNTRY_NAMES.map((name) => ({ name, reviewed: false })),
  };
}

/** Choisit entre « ok », « empty » et « degraded » à partir de la réponse du back. */
export function resultFromPayload(json: unknown): CountriesResult {
  const list = interpretCountriesPayload(json);
  if (list === null) return degradedResult();
  return list.length ? { status: "ok", countries: list } : { status: "empty", countries: [] };
}
