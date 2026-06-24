"use client";

import { useEffect, useRef } from "react";

// Decorative inverted-triangle parallax for hero bands (the SkyRH logo mark reused as
// décor). One rAF-throttled scroll listener moves each triangle by its data-spd factor.
// Honours prefers-reduced-motion: when set, the triangles render static (no listener).
function Triangle({ className, spd }: { className: string; spd: number }) {
  return (
    <svg
      data-spd={spd}
      viewBox="0 0 100 100"
      className={className}
      style={{ willChange: "transform" }}
      aria-hidden="true"
    >
      <polygon points="0,0 100,0 50,100" fill="var(--brand-sky)" />
    </svg>
  );
}

export function ParallaxTriangles() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const tris = Array.from(el.querySelectorAll<SVGElement>("[data-spd]"));
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        for (const t of tris) {
          const spd = parseFloat(t.getAttribute("data-spd") || "0");
          t.style.transform = `translate3d(0, ${(y * spd).toFixed(1)}px, 0)`;
        }
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <Triangle className="absolute -left-10 top-8 h-44 w-44 opacity-[0.07]" spd={0.16} />
      <Triangle className="absolute right-[10%] top-[60%] h-24 w-24 opacity-[0.06]" spd={-0.1} />
      <Triangle className="absolute left-[28%] -bottom-6 h-28 w-28 opacity-[0.05]" spd={0.09} />
    </div>
  );
}
