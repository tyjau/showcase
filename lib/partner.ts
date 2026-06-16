import { apiUrl } from "./api";

export type BillingUnit = "per_employee" | "per_company" | "tiered_caps";

export type PartnerPricing = {
  billing_unit: BillingUnit;
  // Optional wholesale catalogue override (same shape as the public catalogue).
  // When absent, the funnel keeps the build-baked default catalogue.
  packages?: unknown[];
  modules?: unknown[];
};

export type PartnerConfig = {
  code: string;
  brand_name: string;
  logo_url?: string | null;
  logo_b64?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  domain?: string | null; // success-domain suffix, e.g. "acme.skyrh.app"
  products?: string[];
  pricing?: PartnerPricing | null;
};

/**
 * Runtime fetch of a partner's co-branding config (logo, colours, success
 * domain, optional wholesale prices). Public endpoint, mirrors `?c=catalog`.
 *
 * Returns `null` on any failure → the funnel falls back to default SkyRH
 * branding + the build-baked catalogue, so direct (non-partner) prospects keep
 * working. Fetched at RUNTIME (not at build) because the baked catalogue is
 * frozen into the static export and cannot vary per partner.
 */
export async function fetchPartnerConfig(
  code: string,
): Promise<PartnerConfig | null> {
  if (!code) return null;
  try {
    const res = await fetch(
      `${apiUrl("partner_config")}&code=${encodeURIComponent(code)}`,
    );
    const json = (await res.json().catch(() => ({}))) as {
      meta?: { code?: number };
      data?: PartnerConfig;
    };
    const status = json?.meta?.code ?? res.status;
    if (!res.ok || status >= 400 || !json?.data) return null;
    return json.data;
  } catch {
    return null;
  }
}
