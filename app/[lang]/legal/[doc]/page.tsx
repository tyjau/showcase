import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";

const DOCS = ["terms", "privacy", "cookies", "security"];

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.locales.flatMap((lang) =>
    DOCS.map((doc) => ({ lang, doc })),
  );
}

export async function generateMetadata(
  props: {
    params: Promise<{ lang: string; doc: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const docs = t.legalPage.docs as Record<string, string>;
  return { title: docs[params.doc] ?? t.seo.pages.company };
}

export default async function LegalPage(
  props: {
    params: Promise<{ lang: string; doc: string }>;
  }
) {
  const params = await props.params;
  if (!DOCS.includes(params.doc)) notFound();

  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const docs = t.legalPage.docs as Record<string, string>;
  const title = docs[params.doc] ?? params.doc;
  const sections =
    (t.legalPage as { content?: Record<string, { h: string; p: string }[]> })
      .content?.[params.doc] ?? [];

  return (
    <main>
      {/* HERO band */}
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_300px_at_85%_-20%,rgba(15,158,213,0.18),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-5 py-14">
          <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">{t.legalPage.eyebrow}</span>
          <div className="mt-3 flex items-center gap-3.5">
            <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-[13px] bg-sky-strong/20 text-sky-soft">
              <FileText size={24} />
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">{title}</h1>
          </div>
          <p className="mt-3 text-sm text-hero-fg-muted">{t.legalPage.lastUpdate}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-5 py-12">
      {/* Document selector — at the top so it reads as a table of contents. */}
      <nav data-testid="legal-tabs" className="flex flex-wrap gap-2">
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

      {/* Internal "draft — finalize with counsel" warning. Shown in dev only so it
          never reaches visitors on the production build, while still reminding the
          team (and reviewers) that the legal copy is not yet final. */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-6 rounded-lg border border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-fg">
          {t.legalPage.draft}
        </div>
      )}

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
      </div>
    </main>
  );
}
