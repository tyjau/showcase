import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

const STATUS_STYLE: Record<string, { dot: string; text: string; bg: string }> = {
  operational: { dot: "bg-ok-fg", text: "text-ok-fg", bg: "bg-ok-bg" },
  degraded: { dot: "bg-warn-fg", text: "text-warn-fg", bg: "bg-warn-bg" },
  incident: { dot: "bg-err-fg", text: "text-err-fg", bg: "bg-err-bg" },
};

export default async function StatusPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const p = t.statusPage;
  const label: Record<string, string> = {
    operational: p.operational,
    degraded: p.degraded,
    incident: p.incident,
  };
  const allOk = p.services.every((s) => s.status === "operational");

  return (
    <main>
      <section className="bg-hero-bg text-hero-fg">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-sky-soft">{p.eyebrow}</span>
          <h1 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {allOk ? p.title : p.titleDegraded}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-hero-fg-muted">{p.lead}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12">
        {allOk && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-ok-border bg-ok-bg px-5 py-4 text-ok-fg">
            <CheckCircle2 size={20} />
            <span className="font-semibold">{p.title}</span>
          </div>
        )}
        <div className="overflow-hidden rounded-xl border border-line">
          {p.services.map((s) => {
            const st = STATUS_STYLE[s.status] ?? STATUS_STYLE.operational;
            return (
              <div
                key={s.name}
                className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 last:border-b-0"
              >
                <span className="font-medium text-ink">{s.name}</span>
                <div className="flex items-center gap-4">
                  <span className="hidden text-xs text-muted sm:inline">
                    {s.uptime} · {p.uptimeLabel}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${st.bg} ${st.text}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                    {label[s.status] ?? s.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 text-center">
          <Link
            href={`/${params.lang}/contact?sujet=produit`}
            className="inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-heading hover:border-sky"
          >
            {p.subscribe}
          </Link>
        </div>
      </section>
    </main>
  );
}
