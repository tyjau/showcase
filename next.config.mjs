/** @type {import('next').NextConfig} */

// Le site est servi sous un sous-chemin en déploiement (ex. rh.ikwhat.com/showcase/) mais à la racine
// en dev. `basePath` préfixe les <Link> ET les assets /_next ; sans lui, servi sous /showcase/, tout
// tape la racine du domaine → 404 (page nue, nav cassée). Piloté par BASE_PATH (posé au build CI depuis
// l'URL publique) ; vide → racine (dev, ou prod servie à la racine). Normalisé sans slash final.
// NEXT_PUBLIC_BASE_PATH réexpose la valeur au bundle pour withBase() (lib/asset.ts) — les <img src="/…">
// bruts ne sont PAS préfixés par basePath, contrairement aux <Link>/_next.
const BASE_PATH = (process.env.BASE_PATH || "").replace(/\/+$/, "");

const nextConfig = {
  // Static export only at build time; dev renders dynamic routes normally.
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  ...(BASE_PATH ? { basePath: BASE_PATH } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
