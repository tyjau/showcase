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

// Visual half of a slide. The recruitment slide (index 2) uses the real product
// screenshot; the others use a light branded mock card.
function SlideVisual({ index, Icon }: { index: number; Icon: LucideIcon }) {
  if (index === 2) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/img/product-recruitment.png"
        alt=""
        aria-hidden="true"
        className="w-full rounded-2xl border border-white/10 shadow-[0_30px_70px_-28px_rgba(0,0,0,0.6)]"
      />
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface text-ink shadow-[0_30px_70px_-28px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-tint-sky text-sky">
          <Icon size={16} />
        </span>
        <div className="h-2.5 w-32 rounded bg-mist" />
      </div>
      <div className="space-y-3 p-5">
        <div className="grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[10px] bg-mist px-3 py-3">
              <div className="h-2 w-10 rounded bg-line" />
              <div className="mt-2 h-3.5 w-12 rounded bg-sky/40" />
            </div>
          ))}
        </div>
        <div className="flex h-12 items-end gap-1.5">
          {[55, 80, 48, 70, 90, 62, 76].map((h, i) => (
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
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-sky/20 text-sky-soft">
                          <Icon size={19} />
                        </span>
                        <span className="text-sm font-bold text-sky-soft">{s.chip}</span>
                      </div>
                      <h3 className="text-2xl font-extrabold leading-tight">{s.title}</h3>
                      <p className="mt-3 leading-relaxed text-hero-fg-muted">{s.desc}</p>
                      <ul className="mt-4 flex flex-col gap-2.5">
                        {s.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2.5 text-[15px]">
                            <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-sky text-white">
                              <Check size={12} strokeWidth={3.5} />
                            </span>
                            {b}
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/${lang}/features`}
                        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-sky px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0d8bbd]"
                      >
                        {dict.more} <ArrowRight size={15} />
                      </Link>
                    </div>
                    <SlideVisual index={i} Icon={Icon} />
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
                i === slide ? "w-7 bg-sky" : "w-2.5 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
