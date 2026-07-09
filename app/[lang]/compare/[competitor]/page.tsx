import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { i18n } from "@/lib/i18n";
import { buildAlternates, SITE_URL } from "@/lib/seo";
import { COMPETITORS, isCompetitor } from "@/lib/compare";
import { JsonLd } from "@/components/json-ld";
import { CompareTable } from "@/components/compare-table";
import { CtaBand } from "@/components/cta-band";
import { ParallaxTriangles } from "@/components/parallax-triangles";

// Seuls les concurrents connus sont générés ; toute autre valeur → 404 (pas de page fantôme).
export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.locales.flatMap((lang) =>
    COMPETITORS.map((competitor) => ({ lang, competitor })),
  );
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string; competitor: string }> },
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const p = t.comparePage;
  const competitors = p.competitors as Record<string, { name: string }>;
  const name = competitors[params.competitor]?.name ?? params.competitor;
  return {
    title: `${p.vsPrefix} ${name}`,
    description: p.vsLead.replace("{name}", name),
    alternates: buildAlternates(params.lang, `/compare/${params.competitor}`),
  };
}

export default async function ComparePage(
  props: { params: Promise<{ lang: string; competitor: string }> },
) {
  const params = await props.params;
  if (!isCompetitor(params.competitor)) notFound();
  const t = await getDictionary(params.lang);
  const p = t.comparePage;
  const lang = params.lang;
  const competitors = p.competitors as Record<string, { name: string }>;
  const name = competitors[params.competitor]?.name ?? params.competitor;
  const why = p.why as string[];
  const features = p.features as { label: string; skyrh: string }[];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SkyRH", item: `${SITE_URL}/${lang}` },
      { "@type": "ListItem", position: 2, name: p.hubTitle, item: `${SITE_URL}/${lang}/compare` },
      {
        "@type": "ListItem",
        position: 3,
        name: `${p.vsPrefix} ${name}`,
        item: `${SITE_URL}/${lang}/compare/${params.competitor}`,
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
          <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">{p.eyebrow}</span>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {p.vsPrefix} {name}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-hero-fg-muted">{p.vsLead.replace("{name}", name)}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16">
        {process.env.NODE_ENV !== "production" && (
          <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-fg">
            {p.draft}
          </div>
        )}

        {/* Arguments factuels côté SkyRH (jamais d'affirmation sur le concurrent). */}
        <h2 className="text-2xl font-bold text-heading">{p.whyTitle}</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {why.map((w) => (
            <li key={w} className="flex items-start gap-2.5 text-muted">
              <ShieldCheck size={18} className="mt-0.5 flex-none text-sky-text" />
              <span>{w}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 text-2xl font-bold text-heading">{p.tableTitle}</h2>
        <div className="mt-4">
          <CompareTable
            features={features}
            featureCol={p.featureCol}
            skyrhCol={p.skyrhCol}
            competitorName={name}
            verify={p.verify}
          />
        </div>

        <Link
          href={`/${lang}/compare`}
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-text hover:underline"
        >
          <ArrowLeft size={15} /> {p.backToHub}
        </Link>
      </section>

      <CtaBand
        href={`/${lang}/signup`}
        location="compare_vs"
        title={p.ctaTitle}
        sub={p.ctaSub}
        button={p.ctaButton}
      />
    </main>
  );
}
