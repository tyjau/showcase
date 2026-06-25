"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { getToken, getWorkspace, clearSession } from "@/lib/api";

// Run the session sync BEFORE the browser paints on the client (so a returning,
// signed-in visitor never sees the signed-out CTA flash), while falling back to a
// no-op effect during SSR where useLayoutEffect would warn.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Labels = {
  signin: string;
  account: string;
  startTrial: string;
  logout: string;
  invoices: string;
  paymentMethod: string;
  partner: string;
};

// Auth-aware header cluster. Signed out (and on the server / first client paint, since
// localStorage is client-only): the sign-in link + the "start trial" CTA. Signed in: an
// account dropdown, and the acquisition CTA is dropped so a logged-in customer isn't pushed
// back into the funnel. Syncs on mount and on `storage` (cross-tab / logout without reload).
export function HeaderAccount({ lang, labels }: { lang: string; labels: Labels }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [workspace, setWorkspace] = useState<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    const sync = () => {
      setAuthed(!!getToken());
      setWorkspace(getWorkspace());
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function logout() {
    clearSession();
    setAuthed(false);
    router.push(`/${lang}/login`);
  }

  if (!authed) {
    return (
      <>
        <Link href={`/${lang}/login`} className="hidden text-heading hover:text-sky-text nav:inline">
          {labels.signin}
        </Link>
        <Link
          href={`/${lang}/signup`}
          className="rounded-full bg-sky-strong px-4 py-2 font-semibold text-white transition-colors hover:bg-[#08607f]"
        >
          {labels.startTrial}
        </Link>
      </>
    );
  }

  const items = [
    { label: labels.account, href: `/${lang}/account` },
    { label: labels.invoices, href: `/${lang}/account#invoices` },
    { label: labels.paymentMethod, href: `/${lang}/account#payment` },
    { label: labels.partner, href: `/${lang}/partner` },
  ];

  return (
    <details className="relative [&[open]>summary>svg]:rotate-180">
      <summary className="flex cursor-pointer list-none select-none items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-heading hover:border-sky [&::-webkit-details-marker]:hidden">
        <span className="max-w-[10rem] truncate">{labels.account}</span>
        <ChevronDown size={15} className="transition-transform" aria-hidden="true" />
      </summary>
      <div className="absolute right-0 top-11 z-40 w-56 rounded-lg border border-line bg-surface py-2 shadow-md">
        {workspace && (
          <p className="truncate px-4 pb-2 text-xs text-muted">{workspace}.skyrh.app</p>
        )}
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="block px-4 py-2.5 text-sm text-ink hover:bg-mist">
            {it.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={logout}
          className="mt-1 block w-full border-t border-line px-4 pb-1 pt-2.5 text-left text-sm text-ink hover:bg-mist"
        >
          {labels.logout}
        </button>
      </div>
    </details>
  );
}
