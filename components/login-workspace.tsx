"use client";

import { useState } from "react";
import Link from "next/link";

type Dict = Record<string, string>;

// Tenants live on per-workspace subdomains (e.g. acme.skyrh.app). The marketing
// site has no session of its own, so "Sign in" routes the user to their workspace.
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "skyrh.app";

export function LoginWorkspace({ lang, dict }: { lang: string; dict: Dict }) {
  const [slug, setSlug] = useState("");
  const clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

  function go() {
    if (clean) window.location.href = `https://${clean}.${APP_DOMAIN}`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">{dict.title}</h1>
      <p className="mt-1 text-muted">{dict.lead}</p>

      <label className="mt-6 block">
        <span className="mb-1 block text-sm font-medium text-ink">
          {dict.workspaceLabel}
        </span>
        <div className="flex items-stretch overflow-hidden rounded-lg border border-line focus-within:border-sky">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go()}
            placeholder={dict.placeholder}
            autoFocus
            className="w-full px-3 py-2.5 text-sm outline-none"
          />
          <span className="flex items-center whitespace-nowrap bg-mist px-3 text-sm text-muted">
            .{APP_DOMAIN}
          </span>
        </div>
      </label>

      <button
        type="button"
        disabled={!clean}
        onClick={go}
        className={`mt-6 w-full rounded-full px-6 py-3 text-sm font-semibold ${
          clean ? "bg-sky text-white" : "cursor-not-allowed bg-mist text-muted"
        }`}
      >
        {dict.cta}
      </button>

      <p className="mt-6 text-center text-sm text-muted">
        {dict.noWorkspace}{" "}
        <Link
          href={`/${lang}/signup`}
          className="font-semibold text-sky hover:underline"
        >
          {dict.signupCta}
        </Link>
      </p>
    </div>
  );
}
