// Post-export fixups for the static build (out/).
//
// 1. Copy public/.htaccess → out/.htaccess, substituting __BASE_PATH__ with the deploy sub-path
//    (BASE_PATH). Next copies most of public/ into the export, but dotfiles are skipped, so the
//    Apache config is placed explicitly.
// 2. Generate out/index.html — a root locale gateway. The app lives entirely under
//    /[lang]/ (no root page, and output:export has no middleware), so the bare
//    domain would 404. This static index bounces visitors to a locale: it prefers
//    the browser language (fr → /fr/, else the default), with a <meta refresh>
//    fallback for no-JS and a visible link as the last resort. Apache's .htaccess
//    does the same at the HTTP layer when mod_rewrite is on; this guarantees the
//    behaviour on any static host regardless.
//
// Both the gateway and the .htaccess redirects are prefixed with BASE_PATH: the site is served under a
// sub-path in deployment (e.g. /showcase/), so an absolute "/en/" would 404 off the sub-path.
import { existsSync, writeFileSync, readFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const DEFAULT_LOCALE = "en";
const LOCALES = ["en", "fr"];
// Sub-path the site is served under (e.g. "/showcase"), normalised without a trailing slash. Empty →
// served at the domain root (dev, or a root-served prod). Mirrors next.config.mjs BASE_PATH.
const BASE = (process.env.BASE_PATH || "").replace(/\/+$/, "");

if (!existsSync(OUT)) {
  console.log("[postbuild] no out/ directory — skipping (not a static export build).");
  process.exit(0);
}

// 1. .htaccess — substitute __BASE_PATH__ → BASE so the mod_rewrite root redirects hit the sub-path.
const htaccessSrc = join("public", ".htaccess");
if (existsSync(htaccessSrc)) {
  const htaccess = readFileSync(htaccessSrc, "utf8").replaceAll("__BASE_PATH__", BASE);
  writeFileSync(join(OUT, ".htaccess"), htaccess);
  console.log(`[postbuild] wrote out/.htaccess (BASE_PATH='${BASE}')`);
}

// 2. Root locale gateway — all targets prefixed with BASE so they land under the deploy sub-path.
const localesJson = JSON.stringify(LOCALES);
const indexHtml = `<!doctype html>
<html lang="${DEFAULT_LOCALE}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>SkyRH</title>
    <link rel="canonical" href="${BASE}/${DEFAULT_LOCALE}/" />
    <meta http-equiv="refresh" content="0; url=${BASE}/${DEFAULT_LOCALE}/" />
    <script>
      (function () {
        try {
          var base = ${JSON.stringify(BASE)};
          var locales = ${localesJson};
          var pref = (navigator.language || "${DEFAULT_LOCALE}").slice(0, 2).toLowerCase();
          var target = locales.indexOf(pref) !== -1 ? pref : "${DEFAULT_LOCALE}";
          location.replace(base + "/" + target + "/");
        } catch (e) {
          location.replace("${BASE}/${DEFAULT_LOCALE}/");
        }
      })();
    </script>
  </head>
  <body>
    <a href="${BASE}/${DEFAULT_LOCALE}/">Continue to SkyRH</a>
  </body>
</html>
`;
writeFileSync(join(OUT, "index.html"), indexHtml);
console.log(`[postbuild] wrote out/index.html (root locale gateway → ${BASE}/${DEFAULT_LOCALE}/)`);

// 3. Sitemap + robots (pages publiques indexables). SITE = URL publique de base (origin + sous-chemin
//    éventuel), dérivée de FRONT_SMOKE_URL (l'URL de smoke EST l'URL publique) au build CI ; absente en
//    local → on saute. Les chemins de out/ sont déjà relatifs à la racine de déploiement (= le sous-chemin),
//    donc SITE les préfixe directement. Pages d'auth/utilitaires exclues.
const SITE = (process.env.SITE_URL || process.env.FRONT_SMOKE_URL || "").replace(/\/+$/, "");
if (SITE) {
  const EXCLUDE = new Set(["login", "signup", "account", "partner", "forgot-password", "status"]);
  // Map chemin-relatif-à-la-locale ("" = accueil, "features/MGMT00"…) → locales présentes, pour émettre
  // les alternates hreflang : Google veut chaque version listée avec le set complet + un x-default.
  const byPath = new Map();
  const walk = (dir, rel) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue; // _next, dotfiles
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(join(dir, entry.name), relPath);
      } else if (entry.name === "index.html" && rel) {
        const segs = rel.split("/"); // ex. "en/features/MGMT00" → ["en","features","MGMT00"]
        if (!LOCALES.includes(segs[0])) continue; // hors locale (404, etc.) — pas une page de contenu
        if (segs.length >= 2 && EXCLUDE.has(segs[1])) continue; // page non-publique (auth/utilitaire)
        const key = segs.slice(1).join("/"); // "" pour l'accueil /<locale>/
        if (!byPath.has(key)) byPath.set(key, new Set());
        byPath.get(key).add(segs[0]);
      }
    }
  };
  walk(OUT, "");
  const loc = (locale, key) => `${SITE}/${locale}${key ? `/${key}` : ""}/`;
  const urls = [];
  for (const key of [...byPath.keys()].sort()) {
    const locales = LOCALES.filter((l) => byPath.get(key).has(l));
    const alts = [
      ...locales.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${loc(l, key)}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc(DEFAULT_LOCALE, key)}"/>`,
    ].join("\n");
    for (const l of locales) {
      urls.push(`  <url>\n    <loc>${loc(l, key)}</loc>\n${alts}\n  </url>`);
    }
  }
  writeFileSync(
    join(OUT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`,
  );
  writeFileSync(join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
  console.log(`[postbuild] wrote out/sitemap.xml (${urls.length} URLs, hreflang) + out/robots.txt (SITE=${SITE})`);

  // security.txt (RFC 9116) — divulgation responsable. Le dossier .well-known est un dotfile, donc
  // ignoré par l'export Next : on le génère ici (comme .htaccess). Contact = page de contact publique
  // (aucun email inventé), Policy = Trust Center. Expires est requis par la RFC → build + 1 an.
  const secExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  mkdirSync(join(OUT, ".well-known"), { recursive: true });
  writeFileSync(
    join(OUT, ".well-known", "security.txt"),
    `Contact: ${SITE}/${DEFAULT_LOCALE}/contact\n` +
      `Policy: ${SITE}/${DEFAULT_LOCALE}/trust\n` +
      `Preferred-Languages: en, fr\n` +
      `Expires: ${secExpires}\n`,
  );
  console.log(`[postbuild] wrote out/.well-known/security.txt (expires ${secExpires.slice(0, 10)})`);
} else {
  console.log("[postbuild] pas de SITE_URL/FRONT_SMOKE_URL → sitemap/robots ignorés (build local)");
}
