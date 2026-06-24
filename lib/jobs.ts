export type Job = { title: string; team: string; location: string; type: string };

/** Unique teams in declaration order — the careers filter chips. */
export function teamsOf(jobs: Job[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const j of jobs) {
    if (!seen.has(j.team)) {
      seen.add(j.team);
      out.push(j.team);
    }
  }
  return out;
}

/** Jobs filtered to a team, or all jobs when team is null ("All teams"). */
export function filterJobs(jobs: Job[], team: string | null): Job[] {
  return team ? jobs.filter((j) => j.team === team) : jobs;
}
