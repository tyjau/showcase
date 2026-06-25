import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog } from "@/lib/catalog";
import { PricingCalculator } from "@/components/pricing-calculator";
import { CtaBand } from "@/components/cta-band";

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
      <PricingCalculator
        catalog={catalog}
        lang={params.lang}
        dict={t.pricingPage as unknown as Record<string, string>}
        packages={t.packages}
      />

      <section className="mx-auto max-w-3xl px-5 pb-16">
        <h2 className="mb-6 text-center text-2xl font-extrabold tracking-tight text-heading">
          {t.pricingPage.faqTitle}
        </h2>
        <div className="flex flex-col gap-3">
          {t.pricingPage.faq.map((item: { q: string; a: string }) => (
            <div key={item.q} className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="font-bold text-heading">{item.q}</h3>
              <p className="mt-2 leading-relaxed text-muted">{item.a}</p>
            </div>
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
