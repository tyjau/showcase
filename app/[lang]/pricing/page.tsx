import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog } from "@/lib/catalog";
import { PricingCalculator } from "@/components/pricing-calculator";

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
      <section className="bg-hero-bg text-hero-fg">
        <div className="mx-auto max-w-3xl px-5 py-12 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t.pricingPage.heading}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-hero-fg-muted">
            {t.pricingPage.sub}
          </p>
        </div>
      </section>
      {catalog.packages.length > 0 && (
        <section className="border-b border-line bg-mist">
          <div className="mx-auto max-w-6xl px-5 py-10">
            <h2 className="text-center text-2xl font-bold text-heading">
              {t.pricingPage.plansTitle}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {catalog.packages.map((pkg) => (
                <div
                  key={pkg.code}
                  className="rounded-xl border border-line bg-surface p-5"
                >
                  <h3 className="font-bold text-heading">{pkg.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {pkg.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <div className="mx-auto max-w-6xl px-5 py-12">
        <PricingCalculator
          catalog={catalog}
          lang={params.lang}
          dict={t.pricingPage as Record<string, string>}
        />
      </div>
    </main>
  );
}
