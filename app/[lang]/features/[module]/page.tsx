import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Check } from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { fetchCatalog, moduleText, type CatalogModule } from "@/lib/catalog";
import { moduleContent, moduleExtras } from "@/lib/module-content";
import { ModuleIcon } from "@/components/module-icon";
import { MediaFrame } from "@/components/media-frame";
import { Price } from "@/components/price";
import { CtaBand } from "@/components/cta-band";
import { ParallaxTriangles } from "@/components/parallax-triangles";

export const dynamicParams = false;

// Real product screenshots per module (the handoff ships payroll captures; this is the
// "patron" other modules decline into). Keyed by catalogue code.
const HERO = "/img/hero-photo.png";
const MODULE_SHOTS: Record<string, { heroPhoto?: string; dashboard: string; gallery: string[] }> = {
  "WAGE-GEN00": {
    heroPhoto: HERO,
    dashboard: "/img/modules/paie-dashboard.png",
    gallery: ["/img/modules/paie-sessions.png", "/img/modules/paie-elements.png", "/img/modules/paie-compliance.png"],
  },
  "MGMT00": {
    heroPhoto: HERO,
    dashboard: "/img/modules/personnel-dashboard.png",
    gallery: ["/img/modules/personnel-1.png", "/img/modules/personnel-2.png", "/img/modules/personnel-3.png"],
  },
  "ATT00": {
    heroPhoto: HERO,
    dashboard: "/img/modules/attendance-dashboard.png",
    gallery: ["/img/modules/attendance-1.png", "/img/modules/attendance-2.png", "/img/modules/attendance-3.png"],
  },
  "EMPL-SELF00": {
    heroPhoto: HERO,
    dashboard: "/img/modules/selfservice-dashboard.png",
    gallery: ["/img/modules/selfservice-1.png", "/img/modules/selfservice-2.png", "/img/modules/selfservice-3.png"],
  },
  "MGMT-ONB00": {
    heroPhoto: HERO,
    dashboard: "/img/modules/onboarding-dashboard.png",
    gallery: ["/img/modules/onboarding-1.png", "/img/modules/onboarding-2.png"],
  },
  "RECR00": {
    heroPhoto: HERO,
    dashboard: "/img/modules/recruit-dashboard.png",
    gallery: ["/img/modules/recruit-1.png", "/img/modules/recruit-2.png", "/img/modules/recruit-3.png"],
  },
  "CARE00": {
    heroPhoto: HERO,
    dashboard: "/img/modules/career-dashboard.png",
    gallery: ["/img/modules/career-1.png", "/img/modules/career-2.png", "/img/modules/career-3.png"],
  },
  "TRAIN00": {
    heroPhoto: HERO,
    dashboard: "/img/modules/training-dashboard.png",
    gallery: ["/img/modules/training-1.png", "/img/modules/training-2.png", "/img/modules/training-3.png"],
  },
  "CARE-COMP-FW00": {
    heroPhoto: HERO,
    dashboard: "/img/modules/gpec-dashboard.png",
    gallery: ["/img/modules/gpec-1.png", "/img/modules/gpec-2.png", "/img/modules/gpec-3.png"],
  },
  "SOC00": {
    heroPhoto: HERO,
    dashboard: "/img/modules/social-dashboard.png",
    gallery: ["/img/modules/social-1.png", "/img/modules/social-2.png", "/img/modules/social-3.png"],
  },
  "SOC-SST-INC00": {
    heroPhoto: HERO,
    dashboard: "/img/modules/sst-dashboard.png",
    gallery: ["/img/modules/sst-1.png", "/img/modules/sst-2.png", "/img/modules/sst-3.png"],
  },
};

export async function generateStaticParams() {
  const catalog = await fetchCatalog();
  return i18n.locales.flatMap((lang) =>
    catalog.modules.map((m) => ({ lang, module: m.code })),
  );
}

