// scripts/forge-version.mjs — écrit <outDir>/version.json dans le bundle déployé pour que la SONDE
// de santé Guardian (SUIVI-HEALTH WI2) lise QUEL build est en ligne : GET <base>/version.json.
//
// Sources (CD) : RELEASE_SNAPSHOT (le snapshot du dossier Guardian — porte version + build_sequence)
// ou RELEASE_SNAPSHOT_FILE (export local/dev sans Guardian) ; PRODUCT (slug produit) + le dossier
// web-root déployé (argv[2] ou VERSION_OUT_DIR). Repli sur le tag de release (GITHUB_REF_NAME) pour
// la version. Best-effort : un snapshot absent écrit quand même un marqueur (le liveness 200 reste
// utile ; aucune valeur secrète n'entre dans version.json).
//   Local : RELEASE_SNAPSHOT='{"version":"1.2.3","build_sequence":7}' PRODUCT=lex node scripts/forge-version.mjs dist
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const outDir = process.argv[2] || process.env.VERSION_OUT_DIR || "";
if (!outDir) {
  console.error("forge-version: pas de dossier de sortie (argv[2] ou VERSION_OUT_DIR) — saut");
  process.exit(0);
}

let snap = {};
try {
  snap = JSON.parse(
    process.env.RELEASE_SNAPSHOT
      || (process.env.RELEASE_SNAPSHOT_FILE ? readFileSync(process.env.RELEASE_SNAPSHOT_FILE, "utf8") : "")
      || "{}",
  );
} catch {
  console.error("forge-version: RELEASE_SNAPSHOT invalide (JSON) — marqueur best-effort");
}

const tag = (process.env.VERSION || process.env.GITHUB_REF_NAME || "").replace(/^v/, "");
const payload = {
  product: process.env.PRODUCT || snap.product || "",
  version: (typeof snap.version === "string" && snap.version) || tag || "dev",
  build_sequence: snap.build_sequence ?? null,
  built_at: new Date().toISOString(),
};

if (!existsSync(outDir)) { mkdirSync(outDir, { recursive: true }); }
writeFileSync(join(outDir, "version.json"), JSON.stringify(payload, null, 2) + "\n");
console.log("forge-version →", join(outDir, "version.json"), JSON.stringify(payload));
