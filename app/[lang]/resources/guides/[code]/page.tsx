import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Check, Clock, Globe, FileText } from "lucide-react";
import { i18n } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog, moduleText } from "@/lib/catalog";
import { moduleContent, moduleExtras } from "@/lib/module-content";
import { buildAlternates } from "@/lib/seo";
import { ModuleIcon } from "@/components/module-icon";

export const dynamicParams = false;

// Per-module GUIDE pages — documentation-style (capabilities + real use cases + key
// figures), distinct from the marketing /features/[module] page. Generated only for the
// modules that carry real guide content (lib/module-content.ts); the rest 404.
export async function generateStaticParams() {
  const catalog = await fetchCatalog();
  const coded = catalog.modules.filter((m) => moduleContent(m.code, "en"));
  return i18n.locales.flatMap((lang) => coded.map((m) => ({ lang, code: m.code })));
}

export async function generateMetadata(props: {
  params: Promise<{ lang: string; code: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const catalog = await fetchCatalog();
  const m = catalog.modules.find((x) => x.code === params.code);
  const t = await getDictionary(params.lang);
  const name = m ? moduleText(m, params.lang).headline : "";
  return {
    title: name ? `${name} — ${t.guidePage.eyebrow}` : t.seo.pages.resources,
    alternates: buildAlternates(params.lang, `/resources/guides/${params.code}`),
  };
}

export default async function GuidePage(props: {
  params: Promise<{ lang: string; code: string }>;
}) {
  const params = await props.params;
  const lang = params.lang;
  const catalog = await fetchCatalog();
  const m = catalog.modules.find((x) => x.code === params.code);
  const content = m ? moduleContent(m.code, lang) : null;
  if (!m || !content) notFound();
  const t = await getDictionary(lang);
  const g = t.guidePage;
  const txt = moduleText(m, lang);
  const extras = moduleExtras(m.code, lang);
  const catLabel = (t.modulesPage.categories as Record<string, string>)[m.category] ?? "";

  return (
    <main>
      {/* Hero — navy, documentation header (no marketing screenshot) */}
      <section className="bg-hero-bg text-hero-fg">
        <div className="mx-auto max-w-4xl px-5 py-14">
          <Link
            href={`/${lang}/resources`}
            className="inline-flex items-center gap-1 text-sm text-hero-fg-muted hover:text-white"
          >
            <ArrowLeft size={15} /> {g.back}
          </Link>
          <div className="mt-6 flex items-center gap-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[11px] bg-sky-strong/20 text-sky-soft">
              <ModuleIcon name={m.icon} size={22} />
            </span>
            <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">
              {g.eyebrow}
              {catLabel ? ` · ${catLabel}` : ""}
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-[40px]">
            {txt.headline}
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-hero-fg-muted">{txt.tagline}</p>
        </div>
      </section>

      {/* Key figures band */}
      {extras && extras.keyFigures.length > 0 && (
        <div className="border-b border-line bg-surface">
          <div className="mx-auto grid max-w-4xl gap-6 px-5 py-8 sm:grid-cols-3">
            {extras.keyFigures.map((kf, i) => {
              const FIG_ICONS = [Clock, Globe, FileText];
              const Icon = FIG_ICONS[i % FIG_ICONS.length];
              return (
                <div key={kf.title} className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-tint-sky text-sky-text">
                    <Icon size={20} />
                  </span>
                  <div>
                    <div className="font-bold text-ink">{kf.title}</div>
                    <div className="text-[12.5px] text-muted">{kf.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-5 py-14">
        {/* Capabilities — what you can do */}
        <h2 className="text-2xl font-extrabold tracking-tight text-heading">{g.capabilitiesTitle}</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {content.capabilities.map((cap) => (
            <li key={cap} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-md bg-sky-strong text-white">
                <Check size={13} strokeWidth={3} />
              </span>
              <span className="text-sm leading-relaxed text-ink">{cap}</span>
            </li>
          ))}
        </ul>

        {/* Use cases */}
        {content.useCases.length > 0 && (
          <>
            <h2 className="mt-12 text-2xl font-extrabold tracking-tight text-heading">{g.useCasesTitle}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.useCases.map((uc, i) => (
                <div key={uc} className="rounded-xl border border-line bg-mist p-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-strong text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink">{uc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Cross-link to the marketing product page */}
        <Link
          href={`/${lang}/features/${m.code}`}
          className="mt-10 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-text hover:underline"
        >
          {g.featureCta} <ArrowRight size={15} />
        </Link>
      </div>

      {/* CTA band */}
      <section className="bg-hero-bg text-hero-fg">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-5 px-5 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">{g.ctaTitle}</h2>
            <p className="mt-1.5 text-hero-fg-muted">{g.ctaSub}</p>
          </div>
          <Link
            href={`/${lang}/signup`}
            className="flex-none rounded-full bg-sky-strong px-6 py-3 font-semibold text-white transition-colors hover:bg-[#08607f]"
          >
            {t.nav.startTrial}
          </Link>
        </div>
      </section>
    </main>
  );
}
