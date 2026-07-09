import Link from "next/link";
import type { Metadata } from "next";
import {
  Lock,
  Boxes,
  KeyRound,
  Activity,
  Globe2,
  Network,
  BadgeCheck,
  FileCheck2,
  ShieldAlert,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { i18n } from "@/lib/i18n";
import { buildAlternates } from "@/lib/seo";
import { ParallaxTriangles } from "@/components/parallax-triangles";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return {
    title: t.trustPage.title,
    description: t.trustPage.lead,
    alternates: buildAlternates(params.lang, "/trust"),
  };
}

const PILLAR_ICONS: LucideIcon[] = [Lock, Boxes, KeyRound, Activity];
const COMPLIANCE_ICONS: LucideIcon[] = [Globe2, Network, BadgeCheck, FileCheck2];

type Item = { title: string; desc: string };

export default async function TrustPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const p = t.trustPage;
  const lang = params.lang;
  const legal = t.legalPage.docs as Record<string, string>;

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_320px_at_82%_-18%,rgba(15,158,213,0.18),transparent_70%)]" />
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">{p.eyebrow}</span>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {p.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-hero-fg-muted">{p.lead}</p>
        </div>
      </section>

      {/* APPROCHE SÉCURITÉ — capacités réelles du produit */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-2xl font-bold text-heading sm:text-3xl">{p.approachTitle}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.pillars.map((pi: Item, i: number) => {
            const Icon = PILLAR_ICONS[i] ?? Lock;
            return (
              <div key={pi.title} className="rounded-xl border border-line bg-surface p-6">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-tint-sky text-sky-text">
                  <Icon size={22} />
                </div>
                <h3 className="font-bold text-heading">{pi.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{pi.desc}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          {p.availabilityNote}{" "}
          <Link href={`/${lang}/status`} className="font-semibold text-sky-text hover:underline">
            {p.availabilityLink}
          </Link>
          .
        </p>
      </section>

      {/* CONFIDENTIALITÉ & RGPD */}
      <section className="bg-mist">
        <div className="mx-auto max-w-3xl px-5 py-16">
          <h2 className="text-2xl font-bold text-heading sm:text-3xl">{p.privacyTitle}</h2>
          <p className="mt-3 leading-relaxed text-muted">{p.privacyBody}</p>
          <Link
            href={`/${lang}/legal/privacy`}
            className="mt-4 inline-flex items-center gap-1.5 font-semibold text-sky-text hover:underline"
          >
            {p.privacyLink} <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* CONFORMITÉ — formulations honnêtes + rappel interne (dev-only) pour renseigner les faits réels */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-2xl font-bold text-heading sm:text-3xl">{p.complianceTitle}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-muted">{p.complianceLead}</p>
        {/* Jamais affiché aux visiteurs (même pattern que les pages légales) : rappelle à l'équipe de
            remplacer les formulations génériques par les faits réels avant la mise en production. */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mx-auto mt-6 max-w-2xl rounded-lg border border-warn-border bg-warn-bg px-4 py-3 text-sm text-warn-fg">
            {p.draft}
          </div>
        )}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {p.complianceItems.map((ci: Item, i: number) => {
            const Icon = COMPLIANCE_ICONS[i] ?? Globe2;
            return (
              <div key={ci.title} className="flex items-start gap-3.5 rounded-xl border border-line bg-surface p-6">
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-tint-sky text-sky-text">
                  <Icon size={22} />
                </span>
                <div>
                  <h3 className="font-bold text-heading">{ci.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{ci.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DIVULGATION RESPONSABLE — CTA contact (tracké via data-cta) */}
      <section className="bg-mist">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[13px] bg-sky-strong/15 text-sky-text">
            <ShieldAlert size={24} />
          </span>
          <h2 className="mt-4 text-2xl font-bold text-heading">{p.disclosureTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted">{p.disclosureBody}</p>
          <Link
            href={`/${lang}/contact`}
            data-cta="contact_security"
            data-cta-location="trust"
            className="mt-5 inline-flex rounded-full bg-sky-strong px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#08607f]"
          >
            {p.disclosureCta}
          </Link>
        </div>
      </section>

      {/* DOCUMENTS LÉGAUX */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <h2 className="text-center text-lg font-bold text-heading">{p.docsTitle}</h2>
        <nav className="mt-4 flex flex-wrap justify-center gap-2">
          {["privacy", "security", "terms", "cookies"].map((d) => (
            <Link
              key={d}
              href={`/${lang}/legal/${d}`}
              className="rounded-full border border-line px-4 py-1.5 text-sm text-muted transition hover:border-sky hover:text-heading"
            >
              {legal[d] ?? d}
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
