import { getDictionary } from "@/lib/dictionaries";
import { i18n, type Locale } from "@/lib/i18n";
import { ParallaxTriangles } from "@/components/parallax-triangles";
import { CareersList } from "@/components/careers-list";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default async function CareersPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const p = t.careersPage;
  return (
    <main>
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-sky-soft">{p.eyebrow}</span>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {p.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-hero-fg-muted">{p.lead}</p>
        </div>
      </section>
      <CareersList
        lang={params.lang}
        jobs={p.jobs}
        dict={{ openings: p.openings, allTeams: p.allTeams, apply: p.apply, noJobs: p.noJobs }}
      />
    </main>
  );
}
