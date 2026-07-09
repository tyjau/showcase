import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "../globals.css";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RouteProgress } from "@/components/route-progress";
import { CurrencyProvider } from "@/components/currency-provider";
import { PartnerProvider } from "@/components/partner-provider";
import { Analytics } from "@/components/analytics";
import { CookieConsent } from "@/components/cookie-consent";

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-mulish",
  display: "swap",
});

export async function generateMetadata(
  props: {
    params: Promise<{ lang: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://skyrh.app",
    ),
    title: { default: t.seo.defaultTitle, template: t.seo.titleTemplate },
    description: t.seo.description,
    alternates: {
      canonical: `/${params.lang}`,
      languages: { en: "/en", fr: "/fr" },
    },
    openGraph: {
      title: t.seo.defaultTitle,
      description: t.seo.description,
      siteName: "SkyRH",
      locale: params.lang === "fr" ? "fr_FR" : "en_US",
      type: "website",
      // Visuel de partage social. Résolu contre metadataBase (PAS le basePath) → sur le domaine
      // public (skyrh.app en prod). Image existante à défaut d'un visuel OG dédié 1200×630.
      images: [{ url: "/img/hero-office.png", alt: "SkyRH" }],
    },
    twitter: { card: "summary_large_image", images: ["/img/hero-office.png"] },
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default async function LangLayout(props: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const params = await props.params;

  const {
    children
  } = props;

  const dict = await getDictionary(params.lang);
  return (
    <html
      lang={params.lang}
      className={mulish.variable}
      suppressHydrationWarning
    >
      <head>
        {/*
          No-flash theme boot. Runs before paint on the static export and sets the
          `.dark` class on <html> synchronously (no flash, no hydration mismatch —
          server markup is neutral). Default is DARK (handoff: dark-by-default): a
          first-time visitor with no stored choice gets dark; an explicit 'light'
          stays light; 'system' follows the OS.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('skyrh.theme');var d=t==='dark'||!t||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();",
          }}
        />
        <Analytics />
      </head>
      <body className="font-sans bg-page text-ink antialiased flex min-h-screen flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-sky-strong focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          {dict.nav.skipToContent}
        </a>
        <PartnerProvider>
          <CurrencyProvider>
            <RouteProgress />
            <SiteHeader lang={params.lang} dict={dict.nav} theme={dict.theme} />
            <div id="content" className="flex-1">{children}</div>
            <SiteFooter
              lang={params.lang}
              dict={dict.footer}
              legal={dict.legalPage.docs}
            />
          </CurrencyProvider>
        </PartnerProvider>
        <CookieConsent dict={dict.cookieConsent} lang={params.lang} />
      </body>
    </html>
  );
}
