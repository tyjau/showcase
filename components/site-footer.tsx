import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import type { Locale } from "@/lib/i18n";

// lucide-react dropped brand icons, so the social glyphs are inline monochrome SVGs.
const SOCIAL_PATHS: Record<string, string> = {
  LinkedIn:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z",
  X: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  YouTube:
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z",
  Facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
};
const SOCIALS: { name: string; href: string }[] = [
  { name: "LinkedIn", href: "https://www.linkedin.com/company/skyrh" },
  { name: "X", href: "https://x.com/skyrh" },
  { name: "YouTube", href: "https://www.youtube.com/@skyrh" },
  { name: "Facebook", href: "https://www.facebook.com/skyrh" },
];

type FooterDict = {
  tagline: string;
  product: string;
  company: string;
  resources: string;
  modules: string;
  platform: string;
  pricing: string;
  compare: string;
  solutions: string;
  signup: string;
  about: string;
  careers: string;
  contact: string;
  partners: string;
  guides: string;
  security: string;
  status: string;
  trust: string;
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
  lang: string;
  dict: FooterDict;
  legal: LegalDict;
}) {
  return (
    <footer className="bg-hero-bg text-hero-fg-muted">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid grid-cols-2 gap-8 min-[600px]:grid-cols-3 min-[880px]:grid-cols-4">
          <div className="col-span-2 min-[600px]:col-span-3 min-[880px]:col-span-1">
            <BrandLogo className="!text-white" onDark />
            <p className="mt-3 max-w-[34ch] text-sm">{dict.tagline}</p>
            <div className="mt-4 flex gap-3">
              {SOCIALS.map(({ name, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-hero-fg-muted transition hover:border-white/40 hover:text-hero-fg"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d={SOCIAL_PATHS[name]} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <FooterCol
            title={dict.product}
            links={[
              [dict.modules, `/${lang}/features`],
              [dict.platform, `/${lang}/platform`],
              [dict.pricing, `/${lang}/pricing`],
              [dict.compare, `/${lang}/compare`],
              [dict.solutions, `/${lang}/solutions`],
              [dict.signup, `/${lang}/signup`],
            ]}
          />
          <FooterCol
            title={dict.company}
            links={[
              [dict.about, `/${lang}/company`],
              [dict.careers, `/${lang}/careers`],
              [dict.partners, `/${lang}/partners`],
              [dict.contact, `/${lang}/contact`],
            ]}
          />
          <FooterCol
            title={dict.resources}
            links={[
              [dict.guides, `/${lang}/resources`],
              [dict.trust, `/${lang}/trust`],
              [dict.security, `/${lang}/legal/security`],
              [dict.status, `/${lang}/status`],
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
