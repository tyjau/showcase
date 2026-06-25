import type { ReactNode } from "react";

// Realistic monochrome logo PLACEHOLDERS — an abstract logomark + wordmark, cycled
// by index so a row of names reads like a real "trusted by" wall instead of plain
// text. Everything is currentColor so it inherits the muted/monochrome tone and
// re-themes in dark mode. Swap for real client SVGs later (names come from the dict).
const MARKS: (() => ReactNode)[] = [
  () => (
    <>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </>
  ),
  () => <path d="M12 2.5 20 7v10l-8 4.5L4 17V7z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />,
  () => (
    <>
      <circle cx="9" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="15" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </>
  ),
  () => (
    <>
      <rect x="4" y="13" width="4" height="7" rx="1" fill="currentColor" />
      <rect x="10" y="9" width="4" height="11" rx="1" fill="currentColor" />
      <rect x="16" y="5" width="4" height="15" rx="1" fill="currentColor" />
    </>
  ),
  () => <path d="M12 3 21 20H3z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />,
  () => (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </>
  ),
  () => <path d="M5 6l6 6-6 6M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  () => (
    <>
      <path d="M12 3l9 9-9 9-9-9z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M12 8l4 4-4 4-4-4z" fill="currentColor" />
    </>
  ),
];

export function ClientLogos({ names, className = "" }: { names: string[]; className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-5 ${className}`}>
      {names.map((name, i) => (
        <span key={name} className="inline-flex items-center gap-2 text-muted/70">
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            {MARKS[i % MARKS.length]()}
          </svg>
          <span className="text-base font-extrabold tracking-tight">{name}</span>
        </span>
      ))}
    </div>
  );
}
