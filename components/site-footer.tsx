import Link from "next/link";
import { BrandLogo } from "./brand-logo";

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
        {title}
      </h4>
      <ul className="space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy text-[#a9bccd]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <BrandLogo className="!text-white" />
            <p className="mt-3 max-w-[34ch] text-sm">
              Modern HR &amp; payroll, on one platform, with compliance localized
              to your country.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={[
              ["Modules", "/#product"],
              ["Pricing", "/pricing"],
              ["Sign up", "/signup"],
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              ["About", "/company"],
              ["Careers", "/company#careers"],
              ["Contact", "/company#contact"],
            ]}
          />
          <FooterCol
            title="Resources"
            links={[
              ["Guides", "/resources"],
              ["Security", "/legal/security"],
              ["Status", "/status"],
            ]}
          />
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-6 text-sm">
          <span>© {new Date().getFullYear()} SkyRH. All rights reserved.</span>
          <span>Terms · Privacy · Cookies</span>
        </div>
      </div>
    </footer>
  );
}
