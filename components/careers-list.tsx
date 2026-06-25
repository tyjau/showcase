"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Clock,
  ArrowRight,
  Code2,
  Database,
  PenTool,
  Headphones,
  DollarSign,
  ShieldCheck,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { filterJobs, teamsOf, type Job } from "@/lib/jobs";

type Dict = { openings: string; rolesNote: string; allTeams: string; apply: string; noJobs: string };

// Role icon cycled by index — a small visual anchor per row (the mockup gives each role a glyph).
const ROLE_ICONS: LucideIcon[] = [Code2, Database, PenTool, Headphones, DollarSign, ShieldCheck, BarChart3];

export function CareersList({
  lang,
  jobs,
  dict,
}: {
  lang: string;
  jobs: Job[];
  dict: Dict;
}) {
  const [team, setTeam] = useState<string | null>(null);
  const teams = teamsOf(jobs);
  const shown = filterJobs(jobs, team);
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-bold transition ${
      active ? "border-navy bg-navy text-white" : "border-line text-muted hover:text-ink"
    }`;

  return (
    <section className="mx-auto max-w-6xl px-5 pb-4 pt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[26px] font-extrabold tracking-tight text-heading">{dict.openings}</h2>
        <span className="text-sm text-muted">
          {jobs.length} {dict.rolesNote}
        </span>
      </div>

      <div className="my-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setTeam(null)} className={chip(team === null)}>
          {dict.allTeams}
        </button>
        {teams.map((tm) => (
          <button key={tm} type="button" onClick={() => setTeam(tm)} className={chip(team === tm)}>
            {tm}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {shown.length === 0 ? (
          <p className="text-muted">{dict.noJobs}</p>
        ) : (
          shown.map((j, i) => {
            const Icon = ROLE_ICONS[jobs.indexOf(j) % ROLE_ICONS.length] ?? Briefcase;
            return (
              <Link
                key={i}
                href={`/${lang}/contact?sujet=candidature&poste=${encodeURIComponent(j.title)}`}
                className="flex items-center gap-4 rounded-[14px] border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-sky"
              >
                <span className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-[11px] bg-tint-sky text-sky-text">
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-heading">{j.title}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3.5 gap-y-1 text-[13px] text-muted">
                    <span className="inline-flex items-center gap-1.5"><Briefcase size={13} /> {j.team}</span>
                    <span className="inline-flex items-center gap-1.5"><MapPin size={13} /> {j.location}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {j.type}</span>
                  </div>
                </div>
                <span className="inline-flex flex-none items-center gap-1.5 text-[13.5px] font-bold text-sky-text">
                  {dict.apply} <ArrowRight size={15} />
                </span>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
