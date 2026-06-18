// forge-deploy.mjs — forge les COORDONNÉES de déploiement (non secrètes) depuis le snapshot
// de release et les expose aux étapes deploy via $GITHUB_ENV. Objectif : « dé-saturer » GitHub —
// host/port/user/remote_dir/smoke_url voyagent dans le snapshot temporaire (DB → Ignition) au lieu
// d'être des secrets/vars permanents par repo/env.
//
// La CLÉ PRIVÉE SSH N'EST PAS routée ici : elle reste un secret permanent (FRONT_SSH_KEY, posé une
// fois, comme une deploy key) — pas de re-transmission de clé privée à chaque release.
//
// FALLBACK : si le snapshot ne porte pas de bloc `deploy` (mode mock / pas encore authored), on
// retombe sur les valeurs permanentes FB_* (secrets/vars actuels) → comportement INCHANGÉ.
//
// ⚠️ SOURCE CANONIQUE : skyrh-back/deploy/cd/actions/front-deploy/ — NE PAS éditer dans un front
//    (copie vendored, régénérée par `composer cd:sync`). Voir deploy/cd/README.md.
//
// Local : `RELEASE_SNAPSHOT='{...}' FB_HOST=... node forge-deploy.mjs` (GITHUB_ENV absent = no-op fichier).
import { appendFileSync } from "node:fs";

const repo = process.env.FORGE_REPO || "tyjau/ignition";
let snap = {};
try {
  snap = JSON.parse(process.env.RELEASE_SNAPSHOT || "{}");
} catch {
  console.error("forge-deploy: RELEASE_SNAPSHOT invalide (JSON)");
  process.exit(1);
}

const d = snap?.products?.[repo]?.deploy ?? {};

// nom $GITHUB_ENV → [valeur snapshot, valeur de repli permanente, masquer ?]
const MAP = {
  SSH_HOST:       [d.ssh_host,       process.env.FB_HOST,       true],
  SSH_PORT:       [d.ssh_port,       process.env.FB_PORT,       false],
  SSH_USER:       [d.ssh_user,       process.env.FB_USER,       true],
  SSH_REMOTE_DIR: [d.ssh_remote_dir, process.env.FB_REMOTE_DIR, false],
  SMOKE_URL:      [d.smoke_url,      process.env.FB_SMOKE_URL,  false],
};

const lines = [];
const fromSnap = [];
const fromFallback = [];
for (const [name, [snapVal, fb, mask]] of Object.entries(MAP)) {
  const hasSnap = snapVal != null && String(snapVal) !== "";
  const v = hasSnap ? String(snapVal) : (fb ?? "");
  if (v === "") continue; // ni snapshot ni fallback → on n'émet rien (l'étape deploy gardera son défaut/erreur)
  (hasSnap ? fromSnap : fromFallback).push(name);
  if (mask) console.log(`::add-mask::${v}`); // jamais la valeur en clair dans les logs
  lines.push(`${name}=${v}`);
}

if (process.env.GITHUB_ENV) {
  appendFileSync(process.env.GITHUB_ENV, lines.join("\n") + "\n");
}
console.log(
  `forge-deploy → ${lines.length} coord(s) ; snapshot: [${fromSnap.join(",") || "—"}] ; fallback permanent: [${fromFallback.join(",") || "—"}]`,
);
