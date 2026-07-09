import type { Metadata } from "next";
import Link from "next/link";
import { Mail, LifeBuoy, Phone, MapPin, Video, ArrowRight, type LucideIcon } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import { i18n, type Locale } from "@/lib/i18n";
import { ParallaxTriangles } from "@/components/parallax-triangles";
import { ContactForm } from "@/components/contact-form";
import { buildAlternates } from "@/lib/seo";

export function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export async function generateMetadata(
  props: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  return {
    title: t.seo.pages.contact,
    description: t.contactPage.lead,
    alternates: buildAlternates(params.lang, "/contact"),
  };
}

const CHANNEL_ICONS: LucideIcon[] = [Mail, LifeBuoy, Phone];

export default async function ContactPage(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const t = await getDictionary(params.lang);
  const lang = params.lang;
  const p = t.contactPage;

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-bg text-hero-fg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(820px_360px_at_80%_-12%,rgba(15,158,213,0.20),transparent_70%)]" />
        <ParallaxTriangles />
        <div className="relative mx-auto max-w-6xl px-5 py-16 text-center">
          <span className="text-sm font-bold uppercase tracking-wide text-sky-soft">{p.eyebrow}</span>
          <h1 className="mx-auto mt-3.5 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-[42px]">
            {p.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-hero-fg-muted">{p.lead}</p>
        </div>
      </section>

      {/* CONTACT GRID */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid items-start gap-9 min-[880px]:grid-cols-[1.1fr_0.9fr]">
          <ContactForm dict={p} />

          {/* RAIL */}
          <div className="flex flex-col gap-4">
            {/* Channels */}
            <div className="rounded-2xl border border-line bg-surface p-[22px]">
              <h3 className="mb-3.5 text-base font-extrabold text-heading">{p.channelsTitle}</h3>
              <div className="flex flex-col gap-3.5">
                {p.channels.map((c: { label: string; value: string }, i: number) => {
                  const Icon = CHANNEL_ICONS[i] ?? Mail;
                  const isMail = c.value.includes("@");
                  return (
                    <div key={c.label} className="flex items-start gap-3">
                      <span className="inline-flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] bg-tint-sky text-sky-text">
                        <Icon size={18} />
                      </span>
                      <div>
                        <div className="text-[13px] font-bold text-muted">{c.label}</div>
                        {isMail ? (
                          <a href={`mailto:${c.value}`} className="mt-0.5 block text-[15px] font-bold text-ink hover:text-sky-text">
                            {c.value}
                          </a>
                        ) : (
                          <div className="mt-0.5 text-[15px] font-bold text-ink">{c.value}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Offices */}
            <div className="rounded-2xl border border-line bg-surface p-[22px]">
              <h3 className="mb-3.5 text-base font-extrabold text-heading">{p.officesTitle}</h3>
              <div className="flex flex-col gap-3.5">
                {p.offices.map((o: { city: string; addr: string }) => (
                  <div key={o.city} className="flex items-start gap-3">
                    <span className="inline-flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-mist text-accent">
                      <MapPin size={17} />
                    </span>
                    <div>
                      <div className="text-[14.5px] font-bold text-ink">{o.city}</div>
                      <div className="mt-0.5 text-[13px] text-muted">{o.addr}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo CTA */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-mist p-5">
              <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-[10px] bg-sky-strong text-white">
                <Video size={20} />
              </span>
              <div className="min-w-0">
                <div className="text-[14.5px] font-extrabold text-heading">{p.demoTitle}</div>
                <Link
                  href={`/${lang}/signup`}
                  className="mt-0.5 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-sky-text hover:underline"
                >
                  {p.demoCta} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
