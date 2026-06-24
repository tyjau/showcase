"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string };

// Marketing nav. Hidden on portal screens (/account, /partner) so the logged-in
// chrome stays focused — there the account dropdown is the primary navigation.
export function PrimaryNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  if (/\/(account|partner)(\/|$)/.test(pathname || "")) return null;
  return (
    <nav data-testid="primary-nav" className="hidden items-center gap-6 text-sm text-ink nav:flex">
      {items.map((n) => (
        <Link key={n.label} href={n.href} className="hover:text-sky">
          {n.label}
        </Link>
      ))}
    </nav>
  );
}
