import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import type { Locale } from "@/lib/i18n";

type FooterDict = {
  tagline: string;
  product: string;
  company: string;
  resources: string;
  modules: string;
  platform: string;
  pricing: string;
  signup: string;
  about: string;
  careers: string;
  contact: string;
  partners: string;
  guides: string;
  security: string;
  status: string;
  rights: string;
};

type LegalDict = { terms: string; privacy: string; cookies: string };

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-hero-fg">
        {title}
      </h4>
      <ul className="space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-hero-fg">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({
  lang,
  dict,
  legal,
}: {
  lang: Locale;
  dict: FooterDict;
  legal: LegalDict;
}) {
  return (
    <footer className="bg-hero-bg text-hero-fg-muted">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <BrandLogo className="!text-white" />
            <p className="mt-3 max-w-[34ch] text-sm">{dict.tagline}</p>
          </div>
          <FooterCol
            title={dict.product}
            links={[
              [dict.modules, `/${lang}/features`],
              [dict.platform, `/${lang}/platform`],
              [dict.pricing, `/${lang}/pricing`],
              [dict.signup, `/${lang}/signup`],
            ]}
          />
          <FooterCol
            title={dict.company}
            links={[
              [dict.about, `/${lang}/company`],
              [dict.careers, `/${lang}/company#careers`],
              [dict.partners, `/${lang}/partners`],
              [dict.contact, `/${lang}/company#contact`],
            ]}
          />
          <FooterCol
            title={dict.resources}
            links={[
              [dict.guides, `/${lang}/resources`],
              [dict.security, `/${lang}/legal/security`],
              [dict.status, `/${lang}/resources`],
            ]}
          />
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-6 text-sm">
          <span>© {new Date().getFullYear()} SkyRH. {dict.rights}</span>
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            <Link href={`/${lang}/legal/terms`} className="hover:text-hero-fg">
              {legal.terms}
            </Link>
            <Link href={`/${lang}/legal/privacy`} className="hover:text-hero-fg">
              {legal.privacy}
            </Link>
            <Link href={`/${lang}/legal/cookies`} className="hover:text-hero-fg">
              {legal.cookies}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
