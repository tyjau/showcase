"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { type Money } from "@/lib/catalog";
import { Price } from "./price";

type Plan = {
  code: string;
  name: string;
  fallback: string;
  desc: string;
  items: string[];
  cta: string;
  popular?: boolean;
  prices: Money[];
};
type Dict = {
  eyebrow: string;
  title: string;
  sub: string;
  popular: string;
  perMonth: string;
};

// Home pricing band — 3 plans unified with the Tarifs page. Names/descriptions come
// from the dictionary (translated; sidesteps the catalogue's untranslated package
// names), prices from the live catalogue via <Price> + the currency provider. Falls
// back to a static label when a price isn't seeded.
export function HomePacks({
  lang,
  dict,
  plans,
}: {
  lang: string;
  dict: Dict;
  plans: Plan[];
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="mb-8 text-center">
        <span className="text-sm font-bold uppercase tracking-wide text-accent">
          {dict.eyebrow}
        </span>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-heading text-balance sm:text-3xl">
          {dict.title}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-muted">{dict.sub}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {plans.map((p) => {
          const isFree = p.code === "FREE";
          const hasPrice = p.prices.length > 0;
          return (
            <div
              key={p.code}
              className={`relative flex flex-col rounded-2xl border bg-surface p-6 transition hover:-translate-y-1 hover:shadow-sm ${
                p.popular ? "border-2 border-sky" : "border-line"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-strong px-3 py-1 text-xs font-bold text-white">
                  {dict.popular}
                </span>
              )}
              <h3 className="text-lg font-bold text-heading">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-1.5">
                {isFree || !hasPrice ? (
                  <span className="text-3xl font-extrabold text-heading">{p.fallback}</span>
                ) : (
                  <>
                    <Price prices={p.prices} className="text-3xl font-extrabold text-heading" />
                    <span className="text-xs text-muted">{dict.perMonth}</span>
                  </>
                )}
              </div>
              <p className="mt-2 text-sm text-muted">{p.desc}</p>
              <ul className="mt-4 flex-1 space-y-2.5">
                {p.items.map((it) => (
                  <li key={it} className="flex items-center gap-2.5 text-sm text-ink">
                    <Check size={16} className="flex-none text-sky-text" strokeWidth={3} />
                    {it}
                  </li>
                ))}
              </ul>
              <Link
                href={`/${lang}/signup`}
                className={`mt-6 rounded-full px-5 py-2.5 text-center text-sm font-semibold transition-colors ${
                  p.popular
                    ? "bg-sky-strong text-white hover:bg-[#08607f]"
                    : "border border-line text-heading hover:border-sky"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
