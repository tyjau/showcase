"use client";

import { useEffect, useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { wrapIndex } from "@/lib/carousel";

type Testimonial = { quote: string; author: string; role: string };
type Dict = {
  testimonialsTitle: string;
  prev: string;
  next: string;
  testimonials: Testimonial[];
};

const AUTOPLAY_MS = 7000;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// 2-up starred testimonial carousel (mirrors the Home mockup): paginates two cards
// at a time, with prev/next controls and dots. Falls back to 1-up under 720px.
export function TestimonialsCarousel({ dict }: { dict: Dict }) {
  const items = dict.testimonials ?? [];
  const [perView, setPerView] = useState(2);
  const [page, setPage] = useState(0);
  const hovering = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 720px)");
    const apply = () => setPerView(mq.matches ? 2 : 1);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const pages = Math.max(1, Math.ceil(items.length / perView));
  const go = (i: number) => setPage(wrapIndex(i, pages));

  useEffect(() => {
    setPage((p) => Math.min(p, pages - 1));
  }, [pages]);

  useEffect(() => {
    if (pages <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!hovering.current) setPage((p) => wrapIndex(p + 1, pages));
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [pages]);

  if (!items.length) return null;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-heading sm:text-[28px]">
          {dict.testimonialsTitle}
        </h2>
        <div className="flex flex-none gap-2.5">
          <button
            type="button"
            onClick={() => go(page - 1)}
            aria-label={dict.prev}
            className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-sky"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => go(page + 1)}
            aria-label={dict.next}
            className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-sky"
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
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {items.map((tm) => (
            <div
              key={tm.author}
              className="flex-none px-[9px]"
              style={{ width: `${100 / perView}%` }}
            >
              <figure className="flex h-full flex-col rounded-[18px] border border-line bg-surface p-7">
                <div className="mb-3.5 flex gap-0.5 text-sky-text">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="flex-1 text-[16.5px] font-semibold leading-snug tracking-tight text-ink">
                  {tm.quote}
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-full bg-tint-sky text-[14px] font-bold text-accent">
                    {initials(tm.author)}
                  </span>
                  <span>
                    <span className="block text-[15px] font-bold text-heading">{tm.author}</span>
                    <span className="block text-[12.5px] text-muted">{tm.role}</span>
                  </span>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2.5">
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`${i + 1}`}
            aria-current={i === page}
            className={`h-2.5 rounded-full transition-all ${
              i === page ? "w-7 bg-sky-strong" : "w-2.5 bg-line hover:bg-muted/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
