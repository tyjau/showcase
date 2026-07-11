"use client";

// Corps de la 404 globale. Vit HORS de app/[lang]/layout.tsx (pas de header/footer/dictionnaire ni de
// `lang` dans l'URL), donc autonome : on détecte la langue côté client (comme le gateway
// out/index.html) et on préfixe les liens vers la bonne locale. Les <Link> Next sont préfixés
// automatiquement par le basePath (/showcase en déploiement).
import Link from "next/link";
import { useEffect, useState } from "react";
import { Home, ArrowRight } from "lucide-react";

const T = {
  en: {
    eyebrow: "Error 404",
    title: "This page can't be found",
    sub: "It may have moved, or the link is out of date. No worries — here's the way back.",
    home: "Back to home",
    links: [
      { href: "features", label: "Features" },
      { href: "pricing", label: "Pricing" },
      { href: "contact", label: "Contact us" },
    ],
  },
  fr: {
    eyebrow: "Erreur 404",
    title: "Cette page est introuvable",
    sub: "Elle a peut-être été déplacée, ou le lien n'est plus à jour. Pas d'inquiétude — voici par où revenir.",
    home: "Retour à l'accueil",
    links: [
      { href: "features", label: "Fonctionnalités" },
      { href: "pricing", label: "Tarifs" },
      { href: "contact", label: "Nous contacter" },
    ],
  },
} as const;

export function NotFoundContent() {
  const [lang, setLang] = useState<"en" | "fr">("en");
  useEffect(() => {
    const l = (navigator.language || "en").slice(0, 2).toLowerCase();
    setLang(l === "fr" ? "fr" : "en");
    // La coquille sert toutes les locales depuis un seul out/404.html : le <html lang="en"> statique
    // est corrigé ici une fois la langue réelle du visiteur connue.
    document.documentElement.lang = l === "fr" ? "fr" : "en";
  }, []);
  const t = T[lang];

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-hero-bg px-5 py-20 text-center text-hero-fg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_320px_at_50%_-10%,rgba(15,158,213,0.22),transparent_70%)]" />
      <div className="relative">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-sky-soft">{t.eyebrow}</p>
        <p className="mt-3 bg-gradient-to-b from-sky-soft to-sky-strong bg-clip-text text-[110px] font-extrabold leading-none tracking-tight text-transparent sm:text-[150px]">
          404
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{t.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-hero-fg-muted">{t.sub}</p>

        <Link
          href={`/${lang}/`}
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-sky-strong px-7 py-3 font-semibold text-white transition-colors hover:bg-[#08607f]"
        >
          <Home size={18} /> {t.home}
        </Link>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm">
          {t.links.map((l) => (
            <Link
              key={l.href}
              href={`/${lang}/${l.href}/`}
              className="inline-flex items-center gap-1.5 font-semibold text-sky-soft transition-colors hover:text-white"
            >
              {l.label}
              <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
