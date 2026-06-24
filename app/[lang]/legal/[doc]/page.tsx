import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";

const DOCS = ["terms", "privacy", "cookies", "security"];

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.locales.flatMap((lang) =>
    DOCS.map((doc) => ({ lang, doc })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale; doc: string };
}): Promise<Metadata> {
  const t = await getDictionary(params.lang);
  const docs = t.legalPage.docs as Record<string, string>;
  return { title: docs[params.doc] ?? t.seo.pages.company };
}

export default async function LegalPage({
  params,
}: {
  params: { lang: Locale; doc: string };
}) {
  if (!DOCS.includes(params.doc)) notFound();

  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const docs = t.legalPage.docs as Record<string, string>;
  const title = docs[params.doc] ?? params.doc;
  const sections =
    (t.legalPage as { content?: Record<string, { h: string; p: string }[]> })
      .content?.[params.doc] ?? [];

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <Link
        href={`/${lang}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky"
      >
        <ArrowLeft size={15} />
        {t.legalPage.back}
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-tint-sky text-sky">
          <FileText size={22} />
        </div>
        <h1 className="text-3xl font-bold text-heading">{title}</h1>
      </div>

      {/* Document selector — at the top so it reads as a table of contents. */}
      <nav data-testid="legal-tabs" className="mt-6 flex flex-wrap gap-2">
        {DOCS.map((d) => (
          <Link
            key={d}
            href={`/${lang}/legal/${d}`}
            aria-current={d === params.doc ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              d === params.doc
                ? "bg-navy font-semibold text-white"
                : "border border-line text-muted hover:border-sky hover:text-heading"
            }`}
          >
            {docs[d] ?? d}
          </Link>
        ))}
      </nav>

      <div className="mt-6 rounded-lg border border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-fg">
        {t.legalPage.draft}
      </div>

      <div className="mt-8 space-y-7">
        {sections.length > 0 ? (
          sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-bold text-heading">{s.h}</h2>
              <p className="mt-2 leading-relaxed text-ink">{s.p}</p>
            </section>
          ))
        ) : (
          <p className="leading-relaxed text-ink">{t.legalPage.body}</p>
        )}
      </div>
    </main>
  );
}
