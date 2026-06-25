"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Client-side redirect usable inside a statically-exported page (the server page
// keeps generateStaticParams and renders this). Falls back to a visible link when
// JS is disabled. Used to fold /resources into /help.
export function RedirectTo({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(href);
  }, [router, href]);
  // Visible only for the instant before the client redirect fires (and as the
  // no-JS fallback). Present it as a deliberate "redirecting…" card rather than a
  // bare link floating in an empty page.
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-sky-strong"
        aria-hidden="true"
      />
      <Link href={href} className="mt-5 font-semibold text-sky-text hover:underline">
        {label} →
      </Link>
    </main>
  );
}
