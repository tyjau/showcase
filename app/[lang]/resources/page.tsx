import type { Metadata } from "next";
import Link from "next/link";
import {
  Video,
  LifeBuoy,
  ShieldCheck,
  Download,
  BookOpen,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { buildAlternates } from "@/lib/seo";
import { ParallaxTriangles } from "@/components/parallax-triangles";
import { ResourceSearch } from "@/components/resource-search";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return { title: t.seo.pages.resources, description: t.resourcesPage.lead, alternates: buildAlternates(params.lang, "/resources") };
}

const CARD_ICONS: Record<string, LucideIcon> = {
  video: Video,
  help: LifeBuoy,
  shield: ShieldCheck,
  download: Download,
};

export default async function ResourcesPage(
  props: { params: Promise<{ lang: string }> }
) {
  const params = await props.params;
  const lang = params.lang;
  const t = await getDictionary(lang);
  const p = t.resourcesPage;
  const href = (h: string) => `/${lang}/${h}`;

  return (
    <main>
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-sky-soft">{p.eyebrow}</span>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {p.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-hero-fg-muted">{p.lead}</p>
          <ResourceSearch lang={lang} placeholder={p.searchPlaceholder} />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-14">
        {/* Resource cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.cards.map((c) => {
            const Icon = CARD_ICONS[c.icon] ?? LifeBuoy;
            return (
              <Link
                key={c.title}
                href={href(c.href)}
                className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-sky hover:shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-tint-sky text-sky-text">
                  <Icon size={20} />
                </span>
                <h2 className="mt-4 font-bold text-heading">{c.title}</h2>
                <p className="mt-1.5 flex-1 text-sm text-muted">{c.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-text">
                  {c.cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Guides by module */}
        <div className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-heading">{p.guidesTitle}</h2>
              <p className="mt-1.5 text-muted">{p.guidesSub}</p>
            </div>
            <Link href={href("features")} className="flex-none text-sm font-semibold text-sky-text hover:underline">
              {p.guidesAll} →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {p.guides.map((g) => (
              <Link
                key={g.code}
                href={href(`resources/guides/${g.code}`)}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
                  <BookOpen size={18} />
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-ink">{g.title}</div>
                  <div className="text-xs text-muted">{g.count} {p.articles}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help categories + FAQ */}
        <div id="aide" className="mt-16 grid gap-10 rounded-2xl border border-line bg-mist p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-accent">{p.helpEyebrow}</span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-heading">{p.helpTitle}</h2>
            <p className="mt-2 text-muted">{p.helpSub}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {p.helpCategories.map((cat) => (
                <Link
                  key={cat.label}
                  href={href(cat.href)}
                  className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ink transition hover:border-sky"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-accent">{p.faqTitle}</h3>
            <ul className="mt-4 divide-y divide-line">
              {p.faq.map((q) => (
                <li key={q}>
                  <Link
                    href={href(p.faqHref)}
                    className="flex items-center justify-between gap-3 py-3 text-sm text-ink transition hover:text-sky-text"
                  >
                    {q} <ArrowRight size={15} className="flex-none text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
