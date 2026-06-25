import { Quote } from "lucide-react";
import { ClientLogos } from "./client-logos";

type SocialProofDict = {
  stats: { value: string; label: string }[];
  logosTitle: string;
  logos: string[];
  testimonialsTitle: string;
  testimonials: { quote: string; author: string; role: string }[];
};

// Home social-proof block: headline stats + a logo wall + customer quotes.
// MVP content is placeholder (see dictionaries `socialProof`) — to be replaced
// with real, permissioned clients/quotes before launch. Colours use the semantic
// theme tokens (heading/surface/mist/muted/accent) so it re-themes in dark mode.
export function SocialProof({ dict }: { dict: SocialProofDict }) {
  return (
    <section className="border-y border-line bg-mist">
      <div className="mx-auto max-w-6xl px-5 py-14">
        {/* Headline stats */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {dict.stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-heading">{s.value}</div>
              <div className="mt-1 text-sm text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Logo wall — realistic monochrome logo placeholders. */}
        <div className="mt-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {dict.logosTitle}
          </p>
          <ClientLogos names={dict.logos} className="mt-5" />
        </div>

        {/* Testimonials */}
        <div className="mt-12">
          <h2 className="mb-6 text-center text-2xl font-bold text-heading">
            {dict.testimonialsTitle}
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {dict.testimonials.map((tm) => (
              <figure
                key={tm.author}
                className="rounded-xl border border-line bg-surface p-5"
              >
                <Quote size={20} className="text-sky-text" aria-hidden="true" />
                <blockquote className="mt-3 text-sm leading-relaxed text-ink">
                  {tm.quote}
                </blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold text-heading">{tm.author}</span>
                  <span className="block text-xs text-muted">{tm.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
