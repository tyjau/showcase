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

const lines = [];
if (apiBase) lines.push(`NEXT_PUBLIC_API_BASE=${apiBase}`);
if (guardianUrl) lines.push(`GUARDIAN_URL=${guardianUrl}`);
if (catalogKey) lines.push(`CATALOG_API_KEY=${catalogKey}`);

if (process.env.GITHUB_ENV && lines.length) {
  appendFileSync(process.env.GITHUB_ENV, lines.join("\n") + "\n");
}

// URLs are public; NEVER print the key value.
console.log(
  "forge → NEXT_PUBLIC_API_BASE:", apiBase || "(default)",
  "| GUARDIAN_URL:", guardianUrl || "(default)",
  "| CATALOG_API_KEY:", catalogKey ? "(set)" : "(empty)",
);
if (!apiBase) {
  console.log("⚠ pas de api_base_url dans le snapshot → build avec les defaults dev (saas.test)");
}
