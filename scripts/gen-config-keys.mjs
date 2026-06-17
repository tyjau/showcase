// scripts/gen-config-keys.mjs
// Génère/vérifie deploy/config-keys.json = le CONTRAT de config de ce front (showcase) : les clés
// que la forge lit dans le snapshot (cfg.X). DÉRIVÉ de la source, jamais maintenu à la main.
//   node scripts/gen-config-keys.mjs           → (ré)génère deploy/config-keys.json
//   node scripts/gen-config-keys.mjs --check    → échoue si le committé ≠ le régénéré (gate CI)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const FORGE = "scripts/forge-config.mjs";
const OUT = "deploy/config-keys.json";
const PRODUCT = "tyjau/showcase";

const toSnake = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();

const src = readFileSync(FORGE, "utf8");
const keys = new Set();
for (const m of src.matchAll(/\bcfg\.([A-Za-z_][A-Za-z0-9_]*)/g)) {
  const raw = m[1];
  if (/^[A-Z0-9_]+$/.test(raw)) continue; // alias/nom de sortie en MAJUSCULES (ex. VITE_*) → pas une clé de config
  keys.add(toSnake(raw));
}
const list = [...keys].sort();
const json = JSON.stringify({ product: PRODUCT, keys: list }, null, 2) + "\n";

const check = process.argv.includes("--check");
let committed = null;
try { committed = readFileSync(OUT, "utf8"); } catch {}

if (check) {
  if (committed !== json) {
    console.error(`❌ ${OUT} obsolète vs ${FORGE}. Régénère : npm run gen:config-keys`);
    console.error(`   clés attendues : ${list.join(", ") || "(aucune)"}`);
    process.exit(1);
  }
  console.log(`✓ ${OUT} à jour — ${list.length} clé(s) : ${list.join(", ")}`);
} else {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, json);
  console.log(`✓ ${OUT} généré — ${list.length} clé(s) : ${list.join(", ")}`);
}
