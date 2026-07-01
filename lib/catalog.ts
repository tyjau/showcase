export type Money = { currency: string; cycle: string; amount: number };

export type Package = {
  code: string;
  name: string;
  description: string;
  prices: Money[];
  modules: string[];
};

export type ModuleText = {
  headline: string;
  tagline: string | null;
  description: string | null;
};

export type CatalogModule = {
  code: string;
  gate: string;
  category: string;
  icon: string | null;
  cover: string | null;
  isAddon: boolean;
  sort: number;
  text: Record<string, ModuleText>;
  prices: Money[];
  requires: { code: string; kind: string }[];
};

export type Catalog = { packages: Package[]; modules: CatalogModule[] };

const GUARDIAN_URL = process.env.GUARDIAN_URL ?? "https://saas.test:8443";
const CATALOG_API_KEY = process.env.CATALOG_API_KEY ?? "";

/**
 * Server-side fetch of the public catalog. The scoped publishable key lives in
 * the server env (never shipped to the browser). Cached so it bakes into the
 * static export at build time. Prod guardian has a valid certificate; in dev we
 * tolerate the self-signed saas.test certificate.
 */
// Fallback MINIMAL (pas vide) : `output: export` exige ≥1 param pour CHAQUE route dynamique tirée du
// catalogue — un catalogue vide casse le build (« missing generateStaticParams »). Deux routes en
// dépendent : /[lang]/features/[module] (mappe TOUS les modules) ET /[lang]/resources/guides/[code]
// (ne garde que les modules AYANT du contenu front via moduleContent()). Le code du module placeholder
// DOIT donc être un VRAI code documenté dans lib/module-content.ts (MGMT00) — sinon le filtre de la
// route guides le jette et son generateStaticParams retombe à 0 param → l'export casse. Placeholder
// COHÉRENT (1 package, 1 module réel) — remplacé par le vrai catalogue quand CATALOG_API_KEY est
// alignée via Ignition.
const FALLBACK_CATALOG: Catalog = {
  packages: [
    {
      code: "starter",
      name: "Starter",
      description: "Catalogue placeholder — à aligner via Ignition (CATALOG_API_KEY).",
      prices: [{ currency: "EUR", cycle: "monthly", amount: 0 }],
      modules: ["MGMT00"],
    },
  ],
  modules: [
    {
      // Vrai code catalogue (présent dans module-content.ts / EXTRAS / MODULE_SHOTS) et catégorie
      // connue (« people ») : survit au filtre moduleContent() de la route guides, rend un contenu
      // cohérent sur features + guides, et apparaît bien sur l'index features (CATEGORY_ORDER).
      code: "MGMT00",
      gate: "MGMT00",
      category: "people",
      icon: null,
      cover: null,
      isAddon: false,
      sort: 0,
      text: {
        fr: { headline: "Module (placeholder)", tagline: null, description: null },
        en: { headline: "Module (placeholder)", tagline: null, description: null },
      },
      prices: [{ currency: "EUR", cycle: "monthly", amount: 0 }],
      requires: [],
    },
  ],
};

export async function fetchCatalog(): Promise<Catalog> {
  // Résilience build : si le catalogue est injoignable ou la clé non encore alignée (401), NE PAS casser
  // le build — retomber sur un catalogue PLACEHOLDER MINIMAL (le site déploie ; le vrai catalogue arrive
  // quand la clé CATALOG_API_KEY est alignée back↔snapshot via Ignition). Miroir du fallback de
  // fetchCountries. Cohérent pour staging/placeholder ; en prod, aligner la clé pour le vrai catalogue.
  try {
    // Tolerate the self-signed certificate only for the local dev backend
    // (saas.test) — a real guardian endpoint has a valid certificate, so a
    // production build against it never disables verification.
    if (GUARDIAN_URL.includes("saas.test")) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const res = await fetch(`${GUARDIAN_URL}/auth.php?c=catalog`, {
      headers: { "X-API-KEY": CATALOG_API_KEY },
      cache: "force-cache",
    });
    if (!res.ok) {
      throw new Error(`Catalog fetch failed: ${res.status} ${res.statusText}`);
    }
    const json = (await res.json()) as { data?: Catalog };
    if (!json.data) throw new Error("Catalog response missing data");
    return json.data;
  } catch (e) {
    console.warn(
      `[catalog] fetch échoué (${e instanceof Error ? e.message : String(e)}) → catalogue placeholder minimal (fallback build). ` +
        "Aligner CATALOG_API_KEY (back↔snapshot) via Ignition pour un catalogue réel.",
    );
    return FALLBACK_CATALOG;
  }
}

// Fallback if the countries endpoint is unreachable (e.g. an older backend without
// the action). Mirrors the backend's signed compliance list so the signup picker
// always renders a correct set. Sorted by FR name.
const FALLBACK_COUNTRIES = [
  "Allemagne", "Belgique", "Bénin", "Burkina Faso", "Cameroun", "Centrafrique",
  "Comores", "Congo-Brazzaville", "Côte d'Ivoire", "Espagne", "France", "Gabon",
  "Guinée", "Guinée Équatoriale", "Guinée-Bissau", "Italie", "Luxembourg", "Mali",
  "Niger", "Pays-Bas", "Portugal", "Sénégal", "Suisse", "Togo",
];

/**
 * Server-side fetch of the compliance-covered country names (auth.php?c=countries).
 * The list is the single source of truth on the backend (signed countries); this
 * keeps the signup picker in sync. Falls back to the static mirror on any error.
 */
export async function fetchCountries(): Promise<string[]> {
  try {
    if (GUARDIAN_URL.includes("saas.test")) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    const res = await fetch(`${GUARDIAN_URL}/auth.php?c=countries`, {
      headers: { "X-API-KEY": CATALOG_API_KEY },
      cache: "force-cache",
    });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as { data?: { countries?: { name?: string }[] } };
    const list = (json.data?.countries ?? [])
      .map((c) => (c?.name ?? "").trim())
      .filter(Boolean);
    return list.length ? list : FALLBACK_COUNTRIES;
  } catch {
    return FALLBACK_COUNTRIES;
  }
}

export type PackageText = { name: string; description: string };

/**
 * Resolve a package's display name/description with a front-side i18n fallback.
 * The catalogue ships package `name`/`description` untranslated (English only), so
 * components pass a per-locale map (keyed by package code) and we prefer it, falling
 * back field-by-field to the catalogue values when a translation is missing.
 */
export function packageText(
  code: string,
  i18n: Record<string, Partial<PackageText>> | undefined,
  fallback: PackageText,
): PackageText {
  const t = i18n?.[code];
  return {
    name: t?.name || fallback.name,
    description: t?.description || fallback.description,
  };
}

export function moduleText(m: CatalogModule, lang: string): ModuleText {
  return (
    m.text[lang] ??
    m.text.en ?? { headline: m.code, tagline: null, description: null }
  );
}

export function modulesByCategory(
  modules: CatalogModule[],
): Record<string, CatalogModule[]> {
  const out: Record<string, CatalogModule[]> = {};
  for (const m of [...modules].sort((a, b) => a.sort - b.sort)) {
    (out[m.category] ??= []).push(m);
  }
  return out;
}

export function priceFor(
  prices: Money[],
  currency: string,
  cycle = "monthly",
): number | null {
  const p = prices.find((x) => x.currency === currency && x.cycle === cycle);
  return p ? p.amount : null;
}
