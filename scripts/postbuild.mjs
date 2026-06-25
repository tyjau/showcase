// Post-export fixups for the static build (out/).
//
// 1. Copy public/.htaccess → out/.htaccess. Next copies most of public/ into the
//    export, but dotfiles are skipped, so the Apache config is placed explicitly.
// 2. Generate out/index.html — a root locale gateway. The app lives entirely under
//    /[lang]/ (no root page, and output:export has no middleware), so the bare
//    domain would 404. This static index bounces visitors to a locale: it prefers
//    the browser language (fr → /fr/, else the default), with a <meta refresh>
//    fallback for no-JS and a visible link as the last resort. Apache's .htaccess
//    does the same at the HTTP layer when mod_rewrite is on; this guarantees the
//    behaviour on any static host regardless.
import { existsSync, copyFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const DEFAULT_LOCALE = "en";
const LOCALES = ["en", "fr"];

if (!existsSync(OUT)) {
  console.log("[postbuild] no out/ directory — skipping (not a static export build).");
  process.exit(0);
}

// 1. .htaccess
const htaccessSrc = join("public", ".htaccess");
if (existsSync(htaccessSrc)) {
  copyFileSync(htaccessSrc, join(OUT, ".htaccess"));
  console.log("[postbuild] copied .htaccess → out/.htaccess");
}

// 2. Root locale gateway
const localesJson = JSON.stringify(LOCALES);
const indexHtml = `<!doctype html>
<html lang="${DEFAULT_LOCALE}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>SkyRH</title>
    <link rel="canonical" href="/${DEFAULT_LOCALE}/" />
    <meta http-equiv="refresh" content="0; url=/${DEFAULT_LOCALE}/" />
    <script>
      (function () {
        try {
          var locales = ${localesJson};
          var pref = (navigator.language || "${DEFAULT_LOCALE}").slice(0, 2).toLowerCase();
          var target = locales.indexOf(pref) !== -1 ? pref : "${DEFAULT_LOCALE}";
          location.replace("/" + target + "/");
        } catch (e) {
          location.replace("/${DEFAULT_LOCALE}/");
        }
      })();
    </script>
  </head>
  <body>
    <a href="/${DEFAULT_LOCALE}/">Continue to SkyRH</a>
  </body>
</html>
`;
writeFileSync(join(OUT, "index.html"), indexHtml);
console.log("[postbuild] wrote out/index.html (root locale gateway → /" + DEFAULT_LOCALE + "/)");
