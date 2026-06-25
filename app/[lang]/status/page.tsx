import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  Activity,
  Monitor,
  Code2,
  FileText,
  Lock,
  Bell,
  Folder,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return { title: t.seo.pages.status };
}

const SVC_ICONS: LucideIcon[] = [Monitor, Code2, FileText, Lock, Bell, Folder];

// Deterministic 30-day uptime sparkline: mostly healthy with a single amber dip,
// mirroring the mockup's per-service bar strip (hidden on narrow screens).
const SPARK = Array.from({ length: 30 }, (_, i) => ({
  warn: i === 21,
  h: i === 21 ? 9 : 14 + ((i * 7 + 5) % 11),
}));

function Sparkbar() {
  return (
    <div className="hidden h-6 items-end gap-[2px] min-[700px]:flex" aria-hidden="true">
      {SPARK.map((b, i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm"
          style={{
            height: `${b.h}px`,
            background: b.warn ? "var(--warn-fg)" : "var(--ok-fg)",
            opacity: b.warn ? 1 : 0.85,
          }}
        />
      ))}
    </div>
  );
}

export default async function StatusPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = params.lang;
  const t = await getDictionary(lang);
  const p = t.statusPage;

  return (
    <main className="pb-16">
      {/* HEADER + BANNER */}
      <section className="mx-auto max-w-[920px] px-5 pb-2 pt-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-heading">{p.title}</h1>
            <p className="mt-1 text-sm text-muted">{p.lastUpdate}</p>
          </div>
          <Link
            href={`/${lang}/contact?sujet=support`}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2.5 text-[13.5px] font-bold text-ink transition hover:border-sky"
          >
            <Activity size={15} /> {p.subscribe}
          </Link>
        </div>
        <div className="flex items-center gap-3.5 rounded-2xl border border-ok-border bg-ok-bg px-[22px] py-5">
          <span
            className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full text-white"
            style={{ background: "var(--ok-fg)" }}
          >
            <Check size={24} strokeWidth={2.6} />
          </span>
          <div>
            <div className="text-[19px] font-extrabold text-ok-fg">{p.bannerTitle}</div>
            <div className="mt-0.5 text-sm text-muted">{p.bannerSub}</div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-[920px] px-5 pb-2 pt-7">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {p.services.map((s: { name: string; desc: string; uptime: string }, i: number) => {
            const Icon = SVC_ICONS[i] ?? Monitor;
            return (
              <div key={s.name} className="flex items-center gap-3.5 border-b border-line px-5 py-4 last:border-b-0">
                <span className="inline-flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-tint-sky text-sky-text">
                  <Icon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-bold text-ink">{s.name}</div>
                  <div className="mt-0.5 text-[12.5px] text-muted">{s.desc}</div>
                </div>
                <Sparkbar />
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-bold text-ok-fg">
                  <span className="h-2 w-2 rounded-full" style={{ background: "var(--ok-fg)" }} />
                  {s.uptime}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* METRICS */}
      <section className="mx-auto max-w-[920px] px-5 pb-2 pt-6">
        <div className="grid gap-3.5 sm:grid-cols-3">
          {p.metrics.map((m: { label: string; value: string; note: string }) => (
            <div key={m.label} className="rounded-2xl border border-line bg-surface p-[18px]">
              <div className="text-[12.5px] font-bold uppercase tracking-[0.04em] text-muted">{m.label}</div>
              <div className="mt-2 text-[26px] font-extrabold text-heading">{m.value}</div>
              <div className="mt-0.5 text-[12.5px] font-bold text-ok-fg">{m.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* INCIDENTS */}
      <section className="mx-auto max-w-[920px] px-5 pt-8">
        <h2 className="mb-4 text-xl font-extrabold tracking-tight text-heading">{p.historyTitle}</h2>
        <div className="flex flex-col gap-3.5">
          {p.incidents.map(
            (it: { title: string; date: string; body: string; duration: string; impact: string }) => (
              <div key={it.title} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-ok-bg px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.04em] text-ok-fg">
                    {p.resolved}
                  </span>
                  <span className="text-[15px] font-bold text-ink">{it.title}</span>
                  <span className="ml-auto text-[12.5px] text-muted">{it.date}</span>
                </div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{it.body}</p>
                <div className="mt-2 text-[12.5px] text-muted">
                  <span className="font-bold text-ink">{p.durationLabel} :</span> {it.duration} ·{" "}
                  <span className="font-bold text-ink">{p.impactLabel} :</span> {it.impact}
                </div>
              </div>
            )
          )}
        </div>
        <p className="mt-5 text-center text-[13.5px] text-muted">
          {p.closing}{" "}
          <Link href={`/${lang}/legal/security`} className="inline-flex items-center gap-1 font-bold text-sky-text hover:underline">
            {p.closingLink} <ArrowRight size={13} />
          </Link>
        </p>
      </section>
    </main>
  );
}
