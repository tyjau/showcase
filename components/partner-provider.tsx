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

// Persistance de l'attribution (ref/partner + utm) : cookie first-party ~90 j, pour qu'elle
// survive à un reload dur ou à un accès direct à /signup (sans param d'URL). Sans ça, le code
// ?ref/?partner_code n'était qu'en mémoire React → attribution perdue au moindre reload.
const ATTRIB_COOKIE = "skyrh_attrib";
const ATTRIB_MAX_AGE = 60 * 60 * 24 * 90; // 90 jours

type Attrib = { ref: string | null; utm: Utm };

function readAttrib(): Attrib | null {
  const m = document.cookie.match(/(?:^|;\s*)skyrh_attrib=([^;]+)/);
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1])) as Attrib;
  } catch {
    return null;
  }
}

function writeAttrib(data: Attrib) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ATTRIB_COOKIE}=${encodeURIComponent(
    JSON.stringify(data),
  )}; path=/; max-age=${ATTRIB_MAX_AGE}; SameSite=Lax${secure}`;
}

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
    const urlUtm: Utm = {
      source: sp.get("utm_source"),
      campaign: sp.get("utm_campaign"),
      medium: sp.get("utm_medium"),
    };
    const urlCode = sp.get("partner_code") || sp.get("ref");
    const hasUrlAttrib =
      !!urlCode || !!(urlUtm.source || urlUtm.campaign || urlUtm.medium);

    // L'URL prime (dernière touche) ; sinon on relit l'attribution posée à la 1re visite.
    const stored = hasUrlAttrib ? null : readAttrib();
    const code = urlCode ?? stored?.ref ?? null;
    const resolvedUtm = hasUrlAttrib ? urlUtm : stored?.utm ?? EMPTY_UTM;

    setUtm(resolvedUtm);
    if (hasUrlAttrib) writeAttrib({ ref: code, utm: resolvedUtm });

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
