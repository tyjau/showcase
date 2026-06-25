import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog } from "@/lib/catalog";
import { PricingCalculator } from "@/components/pricing-calculator";
import { ParallaxTriangles } from "@/components/parallax-triangles";
import { CtaBand } from "@/components/cta-band";
import { ChevronDown } from "lucide-react";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: {
    params: Promise<{ lang: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return { title: t.seo.pages.pricing };
}

export default async function PricingPage(
  props: {
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;
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

      <section className="mx-auto max-w-3xl px-5 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-heading">
          {t.pricingPage.faqTitle}
        </h2>
        <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {t.pricingPage.faq.map((item: { q: string; a: string }) => (
            <details key={item.q} className="group px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown
                  size={18}
                  className="flex-none text-muted transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-4 leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <CtaBand
        href={`/${params.lang}/signup`}
        title={t.ctaBand.title}
        sub={t.ctaBand.sub}
        button={t.ctaBand.button}
        reassurances={t.ctaBand.reassurances}
      />
    </main>
  );
}
