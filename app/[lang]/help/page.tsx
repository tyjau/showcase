import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Rocket,
  CreditCard,
  ShieldCheck,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import {
  helpArticlesByCategory,
  helpText,
  HELP_CATEGORIES,
  type HelpCategory,
} from "@/lib/help";
import { buildAlternates } from "@/lib/seo";
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
  return { title: t.helpPage.eyebrow, description: t.helpPage.lead, alternates: buildAlternates(params.lang, "/help") };
}

const CAT_ICON: Record<HelpCategory, LucideIcon> = {
  "getting-started": Rocket,
  billing: CreditCard,
  security: ShieldCheck,
};

export default async function HelpPage(
  props: {
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const h = t.helpPage;
  const byCat = helpArticlesByCategory();

  return (
    <main>
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-soft">
            {h.eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{h.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-hero-fg-muted">{h.lead}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-14">
        <div className="space-y-10">
          {HELP_CATEGORIES.map((cat) => {
            const Icon = CAT_ICON[cat];
            const articles = byCat[cat];
            if (!articles.length) return null;
            return (
              <div key={cat}>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-heading">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
                    <Icon size={17} />
                  </span>
                  {h.categories[cat]}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {articles.map((a) => {
                    const at = helpText(a, lang);
                    return (
                      <Link
                        key={a.slug}
                        href={`/${lang}/help/${a.slug}`}
                        className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
                      >
                        <span className="block min-w-0 flex-1">
                          <span className="block font-medium text-ink">{at.title}</span>
                          <span className="mt-0.5 block truncate text-xs text-muted">
                            {at.sections[0]?.p}
                          </span>
                        </span>
                        <ArrowRight
                          size={16}
                          className="shrink-0 text-sky-text transition group-hover:translate-x-0.5"
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <Link
            href={`/${lang}/features`}
            className="group flex items-start gap-4 rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
              <LayoutGrid size={22} />
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 font-semibold text-ink">
                {h.modulesTitle}
                <ArrowRight
                  size={15}
                  className="text-sky-text transition group-hover:translate-x-0.5"
                />
              </h3>
              <p className="mt-1 text-sm text-muted">{h.modulesDesc}</p>
            </div>
          </Link>
        </div>

        <div className="mt-12 rounded-2xl border border-line bg-mist p-6 text-center">
          <h2 className="text-lg font-bold text-heading">{h.contactTitle}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            {h.contactLead}
          </p>
          <Link
            href={`/${lang}/contact`}
            className="mt-4 inline-block rounded-full bg-sky-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#08607f]"
          >
            {h.contactCta}
          </Link>
        </div>
      </div>
    </main>
  );
}
