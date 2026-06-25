import Link from "next/link";
import type { Metadata } from "next";
import {
  Server,
  Zap,
  ShieldCheck,
  Cloud,
  Package,
  ArrowRight,
  ArrowDown,
  Cpu,
  RefreshCw,
  TrendingUp,
  BadgeCheck,
  KeyRound,
  ScrollText,
  Lock,
  DatabaseBackup,
  AlertTriangle,
  Users,
  Check,
  FileText,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import { i18n, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { ParallaxTriangles } from "@/components/parallax-triangles";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return { title: t.seo.pages.platform };
}

const PILLAR_ICONS = [Server, Zap, ShieldCheck];
const ENGINE_ICONS: LucideIcon[] = [Cpu, RefreshCw, TrendingUp, BadgeCheck];
const SECURITY_ICONS: LucideIcon[] = [KeyRound, ScrollText, Lock, Cpu, DatabaseBackup, AlertTriangle];
const LANES = ["100%", "100%", "92%", "100%", "88%"];

// Deployment topology: a source node (accent) → an endpoint node.
function Node({ icon: Icon, label, accent }: { icon: LucideIcon; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
          accent ? "border-sky-strong bg-sky-strong text-white" : "border-line bg-surface text-muted"
        }`}
      >
        <Icon size={18} />
      </span>
      <span className="text-[10.5px] font-bold text-ink">{label}</span>
    </div>
  );
}

export default async function PlatformPage(
  props: { params: Promise<{ lang: string }> }
) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const p = t.platformPage;
  const st = p.stack;

  // Per-mode topology endpoints (Cloud / On-prem / Standalone).
  const topo = [
    { from: Cloud, to: Users, dashed: false },
    { from: Server, to: Users, dashed: false },
    { from: Package, to: Lock, dashed: true },
  ];

  return (
    <main>
      {/* HERO — text + platform stack diagram */}
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/hero-photo.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.35]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,var(--hero-bg)_34%,transparent_100%)]" />
        <ParallaxTriangles />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 min-[880px]:grid-cols-2">
          <div className="max-w-lg">
            <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">{p.eyebrow}</span>
            <h1 className="mt-3.5 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-[44px]">
              {p.title}
            </h1>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-hero-fg-muted">{p.lead}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/${lang}/contact?sujet=produit`}
                className="rounded-full bg-sky-strong px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#08607f]"
              >
                {p.ctaPrimary}
              </Link>
              <Link
                href={`/${lang}/partners`}
                className="rounded-full border border-white/45 px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-white/10"
              >
                {p.partnersCta}
              </Link>
            </div>
          </div>

          {/* STACK DIAGRAM */}
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
              <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-sky-soft">{st.modules}</div>
              <div className="flex flex-wrap gap-1.5">
                {st.pills.map((pill: string) => (
                  <span key={pill} className="rounded-full bg-sky-strong/15 px-2.5 py-1 text-xs font-semibold text-[#cfeefb]">
                    {pill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-center text-hero-fg-muted/70"><ArrowDown size={16} /></div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[linear-gradient(120deg,rgba(15,158,213,0.22),rgba(21,96,130,0.22))] p-4">
              <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-sky-strong text-white">
                <Zap size={20} fill="currentColor" />
              </span>
              <div>
                <div className="text-[14.5px] font-extrabold">{st.engine}</div>
                <div className="text-xs text-hero-fg-muted">{st.engineSub}</div>
              </div>
            </div>
            <div className="flex justify-center text-hero-fg-muted/70"><ArrowDown size={16} /></div>
            <div className="flex gap-2.5 rounded-2xl border border-white/15 bg-white/[0.04] p-4">
              <div className="flex flex-1 items-center gap-2.5">
                <span className="inline-flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg bg-white/[0.08] text-sky-soft"><ShieldCheck size={16} /></span>
                <span className="text-[12.5px] font-semibold">{st.security[0]}</span>
              </div>
              <div className="flex flex-1 items-center gap-2.5">
                <span className="inline-flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg bg-white/[0.08] text-sky-soft"><FileText size={16} /></span>
                <span className="text-[12.5px] font-semibold">{st.security[1]}</span>
              </div>
            </div>
            <div className="flex justify-center text-hero-fg-muted/70"><ArrowDown size={16} /></div>
            <div className="flex items-center justify-between gap-2.5 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-hero-fg-muted/80">{st.deploy}</span>
              <span className="flex gap-1.5">
                {st.modes.map((m: string) => (
                  <span key={m} className="rounded-full border border-white/20 px-2.5 py-1 text-xs font-bold">{m}</span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mx-auto max-w-6xl px-5 pb-5 pt-16">
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
          {p.pillars.map((pl: { title: string; desc: string }, i: number) => {
            const Icon = PILLAR_ICONS[i] ?? Server;
            return (
              <div key={pl.title} className="rounded-[18px] border border-line bg-surface p-6">
                <span className="mb-4 inline-flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-tint-sky text-sky-text">
                  <Icon size={22} />
                </span>
                <h3 className="text-lg font-extrabold text-heading">{pl.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{pl.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SKYENGINE */}
      <section className="relative mt-11 overflow-hidden bg-hero-bg text-hero-fg">
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-6xl px-5 py-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-sky-soft">
              <Zap size={15} fill="currentColor" /> {p.engineEyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight">{p.engineTitle}</h2>
            <p className="mt-3.5 text-[17px] leading-relaxed text-hero-fg-muted">{p.engineLead}</p>
          </div>

          <div className="mt-9 grid items-center gap-8 min-[880px]:grid-cols-2">
            {/* throughput visual */}
            <div className="rounded-[18px] border border-white/15 bg-white/[0.04] p-[22px]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[13px] font-bold">{p.throughputTitle}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-soft px-2.5 py-1 text-xs font-bold text-[#0E2841]">
                  <Zap size={12} fill="currentColor" /> {p.throughputBadge}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {LANES.map((w, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-12 flex-none text-[10.5px] font-bold text-hero-fg-muted/70">{p.laneLabel} {i + 1}</span>
                    <span className="h-3 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                      <span className="block h-full rounded-full bg-gradient-to-r from-sky-strong to-sky-soft" style={{ width: w }} />
                    </span>
                    <span className="inline-flex h-4 w-4 flex-none items-center justify-center rounded-full bg-ok-bg text-ok-fg">
                      <Check size={9} strokeWidth={4} />
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-[18px] grid grid-cols-3 gap-2.5 border-t border-white/10 pt-4 text-center">
                {p.engineStats.map((s: { value: string; label: string }) => (
                  <div key={s.label}>
                    <div className="text-xl font-extrabold text-white">{s.value}</div>
                    <div className="text-[11px] text-hero-fg-muted/70">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* arguments */}
            <div className="flex flex-col gap-3.5">
              {p.engine.map((e: { title: string; desc: string }, i: number) => {
                const Icon = ENGINE_ICONS[i] ?? Zap;
                return (
                  <div key={e.title} className="flex items-start gap-3.5">
                    <span className="inline-flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[11px] bg-sky-strong text-white">
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3 className="font-extrabold">{e.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-hero-fg-muted">{e.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* DEPLOYMENT MODES + topology */}
      <section className="mt-11 border-y border-line bg-mist">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">{p.modesTitle}</p>
            <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight text-heading">{p.modesHeading}</h2>
          </div>
          <div className="mt-7 grid gap-[18px] md:grid-cols-3">
            {p.modes.map((m: { title: string; desc: string }, i: number) => {
              const Icon = [Cloud, Server, Package][i] ?? Cloud;
              const tp = topo[i] ?? topo[0];
              return (
                <div key={m.title} className="flex flex-col rounded-[18px] border border-line bg-surface p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-sky-strong text-white">
                      <Icon size={20} />
                    </span>
                    <h3 className="text-[17px] font-extrabold text-heading">{m.title}</h3>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{m.desc}</p>
                  <div className="mt-[18px] flex min-h-24 items-center justify-center gap-2.5 rounded-xl border border-line bg-mist p-4">
                    <Node icon={tp.from} label={p.topology?.[i]?.from ?? m.title} accent />
                    {tp.dashed ? (
                      <span className="w-7 border-t-2 border-dashed border-line" />
                    ) : (
                      <ArrowRight size={16} className="text-muted" />
                    )}
                    <Node icon={tp.to} label={p.topology?.[i]?.to ?? "•"} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECURITY & COMPLIANCE */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="max-w-sm">
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-[13px] bg-tint-sky text-sky-text">
              <ShieldCheck size={24} />
            </span>
            <h2 className="text-[28px] font-extrabold tracking-tight text-heading">{p.securityTitle}</h2>
            <p className="mt-3 leading-relaxed text-muted">{p.securityLead}</p>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {p.security.map((s: { title: string; desc: string }, i: number) => {
              const Icon = SECURITY_ICONS[i] ?? ShieldCheck;
              return (
                <div key={s.title} className="rounded-[14px] border border-line bg-surface p-[18px]">
                  <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-tint-sky text-sky-text">
                    <Icon size={18} />
                  </span>
                  <h3 className="text-[15px] font-bold text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-snug text-muted">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="bg-hero-bg text-hero-fg">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-soft">{p.ecoEyebrow}</p>
            <h2 className="mt-2.5 text-3xl font-extrabold tracking-tight">{p.ecoTitle}</h2>
            <p className="mt-3 text-base leading-relaxed text-hero-fg-muted">{p.ecoLead}</p>
          </div>
          <div className="mt-7 grid gap-[18px] min-[880px]:grid-cols-2">
            {[
              { icon: LayoutDashboard, title: p.ecoPlatform, desc: p.ecoPlatformDesc },
              { icon: Users, title: p.ecoPartners, desc: p.ecoPartnersDesc },
            ].map((c) => (
              <div key={c.title} className="rounded-[18px] border border-white/15 bg-white/[0.04] p-[26px]">
                <span className="mb-3.5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-strong text-white">
                  <c.icon size={22} />
                </span>
                <h3 className="text-[19px] font-extrabold">{c.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-hero-fg-muted">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-sky to-accent px-5 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{p.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-lg text-[#eaf6fd]">{p.ctaBody}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${lang}/contact?sujet=produit`}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#156082] transition-transform hover:scale-[1.02]"
            >
              {p.ctaPrimary}
            </Link>
            <Link
              href={`/${lang}/partners`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {p.partnersCta} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
