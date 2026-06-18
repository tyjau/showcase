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
  return (
    <main className="mx-auto max-w-3xl px-5 py-24 text-center">
      <Link href={href} className="font-semibold text-sky underline">
        {label} →
      </Link>
    </main>
  );
}
