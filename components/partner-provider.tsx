"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchPartnerConfig, type PartnerConfig } from "@/lib/partner";
import { isHexColor } from "@/lib/cobrand";

export type Utm = {
  source: string | null;
  campaign: string | null;
  medium: string | null;
};

type PartnerCtx = {
  partner: PartnerConfig | null;
  /** Raw partner/referral code from the URL (`?partner_code=` or `?ref=`). */
  refCode: string | null;
  utm: Utm;
};

const EMPTY_UTM: Utm = { source: null, campaign: null, medium: null };

const PartnerContext = createContext<PartnerCtx>({
  partner: null,
  refCode: null,
  utm: EMPTY_UTM,
});

/**
 * Reads the partner / referral code (`?partner_code=` or `?ref=`) and the UTM
 * params from the URL, fetches the partner's co-branding config at runtime, and
 * shares both with the funnel (branding, attribution, wholesale prices).
 *
 * No code in the URL → no partner → default SkyRH branding + baked catalogue.
 */
export function PartnerProvider({ children }: { children: React.ReactNode }) {
  const [partner, setPartner] = useState<PartnerConfig | null>(null);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [utm, setUtm] = useState<Utm>(EMPTY_UTM);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setUtm({
      source: sp.get("utm_source"),
      campaign: sp.get("utm_campaign"),
      medium: sp.get("utm_medium"),
    });
    const code = sp.get("partner_code") || sp.get("ref");
    if (!code) return;
    setRefCode(code);
    let alive = true;
    fetchPartnerConfig(code).then((cfg) => {
      if (alive) setPartner(cfg);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Partner brand colours → CSS variables (themes every bg-sky-strong / text-navy …).
  useEffect(() => {
    const root = document.documentElement;
    // Validate before applying — never trust a network value (defense-in-depth).
    if (isHexColor(partner?.primary_color)) {
      // Co-brand the whole sky family (identity + the accessible-accent fill/text tokens)
      // from the partner's primary, so co-branded CTAs/text use the partner colour.
      root.style.setProperty("--brand-sky", partner.primary_color);
      root.style.setProperty("--brand-sky-strong", partner.primary_color);
      root.style.setProperty("--sky-text", partner.primary_color);
    }
    if (isHexColor(partner?.secondary_color))
      root.style.setProperty("--brand-navy", partner.secondary_color);
    return () => {
      root.style.removeProperty("--brand-sky");
      root.style.removeProperty("--brand-sky-strong");
      root.style.removeProperty("--sky-text");
      root.style.removeProperty("--brand-navy");
    };
  }, [partner]);

  return (
    <PartnerContext.Provider value={{ partner, refCode, utm }}>
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner() {
  return useContext(PartnerContext);
}
