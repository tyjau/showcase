import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Check } from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog, moduleText, type CatalogModule } from "@/lib/catalog";
import { moduleContent } from "@/lib/module-content";
import { ModuleIcon } from "@/components/module-icon";
import { MediaFrame } from "@/components/media-frame";
import { Price } from "@/components/price";

export const dynamicParams = false;

export async function generateStaticParams() {
  const catalog = await fetchCatalog();
  return i18n.locales.flatMap((lang) =>
    catalog.modules.map((m) => ({ lang, module: m.code })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; module: string };
}): Promise<Metadata> {
  const catalog = await fetchCatalog();
  const m = catalog.modules.find((x) => x.code === params.module);
  const t = await getDictionary(params.lang);
  return {
    title: m ? moduleText(m, params.lang).headline : t.seo.pages.features,
  };
}

export default async function ModulePage({
  params,
}: {
  params: { lang: Locale; module: string };
}) {
  const catalog = await fetchCatalog();
  const m = catalog.modules.find((x) => x.code === params.module);
  if (!m) notFound();
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const txt = moduleText(m, lang);
  const content = moduleContent(m.code, lang);
  const hasPrice = m.prices.some((p) => p.cycle === "monthly");
  const inPackages = catalog.packages.filter((p) => p.modules.includes(m.code));
  const requires = m.requires
    .map((r) => ({
      kind: r.kind,
      mod: catalog.modules.find((x) => x.code === r.code),
    }))
    .filter((r) => r.mod) as { kind: string; mod: CatalogModule }[];

  return (
    <main>
      <section className="border-b border-line bg-mist">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <Link
            href={`/${lang}/features`}
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-sky"
          >
            <ArrowLeft size={15} /> {t.modulePage.back}
          </Link>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky text-white">
              <ModuleIcon name={m.icon} size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-heading">{txt.headline}</h1>
              <p className="mt-2 max-w-2xl text-lg text-muted">{txt.tagline}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={`/${lang}/signup`}
                  className="rounded-full bg-sky px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#0d8bbd]"
                >
                  {t.nav.startTrial}
                </Link>
                {hasPrice && (
                  <span className="text-sm text-muted">
                    {t.modulePage.orFrom}{" "}
                    <Price prices={m.prices} className="font-semibold text-ink" />{" "}
                    {t.modulePage.perEmployee}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-12">
        {m.cover && (
          <MediaFrame src={m.cover} alt={txt.headline} className="mb-8" />
        )}
        <p className="max-w-3xl text-lg leading-relaxed text-ink">
          {txt.description}
        </p>

        {content && (
          <>
            <div className="mt-10">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent">
                {t.modulePage.capabilities}
              </h2>
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {content.capabilities.map((cap) => (
                  <div key={cap} className="flex items-start gap-2.5">
                    <Check size={18} className="mt-0.5 shrink-0 text-sky" />
                    <span className="text-ink">{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            {content.useCases.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent">
                  {t.modulePage.useCases}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {content.useCases.map((uc) => (
                    <div
                      key={uc}
                      className="rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed text-muted"
                    >
                      {uc}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {inPackages.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">
              {t.modulePage.availableIn}
            </h2>
            <div className="flex flex-wrap gap-2">
              {inPackages.map((p) => (
                <Link
                  key={p.code}
                  href={`/${lang}/pricing`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm transition hover:border-sky"
                >
                  <Check size={14} className="text-sky" /> {p.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {requires.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">
              {t.modulePage.worksWith}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {requires.map(({ kind, mod }) => {
                const rt = moduleText(mod, lang);
                return (
                  <Link
                    key={mod.code}
                    href={`/${lang}/features/${mod.code}`}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tint-sky text-sky">
                      <ModuleIcon name={mod.icon} size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink">
                        {rt.headline}
                      </div>
                      <div className="text-[11px] uppercase tracking-wide text-muted">
                        {kind === "required"
                          ? t.modulePage.required
                          : t.modulePage.recommended}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <section className="px-5 pb-16">
        <div className="mx-auto max-w-5xl rounded-2xl bg-gradient-to-r from-sky to-accent px-6 py-12 text-center text-white">
          <h2 className="text-2xl font-bold">{t.ctaBand.title}</h2>
          <p className="mx-auto mt-2 max-w-lg text-[#eaf6fd]">{t.ctaBand.sub}</p>
          <Link
            href={`/${lang}/signup`}
            className="mt-5 inline-block rounded-full bg-white px-6 py-3 font-semibold text-[#156082]"
          >
            {t.ctaBand.button}
          </Link>
        </div>
      </section>
    </main>
  );
}
