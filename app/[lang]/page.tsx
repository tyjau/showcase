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

  return (
    <main>
      <section className="bg-hero-bg text-hero-fg">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <span className="text-sm font-semibold tracking-wide text-sky-soft">
            {t.hero.eyebrow}
          </span>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            {t.hero.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-hero-fg-muted">
            {t.hero.lead}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${lang}/signup`}
              className="rounded-full bg-sky px-6 py-3 font-semibold text-white transition-colors hover:bg-[#0d8bbd]"
            >
              {t.hero.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/company#contact`}
              className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Play size={16} /> {t.hero.ctaDemo}
            </Link>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-hero-fg-faint">
            <Check size={14} className="text-sky-soft" /> {t.hero.trustNote}
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-xl bg-surface p-3.5 text-left text-ink shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">{t.preview.title}</span>
              <span className="rounded-full bg-ok-bg px-2 py-0.5 text-[11px] text-ok-fg">
                {t.preview.status}
              </span>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {[
                [t.preview.employees, "248"],
                [t.preview.netPayroll, "$182k"],
                [t.preview.payslips, "248"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-mist p-2">
                  <div className="text-[11px] text-muted">{k}</div>
                  <div className="text-base font-bold text-heading">{v}</div>
                </div>
              ))}
            </div>
            <div className="flex h-10 items-end gap-1.5">
              {[60, 85, 48, 72, 90, 55].map((h, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: i % 2 ? "#0F9ED5" : "#3CAEF2",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-line bg-page">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 py-3 text-xs text-accent">
          {t.trust.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky text-white">
                <Check size={11} />
              </span>
              {item}
            </span>
          ))}
        </div>
      </div>

      <section id="product" className="mx-auto max-w-6xl px-5 py-14">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-heading">{t.features.heading}</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted">{t.features.sub}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureMeta.map(({ key, icon: Icon }) => {
            const item = (t.features.items as Features)[key];
            return (
              <div
                key={key}
                className="rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:shadow-sm"
              >
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-tint-sky text-sky">
                  <Icon size={19} />
                </div>
                <h3 className="font-semibold text-ink">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

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
        </div>
      </section>
    </main>
  );
}
