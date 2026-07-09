import type { Metadata } from "next";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog } from "@/lib/catalog";
import { PricingCalculator } from "@/components/pricing-calculator";
import { CtaBand } from "@/components/cta-band";
import { JsonLd } from "@/components/json-ld";
import { buildAlternates } from "@/lib/seo";

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
  return {
    title: t.seo.pages.pricing,
    alternates: buildAlternates(params.lang, "/pricing"),
  };
}

export default async function PricingPage(
  props: {
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const catalog = await fetchCatalog();

  // Données structurées : FAQPage (rich snippet — la FAQ existe déjà) + SoftwareApplication avec le
  // prix mensuel le plus bas réel du catalogue (AggregateOffer). Construits côté serveur, pas d'input.
  const faq = t.pricingPage.faq as { q: string; a: string }[];
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  // Offre : prix mensuel le plus bas dans une devise réellement présente au catalogue (USD→EUR→XOF,
  // sinon la première dispo). Le placeholder (prix à 0) n'émet AUCUNE offre — pas de faux prix en SERP.
  const monthly = catalog.packages
    .flatMap((p) => p.prices)
    .filter((pr) => pr.cycle === "monthly" && pr.amount > 0);
  const offerCurrency =
    ["USD", "EUR", "XOF"].find((c) => monthly.some((pr) => pr.currency === c)) ??
    monthly[0]?.currency ??
    null;
  const lows = offerCurrency
    ? monthly.filter((pr) => pr.currency === offerCurrency).map((pr) => pr.amount)
    : [];
  const appLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SkyRH",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    ...(lows.length
      ? { offers: { "@type": "AggregateOffer", lowPrice: Math.min(...lows), priceCurrency: offerCurrency } }
      : {}),
  };

  return (
    <main>
      <JsonLd data={faqLd} />
      <JsonLd data={appLd} />
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
