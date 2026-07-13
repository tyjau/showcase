// Registre des pages géo (SEO — intention locale « logiciel paie <pays> »). Porte les FAITS
// (slug, code ISO, cadre réglementaire, devise, caisses) ; la copy templatée vit dans les
// dictionnaires (geoPage). Les acronymes de caisses sont des institutions publiques réelles, donc
// language-neutral. Adossé au positionnement paie multi-pays / OHADA — cf. mémoire projet.
//
// NB : la disponibilité en production réelle par pays dépend du productionSignoff back (chantier
// séparé). La page porte une bannière rappel dev-only, comme le Trust Center et les comparatifs.
export type Framework = "OHADA" | "EU";

// Libellé d'affichage du cadre (language-neutral, identique fr/en). « EU » est le regroupement moteur
// du back — il inclut la Suisse, hors UE — donc on affiche « Europe », correct pour tout le groupe.
export const FRAMEWORK_LABEL: Record<Framework, string> = {
  OHADA: "OHADA",
  EU: "Europe",
};

export type GeoCountry = {
  slug: string;
  code: string;
  name: { fr: string; en: string };
  framework: Framework;
  currency: string;
  funds: string[];
};

// Espace OHADA complet (15 pays) + zone Europe (9 pays, dont la Suisse hors UE), source back
// payroll_compliance. Extensible — un pays = une entrée ici (+ sa page se génère automatiquement).
// Devises et caisses proviennent des figures back (metadata.currency + sign-off agent 2026-06-24).
export const GEO_COUNTRIES: GeoCountry[] = [
  { slug: "senegal", code: "SN", name: { fr: "Sénégal", en: "Senegal" }, framework: "OHADA", currency: "XOF", funds: ["IPRES", "CSS", "IPM"] },
  { slug: "cote-divoire", code: "CI", name: { fr: "Côte d'Ivoire", en: "Côte d'Ivoire" }, framework: "OHADA", currency: "XOF", funds: ["CNPS", "CMU"] },
  { slug: "cameroun", code: "CM", name: { fr: "Cameroun", en: "Cameroon" }, framework: "OHADA", currency: "XAF", funds: ["CNPS"] },
  { slug: "benin", code: "BJ", name: { fr: "Bénin", en: "Benin" }, framework: "OHADA", currency: "XOF", funds: ["CNSS"] },
  { slug: "mali", code: "ML", name: { fr: "Mali", en: "Mali" }, framework: "OHADA", currency: "XOF", funds: ["INPS", "CANAM"] },
  { slug: "burkina-faso", code: "BF", name: { fr: "Burkina Faso", en: "Burkina Faso" }, framework: "OHADA", currency: "XOF", funds: ["CNSS"] },
  { slug: "togo", code: "TG", name: { fr: "Togo", en: "Togo" }, framework: "OHADA", currency: "XOF", funds: ["CNSS", "AMU"] },
  { slug: "niger", code: "NE", name: { fr: "Niger", en: "Niger" }, framework: "OHADA", currency: "XOF", funds: ["CNSS", "ANPE"] },
  { slug: "guinee-bissau", code: "GW", name: { fr: "Guinée-Bissau", en: "Guinea-Bissau" }, framework: "OHADA", currency: "XOF", funds: ["INSS"] },
  { slug: "gabon", code: "GA", name: { fr: "Gabon", en: "Gabon" }, framework: "OHADA", currency: "XAF", funds: ["CNSS", "CNAMGS"] },
  { slug: "congo-brazzaville", code: "CG", name: { fr: "Congo-Brazzaville", en: "Congo-Brazzaville" }, framework: "OHADA", currency: "XAF", funds: ["CNSS", "CAMU"] },
  { slug: "centrafrique", code: "CF", name: { fr: "Centrafrique", en: "Central African Republic" }, framework: "OHADA", currency: "XAF", funds: ["CNSS"] },
  { slug: "guinee-equatoriale", code: "GQ", name: { fr: "Guinée Équatoriale", en: "Equatorial Guinea" }, framework: "OHADA", currency: "XAF", funds: ["INSESO"] },
  { slug: "guinee", code: "GN", name: { fr: "Guinée", en: "Guinea" }, framework: "OHADA", currency: "GNF", funds: ["CNSS"] },
  { slug: "comores", code: "KM", name: { fr: "Comores", en: "Comoros" }, framework: "OHADA", currency: "KMF", funds: ["CRC", "CNSPS"] },
  { slug: "france", code: "FR", name: { fr: "France", en: "France" }, framework: "EU", currency: "EUR", funds: ["URSSAF", "DSN"] },
  { slug: "belgique", code: "BE", name: { fr: "Belgique", en: "Belgium" }, framework: "EU", currency: "EUR", funds: ["ONSS", "IPP"] },
  { slug: "allemagne", code: "DE", name: { fr: "Allemagne", en: "Germany" }, framework: "EU", currency: "EUR", funds: ["Sozialversicherung", "Lohnsteuer"] },
  { slug: "espagne", code: "ES", name: { fr: "Espagne", en: "Spain" }, framework: "EU", currency: "EUR", funds: ["Seguridad Social", "IRPF"] },
  { slug: "italie", code: "IT", name: { fr: "Italie", en: "Italy" }, framework: "EU", currency: "EUR", funds: ["INPS", "IRPEF"] },
  { slug: "luxembourg", code: "LU", name: { fr: "Luxembourg", en: "Luxembourg" }, framework: "EU", currency: "EUR", funds: ["CCSS", "IGSS"] },
  { slug: "pays-bas", code: "NL", name: { fr: "Pays-Bas", en: "Netherlands" }, framework: "EU", currency: "EUR", funds: ["Belastingdienst"] },
  { slug: "portugal", code: "PT", name: { fr: "Portugal", en: "Portugal" }, framework: "EU", currency: "EUR", funds: ["Segurança Social", "IRS"] },
  { slug: "suisse", code: "CH", name: { fr: "Suisse", en: "Switzerland" }, framework: "EU", currency: "CHF", funds: ["AVS", "LPP"] },
];

// Nombre de cadres réglementaires couverts (1 pays = 1 cadre = 1 entrée ci-dessus). Source UNIQUE du
// compteur affiché sur la vitrine — monte automatiquement quand on ajoute un pays. Cf. positionnement
// (extensibilité : « un cadre = de la donnée, pas du code »).
export const GEO_FRAMEWORK_COUNT = GEO_COUNTRIES.length;

export function geoBySlug(slug: string): GeoCountry | undefined {
  return GEO_COUNTRIES.find((c) => c.slug === slug);
}

export function isGeoCountry(slug: string): boolean {
  return GEO_COUNTRIES.some((c) => c.slug === slug);
}
