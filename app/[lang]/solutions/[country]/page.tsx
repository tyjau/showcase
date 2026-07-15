import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { i18n } from "@/lib/i18n";
import { buildAlternates, SITE_URL } from "@/lib/seo";
import { GEO_COUNTRIES, FRAMEWORK_LABEL, geoBySlug, isGeoCountry } from "@/lib/geo";
import { JsonLd } from "@/components/json-ld";
import { CtaBand } from "@/components/cta-band";
import { ParallaxTriangles } from "@/components/parallax-triangles";

// Seuls les pays connus sont générés ; toute autre valeur → 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.locales.flatMap((lang) =>
    GEO_COUNTRIES.map((c) => ({ lang, country: c.slug })),
  );
}

function nameFor(slug: string, lang: string): string {
  const c = geoBySlug(slug);
  if (!c) return slug;
  return lang === "fr" ? c.name.fr : c.name.en;
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string; country: string }> },
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const g = t.geoPage;
  const name = nameFor(params.country, params.lang);
  return {
    title: g.titlePattern.replace("{name}", name),
    description: g.lead,
    alternates: buildAlternates(params.lang, `/solutions/${params.country}`),
  };
}

export default async function CountryPage(
  props: { params: Promise<{ lang: string; country: string }> },
) {
  const params = await props.params;
  if (!isGeoCountry(params.country)) notFound();
  const t = await getDictionary(params.lang);
  const g = t.geoPage;
  const lang = params.lang;
  const c = geoBySlug(params.country)!;
  const name = lang === "fr" ? c.name.fr : c.name.en;
  const title = g.titlePattern.replace("{name}", name);
  const why = g.why as string[];

  const facts = [
    { label: g.frameworkLabel, value: FRAMEWORK_LABEL[c.framework] },
    { label: g.currencyLabel, value: c.currency },
    { label: g.fundsLabel, value: c.funds.join(" · ") },
  ];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SkyRH", item: `${SITE_URL}/${lang}` },
      { "@type": "ListItem", position: 2, name: g.hubTitle, item: `${SITE_URL}/${lang}/solutions` },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${SITE_URL}/${lang}/solutions/${c.slug}`,
      },
    ],
  };

  return (
    <main>
      <JsonLd data={breadcrumb} />
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_320px_at_82%_-18%,rgba(15,158,213,0.18),transparent_70%)]" />
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">{g.eyebrow}</span>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-hero-fg-muted">{g.lead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16">
        {process.env.NODE_ENV !== "production" && (
          <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-fg">
            {g.draft}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          {facts.map((f) => (
            <div key={f.label} className="rounded-xl border border-line bg-surface p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-muted">{f.label}</div>
              <div className="mt-1 text-lg font-extrabold text-ink">{f.value}</div>
            </div>
          ))}
        </div>

        {/* Arguments factuels côté SkyRH, agnostiques au pays (positionnement paie multi-pays). */}
        <h2 className="mt-12 text-2xl font-bold text-heading">{g.whyTitle}</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {why.map((w) => (
            <li key={w} className="flex items-start gap-2.5 text-muted">
              <ShieldCheck size={18} className="mt-0.5 flex-none text-sky-text" />
              <span>{w}</span>
            </li>
          ))}
        </ul>

        <Link
          href={`/${lang}/solutions`}
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-text hover:underline"
        >
          <ArrowLeft size={15} /> {g.backToHub}
        </Link>
      </section>

      <CtaBand
        href={`/${lang}/signup`}
        location="geo_country"
        title={g.ctaTitle}
        sub={g.ctaSub}
        button={g.ctaButton}
      />
    </main>
  );
}
