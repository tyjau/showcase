"use client";

import { useEffect, useState } from "react";
import { Play, Radio, X } from "lucide-react";

type Video = {
  title: string;
  category: string;
  duration: number;
  date: string;
  presenter: string;
  live: boolean;
};
type Dict = {
  categories: string[];
  liveBadge: string;
  replayBadge: string;
  watch: string;
  minutes: string;
  videos: Video[];
};

// Deterministic thumbnail gradient per card (no Math.random — keeps SSR/CSR stable).
const GRADIENTS = [
  "from-[#0F9ED5] to-[#156082]",
  "from-[#156082] to-[#0E2841]",
  "from-[#3CAEF2] to-[#0F9ED5]",
  "from-[#0E2841] to-[#156082]",
];

// Free, stable sample videos (placeholders) streamed in the lightbox. Swap for the
// real webinar/replay URLs when they exist.
const VIDEO_SRC = [
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
];

export function VideoLibrary({ dict }: { lang: string; dict: Dict }) {
  const cats = dict.categories ?? [];
  const [cat, setCat] = useState(cats[0] ?? "");
  const [open, setOpen] = useState<Video | null>(null);
  const all = cat === cats[0];
  const shown = all ? dict.videos : dict.videos.filter((v) => v.category === cat);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const srcFor = (v: Video) => VIDEO_SRC[dict.videos.indexOf(v) % VIDEO_SRC.length];

  return (
    <section className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-7 flex flex-wrap gap-2">
        {cats.map((c) => {
          const active = c === cat;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                active ? "border-navy bg-navy text-white" : "border-line text-muted hover:text-ink"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((v, i) => (
          <button
            key={v.title}
            type="button"
            onClick={() => setOpen(v)}
            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left transition hover:-translate-y-1 hover:shadow-sm"
          >
            {/* Thumbnail */}
            <div className={`relative aspect-video bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]}`}>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-[#156082] shadow-lg transition group-hover:scale-105">
                  <Play size={24} fill="currentColor" />
                </span>
              </span>
              {v.live ? (
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#E11D48] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  <Radio size={11} /> {dict.liveBadge}
                </span>
              ) : (
                <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  {dict.replayBadge}
                </span>
              )}
              <span className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white">
                {v.duration} {dict.minutes}
              </span>
            </div>
            {/* Meta */}
            <div className="flex flex-1 flex-col p-5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-sky-text">{v.category}</span>
              <h3 className="mt-1.5 flex-1 font-extrabold leading-snug text-heading">{v.title}</h3>
              <div className="mt-3 text-[13px] text-muted">{v.presenter}</div>
              <div className="text-[12.5px] text-muted">{v.date}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox player */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          onClick={() => setOpen(null)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-sky-soft">{open.category}</div>
                <h3 className="mt-0.5 text-lg font-extrabold text-white">{open.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Fermer"
                className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              key={open.title}
              src={srcFor(open)}
              controls
              autoPlay
              playsInline
              className="w-full rounded-xl border border-white/10 bg-black shadow-2xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}
