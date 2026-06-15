import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { LocaleSwitcher } from "./locale-switcher";
import { CurrencySwitcher } from "./currency-switcher";
import { MobileNav } from "./mobile-nav";
import type { Locale } from "@/lib/i18n";

type NavDict = {
  product: string;
  features: string;
  pricing: string;
  platform: string;
  company: string;
  resources: string;
  signin: string;
  startTrial: string;
};

export function SiteHeader({ lang, dict }: { lang: Locale; dict: NavDict }) {
  const nav = [
    { label: dict.features, href: `/${lang}/features` },
    { label: dict.pricing, href: `/${lang}/pricing` },
    { label: dict.platform, href: `/${lang}/platform` },
    { label: dict.company, href: `/${lang}/company` },
    { label: dict.resources, href: `/${lang}/resources` },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href={`/${lang}`}>
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
          <CurrencySwitcher className="hidden sm:inline-flex" />
          <LocaleSwitcher current={lang} />
          <Link
            href={`/${lang}/login`}
            className="hidden text-navy hover:text-sky sm:inline"
          >
            {dict.signin}
          </Link>
          <Link
            href={`/${lang}/signup`}
            className="rounded-full bg-sky px-4 py-2 font-semibold text-white transition-colors hover:bg-[#0d8bbd]"
          >
            {dict.startTrial}
          </Link>
          <MobileNav
            items={nav}
            signin={dict.signin}
            signinHref={`/${lang}/login`}
            className="md:hidden"
          />
        </div>
      </div>
    </header>
  );
}
