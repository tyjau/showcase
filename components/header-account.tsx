"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  getToken,
  getWorkspace,
  getSessionName,
  getSessionAvatar,
  clearSession,
  PROFILE_EVENT,
} from "@/lib/api";

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

function initials(name: string | null): string {
  if (!name) return "•";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || "•";
}

function AvatarCircle({ avatar, name, size = 28 }: { avatar: string | null; name: string | null; size?: number }) {
  if (avatar) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatar}
        alt=""
        aria-hidden="true"
        className="flex-none rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex flex-none items-center justify-center rounded-full bg-sky-strong font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name)}
    </span>
  );
}

// Auth-aware header cluster. Signed out (and on the server / first client paint, since
// localStorage is client-only): the sign-in link + the "start trial" CTA. Signed in: an
// avatar + name that opens the account dropdown, and the acquisition CTA is dropped so a
// logged-in customer isn't pushed back into the funnel. Re-syncs on mount, on navigation
// (a same-tab login emits no `storage` event), on `storage` (cross-tab), and on a profile
// update (avatar change).
export function HeaderAccount({ lang, labels }: { lang: string; labels: Labels }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    const sync = () => {
      setAuthed(!!getToken());
      setWorkspace(getWorkspace());
      setName(getSessionName());
      setAvatar(getSessionAvatar());
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(PROFILE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(PROFILE_EVENT, sync);
    };
  }, [pathname]);

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

  const firstName = (name || "").trim().split(/\s+/)[0] || "";
  const items = [
    { label: labels.account, href: `/${lang}/account` },
    { label: labels.invoices, href: `/${lang}/account#invoices` },
    { label: labels.paymentMethod, href: `/${lang}/account#payment` },
    { label: labels.partner, href: `/${lang}/account#referrals` },
  ];

  return (
    <details className="relative [&[open]>summary>svg]:rotate-180">
      <summary className="flex cursor-pointer list-none select-none items-center gap-2 rounded-full border border-line py-1 pl-1 pr-2.5 text-heading hover:border-sky [&::-webkit-details-marker]:hidden">
        <AvatarCircle avatar={avatar} name={name} />
        {firstName && <span className="hidden max-w-[8rem] truncate text-sm font-semibold sm:inline">{firstName}</span>}
        <ChevronDown size={15} className="transition-transform" aria-hidden="true" />
      </summary>
      <div className="absolute right-0 top-12 z-40 w-60 rounded-lg border border-line bg-surface py-2 shadow-md">
        <div className="flex items-center gap-2.5 border-b border-line px-4 pb-2.5 pt-1">
          <AvatarCircle avatar={avatar} name={name} size={34} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-heading">{name || labels.account}</p>
            {workspace && <p className="truncate text-xs text-muted">{workspace}.skyrh.app</p>}
          </div>
        </div>
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
