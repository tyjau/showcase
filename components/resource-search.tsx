"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

// Hero search bar from the Ressources mockup. The mockup's input is presentational;
// here it routes to the help center on submit so it's actually useful.
export function ResourceSearch({ lang, placeholder }: { lang: string; placeholder: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/${lang}/help`);
      }}
      className="relative mx-auto mt-7 max-w-lg"
    >
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-hero-fg-muted">
        <Search size={18} />
      </span>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-full border border-white/20 bg-white/[0.06] py-3.5 pl-11 pr-4 text-[15px] text-white placeholder:text-hero-fg-muted/70 outline-none focus:border-sky-soft"
      />
    </form>
  );
}
