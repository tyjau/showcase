import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog } from "@/lib/catalog";
import { PricingCalculator } from "@/components/pricing-calculator";
import { ParallaxTriangles } from "@/components/parallax-triangles";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const t = await getDictionary(params.lang);
  return { title: t.seo.pages.pricing };
}

export default async function PricingPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const t = await getDictionary(params.lang);
  const catalog = await fetchCatalog();

  return (
    <main>
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {t.pricingPage.heading}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-hero-fg-muted">
            {t.pricingPage.sub}
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-5 py-12">
        <PricingCalculator
          catalog={catalog}
          lang={params.lang}
          dict={t.pricingPage as unknown as Record<string, string>}
          packages={t.packages}
        />
      </div>
    </main>
  );
}
