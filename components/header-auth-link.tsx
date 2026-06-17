"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/api";

// Session-aware nav link. Shows the "account" entry when a portal token is present,
// "sign in" otherwise. Renders the signed-out variant on the server and the first
// client paint (localStorage is client-only) then syncs after mount — and on the
// `storage` event so it updates across tabs / on logout without a reload.
export function HeaderAuthLink({
  lang,
  signinLabel,
  accountLabel,
  className = "",
}: {
  lang: string;
  signinLabel: string;
  accountLabel: string;
  className?: string;
}) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const sync = () => setAuthed(!!getToken());
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
    <Link href={`/${lang}/${authed ? "account" : "login"}`} className={className}>
      {authed ? accountLabel : signinLabel}
    </Link>
  );
}
