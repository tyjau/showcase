import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, type Locale } from "@/lib/i18n";
import { ParallaxTriangles } from "@/components/parallax-triangles";
import { CareersList } from "@/components/careers-list";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return { title: t.seo.pages.careers };
}

export default async function CareersPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const p = t.careersPage;
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
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="text-center text-2xl font-bold text-heading">{p.valuesTitle}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {p.values.map((v: { title: string; desc: string }) => (
            <div key={v.title} className="rounded-xl border border-line bg-surface p-5">
              <h3 className="font-semibold text-ink">{v.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <CareersList
        lang={params.lang}
        jobs={p.jobs}
        dict={{ openings: p.openings, allTeams: p.allTeams, apply: p.apply, noJobs: p.noJobs }}
      />

      <section className="border-t border-line bg-mist">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center">
          <h2 className="text-2xl font-bold text-heading">{p.perksTitle}</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">{p.perksBody}</p>
          <Link
            href={`/${params.lang}/contact?sujet=produit`}
            className="mt-6 inline-flex rounded-full bg-sky-strong px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#08607f]"
          >
            {p.perksCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
