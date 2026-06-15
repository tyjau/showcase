import Link from "next/link";
import type { Metadata } from "next";
import {
  Server,
  Zap,
  ShieldCheck,
  Cloud,
  Building2,
  Package,
  ArrowRight,
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
  return { title: t.seo.pages.platform };
}

const PILLAR_ICONS = [Server, Zap, ShieldCheck];
const MODE_ICONS = [Cloud, Building2, Package];

export default async function PlatformPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const p = t.platformPage;

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
        <div className="grid gap-5 md:grid-cols-3">
          {p.pillars.map((pl: { title: string; desc: string }, i: number) => {
            const Icon = PILLAR_ICONS[i] ?? Server;
            return (
              <div
                key={pl.title}
                className="rounded-xl border border-line p-6"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#e7f4fb] text-sky">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-ink">{pl.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {pl.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-line bg-mist">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-navy">{p.modesTitle}</h2>
            <p className="mt-2 text-muted">{p.modesLead}</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {p.modes.map((md: { title: string; desc: string }, i: number) => {
              const Icon = MODE_ICONS[i] ?? Cloud;
              return (
                <div
                  key={md.title}
                  className="rounded-xl border border-line bg-white p-6"
                >
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-navy text-white">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 font-semibold text-ink">{md.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {md.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-sky to-accent text-white">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">{p.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/90">{p.ctaBody}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${lang}/company#contact`}
              className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-mist"
            >
              {p.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/partners`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {p.partnersCta}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
