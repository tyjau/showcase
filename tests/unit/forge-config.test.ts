// Black-box tests of scripts/forge-config.mjs — the build-time forge that turns the
// release snapshot into $GITHUB_ENV. Run as a real child process (exactly as the CD
// invokes it) so the process.exit / appendFileSync / ::add-mask:: behaviour is exercised
// for real, not a refactored stub. The "hard guardrail" (incomplete config -> exit 1)
// is the deploy-blocking contract, so it gets first-class coverage.
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const FULL = {
  products: {
    "tyjau/showcase": {
      config: {
        api_base_url: "https://api.example.test",
        guardian_url: "https://guardian.example.test",
        catalog_api_key: "key_abc123",
        turnstile_sitekey: "0xSITEKEY_test",
        harmony_url: "https://harmony.example.test",
      },
    },
  },
};

function runForge(opts: { snapshot?: string; githubActions?: boolean; env?: string } = {}) {
  const ghEnv = join(mkdtempSync(join(tmpdir(), "forge-")), "github_env");
  writeFileSync(ghEnv, "");
  const env: NodeJS.ProcessEnv = { ...process.env };
  // Neutralise anything the host might inject so each case is deterministic.
  delete env.RELEASE_SNAPSHOT;
  delete env.RELEASE_SNAPSHOT_FILE;
  delete env.NEXT_PUBLIC_API_BASE;
  delete env.GITHUB_ACTIONS;
  delete env.SHOWCASE_ENV;
  env.GITHUB_ENV = ghEnv;
  env.FORGE_REPO = "tyjau/showcase";
  if (opts.snapshot !== undefined) env.RELEASE_SNAPSHOT = opts.snapshot;
  if (opts.githubActions) env.GITHUB_ACTIONS = "true";
  if (opts.env !== undefined) env.SHOWCASE_ENV = opts.env;

  // spawnSync (et non execFileSync) : on veut stderr MÊME en cas de succès (les avertissements).
  const r = spawnSync("node", ["scripts/forge-config.mjs"], { env, encoding: "utf8" });
  return { status: r.status ?? 1, stdout: r.stdout ?? "", stderr: r.stderr ?? "", ghEnv: readFileSync(ghEnv, "utf8") };
}

describe("forge-config", () => {
  it("emits the build env vars from a complete snapshot", () => {
    const r = runForge({ snapshot: JSON.stringify(FULL) });
    expect(r.status).toBe(0);
    expect(r.ghEnv).toContain("NEXT_PUBLIC_API_BASE=https://api.example.test");
    expect(r.ghEnv).toContain("GUARDIAN_URL=https://guardian.example.test");
    expect(r.ghEnv).toContain("CATALOG_API_KEY=key_abc123");
    expect(r.ghEnv).toContain("NEXT_PUBLIC_TURNSTILE_SITEKEY=0xSITEKEY_test");
    expect(r.ghEnv).toContain("NEXT_PUBLIC_HARMONY_URL=https://harmony.example.test");
    expect(r.stdout).toContain("(set)");
  });

  it("hard-fails (exit 1) when a contract key is missing from a real config", () => {
    const partial = JSON.parse(JSON.stringify(FULL));
    delete partial.products["tyjau/showcase"].config.catalog_api_key;
    const r = runForge({ snapshot: JSON.stringify(partial) });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/catalog_api_key/);
    expect(r.ghEnv).toBe("");
  });

  it("injecte une clé Turnstile DÉMO si absente du snapshot (débloque le build ; écrasée par le vrai config_json)", () => {
    const partial = JSON.parse(JSON.stringify(FULL));
    delete partial.products["tyjau/showcase"].config.turnstile_sitekey;
    const r = runForge({ snapshot: JSON.stringify(partial) });
    expect(r.status).toBe(0);
    expect(r.ghEnv).toContain("NEXT_PUBLIC_TURNSTILE_SITEKEY=1x00000000000000000000AA");
  });

  it("garde le sitekey RÉEL du snapshot quand il est fourni (le défaut démo n'écrase pas)", () => {
    const r = runForge({ snapshot: JSON.stringify(FULL) });
    expect(r.status).toBe(0);
    expect(r.ghEnv).toContain("NEXT_PUBLIC_TURNSTILE_SITEKEY=0xSITEKEY_test");
  });

  it("is a no-op (exit 0, no vars) for an empty/mock snapshot", () => {
    const r = runForge({ snapshot: "{}" });
    expect(r.status).toBe(0);
    expect(r.ghEnv).toBe("");
    expect(r.stdout).toMatch(/defaults dev|saas\.test/);
  });

  it("rejects a malformed snapshot (exit 1)", () => {
    const r = runForge({ snapshot: "{not valid json" });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/not valid JSON/i);
  });

  it("registers a ::add-mask:: for the catalog key under GITHUB_ACTIONS, never printing it bare", () => {
    const r = runForge({ snapshot: JSON.stringify(FULL), githubActions: true });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("::add-mask::key_abc123");
    // The human-readable summary must show "(set)", not the raw key.
    expect(r.stdout).toMatch(/CATALOG_API_KEY:\s*\(set\)/);
  });
});

