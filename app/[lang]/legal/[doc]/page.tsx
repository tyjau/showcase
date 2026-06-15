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
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#e7f4fb] text-sky">
          <FileText size={22} />
        </div>
        <h1 className="text-3xl font-bold text-navy">{title}</h1>
      </div>

      <div className="mt-6 rounded-lg border border-[#f0d9a8] bg-[#fdf6e6] px-4 py-3 text-sm text-[#8a6d1f]">
        {t.legalPage.draft}
      </div>

      <p className="mt-6 leading-relaxed text-ink">{t.legalPage.body}</p>

      <nav className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
        {DOCS.map((d) => (
          <Link
            key={d}
            href={`/${lang}/legal/${d}`}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              d === params.doc
                ? "bg-navy font-semibold text-white"
                : "border border-line text-muted hover:border-sky hover:text-navy"
            }`}
          >
            {docs[d] ?? d}
          </Link>
        ))}
      </nav>
    </main>
  );
}
