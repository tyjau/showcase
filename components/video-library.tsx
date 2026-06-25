"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Radio } from "lucide-react";

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

export function VideoLibrary({ lang, dict }: { lang: string; dict: Dict }) {
  const cats = dict.categories ?? [];
  const [cat, setCat] = useState(cats[0] ?? "");
  const all = cat === cats[0];
  const shown = all ? dict.videos : dict.videos.filter((v) => v.category === cat);

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
          <Link
            key={v.title}
            href={`/${lang}/contact?sujet=demo`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-1 hover:shadow-sm"
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
          </Link>
        ))}
      </div>
    </section>
  );
}
