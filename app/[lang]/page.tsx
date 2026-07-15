import Link from "next/link";
import {
  Check,
  Play,
  Calculator,
  CalendarDays,
  Users,
  UserSearch,
  Target,
  Smartphone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, type Locale } from "@/lib/i18n";
import { Picture } from "@/components/picture";
import { SocialProof } from "@/components/social-proof";
import { ParallaxTriangles } from "@/components/parallax-triangles";
import { ModulesCarousel } from "@/components/modules-carousel";
import { HomePacks } from "@/components/home-packs";
import { CtaBand } from "@/components/cta-band";
import { fetchCatalog, type Money } from "@/lib/catalog";
import { GEO_FRAMEWORK_COUNT } from "@/lib/geo";
import { FileText, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { buildAlternates } from "@/lib/seo";

type PreviewDict = {
  title: string;
  subtitle: string;
  status: string;
  netPayroll: string;
  charges: string;
  payslips: string;
};

// Illustrative payroll-run demo data for the hero preview card (a product mock, not user copy).
const PREVIEW_ROWS = [
  { initials: "AD", name: "Awa Diallo", role: "Finance · CDI", amount: "€3 240", tint: "bg-tint-sky text-accent" },
  { initials: "JO", name: "Jean-Marc Obiang", role: "Tech · CDI", amount: "€2 980", tint: "bg-warn-bg text-warn-fg" },
  { initials: "FN", name: "Fatou N'Diaye", role: "RH · CDI", amount: "€3 510", tint: "bg-ok-bg text-ok-fg" },
];
const PREVIEW_BARS = [60, 85, 50, 72, 90, 64, 78];

function PayrollPreview({ dict }: { dict: PreviewDict }) {
  return (
    <div className="relative">
      <div className="absolute -inset-x-4 -bottom-4 top-4 rounded-[18px] bg-gradient-to-b from-sky-soft/20 to-transparent blur-sm" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface text-ink shadow-[0_24px_60px_-20px_rgba(8,24,40,0.55)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
              <FileText size={16} />
            </span>
            <div>
              <div className="text-sm font-bold text-heading">{dict.title}</div>
              <div className="text-[11px] text-muted">{dict.subtitle}</div>
            </div>
          </div>
          <span className="rounded-full bg-ok-bg px-2.5 py-1 text-[11px] font-bold text-ok-fg">
            {dict.status}
          </span>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              [dict.netPayroll, "€182k"],
              [dict.charges, "€61k"],
              [dict.payslips, "248"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[10px] bg-mist px-3 py-2.5">
                <div className="text-[11px] text-muted">{k}</div>
                <div className="text-lg font-extrabold text-heading">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3.5 flex flex-col">
            {PREVIEW_ROWS.map((r, i) => (
              <div
                key={r.initials}
                className={`flex items-center gap-3 py-2.5 ${i < PREVIEW_ROWS.length - 1 ? "border-b border-line" : ""}`}
              >
                <span className={`inline-flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-xs font-bold ${r.tint}`}>
                  {r.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-ink">{r.name}</div>
                  <div className="text-[11px] text-muted">{r.role}</div>
                </div>
                <div className="text-[13px] font-bold text-heading">{r.amount}</div>
              </div>
            ))}
          </div>
          <div className="mt-3.5 flex h-12 items-end gap-1.5">
            {PREVIEW_BARS.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-t"
                style={{ height: `${h}%`, background: i % 2 ? "var(--brand-sky)" : "#3CAEF2" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> },
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  // Titre : hérite du défaut du layout (l'accueil EST la page-vitrine). Description : le lead du
  // hero, déjà rédigé. Alternates : self-canonical + hreflang par page (sinon héritage → SEO-01).
  return {
    description: t.hero.lead,
    alternates: buildAlternates(params.lang, ""),
  };
}

const VALUE_ICONS: LucideIcon[] = [Calculator, ShieldCheck, Users];

const featureMeta: { key: keyof Features; icon: LucideIcon }[] = [
  { key: "payroll", icon: Calculator },
  { key: "attendance", icon: CalendarDays },
  { key: "records", icon: Users },
  { key: "recruitment", icon: UserSearch },
  { key: "career", icon: Target },
  { key: "selfservice", icon: Smartphone },
];

type Features = {
  payroll: { title: string; desc: string };
  attendance: { title: string; desc: string };
  records: { title: string; desc: string };
  recruitment: { title: string; desc: string };
  career: { title: string; desc: string };
  selfservice: { title: string; desc: string };
};

export default async function Home(
  props: {
    params: Promise<{ lang: string }>;
  }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const lang = params.lang;

  // Prices for the home packs band come from the live catalogue (baked at build);
  // names/descriptions come from the dictionary. Resilient: if the catalogue is
  // unreachable the band falls back to its static labels rather than failing the page.
  let pricesByCode: Record<string, Money[]> = {};
  // Resolve the payroll module's real catalogue code (e.g. WAGE-GEN00) so the "Paie &
  // bulletins" card deep-links to its module page instead of a non-existent /features/payroll.
  let payrollCode: string | null = null;
  try {
    const catalog = await fetchCatalog();
    pricesByCode = Object.fromEntries(catalog.packages.map((p) => [p.code, p.prices]));
    payrollCode = catalog.modules.find((m) => m.category === "payroll")?.code ?? null;
  } catch {
    /* catalogue unreachable → packs use their dict fallback price */
  }
  const packs = t.homePacks.plans.map((p) => ({
    ...p,
    prices: pricesByCode[p.code] ?? [],
  }));

  return (
    <main>
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        {/* Photo backdrop + navy overlay + sky radial + parallax triangles. */}
        <Picture
          src="/img/hero-office.png"
          alt=""
          ariaHidden
          priority
          className="absolute inset-0 h-full w-full object-cover opacity-[0.55]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-hero-bg via-hero-bg/85 to-hero-bg/30" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(60% 80% at 75% 30%, rgba(60,174,242,0.18), transparent)" }}
        />
        <ParallaxTriangles />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wide text-sky-soft">
              {t.hero.eyebrow}
            </span>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl">
              {t.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-hero-fg-muted">
              {t.hero.lead}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/${lang}/signup`}
                data-cta="start_trial"
                data-cta-location="hero"
                className="rounded-full bg-sky-strong px-6 py-3 font-semibold text-white transition-colors hover:bg-[#08607f]"
              >
                {t.hero.ctaPrimary}
              </Link>
              <Link
                href={`/${lang}/contact?sujet=demo`}
                data-cta="book_demo"
                data-cta-location="hero"
                className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Play size={16} /> {t.hero.ctaDemo}
              </Link>
            </div>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-hero-fg-faint">
              <Check size={14} className="text-sky-soft" /> {t.hero.trustNote}
            </p>
            <div className="mt-7 inline-flex items-baseline gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-2xl font-extrabold tracking-tight text-white tabular-nums">{GEO_FRAMEWORK_COUNT}</span>
              <span className="max-w-[15rem] text-[13px] leading-snug text-hero-fg-muted">{t.hero.coverageLabel}</span>
            </div>
          </div>

          <PayrollPreview dict={t.preview} />
        </div>
      </section>

      {/* VALUE BAND (marketing + SEO) */}
      <section className="border-b border-line bg-mist">
        <div className="mx-auto max-w-6xl px-5 py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-accent">{t.homeValue.eyebrow}</p>
          <h2 className="mx-auto mt-2.5 max-w-3xl text-[26px] font-extrabold tracking-tight text-balance text-heading">
            {t.homeValue.title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-muted">{t.homeValue.lead}</p>
          <div className="mx-auto mt-8 grid max-w-4xl gap-[18px] text-left sm:grid-cols-3">
            {t.homeValue.blocks.map((b: { title: string; desc: string }, i: number) => {
              const Icon = VALUE_ICONS[i] ?? Calculator;
              return (
                <div key={b.title} className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-tint-sky text-sky-text">
                    <Icon size={20} />
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

      <section id="product" className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-heading sm:text-3xl">{t.features.heading}</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">{t.features.sub}</p>
        </div>
        <div className="grid items-stretch gap-[18px] min-[895px]:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-3.5 sm:grid-cols-2">
            {featureMeta.map(({ key, icon: Icon }) => {
              const item = (t.features.items as Features)[key];
              const href =
                key === "payroll" && payrollCode
                  ? `/${lang}/features/${payrollCode}`
                  : `/${lang}/features`;
              return (
                <Link
                  key={key}
                  href={href}
                  className="group flex items-start gap-3.5 rounded-2xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:shadow-[0_14px_32px_-18px_rgba(14,40,65,0.45)]"
                >
                  <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-[11px] bg-tint-sky text-sky-text">
                    <Icon size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-1.5 text-[16.5px] font-bold text-ink">
                      {item.title}
                      <ArrowRight size={14} className="flex-none text-sky-text transition group-hover:translate-x-0.5" />
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          {/* Photo tile with caption overlay */}
          <div className="relative hidden min-h-[300px] overflow-hidden rounded-2xl border border-line min-[895px]:block">
            <Picture
              src="/img/feat-photo-filled.png"
              alt={t.features.lateralAlt}
              className="absolute inset-0 h-full w-full object-cover object-[center_42%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-hero-bg/60" />
            <div className="absolute inset-x-5 bottom-[18px] text-white">
              <div className="text-base font-extrabold">{t.features.photoTitle}</div>
              <div className="mt-0.5 text-[13px] text-[#dce8f2]">{t.features.photoSub}</div>
            </div>
          </div>
        </div>
      </section>

      <ModulesCarousel lang={lang} dict={t.modulesShowcase} />

      <HomePacks lang={lang} dict={t.homePacks} plans={packs} />

      <SocialProof dict={t.socialProof} />

      <CtaBand
        href={`/${lang}/signup`}
        title={t.ctaBand.title}
        sub={t.ctaBand.sub}
        button={t.ctaBand.button}
        reassurances={t.ctaBand.reassurances}
      />
    </main>
  );
}
