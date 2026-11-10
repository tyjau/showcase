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

// ── Environnement (F-0016 / R8) ─────────────────────────────────────────────────────────────────
// SHOWCASE_ENV = production | staging | development, posé par deploy.yml (dérivé du tag). Sert à NE PAS
// traiter la production comme la staging : une clé Turnstile de TEST en production = inscription sans
// anti-robot, sans un mot. ÉCHEC FERMÉ : absent sous GitHub Actions → production ; inconnu → erreur.
const KNOWN_ENVS = ["production", "staging", "development"];
const envName = (process.env.SHOWCASE_ENV || "").trim().toLowerCase()
  || (process.env.GITHUB_ACTIONS ? "production" : "development");
if (!KNOWN_ENVS.includes(envName)) {
  console.error(`forge: SHOWCASE_ENV="${process.env.SHOWCASE_ENV}" inconnu — valeurs admises : ${KNOWN_ENVS.join(", ")}`);
  process.exit(1);
}
const isProduction = envName === "production";

// Clés de TEST publiques de Cloudflare Turnstile : 1x…AA (passe toujours), 2x…AB (bloque toujours),
// 1x…BB / 2x…BB (invisibles), 3x…FF (défi interactif forcé). Les vraies clés commencent par `0x` :
// aucune collision possible. On reconnaît la FAMILLE (`[123]x` + zéros), pas une liste figée.
const TEST_KEY_DEFAULT = "1x00000000000000000000AA";
const isTestSitekey = (k) => /^[123]x0{8,}/i.test(String(k ?? "").trim());
const rawSitekey = String(cfg.turnstile_sitekey ?? cfg.turnstileSitekey ?? "").trim();
const sitekeyMissing = rawSitekey === "";

// PRODUCTION : clé absente ou de test → la forge S'ARRÊTE (rien n'est écrit dans $GITHUB_ENV, le build
// ne part pas). Y compris snapshot vide (secret RELEASE_SNAPSHOT_PROD non posé), qui sinon partirait
// avec les valeurs de développement. La vraie clé se pose dans le config_json de Guardian, via Ignition.
if (isProduction && (sitekeyMissing || isTestSitekey(rawSitekey))) {
  console.error(
    sitekeyMissing
      ? "forge: PRODUCTION refusée — clé Turnstile `turnstile_sitekey` ABSENTE de la config du snapshot"
        + (Object.keys(cfg).length === 0 ? " (snapshot vide : secret RELEASE_SNAPSHOT_PROD non posé ?)" : "") + "."
      : `forge: PRODUCTION refusée — \`turnstile_sitekey\` est une clé Cloudflare de TEST (${rawSitekey}), qui laisse tout passer.`,
  );
  console.error(
    "  → Posez la VRAIE clé de site Turnstile (commence par 0x, compte Cloudflare) dans le config_json de Guardian\n"
    + "    pour ce produit (tyjau/showcase), via Ignition, puis republiez le snapshot de production.",
  );
  process.exit(1);
}

// STAGING / DÉVELOPPEMENT : comportement inchangé — clé DÉMO (`1x00000000000000000000AA`, valeur PUBLIQUE)
// si une config RÉELLE (cfg non vide) n'en fournit pas ; le mode mock/dev à config vide reste no-op.
// Un avertissement VISIBLE (sortie + annotation GitHub) dit que cette clé ne protège rien.
if (Object.keys(cfg).length > 0 && sitekeyMissing) {
  cfg.turnstile_sitekey = TEST_KEY_DEFAULT; // placeholder démo — remplacé par le vrai sitekey via Ignition
}
if (!isProduction && (isTestSitekey(cfg.turnstile_sitekey) || (envName === "staging" && sitekeyMissing))) {
  const why = sitekeyMissing && Object.keys(cfg).length === 0 ? "absente" : "de TEST (laisse tout passer)";
  const msg = `Turnstile ${envName} : clé ${why} — l'inscription n'a PAS d'anti-robot ici. Acceptable hors production ; refusé en production.`;
  console.warn(`forge: ⚠ ${msg}`);
  if (process.env.GITHUB_ACTIONS) console.log(`::warning title=Turnstile (${envName})::${msg}`);
}

