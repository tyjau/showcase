"use client";

import { usePartner } from "./partner-provider";

/**
 * Brand mark — co-branded when a partner config is loaded (partner logo, or the
 * partner name beside the mark), otherwise the default SkyRH mark. The triangle
 * uses the `--brand-sky` CSS variable so it follows the partner's primary colour.
 */
export function BrandLogo({ className = "" }: { className?: string }) {
  const { partner } = usePartner();

  if (partner?.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={partner.logo_url}
        alt={partner.brand_name ?? "logo"}
        className={`h-6 w-auto ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 font-bold text-navy ${className}`}
    >
      <svg viewBox="0 0 132 116" width="22" height="20" aria-hidden="true">
        <polygon points="6,8 126,8 66,108" fill="var(--brand-sky, #0F9ED5)" />
      </svg>
      <span className="text-[18px] leading-none">
        {partner?.brand_name ? (
          partner.brand_name
        ) : (
          <>
            Sky<span className="text-sky">RH</span>
          </>
        )}
      </span>
    </span>
  );
}