// ── F-0016 / R8 : la production ne part jamais avec une clé Turnstile absente ou de TEST ──────────
const withKey = (key: string | undefined) => {
  const snap = JSON.parse(JSON.stringify(FULL));
  if (key === undefined) delete snap.products["tyjau/showcase"].config.turnstile_sitekey;
  else snap.products["tyjau/showcase"].config.turnstile_sitekey = key;
  return JSON.stringify(snap);
};
const TEST_KEY = "1x00000000000000000000AA";
const REAL_KEY = "0x4AAAAAAAreal_key_example";

describe("forge-config — clé Turnstile par environnement (F-0016)", () => {
  it("PRODUCTION + clé de test → REFUS (exit 1), rien dans GITHUB_ENV, message actionnable", () => {
    const r = runForge({ snapshot: withKey(TEST_KEY), env: "production" });
    expect(r.status).toBe(1);
    expect(r.ghEnv).toBe("");
    expect(r.stderr).toMatch(/turnstile_sitekey/);
    expect(r.stderr).toMatch(/TEST/);
    expect(r.stderr).toMatch(/config_json de Guardian/);
    expect(r.stderr).toMatch(/Ignition/);
  });

  it.each(["2x00000000000000000000AB", "1x00000000000000000000BB", "2x00000000000000000000BB", "3x00000000000000000000FF"])(
    "PRODUCTION + variante de test %s → REFUS",
    (k) => {
      const r = runForge({ snapshot: withKey(k), env: "production" });
      expect(r.status).toBe(1);
      expect(r.ghEnv).toBe("");
    },
  );

  it("PRODUCTION + clé absente → REFUS, et la clé de test N'EST PAS injectée", () => {
    const r = runForge({ snapshot: withKey(undefined), env: "production" });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/ABSENTE/);
    expect(r.ghEnv).toBe("");
  });

  it("PRODUCTION + clé vide ou blanche → REFUS", () => {
    expect(runForge({ snapshot: withKey(""), env: "production" }).status).toBe(1);
    expect(runForge({ snapshot: withKey("   "), env: "production" }).status).toBe(1);
  });

  it("PRODUCTION + snapshot vide (secret de prod non posé) → REFUS au lieu d'un build aux valeurs de dev", () => {
    const r = runForge({ snapshot: "{}", env: "production" });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/RELEASE_SNAPSHOT_PROD/);
  });

  it("PRODUCTION + vraie clé → PASSE, clé écrite, aucun avertissement", () => {
    const r = runForge({ snapshot: withKey(REAL_KEY), env: "production" });
    expect(r.status).toBe(0);
    expect(r.ghEnv).toContain(`NEXT_PUBLIC_TURNSTILE_SITEKEY=${REAL_KEY}`);
    expect(r.stderr).not.toMatch(/Turnstile/);
  });

  it("STAGING + clé de test → PASSE avec un AVERTISSEMENT visible", () => {
    const r = runForge({ snapshot: withKey(TEST_KEY), env: "staging" });
    expect(r.status).toBe(0);
    expect(r.ghEnv).toContain(`NEXT_PUBLIC_TURNSTILE_SITEKEY=${TEST_KEY}`);
    expect(r.stderr).toMatch(/⚠.*Turnstile staging.*TEST/);
  });

  it("STAGING + clé absente → clé de test posée comme avant, AVEC avertissement", () => {
    const r = runForge({ snapshot: withKey(undefined), env: "staging" });
    expect(r.status).toBe(0);
    expect(r.ghEnv).toContain(`NEXT_PUBLIC_TURNSTILE_SITEKEY=${TEST_KEY}`);
    expect(r.stderr).toMatch(/Turnstile staging/);
  });

  it("STAGING sous GitHub Actions → annotation ::warning::", () => {
    const r = runForge({ snapshot: withKey(TEST_KEY), env: "staging", githubActions: true });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("::warning title=Turnstile (staging)::");
  });

  it("STAGING + vraie clé → aucun avertissement", () => {
    const r = runForge({ snapshot: withKey(REAL_KEY), env: "staging" });
    expect(r.status).toBe(0);
    expect(r.stderr).not.toMatch(/Turnstile/);
  });

  it("DÉVELOPPEMENT (hors CI, SHOWCASE_ENV absent) + clé de test → passe avec avertissement", () => {
    const r = runForge({ snapshot: withKey(TEST_KEY) });
    expect(r.status).toBe(0);
    expect(r.stderr).toMatch(/Turnstile development/);
  });

  it("ÉCHEC FERMÉ : SHOWCASE_ENV absent SOUS GitHub Actions → traité comme production", () => {
    const r = runForge({ snapshot: withKey(TEST_KEY), githubActions: true });
    expect(r.status).toBe(1);
    expect(r.ghEnv).toBe("");
  });

  it("SHOWCASE_ENV inconnu → erreur (jamais traité comme du développement)", () => {
    const r = runForge({ snapshot: withKey(TEST_KEY), env: "prod" });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/SHOWCASE_ENV/);
  });
});
