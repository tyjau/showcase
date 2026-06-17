import Link from "next/link";
import { Menu } from "lucide-react";
import type { ReactNode } from "react";

type NavItem = { label: string; href: string };

// Native <details> disclosure — no client JS / hydration needed, which suits a
// static export and avoids a fragile client component for a simple menu.
export function MobileNav({
  items,
  authLink,
  className = "",
}: {
  items: NavItem[];
  authLink: ReactNode;
  className?: string;
}) {
  return (
    <details className={`relative ${className}`}>
      <summary
        aria-label="Menu"
        className="flex h-9 w-9 cursor-pointer list-none select-none items-center justify-center rounded-md text-navy hover:bg-mist [&::-webkit-details-marker]:hidden"
      >
        <Menu size={22} aria-hidden="true" />
      </summary>
      <div className="absolute right-0 top-11 z-40 w-56 rounded-lg border border-line bg-white py-2 shadow-md">
        <nav className="flex flex-col text-sm">
          {items.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="px-4 py-2.5 text-ink hover:bg-mist"
            >
              {n.label}
            </Link>
          ))}
          {authLink}
        </nav>
      </div>
    </details>
  );
}
