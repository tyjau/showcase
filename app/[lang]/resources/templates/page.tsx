import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, type Locale } from "@/lib/i18n";
import { buildAlternates } from "@/lib/seo";
import { ParallaxTriangles } from "@/components/parallax-triangles";
import { DownloadCenter } from "@/components/download-center";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return { title: t.templatesPage.title, description: t.templatesPage.lead, alternates: buildAlternates(params.lang, "/resources/templates") };
}

export default async function TemplatesPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = params.lang;
  const t = await getDictionary(lang);
  const p = t.templatesPage;

  return (
    <main>
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(820px_360px_at_80%_-12%,rgba(15,158,213,0.20),transparent_70%)]" />
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">{p.eyebrow}</span>
          <h1 className="mx-auto mt-3.5 max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-[42px]">
            {p.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-hero-fg-muted">{p.lead}</p>
        </div>
      </section>

      <DownloadCenter lang={lang} dict={p} />

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-hero-bg px-7 py-11 text-center text-hero-fg">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_280px_at_50%_-20%,rgba(15,158,213,0.22),transparent_70%)]" />
          <div className="relative">
            <h2 className="text-[28px] font-extrabold tracking-tight">{p.ctaTitle}</h2>
            <p className="mx-auto mt-2.5 max-w-lg text-hero-fg-muted">{p.ctaLead}</p>
            <Link
              href={`/${lang}/contact?sujet=produit`}
              className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-[15px] font-semibold text-[#156082] transition-transform hover:scale-[1.02]"
            >
              {p.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
