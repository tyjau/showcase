"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileText,
  CalendarDays,
  UserSearch,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { wrapIndex } from "@/lib/carousel";

type Slide = { chip: string; title: string; desc: string; bullets: string[] };
type Dict = {
  eyebrow: string;
  title: string;
  prev: string;
  next: string;
  more: string;
  slides: Slide[];
};

const ICONS: LucideIcon[] = [FileText, CalendarDays, UserSearch];
const AUTOPLAY_MS = 6000;

const CARD_CLS =
  "overflow-hidden rounded-2xl border border-white/10 bg-surface text-ink shadow-[0_30px_70px_-28px_rgba(0,0,0,0.6)]";

// Slide 0 — a payroll run dashboard mock (3 KPIs, a 3-step progress, a mini bar chart).
function PayrollVisual() {
  return (
    <div className={CARD_CLS}>
      <div className="flex items-center justify-between border-b border-line px-[18px] py-4">
        <div>
          <div className="text-sm font-bold text-heading">Paie · juin 2026</div>
          <div className="text-[11px] text-muted">3 sociétés · 248 employés</div>
        </div>
        <span className="rounded-full bg-ok-bg px-2.5 py-1 text-[11px] font-bold text-ok-fg">Clôturée</span>
      </div>
      <div className="p-[18px]">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            ["Net à payer", "€182k"],
            ["Charges", "€61k"],
            ["Bulletins", "248"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-[10px] bg-mist px-3 py-2.5">
              <div className="text-[11px] text-muted">{k}</div>
              <div className="text-lg font-extrabold text-heading">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-[18px] flex items-center gap-1.5">
          {["Préparation", "Validation", "Clôture"].map((step, i) => (
            <span key={step} className="contents">
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-ok-fg">
                <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-ok-bg">
                  <Check size={10} strokeWidth={3.5} />
                </span>
                {step}
              </span>
              {i < 2 && <span className="h-px flex-1 bg-ok-fg/50" />}
            </span>
          ))}
        </div>
        <div className="mt-4 flex h-[50px] items-end gap-1.5">
          {[60, 85, 50, 72, 90, 64, 78].map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${h}%`, background: i % 2 ? "var(--brand-sky)" : "#3CAEF2" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Slide 1 — a team leave calendar mock (week grid + two pending requests).
const LEAVE_ROWS = [
  { who: "Awa D.", cells: ["m", "b", "b", "m", "m"] },
  { who: "Jean-M.", cells: ["m", "m", "w", "w", "m"] },
  { who: "Fatou N.", cells: ["s", "m", "m", "m", "s"] },
];
const CELL_BG: Record<string, string> = {
  m: "var(--mist)",
  b: "var(--brand-sky)",
  s: "#3CAEF2",
  w: "#f0d9a8",
};
const LEAVE_REQ = [
  { initials: "AD", name: "Awa Diallo", meta: "· Congé payé · 2j", tint: "bg-tint-sky text-accent" },
  { initials: "JO", name: "Jean-Marc O.", meta: "· RTT · 1j", tint: "bg-warn-bg text-warn-fg" },
];
function LeaveVisual() {
  return (
    <div className={CARD_CLS}>
      <div className="flex items-center justify-between border-b border-line px-[18px] py-4">
        <div className="text-sm font-bold text-heading">Congés · Semaine 24</div>
        <span className="rounded-full bg-warn-bg px-2.5 py-1 text-[11px] font-bold text-warn-fg">2 en attente</span>
      </div>
      <div className="px-[18px] py-4">
        <div className="mb-2 grid grid-cols-5 gap-1.5 text-center text-[11px] font-bold text-muted">
          {["Lun", "Mar", "Mer", "Jeu", "Ven"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="flex flex-col gap-[7px]">
          {LEAVE_ROWS.map((r) => (
            <div key={r.who} className="flex items-center gap-2">
              <span className="w-[54px] flex-none text-[11px] text-muted">{r.who}</span>
              <div className="grid flex-1 grid-cols-5 gap-1.5">
                {r.cells.map((c, i) => (
                  <span key={i} className="h-[18px] rounded-[5px]" style={{ background: CELL_BG[c] }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3.5 flex flex-col gap-2.5 border-t border-line pt-3">
          {LEAVE_REQ.map((q) => (
            <div key={q.initials} className="flex items-center gap-2.5">
              <span className={`inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-[11px] font-bold ${q.tint}`}>
                {q.initials}
              </span>
              <div className="flex-1 text-[12.5px]">
                <span className="font-bold text-ink">{q.name}</span>{" "}
                <span className="text-muted">{q.meta}</span>
              </div>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ok-bg text-ok-fg">
                <Check size={12} strokeWidth={3} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Slide 2 — a browser-chrome frame around the real recruitment screenshot.
function RecruitVisual() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-white/10 shadow-[0_30px_70px_-24px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-1.5 bg-[#0a1f33] px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2.5 text-[11px] text-[#7d93a6]">app.skyrh.com/recruit/needs</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/product-recruitment.png" alt="" aria-hidden="true" className="block w-full" />
    </div>
  );
}

function SlideVisual({ index }: { index: number }) {
  if (index === 0) return <PayrollVisual />;
  if (index === 1) return <LeaveVisual />;
  return <RecruitVisual />;
}

export function ModulesCarousel({ lang, dict }: { lang: string; dict: Dict }) {
  const slides = dict.slides ?? [];
  const [slide, setSlide] = useState(0);
  const hovering = useRef(false);

  const go = (i: number) => setSlide(wrapIndex(i, slides.length));

  useEffect(() => {
    if (slides.length <= 1) return;
    // Respect prefers-reduced-motion: no autoplay (the user still drives via arrows/dots).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!hovering.current) setSlide((s) => wrapIndex(s + 1, slides.length));
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="bg-hero-bg text-hero-fg">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">
              {dict.eyebrow}
            </span>
            <h2 className="mt-2.5 max-w-xl text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
              {dict.title}
            </h2>
          </div>
          <div className="flex flex-none gap-2.5">
            <button
              type="button"
              onClick={() => go(slide - 1)}
              aria-label={dict.prev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => go(slide + 1)}
              aria-label={dict.next}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          className="overflow-hidden"
          onMouseEnter={() => (hovering.current = true)}
          onMouseLeave={() => (hovering.current = false)}
        >
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
            style={{ transform: `translateX(-${slide * 100}%)` }}
          >
            {slides.map((s, i) => {
              const Icon = ICONS[i] ?? FileText;
              return (
                <div key={i} className="w-full flex-none">
                  <div className="grid items-center gap-10 min-[895px]:grid-cols-2">
                    <div className="max-w-md">
                      <div className="mb-3.5 inline-flex items-center gap-2.5">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-sky-strong/20 text-sky-soft">
                          <Icon size={19} />
                        </span>
                        <span className="text-sm font-bold text-sky-soft">{s.chip}</span>
                      </div>
                      <h3 className="text-2xl font-extrabold leading-tight">{s.title}</h3>
                      <p className="mt-3 leading-relaxed text-hero-fg-muted">{s.desc}</p>
                      <ul className="mt-4 flex flex-col gap-2.5">
                        {s.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2.5 text-[15px]">
                            <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-sky-strong text-white">
                              <Check size={12} strokeWidth={3.5} />
                            </span>
                            {b}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/${lang}/features`}
                        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-sky-strong px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#08607f]"
                      >
                        {dict.more} <ArrowRight size={15} />
                      </Link>
                    </div>
                    <SlideVisual index={i} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              data-testid={`carousel-dot-${i}`}
              aria-label={`${i + 1}`}
              aria-current={i === slide}
              className={`h-2.5 rounded-full transition-all ${
                i === slide ? "w-7 bg-sky-strong" : "w-2.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
