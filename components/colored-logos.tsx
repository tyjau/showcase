import type { ReactNode } from "react";

// Per-brand colored partner marks (placeholder brands — to be replaced with real,
// permissioned logos before launch). Glyph + color mirror the handoff mockup's
// logo(kind,name,color) mapping, in dictionary order.
const MARKS: { color: string; glyph: ReactNode }[] = [
  { color: "#6366f1", glyph: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 21,7 21,17 12,22 3,17 3,7" /></svg> },
  { color: "#0ea5a4", glyph: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg> },
  { color: "#f59e0b", glyph: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="13,2 4,14 11,14 11,22 20,9 13,9" /></svg> },
  { color: "#ec4899", glyph: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 14c3-6 6 6 9 0s6-6 9 0" /></svg> },
  { color: "#3b82f6", glyph: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg> },
  { color: "#8b5cf6", glyph: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="3" y="3" width="18" height="18" rx="5" /><line x1="3" y1="12" x2="21" y2="12" /></svg> },
];

/** Centered wrap of colored brand marks (partner wall). */
export function ColoredLogos({ names, className = "" }: { names: string[]; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-10 gap-y-4 ${className}`}>
      {names.map((name, i) => {
        const m = MARKS[i % MARKS.length];
        return (
          <span key={name} className="inline-flex items-center gap-2.5" style={{ color: m.color }}>
            {m.glyph}
            <span className="text-[17px] font-extrabold tracking-tight">{name}</span>
          </span>
        );
      })}
    </div>
  );
}
