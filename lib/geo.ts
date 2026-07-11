// Registre des pages géo (SEO — intention locale « logiciel paie <pays> »). Porte les FAITS
// (slug, code ISO, cadre réglementaire, devise, caisses) ; la copy templatée vit dans les
// dictionnaires (geoPage). Les acronymes de caisses sont des institutions publiques réelles, donc
// language-neutral. Adossé au positionnement paie multi-pays / OHADA — cf. mémoire projet.
//
// NB : la disponibilité en production réelle par pays dépend du productionSignoff back (chantier
// séparé). La page porte une bannière rappel dev-only, comme le Trust Center et les comparatifs.
export type Framework = "OHADA" | "EU";

export type GeoCountry = {
  slug: string;
  code: string;
  name: { fr: string; en: string };
  framework: Framework;
  currency: string;
  funds: string[];
};

// Jeu de départ : cœur Afrique francophone (OHADA) + la France comme ancre européenne cross-border.
// Extensible — un pays = une entrée ici (+ sa page se génère automatiquement).
export const GEO_COUNTRIES: GeoCountry[] = [
  { slug: "senegal", code: "SN", name: { fr: "Sénégal", en: "Senegal" }, framework: "OHADA", currency: "XOF", funds: ["IPRES", "CSS", "IPM"] },
  { slug: "cote-divoire", code: "CI", name: { fr: "Côte d'Ivoire", en: "Côte d'Ivoire" }, framework: "OHADA", currency: "XOF", funds: ["CNPS", "CMU"] },
  { slug: "cameroun", code: "CM", name: { fr: "Cameroun", en: "Cameroon" }, framework: "OHADA", currency: "XAF", funds: ["CNPS"] },
  { slug: "benin", code: "BJ", name: { fr: "Bénin", en: "Benin" }, framework: "OHADA", currency: "XOF", funds: ["CNSS"] },
  { slug: "mali", code: "ML", name: { fr: "Mali", en: "Mali" }, framework: "OHADA", currency: "XOF", funds: ["INPS"] },
  { slug: "burkina-faso", code: "BF", name: { fr: "Burkina Faso", en: "Burkina Faso" }, framework: "OHADA", currency: "XOF", funds: ["CNSS"] },
  { slug: "france", code: "FR", name: { fr: "France", en: "France" }, framework: "EU", currency: "EUR", funds: ["URSSAF", "DSN"] },
];

export function geoBySlug(slug: string): GeoCountry | undefined {
  return GEO_COUNTRIES.find((c) => c.slug === slug);
}

export function isGeoCountry(slug: string): boolean {
  return GEO_COUNTRIES.some((c) => c.slug === slug);
}
