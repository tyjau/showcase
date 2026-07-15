import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { i18n } from "@/lib/i18n";
import { buildAlternates, SITE_URL } from "@/lib/seo";
import { COMPETITORS } from "@/lib/compare";
import { JsonLd } from "@/components/json-ld";
import { CtaBand } from "@/components/cta-band";
import { ParallaxTriangles } from "@/components/parallax-triangles";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return {
    title: t.comparePage.hubTitle,
    description: t.comparePage.hubLead,
    alternates: buildAlternates(params.lang, "/compare"),
  };
}

export default async function CompareHub(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const p = t.comparePage;
  const lang = params.lang;
  const competitors = p.competitors as Record<string, { name: string }>;

  // Fil d'Ariane structuré (SkyRH → Comparatifs) pour la SERP.
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SkyRH", item: `${SITE_URL}/${lang}` },
      { "@type": "ListItem", position: 2, name: p.hubTitle, item: `${SITE_URL}/${lang}/compare` },
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
            {p.hubTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-hero-fg-muted">{p.hubLead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16">
        {process.env.NODE_ENV !== "production" && (
          <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-fg">
            {p.draft}
          </div>
        )}
        <h2 className="text-center text-2xl font-bold text-heading">{p.pickTitle}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {COMPETITORS.map((slug) => (
            <Link
              key={slug}
              href={`/${lang}/compare/${slug}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:shadow-[0_14px_32px_-18px_rgba(14,40,65,0.45)]"
            >
              <span className="font-bold text-ink">
                {p.vsPrefix} {competitors[slug]?.name ?? slug}
              </span>
              <ArrowRight size={16} className="flex-none text-sky-text transition group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      <CtaBand
        href={`/${lang}/signup`}
        location="compare_hub"
        title={p.ctaTitle}
        sub={p.ctaSub}
        button={p.ctaButton}
      />
    </main>
  );
}
