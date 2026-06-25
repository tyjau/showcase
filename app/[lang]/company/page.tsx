import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  Lock,
  Layers,
  Handshake,
  ArrowRight,
  Briefcase,
  Check,
} from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { ParallaxTriangles } from "@/components/parallax-triangles";
import { ContactForm } from "@/components/contact-form";

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
  return { title: t.seo.pages.company };
}

const VALUE_ICONS = [ShieldCheck, HeartHandshake, Sparkles, Lock];

export default async function CompanyPage(
  props: {
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const c = t.companyPage;

  return (
    <main>
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/hero-photo.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-hero-bg/70 via-hero-bg/85 to-hero-bg" />
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-soft">
            {c.eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{c.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-hero-fg-muted">{c.lead}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${lang}/contact?sujet=demo`}
              className="rounded-full bg-sky-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#08607f]"
            >
              {c.heroDemo}
            </Link>
            <Link
              href={`/${lang}/careers`}
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {c.heroJoin}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-12 sm:grid-cols-4">
          {c.stats.map((s: { value: string; label: string }) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-heading sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-sm text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
            {c.missionTitle}
          </h2>
          <p className="mt-3 text-2xl font-bold leading-snug text-heading">{c.lead}</p>
        </div>
        <p className="self-center text-lg leading-relaxed text-ink">{c.missionBody}</p>
      </section>

      <section className="border-y border-line bg-mist">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="mb-8 text-center text-2xl font-bold text-heading">
            {c.valuesTitle}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.values.map((v: { title: string; desc: string }, i: number) => {
              const Icon = VALUE_ICONS[i] ?? Sparkles;
              return (
                <div
                  key={v.title}
                  className="rounded-xl border border-line bg-surface p-5"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-3 font-semibold text-ink">{v.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold text-heading">{c.ecosystemTitle}</h2>
          <p className="mt-2 text-muted">{c.ecosystemLead}</p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Link
            href={`/${lang}/platform`}
            className="group rounded-xl border border-line bg-surface p-6 transition hover:-translate-y-1 hover:shadow-sm"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
              <Layers size={22} />
            </div>
            <h3 className="mt-4 flex items-center gap-1.5 font-semibold text-ink">
              {c.ecoPlatform}
              <ArrowRight
                size={15}
                className="text-sky-text transition group-hover:translate-x-0.5"
              />
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {c.ecoPlatformDesc}
            </p>
          </Link>
          <Link
            href={`/${lang}/partners`}
            className="group rounded-xl border border-line bg-surface p-6 transition hover:-translate-y-1 hover:shadow-sm"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
              <Handshake size={22} />
            </div>
            <h3 className="mt-4 flex items-center gap-1.5 font-semibold text-ink">
              {c.ecoPartners}
              <ArrowRight
                size={15}
                className="text-sky-text transition group-hover:translate-x-0.5"
              />
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {c.ecoPartnersDesc}
            </p>
          </Link>
        </div>
      </section>

      <section className="border-t border-line bg-mist">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-2">
          {/* Careers */}
          <div id="careers" className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-tint-sky text-sky-text">
              <Briefcase size={22} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-heading">{c.careersTitle}</h2>
            <p className="mt-2 leading-relaxed text-muted">{c.careersBody}</p>
            <ul className="mt-5 flex flex-col gap-2.5">
              {c.careersItems.map((it: string) => (
                <li key={it} className="flex items-center gap-2.5 text-sm text-ink">
                  <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-sky-strong text-white">
                    <Check size={12} strokeWidth={3.5} />
                  </span>
                  {it}
                </li>
              ))}
            </ul>
            <Link
              href={`/${lang}/careers`}
              className="mt-6 inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-heading transition hover:border-sky"
            >
              {c.careersCta}
            </Link>
          </div>

          {/* Talk to an expert */}
          <div id="contact" className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <span className="text-sm font-semibold uppercase tracking-wide text-accent">
              {c.expertEyebrow}
            </span>
            <h2 className="mt-2 text-2xl font-bold text-heading">{c.expertTitle}</h2>
            <div className="mt-5">
              <ContactForm dict={t.contactPage} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
