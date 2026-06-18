import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { LocaleSwitcher } from "./locale-switcher";
import { CurrencySwitcher } from "./currency-switcher";
import { MobileNav } from "./mobile-nav";
import { PrimaryNav } from "./primary-nav";
import { HeaderAuthLink } from "./header-auth-link";
import { HeaderAccount } from "./header-account";
import { ThemeToggle } from "./theme-toggle";
import type { Locale } from "@/lib/i18n";

type NavDict = {
  product: string;
  features: string;
  pricing: string;
  platform: string;
  company: string;
  resources: string;
  signin: string;
  account: string;
  startTrial: string;
  logout: string;
  invoices: string;
  paymentMethod: string;
  partner: string;
};

type ThemeDict = { toggle: string; light: string; dark: string; system: string };

export function SiteHeader({
  lang,
  dict,
  theme,
}: {
  lang: Locale;
  dict: NavDict;
  theme: ThemeDict;
}) {
  const nav = [
    { label: dict.features, href: `/${lang}/features` },
    { label: dict.pricing, href: `/${lang}/pricing` },
    { label: dict.platform, href: `/${lang}/platform` },
    { label: dict.company, href: `/${lang}/company` },
    { label: dict.resources, href: `/${lang}/resources` },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-header backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href={`/${lang}`}>
          <BrandLogo />
        </Link>
        <PrimaryNav items={nav} />
        <div className="flex items-center gap-3 text-sm">
          <CurrencySwitcher className="hidden sm:inline-flex" />
          <ThemeToggle labels={theme} className="hidden sm:inline-flex" />
          <LocaleSwitcher current={lang} />
          <HeaderAccount
            lang={lang}
            labels={{
              signin: dict.signin,
              account: dict.account,
              startTrial: dict.startTrial,
              logout: dict.logout,
              invoices: dict.invoices,
              paymentMethod: dict.paymentMethod,
              partner: dict.partner,
            }}
          />
          <MobileNav
            items={nav}
            authLink={
              <HeaderAuthLink
                lang={lang}
                signinLabel={dict.signin}
                accountLabel={dict.account}
                className="mt-1 border-t border-line px-4 pb-1 pt-3 text-heading"
              />
            }
            themeToggle={<ThemeToggle labels={theme} />}
            className="md:hidden"
          />
        </div>
      </div>
    </header>
  );
}
