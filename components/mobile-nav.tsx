"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { ReactNode } from "react";

type NavItem = { label: string; href: string };

// <details> disclosure for the marketing menu. Hidden on portal screens
// (/account, /partner), where the account dropdown is the primary navigation.
export function MobileNav({
  items,
  authLink,
  currencySwitcher,
  localeSwitcher,
  themeToggle,
  className = "",
}: {
  items: NavItem[];
  authLink: ReactNode;
  currencySwitcher?: ReactNode;
  localeSwitcher?: ReactNode;
  themeToggle?: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  if (/\/(account|partner)(\/|$)/.test(pathname || "")) return null;
  const path = (pathname || "").replace(/\/$/, "");
  const isActive = (href: string) => {
    const h = href.replace(/\/$/, "");
    return path === h || path.startsWith(`${h}/`);
  };
  return (
    <details className={`relative ${className}`}>
      <summary
        aria-label="Menu"
        data-testid="burger"
        className="flex h-9 w-9 cursor-pointer list-none select-none items-center justify-center rounded-md text-heading hover:bg-mist [&::-webkit-details-marker]:hidden"
      >
        <Menu size={22} aria-hidden="true" />
      </summary>
      <div className="absolute right-0 top-11 z-40 w-56 rounded-lg border border-line bg-surface py-2 shadow-md">
        <nav className="flex flex-col text-sm">
          {items.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.label}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`px-4 py-2.5 hover:bg-mist ${active ? "font-semibold text-sky-text" : "text-ink"}`}
              >
                {n.label}
              </Link>
            );
          })}
          {/* Controls that live in the desktop bar move here below 1123px:
              Devise · Langue · Thème · Se connecter (handoff order). */}
          {(currencySwitcher || localeSwitcher || themeToggle) && (
            <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-line px-4 pb-1 pt-3">
              {currencySwitcher}
              {localeSwitcher}
              {themeToggle}
            </div>
          )}
          {authLink}
        </nav>
      </div>
    </details>
  );
}
