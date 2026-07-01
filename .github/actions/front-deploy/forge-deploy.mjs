// forge-deploy.mjs — forge les COORDONNÉES + SECRETS de déploiement depuis le snapshot de release
// et les expose aux étapes deploy via $GITHUB_ENV. Objectif : « dé-saturer » GitHub — host/port/user/
// remote_dir/smoke_url ET les creds de transport (clé SSH, mdp FTPS) voyagent dans le snapshot
// temporaire (DB → Ignition, secret-ref baké au release) au lieu d'être des secrets/vars permanents.
//
// CLÉ PRIVÉE SSH / MDP FTPS (deploy-creds managés, cf. docs/SPEC-deploy-creds-managed.md) : routés ici
// DEPUIS LE SNAPSHOT s'il les porte, sinon repli sur le secret permanent (FB_SSH_KEY/FB_FTP_PASS) →
// migration douce « dossier-first ». TOUJOURS masqués (::add-mask:: par ligne, PEM multi-ligne géré).
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
  // SECRETS de transport (deploy-creds managés) : la clé SSH / le mdp FTPS viennent du snapshot
  // (secret-ref baké au release) sinon du secret permanent (FB_SSH_KEY=FRONT_SSH_KEY,
  // FB_FTP_PASS=FRONT_FTP_PASS). TOUJOURS masqués. dossier-first → retrait progressif des secrets.
  SSH_KEY:        [d.ssh_key,        process.env.FB_SSH_KEY,    true],
  FTP_PASS:       [d.ftps_pass,      process.env.FB_FTP_PASS,   true],
};

const lines = [];
const fromSnap = [];
const fromFallback = [];
for (const [name, [snapVal, fb, mask]] of Object.entries(MAP)) {
  const hasSnap = snapVal != null && String(snapVal) !== "";
  const v = hasSnap ? String(snapVal) : (fb ?? "");
  if (v === "") continue; // ni snapshot ni fallback → on n'émet rien (l'étape deploy gardera son défaut/erreur)
  (hasSnap ? fromSnap : fromFallback).push(name);
  if (mask) {
    // ::add-mask:: agit PAR LIGNE → masquer chaque ligne non vide (une clé privée PEM est multi-ligne).
    for (const ln of v.split(/\r?\n/)) { const t = ln.trim(); if (t !== "") console.log(`::add-mask::${t}`); }
  }
  if (v.includes("\n")) {
    // valeur MULTI-LIGNE (clé privée PEM) → heredoc $GITHUB_ENV ; `NAME=valeur` ne gère qu'UNE ligne.
    const delim = `__FORGE_EOF_${name}__`;
    lines.push(`${name}<<${delim}\n${v}\n${delim}`);
  } else {
    lines.push(`${name}=${v}`);
  }
}

if (process.env.GITHUB_ENV) {
  appendFileSync(process.env.GITHUB_ENV, lines.join("\n") + "\n");
}
console.log(
  `forge-deploy → ${lines.length} coord(s) ; snapshot: [${fromSnap.join(",") || "—"}] ; fallback permanent: [${fromFallback.join(",") || "—"}]`,
);
