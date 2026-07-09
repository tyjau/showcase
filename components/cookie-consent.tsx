"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GA_ENABLED, setAnalyticsConsent, storedConsent } from "@/lib/analytics";

type Dict = { text: string; accept: string; decline: string; privacy: string };

/**
 * Bandeau de consentement cookies (RGPD, Consent Mode v2). Ne s'affiche QUE si GA est activé
 * (NEXT_PUBLIC_GA_ID posé) ET qu'aucun choix n'a encore été fait — sinon rien à consentir. « Accepter »
 * passe `analytics_storage` à `granted` (tracking complet) ; « Refuser » le laisse `denied` (cookieless).
 * Le choix est persisté (lib/analytics), donc le bandeau ne réapparaît pas.
 */
export function CookieConsent({ dict, lang }: { dict: Dict; lang: string }) {
  const [show, setShow] = useState(false);

  // Décidé après hydratation (localStorage indispo au SSR) pour éviter tout mismatch.
  useEffect(() => {
    if (GA_ENABLED && storedConsent() === null) setShow(true);
  }, []);

  if (!show) return null;

  const choose = (granted: boolean) => {
    setAnalyticsConsent(granted);
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-label={dict.text}
      className="fixed inset-x-0 bottom-0 z-[95] border-t border-line bg-surface/95 px-4 py-4 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted">
          {dict.text}{" "}
          <Link
            href={`/${lang}/legal/privacy`}
            className="font-medium text-sky-text hover:underline"
          >
            {dict.privacy}
          </Link>
        </p>
        <div className="flex flex-none gap-2">
          <button
            onClick={() => choose(false)}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-mist"
          >
            {dict.decline}
          </button>
          <button
            onClick={() => choose(true)}
            className="rounded-full bg-sky-strong px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#08607f]"
          >
            {dict.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
