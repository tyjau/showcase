import type { Metadata } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, type Locale } from "@/lib/i18n";
import { ParallaxTriangles } from "@/components/parallax-triangles";
import { ContactForm } from "@/components/contact-form";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return { title: t.seo.pages.contact };
}

export default async function ContactPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const p = t.contactPage;
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
      <section className="mx-auto max-w-5xl px-5 py-12">
        <ContactForm dict={p} />
      </section>

      <section className="border-t border-line bg-mist">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">{p.channelsTitle}</h2>
            <ul className="mt-4 space-y-3">
              {p.channels.map((ch: { label: string; value: string }) => (
                <li key={ch.label} className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-0">
                  <span className="text-sm font-medium text-ink">{ch.label}</span>
                  <a href={`mailto:${ch.value}`} className="text-sm font-semibold text-sky-text hover:underline">
                    {ch.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">{p.officesTitle}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {p.offices.map((o: { city: string; lines: string[] }) => (
                <div key={o.city} className="rounded-xl border border-line bg-surface p-4">
                  <div className="font-semibold text-ink">{o.city}</div>
                  {o.lines.map((ln: string) => (
                    <div key={ln} className="text-sm text-muted">{ln}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