export async function generateMetadata(
  props: {
    params: Promise<{ lang: string; module: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const catalog = await fetchCatalog();
  const m = catalog.modules.find((x) => x.code === params.module);
  const t = await getDictionary(params.lang);
  return {
    title: m ? moduleText(m, params.lang).headline : t.seo.pages.features,
  };
}

export default async function ModulePage(
  props: {
    params: Promise<{ lang: string; module: string }>;
  }
) {
  const params = await props.params;
  const catalog = await fetchCatalog();
  const m = catalog.modules.find((x) => x.code === params.module);
  if (!m) notFound();
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const txt = moduleText(m, lang);
  const content = moduleContent(m.code, lang);
  const extras = moduleExtras(m.code, lang);
  const shots = MODULE_SHOTS[m.code];
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
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        {shots?.heroPhoto && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shots.heroPhoto}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-[0.4]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-hero-bg via-hero-bg/85 to-hero-bg/40" />
          </>
        )}
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-5xl px-5 py-16">
          <Link
            href={`/${lang}/features`}
            className="inline-flex items-center gap-1 text-sm text-hero-fg-muted hover:text-white"
          >
            <ArrowLeft size={15} /> {t.modulePage.back}
          </Link>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-strong text-white">
              <ModuleIcon name={m.icon} size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{txt.headline}</h1>
              <p className="mt-2 max-w-2xl text-lg text-hero-fg-muted">{txt.tagline}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={`/${lang}/signup`}
                  className="rounded-full bg-sky-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#08607f]"
                >
                  {t.nav.startTrial}
                </Link>
                {hasPrice && (
                  <span className="text-sm text-hero-fg-muted">
                    {t.modulePage.orFrom}{" "}
                    <Price prices={m.prices} className="font-semibold text-white" />{" "}
                    {t.modulePage.perEmployee}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-12">
        {(shots?.dashboard || m.cover) && (
          <MediaFrame src={shots?.dashboard ?? m.cover!} alt={txt.headline} className="mb-8" />
        )}
        <p className="max-w-3xl text-lg leading-relaxed text-ink">
          {txt.description}
        </p>

        {/* Key figures */}
        {extras && extras.keyFigures.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-3">
            {extras.keyFigures.map((kf) => (
              <div key={kf} className="flex items-center gap-2.5">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-strong text-white">
                  <Check size={15} strokeWidth={3} />
                </span>
                <span className="font-semibold text-ink">{kf}</span>
              </div>
            ))}
          </div>
        )}

        {/* Alternating feature blocks: screenshot + highlight + capability bullets.
            Falls back to a flat capabilities checklist if no gallery/extras exist. */}
        {content && shots?.gallery && shots.gallery.length > 0 && extras ? (
          <div className="mt-12 flex flex-col gap-12">
            {shots.gallery.map((img, i) => {
              const per = Math.ceil(content.capabilities.length / shots.gallery!.length);
              const bullets = content.capabilities.slice(i * per, (i + 1) * per);
              const flip = i % 2 === 1;
              return (
                <div key={img} className="grid items-center gap-8 md:grid-cols-2">
                  <div className={flip ? "md:order-2" : ""}>
                    <MediaFrame src={img} alt={txt.headline} />
                  </div>
                  <div className={flip ? "md:order-1" : ""}>
                    <h3 className="text-xl font-bold text-heading">{extras.highlights[i] ?? txt.headline}</h3>
                    <ul className="mt-4 flex flex-col gap-2.5">
                      {bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5">
                          <Check size={18} className="mt-0.5 shrink-0 text-sky-text" />
                          <span className="text-ink">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          content && (
            <div className="mt-10">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent">
                {t.modulePage.capabilities}
              </h2>
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {content.capabilities.map((cap) => (
                  <div key={cap} className="flex items-start gap-2.5">
                    <Check size={18} className="mt-0.5 shrink-0 text-sky-text" />
                    <span className="text-ink">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {content && content.useCases.length > 0 && (
          <div className="mt-12">
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
                  <Check size={14} className="text-sky-text" /> {p.name}
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
                    <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
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

      <CtaBand
        href={`/${lang}/signup`}
        title={t.ctaBand.title}
        sub={t.ctaBand.sub}
        button={t.ctaBand.button}
      />
    </main>
  );
}
