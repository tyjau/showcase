import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "../globals.css";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CurrencyProvider } from "@/components/currency-provider";
import { PartnerProvider } from "@/components/partner-provider";

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-mulish",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const t = await getDictionary(params.lang);
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://get.ikwhat.com",
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
    },
  };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { lang: Locale } }>) {
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
      </head>
      <body className="font-sans bg-page text-ink antialiased flex min-h-screen flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-sky focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          {dict.nav.skipToContent}
        </a>
        <PartnerProvider>
          <CurrencyProvider>
            <SiteHeader lang={params.lang} dict={dict.nav} theme={dict.theme} />
            <div id="content" className="flex-1">{children}</div>
            <SiteFooter
              lang={params.lang}
              dict={dict.footer}
              legal={dict.legalPage.docs}
            />
          </CurrencyProvider>
        </PartnerProvider>
      </body>
    </html>
  );
}