// App skyrh (produit RH du tenant) : URL de base bakée pour « ouvrir mon espace » (lib/harmony.appHref).
// Défaut = sous-domaine par tenant (prod) via {workspace} ; écrasé par env (staging rh.ikwhat.com/skyrh/).
// REQUISE (dot-access cfg.app_url ⇒ contrat config-keys). Le CRM Harmony, lui, est OPTIONNEL (bracket).
if (Object.keys(cfg).length > 0 && (cfg.app_url == null || cfg.app_url === "")) {
  cfg.app_url = "https://{workspace}.skyrh.app"; // défaut sous-domaine — remplacé par le vrai via Ignition
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
// guardian_url est OPTIONNEL : par défaut le build tape le catalogue au MÊME back que le funnel client
// (api_base_url). Lu via bracket (cfg["…"]) pour NE PAS l'imposer dans le contrat config-keys.json — une
// seule URL à saisir dans le cas courant. Surcharge possible via le config_json si le build doit un jour
// taper une URL interne distincte du navigateur ; il faudra alors le re-déclarer au contrat (accès point).
const guardianUrl = cfg["guardian_url"] ?? cfg["guardianUrl"] ?? apiBase;
const catalogKey = cfg.catalog_api_key ?? cfg.catalogApiKey ?? "";
// Cloudflare Turnstile sitekey — PUBLIC (safe to inline + log). Empty in dev/no-snapshot,
// so the widget stays a no-op there; set per-env in the Guardian config_json for prod.
const turnstileSitekey = cfg.turnstile_sitekey ?? cfg.turnstileSitekey ?? "";
// App skyrh (produit RH) — REQUISE (dot-access ⇒ contrat config-keys). {workspace} résolu côté client.
const appUrl = cfg.app_url ?? cfg.appUrl ?? "";
// CRM Harmony — OPTIONNEL (bracket ⇒ HORS contrat, comme ga_id/gsc) : app séparée, pas toujours déployée.
// Vide ⇒ aucun lien CRM dans le portail. Staging : https://rh.ikwhat.com/harmony.
const harmonyUrl = cfg["harmony_url"] ?? cfg["harmonyUrl"] ?? "";
// Google Analytics 4 (démo) — OPTIONNEL. Lu via bracket → PAS ajouté au contrat config-keys.json (non
// requis au publish). Vide → GA no-op (components/analytics). L'ID démo/prod est posé dans le config_json.
const gaId = cfg["ga_id"] ?? cfg["gaId"] ?? "";
// Google Search Console — jeton de vérification du domaine (balise <meta google-site-verification>).
// OPTIONNEL, bracket → PAS dans le contrat config-keys.json. Vide → aucune balise émise (on peut aussi
// vérifier via la propriété GA4 liée, sans code).
const gscVerification = cfg["gsc_verification"] ?? cfg["gscVerification"] ?? "";
// Connexion/inscription sociales (lot 4, SPEC-oauth-multi-provider côté Guardian). Ces client ids
// sont PUBLICS par construction (ils vivent dans le navigateur) — contrairement à catalog_api_key,
// ils n'ont donc rien d'un secret. Lecture BRACKET ⇒ HORS contrat config-keys.json, donc OPTIONNELS
// comme harmony_url/ga_id : une vitrine sans client id masque simplement les boutons sociaux, elle
// ne casse pas le build. C'est ce qui permet de déployer la vitrine AVANT que les apps OAuth
// existent chez Google/Microsoft.
const googleClientId = cfg["google_client_id"] ?? cfg["googleClientId"] ?? "";
const microsoftClientId = cfg["microsoft_client_id"] ?? cfg["microsoftClientId"] ?? "";

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
if (appUrl) lines.push(`NEXT_PUBLIC_APP_URL=${appUrl}`);
if (harmonyUrl) lines.push(`NEXT_PUBLIC_HARMONY_URL=${harmonyUrl}`);
if (gaId) lines.push(`NEXT_PUBLIC_GA_ID=${gaId}`);
if (gscVerification) lines.push(`NEXT_PUBLIC_GSC_VERIFICATION=${gscVerification}`);
if (googleClientId) lines.push(`NEXT_PUBLIC_GOOGLE_CLIENT_ID=${googleClientId}`);
if (microsoftClientId) lines.push(`NEXT_PUBLIC_MICROSOFT_CLIENT_ID=${microsoftClientId}`);

if (process.env.GITHUB_ENV && lines.length) {
  appendFileSync(process.env.GITHUB_ENV, lines.join("\n") + "\n");
}

// URLs are public; NEVER print the key value.
console.log(
  "forge → NEXT_PUBLIC_API_BASE:", apiBase || "(default)",
  "| GUARDIAN_URL:", guardianUrl || "(default)",
  "| CATALOG_API_KEY:", catalogKey ? "(set)" : "(empty)",
  "| TURNSTILE_SITEKEY:", turnstileSitekey || "(empty)",
  "| HARMONY_URL:", harmonyUrl || "(empty)",
  "| GA_ID:", gaId || "(empty)",
  "| GSC:", gscVerification ? "(set)" : "(empty)",
  "| GOOGLE_CLIENT_ID:", googleClientId ? "(set)" : "(empty)",
  "| MICROSOFT_CLIENT_ID:", microsoftClientId ? "(set)" : "(empty)",
);
if (!apiBase) {
  console.log("⚠ pas de api_base_url dans le snapshot → build avec les defaults dev (saas.test)");
}
