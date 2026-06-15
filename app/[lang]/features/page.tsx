import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog, modulesByCategory, moduleText } from "@/lib/catalog";
import { ModuleIcon } from "@/components/module-icon";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const t = await getDictionary(params.lang);
  return { title: t.seo.pages.features };
}

const CATEGORY_ORDER = ["people", "time-off", "payroll", "talent", "health"];

export default async function FeaturesPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const catalog = await fetchCatalog();
  const groups = modulesByCategory(catalog.modules);
  const cats = t.modulesPage.categories as Record<string, string>;

  return (
    <main>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {t.modulesPage.heading}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[#c7d6e3]">
            {t.modulesPage.sub}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-12">
        {CATEGORY_ORDER.filter((c) => groups[c]?.length).map((cat) => (
          <section key={cat} className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent">
              {cats[cat] ?? cat}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups[cat].map((m) => {
                const txt = moduleText(m, lang);
                return (
                  <Link
                    key={m.code}
                    href={`/${lang}/features/${m.code}`}
                    className="group rounded-xl border border-line p-5 transition hover:-translate-y-1 hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#e7f4fb] text-sky">
                        <ModuleIcon name={m.icon} size={20} />
                      </div>
                      {m.isAddon && (
                        <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] text-muted">
                          {t.modulesPage.addon}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-ink">{txt.headline}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {txt.tagline}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky">
                      {t.modulesPage.learnMore}
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
      </div>
    </main>
  );
}
