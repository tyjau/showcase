import Link from "next/link";
import type { Metadata } from "next";
import {
  Wrench,
  Store,
  Calculator,
  Code2,
  Check,
  DollarSign,
  Award,
  Megaphone,
  Headphones,
  Zap,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { buildAlternates } from "@/lib/seo";
import { ParallaxTriangles } from "@/components/parallax-triangles";
import { ColoredLogos } from "@/components/colored-logos";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return { title: t.seo.pages.partners, alternates: buildAlternates(params.lang, "/partners") };
}

const TYPE_ICONS: LucideIcon[] = [Wrench, Store, Calculator, Code2];
const BENEFIT_ICONS: LucideIcon[] = [DollarSign, Award, Megaphone, Headphones, Zap, LayoutGrid];

export default async function PartnersPage(
  props: { params: Promise<{ lang: string }> }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const p = t.partnersPage;
  const contact = `/${lang}/contact?sujet=partenariat`;

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(820px_360px_at_80%_-12%,rgba(15,158,213,0.20),transparent_70%)]" />
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">{p.eyebrow}</span>
          <h1 className="mx-auto mt-3.5 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-[42px]">
            {p.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-hero-fg-muted">{p.lead}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={contact}
              className="rounded-full bg-sky-strong px-7 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#08607f]"
            >
              {p.heroPrimary}
            </Link>
            <a
              href="#programmes"
              className="rounded-full border border-white/45 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-white/10"
            >
              {p.heroSecondary}
            </a>
          </div>
        </div>
      </section>

      {/* PARTNER TYPES */}
      <section id="programmes" className="mx-auto max-w-6xl px-5 pb-4 pt-14 scroll-mt-20">
        <div className="text-center">
          <h2 className="text-[28px] font-extrabold tracking-tight text-heading">{p.typesTitle}</h2>
          <p className="mt-2 text-muted">{p.typesSubtitle}</p>
        </div>
        <div className="mt-8 grid gap-[18px] min-[760px]:grid-cols-2">
          {p.types.map((tp: { title: string; desc: string; points: string[] }, i: number) => {
            const Icon = TYPE_ICONS[i] ?? Wrench;
            return (
              <div key={tp.title} className="flex flex-col rounded-[18px] border border-line bg-surface p-7">
                <span className="mb-4 inline-flex h-[50px] w-[50px] items-center justify-center rounded-[13px] bg-tint-sky text-sky-text">
                  <Icon size={24} />
                </span>
                <h3 className="text-[19px] font-extrabold text-heading">{tp.title}</h3>
                <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-muted">{tp.desc}</p>
                <div className="mt-4 flex flex-col gap-2.5">
                  {tp.points.map((pt) => (
                    <span key={pt} className="flex items-center gap-2.5 text-sm text-ink">
                      <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-tint-sky text-sky-text">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {pt}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-6xl px-5 pb-4 pt-12">
        <div className="rounded-[22px] border border-line bg-mist p-9">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-heading">{p.benefitsTitle}</h2>
          <div className="mt-7 grid gap-[18px] min-[520px]:grid-cols-2 min-[820px]:grid-cols-3">
            {p.benefits.map((b: { title: string; desc: string }, i: number) => {
              const Icon = BENEFIT_ICONS[i] ?? DollarSign;
              return (
                <div key={b.title} className="flex items-start gap-3.5">
                  <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-[11px] border border-line bg-surface text-sky-text">
                    <Icon size={18} />
                  </span>
                  <div>
                    <div className="text-[15px] font-extrabold text-heading">{b.title}</div>
                    <p className="mt-1 text-[13.5px] leading-snug text-muted">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LOGOS */}
      <section className="mx-auto max-w-6xl px-5 pb-4 pt-12 text-center">
        <p className="text-[13px] font-bold uppercase tracking-[0.06em] text-muted">{p.logosTitle}</p>
        <ColoredLogos names={p.logos} className="mt-6" />
      </section>

      {/* CTA — navy rounded card */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-12">
        <div className="relative overflow-hidden rounded-3xl bg-hero-bg px-7 py-11 text-center text-hero-fg">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_280px_at_50%_-20%,rgba(15,158,213,0.22),transparent_70%)]" />
          <div className="relative">
            <h2 className="text-[28px] font-extrabold tracking-tight">{p.ctaTitle}</h2>
            <p className="mx-auto mt-2.5 max-w-lg text-hero-fg-muted">{p.ctaBody}</p>
            <Link
              href={contact}
              className="mt-6 inline-block rounded-full bg-white px-7 py-3 text-[15px] font-semibold text-[#156082] transition-transform hover:scale-[1.02]"
            >
              {p.ctaPrimary}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
