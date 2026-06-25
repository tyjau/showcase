import type { ReactNode } from "react";
import { TestimonialsCarousel } from "./testimonials-carousel";

type SocialProofDict = {
  stats: { value: string; label: string }[];
  logosTitle: string;
  logos: string[];
  testimonialsTitle: string;
  prev: string;
  next: string;
  testimonials: { quote: string; author: string; role: string }[];
};

// Colored glyph marks for the client logo wall (placeholder brands — to be replaced
// with real, permissioned logos before launch). Each is paired with a brand color.
const MARKS: { color: string; glyph: ReactNode }[] = [
  { color: "#0F9ED5", glyph: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg> },
  { color: "#4F46E5", glyph: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,3 21,20 3,20" /></svg> },
  { color: "#D97706", glyph: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7" /></svg> },
  { color: "#E11D48", glyph: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="3" y="3" width="18" height="18" rx="5" /><line x1="3" y1="12" x2="21" y2="12" /></svg> },
  { color: "#059669", glyph: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 14c3-6 6 6 9 0s6-6 9 0" /></svg> },
  { color: "#7C3AED", glyph: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg> },
];

// Home social-proof: a colored logo wall + a 2-up starred testimonial carousel.
export function SocialProof({ dict }: { dict: SocialProofDict }) {
  return (
    <section className="border-y border-line bg-mist">
      <div className="mx-auto max-w-6xl px-5 py-16">
        {/* Logo wall */}
        <p className="text-center text-xs font-bold uppercase tracking-[0.08em] text-muted">
          {dict.logosTitle}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          {dict.logos.map((name, i) => {
            const m = MARKS[i % MARKS.length];
            return (
              <div
                key={name}
                className="flex h-[88px] items-center justify-center gap-2.5 rounded-[14px] border border-line bg-surface px-3"
                style={{ color: m.color }}
              >
                {m.glyph}
                <span className="truncate text-[15px] font-extrabold tracking-tight">{name}</span>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="mt-[52px]">
          <TestimonialsCarousel dict={dict} />
        </div>
      </div>
    </section>
  );
}
