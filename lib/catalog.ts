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
export async function fetchCatalog(): Promise<Catalog> {
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
