"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Top loading bar for client-side navigations. The App Router (especially in a
// static export) exposes no router events, so we start the bar when an in-app
// link is clicked and finish it when the pathname actually changes — with a
// safety timeout so it never gets stuck (e.g. same-path query-only navigations).
export function RouteProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const hide = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  function clearTimers() {
    if (tick.current) clearInterval(tick.current);
    if (hide.current) clearTimeout(hide.current);
    if (safety.current) clearTimeout(safety.current);
    tick.current = hide.current = safety.current = null;
  }

  function start() {
    clearTimers();
    setVisible(true);
    setProgress(8);
    // Ease toward 90% while the next route loads; the real completion snaps to 100%.
    tick.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.max(0.5, (90 - p) * 0.08)));
    }, 120);
    // Never hang: auto-finish if the navigation produced no pathname change.
    safety.current = setTimeout(finish, 5000);
  }

  function finish() {
    clearTimers();
    setProgress(100);
    hide.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);
  }

  // Start on any left-click of an in-app, same-origin link to a different path.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || anchor.getAttribute("target") === "_blank" || anchor.hasAttribute("download")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // hash/query-only → no nav bar
      start();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Finish whenever the route resolves.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => clearTimers, []);

  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5" aria-hidden="true">
      <div
        className="h-full bg-sky-strong shadow-[0_0_8px_var(--brand-sky)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
