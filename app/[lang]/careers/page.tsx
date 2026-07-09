import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ShieldCheck, Globe, BookOpen, type LucideIcon } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, type Locale } from "@/lib/i18n";
import { buildAlternates } from "@/lib/seo";
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
  return { title: t.seo.pages.careers, alternates: buildAlternates(params.lang, "/careers") };
}

const VALUE_ICONS: LucideIcon[] = [Heart, ShieldCheck, Globe, BookOpen];

export default async function CareersPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const p = t.careersPage;
  return (
    <main>
      {/* HERO + stats */}
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">{p.eyebrow}</span>
          <h1 className="mx-auto mt-3.5 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-[42px]">
            {p.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-hero-fg-muted">{p.lead}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-7">
            {p.stats.map((s: { v: string; l: string }) => (
              <div key={s.l} className="text-center">
                <div className="text-3xl font-extrabold text-white">{s.v}</div>
                <div className="mt-0.5 text-sm text-hero-fg-muted">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-6xl px-5 pb-4 pt-14">
        <div className="text-center">
          <h2 className="text-[28px] font-extrabold tracking-tight text-heading">{p.valuesTitle}</h2>
          <p className="mt-2 text-muted">{p.valuesSubtitle}</p>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.values.map((v: { title: string; desc: string }, i: number) => {
            const Icon = VALUE_ICONS[i] ?? Heart;
            return (
              <div key={v.title} className="rounded-2xl border border-line bg-surface p-6">
                <span className="mb-3.5 inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-tint-sky text-sky-text">
                  <Icon size={22} />
                </span>
                <h3 className="text-[16.5px] font-extrabold text-heading">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <CareersList
        lang={lang}
        jobs={p.jobs}
        dict={{ openings: p.openings, rolesNote: p.rolesNote, allTeams: p.allTeams, apply: p.apply, noJobs: p.noJobs }}
      />

      {/* PERKS — dark navy rounded card */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-hero-bg px-7 py-12 text-center text-hero-fg">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_280px_at_50%_-20%,rgba(15,158,213,0.22),transparent_70%)]" />
          <div className="relative">
            <h2 className="text-[28px] font-extrabold tracking-tight">{p.perksTitle}</h2>
            <p className="mx-auto mt-3 max-w-lg text-hero-fg-muted">{p.perksBody}</p>
            <Link
              href={`/${lang}/contact?sujet=candidature`}
              className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-[15px] font-semibold text-[#156082] transition-transform hover:scale-[1.02]"
            >
              {p.perksCta}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
