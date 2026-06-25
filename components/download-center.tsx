"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, FileSpreadsheet, FileType, Download, type LucideIcon } from "lucide-react";

type Template = {
  title: string;
  desc: string;
  category: string;
  format: string;
  size: string;
};
type Dict = {
  categories: string[];
  download: string;
  templates: Template[];
};

const FORMAT_ICON: Record<string, LucideIcon> = {
  PDF: FileText,
  DOCX: FileType,
  XLSX: FileSpreadsheet,
};
const FORMAT_TINT: Record<string, string> = {
  PDF: "bg-[#fdecec] text-[#c0392b]",
  DOCX: "bg-tint-sky text-sky-text",
  XLSX: "bg-[#e6f5ec] text-[#2e7d4f]",
};

export function DownloadCenter({ lang, dict }: { lang: string; dict: Dict }) {
  const cats = dict.categories ?? [];
  const [cat, setCat] = useState(cats[0] ?? "");
  const all = cat === cats[0];
  const shown = all ? dict.templates : dict.templates.filter((t) => t.category === cat);

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((tpl) => {
          const Icon = FORMAT_ICON[tpl.format] ?? FileText;
          const tint = FORMAT_TINT[tpl.format] ?? "bg-tint-sky text-sky-text";
          return (
            <div key={tpl.title} className="flex flex-col rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <span className={`inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl ${tint}`}>
                  <Icon size={22} />
                </span>
                <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-bold text-muted">
                  {tpl.format} · {tpl.size}
                </span>
              </div>
              <h3 className="mt-4 font-extrabold text-heading">{tpl.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{tpl.desc}</p>
              {/* Placeholder destination — swap for the real signed file URL when assets ship. */}
              <Link
                href={`/${lang}/contact?sujet=produit`}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-line py-2.5 text-sm font-bold text-heading transition hover:border-sky hover:text-sky-text"
              >
                <Download size={16} /> {dict.download}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
