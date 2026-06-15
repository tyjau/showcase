import Link from "next/link";
import type { Metadata } from "next";
import {
  Store,
  Wrench,
  Share2,
  LayoutDashboard,
  Check,
} from "lucide-react";
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
  return { title: t.seo.pages.partners };
}

const TYPE_ICONS = [Store, Wrench, Share2];

export default async function PartnersPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const p = t.partnersPage;

  return (
    <main>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-soft">
            {p.eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{p.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-[#c7d6e3]">{p.lead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="mb-8 text-center text-2xl font-bold text-navy">
          {p.typesTitle}
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {p.types.map((tp: { title: string; desc: string }, i: number) => {
            const Icon = TYPE_ICONS[i] ?? Store;
            return (
              <div key={tp.title} className="rounded-xl border border-line p-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#e7f4fb] text-sky">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-ink">{tp.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {tp.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-line bg-mist">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white">
              <LayoutDashboard size={24} />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-navy">
              {p.consoleTitle}
            </h2>
            <p className="mt-2 text-muted">{p.consoleBody}</p>
          </div>
          <ul className="space-y-3">
            {p.consolePoints.map((pt: string) => (
              <li key={pt} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky text-white">
                  <Check size={13} />
                </span>
                <span className="text-sm text-ink">{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-gradient-to-r from-sky to-accent text-white">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{p.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/90">{p.ctaBody}</p>
          <Link
            href={`/${lang}/company#contact`}
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-mist"
          >
            {p.ctaPrimary}
          </Link>
        </div>
      </section>
    </main>
  );
}
