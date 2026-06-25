import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog, modulesByCategory, moduleText } from "@/lib/catalog";
import { ModuleIcon } from "@/components/module-icon";
import { ParallaxTriangles } from "@/components/parallax-triangles";

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
  return { title: t.seo.pages.features };
}

const CATEGORY_ORDER = ["people", "time-off", "payroll", "talent", "health"];

export default async function FeaturesPage(
  props: {
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const catalog = await fetchCatalog();
  const groups = modulesByCategory(catalog.modules);
  const m = t.modulesPage;
  const cats = m.categories as Record<string, string>;

  return (
    <main>
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(820px_360px_at_80%_-12%,rgba(15,158,213,0.20),transparent_70%)]" />
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">{m.eyebrow}</span>
          <h1 className="mt-3.5 text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-[42px]">
            {m.heading}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-hero-fg-muted">
            {m.sub}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${lang}/signup`}
              className="rounded-full bg-sky-strong px-7 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#08607f]"
            >
              {m.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/pricing`}
              className="rounded-full border border-white/45 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-white/10"
            >
              {m.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-12">
        {CATEGORY_ORDER.filter((c) => groups[c]?.length).map((cat) => (
          <section key={cat} className="mb-10">
            <div className="mb-4 flex items-center gap-4">
              <h2 className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-accent">
                {cats[cat] ?? cat}
              </h2>
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs font-semibold text-muted">
                {groups[cat].length} {groups[cat].length === 1 ? m.moduleCountOne : m.modulesCount}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups[cat].map((mod) => {
                const txt = moduleText(mod, lang);
                return (
                  <Link
                    key={mod.code}
                    href={`/${lang}/features/${mod.code}`}
                    className="group rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-tint-sky text-sky-text">
                        <ModuleIcon name={mod.icon} size={22} />
                      </div>
                      {mod.isAddon && (
                        <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] text-muted">
                          {m.addon}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-ink">{txt.headline}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {txt.tagline}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-text">
                      {m.learnMore}
                      <ArrowRight
                        size={15}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {/* CLOSING CTA BAND */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky to-accent px-7 py-12 text-center text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">{m.ctaTitle}</h2>
          <p className="mx-auto mt-2.5 max-w-lg text-white/90">{m.ctaLead}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${lang}/signup`}
              className="rounded-full bg-white px-7 py-3 text-[15px] font-semibold text-[#156082] transition-transform hover:scale-[1.02]"
            >
              {m.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/pricing`}
              className="rounded-full border border-white/60 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-white/10"
            >
              {m.ctaSecondary}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
