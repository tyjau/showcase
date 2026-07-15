// Registre des pages géo (SEO — intention locale « logiciel paie <pays> »). Porte les FAITS
// (slug, code ISO, cadre réglementaire, devise, caisses) ; la copy templatée vit dans les
// dictionnaires (geoPage). Les acronymes de caisses sont des institutions publiques réelles, donc
// language-neutral. Adossé au positionnement paie multi-pays / OHADA — cf. mémoire projet.
//
// NB : la disponibilité en production réelle par pays dépend du productionSignoff back (chantier
// séparé). La page porte une bannière rappel dev-only, comme le Trust Center et les comparatifs.
// Groupement d'AFFICHAGE (région), pas le champ moteur du back (qui vaut OHADA/EU/IFRS/Maghreb-PAYE…).
// On regroupe géographiquement pour la vitrine — chaque pays garde son propre cadre paie côté moteur.
export type Framework = "OHADA" | "EU" | "AMERICAS" | "AFRICA_EN" | "MAGHREB" | "GULF";

// Libellé d'affichage du cadre (language-neutral, identique fr/en). « EU » inclut la Suisse (hors UE) →
// on affiche « Europe ». Les groupes non-OHADA/EU sont des régions (faits géographiques, pas des faits paie).
export const FRAMEWORK_LABEL: Record<Framework, string> = {
  OHADA: "OHADA",
  EU: "Europe",
  AMERICAS: "Amériques",
  AFRICA_EN: "Afrique anglophone",
  MAGHREB: "Maghreb",
  GULF: "Golfe",
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
  // Extension hors zone OHADA/Europe (couverture back en expansion). Devise = fait back (metadata.currency).
  // Caisses = SEULEMENT là où le back les structure (metadata.immatriculationRequiredBodies) — sinon [] :
  // on n'invente pas de caisses. NB : les Amériques sont MODÉLISÉES mais pas encore productionSignoff côté
  // back — la bannière dev-only + le signup (liste live signée) restent la source de vérité déployable.
  { slug: "ghana", code: "GH", name: { fr: "Ghana", en: "Ghana" }, framework: "AFRICA_EN", currency: "GHS", funds: ["SSNIT", "GRA"] },
  { slug: "kenya", code: "KE", name: { fr: "Kenya", en: "Kenya" }, framework: "AFRICA_EN", currency: "KES", funds: ["NSSF", "SHA", "KRA"] },
  { slug: "nigeria", code: "NG", name: { fr: "Nigeria", en: "Nigeria" }, framework: "AFRICA_EN", currency: "NGN", funds: [] },
  { slug: "maroc", code: "MA", name: { fr: "Maroc", en: "Morocco" }, framework: "MAGHREB", currency: "MAD", funds: [] },
  { slug: "arabie-saoudite", code: "SA", name: { fr: "Arabie Saoudite", en: "Saudi Arabia" }, framework: "GULF", currency: "SAR", funds: [] },
  { slug: "etats-unis", code: "US", name: { fr: "États-Unis", en: "United States" }, framework: "AMERICAS", currency: "USD", funds: [] },
  { slug: "canada", code: "CA", name: { fr: "Canada", en: "Canada" }, framework: "AMERICAS", currency: "CAD", funds: [] },
  { slug: "mexique", code: "MX", name: { fr: "Mexique", en: "Mexico" }, framework: "AMERICAS", currency: "MXN", funds: [] },
  { slug: "bresil", code: "BR", name: { fr: "Brésil", en: "Brazil" }, framework: "AMERICAS", currency: "BRL", funds: [] },
  { slug: "argentine", code: "AR", name: { fr: "Argentine", en: "Argentina" }, framework: "AMERICAS", currency: "ARS", funds: [] },
  { slug: "chili", code: "CL", name: { fr: "Chili", en: "Chile" }, framework: "AMERICAS", currency: "CLP", funds: [] },
  { slug: "colombie", code: "CO", name: { fr: "Colombie", en: "Colombia" }, framework: "AMERICAS", currency: "COP", funds: [] },
  { slug: "perou", code: "PE", name: { fr: "Pérou", en: "Peru" }, framework: "AMERICAS", currency: "PEN", funds: [] },
  { slug: "uruguay", code: "UY", name: { fr: "Uruguay", en: "Uruguay" }, framework: "AMERICAS", currency: "UYU", funds: [] },
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
