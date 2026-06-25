"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile — a privacy-friendly CAPTCHA. Renders only when a site key is
// configured (NEXT_PUBLIC_TURNSTILE_SITEKEY); otherwise it's a no-op so dev/self-host
// keep working (the honeypot still guards the forms). The backend verifies the token
// when TURNSTILE_SECRET is set. Dev can use Cloudflare's always-pass test key
// 1x00000000000000000000AA.
const SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY;

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!SITEKEY || !ref.current) return;
    let widgetId: string | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const render = () => {
      if (cancelled || widgetId || !window.turnstile || !ref.current) return;
      widgetId = window.turnstile.render(ref.current, {
        sitekey: SITEKEY,
        callback: (t: string) => cb.current(t),
        "expired-callback": () => cb.current(""),
        "error-callback": () => cb.current(""),
        theme: "auto",
      });
    };

    if (window.turnstile) {
      render();
    } else {
      if (!document.querySelector("script[data-turnstile]")) {
        const s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        s.defer = true;
        s.dataset.turnstile = "1";
        document.head.appendChild(s);
      }
      poll = setInterval(() => {
        if (window.turnstile) {
          if (poll) clearInterval(poll);
          render();
        }
      }, 200);
      setTimeout(() => poll && clearInterval(poll), 6000);
    }

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          /* widget already gone */
        }
      }
    };
  }, []);

  if (!SITEKEY) return null;
  return <div ref={ref} className="mt-3" />;
}
