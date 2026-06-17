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
import { appendFileSync } from "node:fs";

const repo = process.env.FORGE_REPO || "tyjau/showcase";
let snap = {};
try {
  snap = JSON.parse(process.env.RELEASE_SNAPSHOT || "{}");
} catch {
  console.error("forge: RELEASE_SNAPSHOT is not valid JSON");
  process.exit(1);
}

const cfg = snap?.products?.[repo]?.config ?? {};
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
