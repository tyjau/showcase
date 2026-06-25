"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string };

// Marketing nav. Hidden on portal screens (/account, /partner) so the logged-in
// chrome stays focused — there the account dropdown is the primary navigation.
export function PrimaryNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  if (/\/(account|partner)(\/|$)/.test(pathname || "")) return null;
  const path = (pathname || "").replace(/\/$/, "");
  const isActive = (href: string) => {
    const h = href.replace(/\/$/, "");
    return path === h || path.startsWith(`${h}/`);
  };
  return (
    <nav data-testid="primary-nav" className="hidden items-center gap-6 text-sm text-ink nav:flex">
      {items.map((n) => {
        const active = isActive(n.href);
        return (
          <Link
            key={n.label}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={active ? "font-semibold text-sky-text" : "text-ink hover:text-sky-text"}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
