import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, LifeBuoy, ShieldCheck, Activity, ArrowRight } from "lucide-react";
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
  return { title: t.seo.pages.resources };
}

const ICONS = [BookOpen, LifeBuoy, ShieldCheck, Activity];

export default async function ResourcesPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const r = t.resourcesPage;
  // Real destinations (the cards previously linked back to /resources — dead/circular).
  const hrefs = [
    `/${lang}/features`,
    `/${lang}/help`,
    `/${lang}/legal/security`,
    `/${lang}/company#contact`,
  ];

  return (
    <main>
      <section className="bg-hero-bg text-hero-fg">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-soft">
            {r.eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{r.title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-hero-fg-muted">{r.lead}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-14">
        <div className="grid gap-5 sm:grid-cols-2">
          {r.items.map((it: { title: string; desc: string }, i: number) => {
            const Icon = ICONS[i] ?? BookOpen;
            return (
              <Link
                key={it.title}
                href={hrefs[i] ?? `/${lang}/resources`}
                className="group flex items-start gap-4 rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-1 hover:shadow-sm"
              >
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-tint-sky text-sky">
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <h3 className="flex items-center gap-1.5 font-semibold text-ink">
                    {it.title}
                    <ArrowRight
                      size={15}
                      className="text-sky transition group-hover:translate-x-0.5"
                    />
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {it.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
