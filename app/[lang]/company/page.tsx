import Link from "next/link";
import { Picture } from "@/components/picture";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  Lock,
  Monitor,
  Handshake,
  ArrowRight,
  Briefcase,
  Check,
} from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { buildAlternates } from "@/lib/seo";
import { ParallaxTriangles } from "@/components/parallax-triangles";
import { ExpertForm } from "@/components/expert-form";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return { title: t.seo.pages.company, description: t.companyPage.lead, alternates: buildAlternates(params.lang, "/company") };
}

const VALUE_ICONS = [ShieldCheck, Users, CheckCircle2, Lock];

export default async function CompanyPage(
  props: { params: Promise<{ lang: string }> }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const c = t.companyPage;

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <Picture
          src="/img/hero-photo.png"
          alt=""
          ariaHidden
          priority
          className="absolute inset-0 h-full w-full object-cover opacity-[0.42]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-hero-bg/70 via-hero-bg/85 to-hero-bg" />
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center">
          <span className="text-sm font-bold uppercase tracking-wider text-sky-soft">{c.eyebrow}</span>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.06] tracking-tight text-balance sm:text-5xl">
            {c.title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-hero-fg-muted">{c.lead}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#contact"
              className="rounded-full bg-sky-strong px-7 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#08607f]"
            >
              {c.heroDemo}
            </a>
            <a
              href="#careers"
              className="rounded-full border border-white/45 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-white/10"
            >
              {c.heroJoin}
            </a>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-start gap-9 min-[880px]:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">{c.missionTitle}</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-balance text-heading">
              {c.missionHeadline}
            </h2>
          </div>
          <p className="text-[17px] leading-[1.7] text-muted">{c.missionBody}</p>
        </div>
      </section>

      {/* STATS BAND (dark) */}
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_300px_at_15%_120%,rgba(15,158,213,0.16),transparent_70%)]" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-12 text-center sm:grid-cols-4">
          {c.stats.map((s: { value: string; label: string }) => (
            <div key={s.label}>
              <div className="text-[34px] font-extrabold tracking-tight text-white">{s.value}</div>
              <div className="mt-1 text-sm text-hero-fg-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">{c.valuesEyebrow}</p>
          <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight text-heading">{c.valuesTitle}</h2>
        </div>
        <div className="mt-7 grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {c.values.map((v: { title: string; desc: string }, i: number) => {
            const Icon = VALUE_ICONS[i] ?? ShieldCheck;
            return (
              <div key={v.title} className="rounded-[18px] border border-line bg-surface p-6">
                <span className="mb-4 inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-tint-sky text-sky-text">
                  <Icon size={22} />
                </span>
                <h3 className="text-[17px] font-extrabold text-heading">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="border-t border-line bg-mist">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">{c.ecoEyebrow}</p>
            <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight text-heading">{c.ecosystemTitle}</h2>
            <p className="mt-3 text-base leading-relaxed text-muted">{c.ecosystemLead}</p>
          </div>
          <div className="mt-7 grid gap-[18px] min-[880px]:grid-cols-2">
            <Link
              href={`/${lang}/platform`}
              className="group rounded-[18px] border border-line bg-surface p-[26px] transition hover:-translate-y-1 hover:shadow-sm"
            >
              <span className="mb-3.5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-tint-sky text-sky-text">
                <Monitor size={22} />
              </span>
              <h3 className="flex items-center gap-1.5 text-[19px] font-extrabold text-heading">
                {c.ecoPlatform}
                <ArrowRight size={16} className="text-sky-text transition group-hover:translate-x-0.5" />
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{c.ecoPlatformDesc}</p>
            </Link>
            <Link
              href={`/${lang}/partners`}
              className="group rounded-[18px] border border-line bg-surface p-[26px] transition hover:-translate-y-1 hover:shadow-sm"
            >
              <span className="mb-3.5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-tint-sky text-sky-text">
                <Handshake size={22} />
              </span>
              <h3 className="flex items-center gap-1.5 text-[19px] font-extrabold text-heading">
                {c.ecoPartners}
                <ArrowRight size={16} className="text-sky-text transition group-hover:translate-x-0.5" />
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{c.ecoPartnersDesc}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CAREERS + EXPERT FORM */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-stretch gap-6 min-[880px]:grid-cols-[1fr_1.1fr]">
          {/* Careers */}
          <div id="careers" className="flex flex-col rounded-[20px] border border-line bg-surface p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-[13px] bg-tint-sky text-sky-text">
              <Briefcase size={24} />
            </span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-heading">{c.careersTitle}</h2>
            <p className="mt-2.5 flex-1 leading-relaxed text-muted">{c.careersBody}</p>
            <ul className="mt-[18px] flex flex-col gap-2">
              {c.careersItems.map((it: string) => (
                <li key={it} className="flex items-center gap-2.5 text-sm text-ink">
                  <span className="inline-flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full bg-tint-sky text-sky-text">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {it}
                </li>
              ))}
            </ul>
            <Link
              href={`/${lang}/careers`}
              className="mt-[22px] inline-flex items-center gap-2 self-start rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-sky hover:text-sky-text"
            >
              {c.careersCta} <ArrowRight size={15} />
            </Link>
          </div>

          {/* Talk to an expert */}
          <ExpertForm dict={c} />
        </div>
      </section>
    </main>
  );
}
