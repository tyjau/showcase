// scripts/forge-config.mjs — forge showcase's build-time config from the release snapshot.
//
// The CD sets RELEASE_SNAPSHOT (a temporary repo secret = the Guardian dossier snapshot);
// we extract THIS repo's config and emit the build env vars to $GITHUB_ENV so the SAME
// production build bakes them:
//   - NEXT_PUBLIC_API_BASE : public backend URL, inlined into the client bundle for the
//     self-signup funnel (lib/api.ts).
//   - GUARDIAN_URL         : backend URL for the BUILD-TIME catalog fetch (lib/catalog.ts,
//     server-side — never shipped to the browser).
//   - CATALOG_API_KEY      : scoped publishable key for that catalog fetch (X-API-KEY).
//   - NEXT_PUBLIC_TURNSTILE_SITEKEY : public Cloudflare Turnstile sitekey, inlined so the
//     front captcha widget renders in prod (components/turnstile-widget.tsx). Public value.
//
// No-op locally (GITHUB_ENV unset) and when no snapshot is present (keeps the dev defaults,
// e.g. saas.test) — a production CD without a snapshot just logs a warning.
//   Local: `RELEASE_SNAPSHOT='{...}' node scripts/forge-config.mjs`
import { appendFileSync, readFileSync } from "node:fs";

const repo = process.env.FORGE_REPO || "tyjau/showcase";
let snap = {};
try {
  // RELEASE_SNAPSHOT en env (CD) ; sinon RELEASE_SNAPSHOT_FILE = chemin d'un snapshot exporté
  // (build local/dev sans Guardian, Lot 4 du plan) ; sinon objet vide (mock).
  snap = JSON.parse(
    process.env.RELEASE_SNAPSHOT
      || (process.env.RELEASE_SNAPSHOT_FILE ? readFileSync(process.env.RELEASE_SNAPSHOT_FILE, "utf8") : "")
      || "{}",
  );
} catch {
  console.error("forge: RELEASE_SNAPSHOT is not valid JSON");
  process.exit(1);
}

const cfg = snap?.products?.[repo]?.config ?? {};

// Turnstile : clé DÉMO (Cloudflare test sitekey `1x00000000000000000000AA`, always-passes — valeur PUBLIQUE)
// si le snapshot n'en fournit pas encore. Débloque le build ; la vraie clé arrivera via le snapshot Guardian
// (config_json) d'un déploiement Ignition ultérieur — qui ÉCRASE ce défaut (appliqué SEULEMENT si absent/vide).
// N'agit QUE sur un déploiement RÉEL (cfg non vide) — le mode mock/dev à config vide reste no-op.
if (Object.keys(cfg).length > 0 && (cfg.turnstile_sitekey == null || cfg.turnstile_sitekey === "")) {
  cfg.turnstile_sitekey = "1x00000000000000000000AA"; // placeholder démo — remplacé par le vrai sitekey via Ignition
}

// Garde-fou complétude (rempart dur au deploy) : si une config produit est fournie — déploiement
// RÉEL, pas le mode mock à config vide — elle doit porter TOUTES les clés du contrat
// deploy/config-keys.json, sinon le bundle partirait avec des valeurs vides. Config vide → exempt.
if (Object.keys(cfg).length > 0) {
  let contract = [];
  try { contract = JSON.parse(readFileSync("deploy/config-keys.json", "utf8")).keys ?? []; } catch { /* contrat absent → on ne bloque pas */ }
  const missing = contract.filter((k) => cfg[k] == null || cfg[k] === "");
  if (missing.length) {
    console.error(`forge: config_json incomplet vs contrat — clés requises manquantes : ${missing.join(", ")}`);
    process.exit(1);
  }
}
const apiBase = cfg.api_base_url ?? cfg.apiBaseUrl ?? process.env.NEXT_PUBLIC_API_BASE ?? "";
// Catalog fetch target defaults to the same backend as the public API.
const guardianUrl = cfg.guardian_url ?? cfg.guardianUrl ?? apiBase;
const catalogKey = cfg.catalog_api_key ?? cfg.catalogApiKey ?? "";
// Cloudflare Turnstile sitekey — PUBLIC (safe to inline + log). Empty in dev/no-snapshot,
// so the widget stays a no-op there; set per-env in the Guardian config_json for prod.
const turnstileSitekey = cfg.turnstile_sitekey ?? cfg.turnstileSitekey ?? "";

// 🔒 The catalog key is a SECRET promoted into $GITHUB_ENV below. GitHub only auto-masks
// `secrets.*`, NOT values we inject — so register a mask explicitly, else any later env dump
// during the build leaks it in plaintext. `::add-mask::` redacts the value across the rest of
// the job log (defence-in-depth, independent of which step prints it).
if (catalogKey && process.env.GITHUB_ACTIONS) {
  console.log(`::add-mask::${catalogKey}`);
}

const lines = [];
if (apiBase) lines.push(`NEXT_PUBLIC_API_BASE=${apiBase}`);
if (guardianUrl) lines.push(`GUARDIAN_URL=${guardianUrl}`);
if (catalogKey) lines.push(`CATALOG_API_KEY=${catalogKey}`);
if (turnstileSitekey) lines.push(`NEXT_PUBLIC_TURNSTILE_SITEKEY=${turnstileSitekey}`);

if (process.env.GITHUB_ENV && lines.length) {
  appendFileSync(process.env.GITHUB_ENV, lines.join("\n") + "\n");
}

// URLs are public; NEVER print the key value.
console.log(
  "forge → NEXT_PUBLIC_API_BASE:", apiBase || "(default)",
  "| GUARDIAN_URL:", guardianUrl || "(default)",
  "| CATALOG_API_KEY:", catalogKey ? "(set)" : "(empty)",
  "| TURNSTILE_SITEKEY:", turnstileSitekey || "(empty)",
);
if (!apiBase) {
  console.log("⚠ pas de api_base_url dans le snapshot → build avec les defaults dev (saas.test)");
}
