import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "../globals.css";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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
    <html lang={params.lang} className={mulish.variable}>
      <body className="font-sans bg-white text-ink antialiased">
        <SiteHeader lang={params.lang} dict={dict.nav} />
        {children}
        <SiteFooter lang={params.lang} dict={dict.footer} />
      </body>
    </html>
  );
}
