"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Client-side redirect for a deprecated/static route (the auth state is client-only, so the
// redirect can't run on the server). Renders a no-JS fallback link.
export function ClientRedirect({ to, label }: { to: string; label: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [to, router]);
  return (
    <p className="text-muted">
      <Link href={to} className="font-semibold text-sky-text hover:underline">
        {label}
      </Link>
    </p>
  );
}
