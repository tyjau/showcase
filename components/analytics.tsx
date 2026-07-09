import Script from "next/script";
import { GA_ID, CONSENT_KEY } from "@/lib/analytics";

/**
 * Google Analytics 4 (démo) — injecté dans le <head> du layout. No-op si NEXT_PUBLIC_GA_ID est absent
 * (dev / démo sans clé), donc zéro impact quand la config n'est pas bakée.
 *
 * Consent Mode v2 : `analytics_storage` démarre `denied` (RGPD) — GA envoie des pings cookieless
 * anonymisés jusqu'à ce que le bandeau cookies passe le consentement à `granted`
 * (lib/analytics.setAnalyticsConsent). On ré-applique un consentement déjà accordé au boot pour tracker
 * dès le chargement les visiteurs qui ont déjà accepté. gtag.js est chargé `afterInteractive` (hors LCP).
 */
export function Analytics() {
  if (!GA_ID) return null;
  return (
    <>
      <Script id="ga-consent-default" strategy="beforeInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
try{if(localStorage.getItem('${CONSENT_KEY}')==='granted'){gtag('consent','update',{analytics_storage:'granted'});}}catch(e){}`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
