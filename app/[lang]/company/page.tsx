import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck, HeartHandshake, Sparkles, Lock } from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Locale };
}): Promise<Metadata> {
  const t = await getDictionary(params.lang);
  return { title: t.seo.pages.company };
}

const VALUE_ICONS = [ShieldCheck, HeartHandshake, Sparkles, Lock];

export default async function CompanyPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const c = t.companyPage;

  return (
    <main>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-soft">
            {c.eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{c.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-[#c7d6e3]">{c.lead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
          {c.missionTitle}
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-ink">{c.missionBody}</p>
      </section>

      <section className="border-y border-line bg-mist">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="mb-8 text-center text-2xl font-bold text-navy">
            {c.valuesTitle}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.values.map((v: { title: string; desc: string }, i: number) => {
              const Icon = VALUE_ICONS[i] ?? Sparkles;
              return (
                <div
                  key={v.title}
                  className="rounded-xl border border-line bg-white p-5"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#e7f4fb] text-sky">
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

      <section id="careers" className="mx-auto max-w-3xl px-5 py-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
          {c.careersTitle}
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-ink">{c.careersBody}</p>
        <Link
          href={`/${lang}/signup`}
          className="mt-5 inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-navy transition hover:border-sky"
        >
          {c.careersCta}
        </Link>
      </section>

      <section
        id="contact"
        className="bg-gradient-to-r from-sky to-accent text-white"
      >
        <div className="mx-auto max-w-3xl px-5 py-14 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{c.contactTitle}</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/90">{c.contactBody}</p>
          <Link
            href={`/${lang}/signup`}
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-mist"
          >
            {c.contactCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
