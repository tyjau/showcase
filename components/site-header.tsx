import Link from "next/link";
import { BrandLogo } from "./brand-logo";

const nav = [
  { label: "Product", href: "/#product" },
  { label: "Pricing", href: "/pricing" },
  { label: "Company", href: "/company" },
  { label: "Resources", href: "/resources" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/">
          <BrandLogo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink md:flex">
          {nav.map((n) => (
            <Link key={n.label} href={n.href} className="hover:text-sky">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden rounded-md border border-line px-2 py-0.5 text-xs text-muted sm:inline">
            EN
          </span>
          <Link href="/login" className="hidden text-navy hover:text-sky sm:inline">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-sky px-4 py-2 font-semibold text-white transition-colors hover:bg-[#0d8bbd]"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </header>
  );
}
