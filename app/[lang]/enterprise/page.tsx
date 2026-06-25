import Link from "next/link";
import type { Metadata } from "next";
import { Cloud, Server, Package, ShieldCheck, KeyRound, Headphones, type LucideIcon } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, type Locale } from "@/lib/i18n";
import { ParallaxTriangles } from "@/components/parallax-triangles";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: { lang: Locale } }): Promise<Metadata> {
  const t = await getDictionary(params.lang);
  return { title: t.enterprisePage.title };
}

const MODE_ICONS: LucideIcon[] = [Cloud, Server, Package];
const BENEFIT_ICONS: LucideIcon[] = [ShieldCheck, KeyRound, Headphones];

export default async function EnterprisePage({ params }: { params: { lang: Locale } }) {
  const t = await getDictionary(params.lang);
  const p = t.enterprisePage;
  const lang = params.lang;

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
          <div className="mt-6">
            <span className="text-2xl font-extrabold text-white">{p.priceLabel}</span>
            <p className="mt-1 text-sm text-hero-fg-faint">{p.priceNote}</p>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${lang}/contact?sujet=devis`}
              className="rounded-full bg-sky-strong px-6 py-3 font-semibold text-white transition-colors hover:bg-[#08607f]"
            >
              {p.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/company`}
              className="rounded-full border border-white/50 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              {p.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-2xl font-bold text-heading sm:text-3xl">{p.deployTitle}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {p.modes.map((m, i) => {
            const Icon = MODE_ICONS[i] ?? Cloud;
            return (
              <div key={m.title} className="rounded-xl border border-line bg-surface p-6">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-heading">{m.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-mist">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-center text-2xl font-bold text-heading sm:text-3xl">{p.benefitsTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {p.benefits.map((b, i) => {
              const Icon = BENEFIT_ICONS[i] ?? ShieldCheck;
              return (
                <div key={b.title} className="rounded-xl border border-line bg-surface p-6">
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-heading">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-16">
        <div className="mx-auto max-w-5xl rounded-2xl bg-gradient-to-r from-sky to-accent px-6 py-12 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">{p.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-lg text-[#eaf6fd]">{p.ctaBody}</p>
          <Link
            href={`/${lang}/contact?sujet=devis`}
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-[#156082]"
          >
            {p.ctaPrimary}
          </Link>
        </div>
      </section>
    </main>
  );
}
