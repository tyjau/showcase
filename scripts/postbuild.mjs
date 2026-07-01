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
import { existsSync, writeFileSync, readFileSync } from "node:fs";
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
