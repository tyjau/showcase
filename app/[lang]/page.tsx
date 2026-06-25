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
  type LucideIcon,
} from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, type Locale } from "@/lib/i18n";
import { SocialProof } from "@/components/social-proof";
import { ParallaxTriangles } from "@/components/parallax-triangles";
import { ModulesCarousel } from "@/components/modules-carousel";
import { HomePacks } from "@/components/home-packs";
import { fetchCatalog, type Money } from "@/lib/catalog";
import { FileText, ArrowRight } from "lucide-react";

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

export default async function Home({
  params,
}: {
  params: { lang: Locale };
}) {
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/hero-office.png"
          alt=""
          aria-hidden="true"
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
                className="rounded-full bg-sky-strong px-6 py-3 font-semibold text-white transition-colors hover:bg-[#08607f]"
              >
                {t.hero.ctaPrimary}
              </Link>
              <Link
                href={`/${lang}/contact?sujet=demo`}
                className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Play size={16} /> {t.hero.ctaDemo}
              </Link>
            </div>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-hero-fg-faint">
              <Check size={14} className="text-sky-soft" /> {t.hero.trustNote}
            </p>
          </div>

          <PayrollPreview dict={t.preview} />
        </div>
      </section>

      <div className="border-b border-line bg-page">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 py-3 text-xs text-accent">
          {t.trust.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-strong text-white">
                <Check size={11} />
              </span>
              {item}
            </span>
          ))}
        </div>
      </div>

      <section id="product" className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-heading sm:text-3xl">{t.features.heading}</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">{t.features.sub}</p>
        </div>
        <div className="grid items-center gap-8 min-[895px]:grid-cols-[1fr_300px]">
          <div className="grid gap-4 sm:grid-cols-2">
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
                  className="group rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:border-sky hover:shadow-sm"
                >
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
                    <Icon size={19} />
                  </div>
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-text opacity-0 transition-opacity group-hover:opacity-100">
                    {t.features.more} <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/feat-photo-filled.png"
            alt={t.features.lateralAlt}
            className="hidden h-full max-h-[460px] w-full rounded-2xl object-cover min-[895px]:block"
          />
        </div>
      </section>

      <ModulesCarousel lang={lang} dict={t.modulesShowcase} />

      <HomePacks lang={lang} dict={t.homePacks} plans={packs} />

      <SocialProof dict={t.socialProof} />

      <section className="px-5 pb-16">
        <div className="mx-auto max-w-6xl rounded-2xl bg-gradient-to-r from-sky to-accent px-6 py-14 text-center text-white">
          <h2 className="text-2xl font-bold">{t.ctaBand.title}</h2>
          <p className="mx-auto mt-2 max-w-lg text-[#eaf6fd]">{t.ctaBand.sub}</p>
          <Link
            href={`/${lang}/signup`}
            className="mt-5 inline-block rounded-full bg-white px-6 py-3 font-semibold text-[#156082]"
          >
            {t.ctaBand.button}
          </Link>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#eaf6fd]">
            {t.ctaBand.reassurances.map((r) => (
              <span key={r} className="inline-flex items-center gap-1.5">
                <Check size={15} /> {r}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
