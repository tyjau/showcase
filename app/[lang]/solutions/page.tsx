import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MapPin } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { i18n } from "@/lib/i18n";
import { buildAlternates, SITE_URL } from "@/lib/seo";
import { GEO_COUNTRIES, type Framework } from "@/lib/geo";
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
    title: t.geoPage.hubTitle,
    description: t.geoPage.hubLead,
    alternates: buildAlternates(params.lang, "/solutions"),
  };
}

export default async function SolutionsHub(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const g = t.geoPage;
  const lang = params.lang;
  const nameOf = (n: { fr: string; en: string }) => (lang === "fr" ? n.fr : n.en);

  const groups: { key: Framework; label: string }[] = [
    { key: "OHADA", label: g.groupOHADA },
    { key: "EU", label: g.groupEU },
  ];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "SkyRH", item: `${SITE_URL}/${lang}` },
      { "@type": "ListItem", position: 2, name: g.hubTitle, item: `${SITE_URL}/${lang}/solutions` },
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
            {g.hubTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-hero-fg-muted">{g.hubLead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16">
        {process.env.NODE_ENV !== "production" && (
          <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-fg">
            {g.draft}
          </div>
        )}
        {groups.map((grp) => {
          const list = GEO_COUNTRIES.filter((c) => c.framework === grp.key);
          if (!list.length) return null;
          return (
            <div key={grp.key} className="mb-10 last:mb-0">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">{grp.label}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/${lang}/solutions/${c.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:shadow-[0_14px_32px_-18px_rgba(14,40,65,0.45)]"
                  >
                    <span className="flex items-center gap-2.5 font-bold text-ink">
                      <MapPin size={17} className="flex-none text-sky-text" /> {nameOf(c.name)}
                    </span>
                    <ArrowRight size={16} className="flex-none text-sky-text transition group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <CtaBand
        href={`/${lang}/signup`}
        location="geo_hub"
        title={g.ctaTitle}
        sub={g.ctaSub}
        button={g.ctaButton}
      />
    </main>
  );
}
