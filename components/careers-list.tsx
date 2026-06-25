"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Briefcase } from "lucide-react";
import { filterJobs, teamsOf, type Job } from "@/lib/jobs";

type Dict = { openings: string; allTeams: string; apply: string; noJobs: string };

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
    `rounded-full px-4 py-1.5 text-sm font-medium transition ${
      active ? "bg-sky-strong text-white" : "border border-line text-muted hover:text-ink"
    }`;

  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <h2 className="text-2xl font-bold text-heading">{dict.openings}</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setTeam(null)} className={chip(team === null)}>
          {dict.allTeams}
        </button>
        {teams.map((tm) => (
          <button key={tm} type="button" onClick={() => setTeam(tm)} className={chip(team === tm)}>
            {tm}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {shown.length === 0 ? (
          <p className="text-muted">{dict.noJobs}</p>
        ) : (
          shown.map((j, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-5"
            >
              <div>
                <h3 className="font-semibold text-ink">{j.title}</h3>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase size={14} /> {j.team}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} /> {j.location}
                  </span>
                  <span>{j.type}</span>
                </div>
              </div>
              <Link
                href={`/${lang}/contact?sujet=produit`}
                className="shrink-0 rounded-full bg-sky-strong px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#08607f]"
              >
                {dict.apply}
              </Link>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
