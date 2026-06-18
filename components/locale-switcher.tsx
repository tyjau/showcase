"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { i18n, type Locale } from "@/lib/i18n";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() || `/${current}`;

  const hrefFor = (loc: Locale) => {
    const parts = pathname.split("/");
    parts[1] = loc;
    return parts.join("/") || `/${loc}`;
  };

  return (
    <div className="flex items-center gap-0.5 text-xs">
      {i18n.locales.map((loc) => (
        <Link
          key={loc}
          href={hrefFor(loc)}
          aria-current={loc === current ? "true" : undefined}
          className={`rounded px-1.5 py-0.5 uppercase ${
            loc === current
              ? "bg-mist font-semibold text-heading"
              : "text-muted hover:text-heading"
          }`}
        >
          {loc}
        </Link>
      ))}
    </div>
  );
}
