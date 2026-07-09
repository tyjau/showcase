"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Écoute déléguée des clics sur les CTA marqués `data-cta`. Un seul listener au niveau document
 * couvre tous les CTA du site — y compris ceux rendus par des Server Components, qui ne peuvent pas
 * porter d'`onClick`. Émet `cta_click` avec le libellé (`data-cta`), l'emplacement
 * (`data-cta-location`) et, si présent, le plan (`data-cta-plan`) : la base du funnel d'acquisition
 * côté GA. No-op tant que gtag n'est pas prêt (lib/analytics.trackEvent).
 */
export function CtaTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cta]");
      if (!el) return;
      trackEvent("cta_click", {
        cta: el.dataset.cta || "unknown",
        location: el.dataset.ctaLocation || "unknown",
        ...(el.dataset.ctaPlan ? { plan: el.dataset.ctaPlan } : {}),
      });
    };
    // Capture : on veut l'événement même si un handler en aval fait stopPropagation.
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
