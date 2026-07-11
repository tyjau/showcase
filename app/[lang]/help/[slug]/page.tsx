import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { helpArticles, helpArticle, helpText } from "@/lib/help";
import { buildAlternates } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.locales.flatMap((lang) =>
    helpArticles().map((a) => ({ lang, slug: a.slug })),
  );
}

export async function generateMetadata(
  props: {
    params: Promise<{ lang: string; slug: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const a = helpArticle(params.slug);
  const t = await getDictionary(params.lang);
  return {
    title: a ? helpText(a, params.lang).title : t.helpPage.eyebrow,
    description: t.helpPage.lead,
    alternates: buildAlternates(params.lang, `/help/${params.slug}`),
  };
}

export default async function HelpArticlePage(
  props: {
    params: Promise<{ lang: string; slug: string }>;
  }
) {
  const params = await props.params;
  const a = helpArticle(params.slug);
  if (!a) notFound();
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const at = helpText(a, lang);
  const h = t.helpPage;

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <Link
        href={`/${lang}/help`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-text"
      >
        <ArrowLeft size={15} /> {h.back}
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
          <HelpCircle size={22} />
        </div>
        <h1 className="text-3xl font-bold text-heading">{at.title}</h1>
      </div>

      <div className="mt-8 space-y-7">
        {at.sections.map((s, i) => (
          <section key={i}>
            <h2 className="text-lg font-bold text-heading">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-ink">{s.p}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-line bg-mist p-6 text-center">
        <h2 className="text-lg font-bold text-heading">{h.contactTitle}</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">{h.contactLead}</p>
        <Link
          href={`/${lang}/company#contact`}
          className="mt-4 inline-block rounded-full bg-sky-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-[#08607f]"
        >
          {h.contactCta}
        </Link>
      </div>
    </main>
  );
}
