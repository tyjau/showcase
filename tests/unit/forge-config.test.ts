// Black-box tests of scripts/forge-config.mjs — the build-time forge that turns the
// release snapshot into $GITHUB_ENV. Run as a real child process (exactly as the CD
// invokes it) so the process.exit / appendFileSync / ::add-mask:: behaviour is exercised
// for real, not a refactored stub. The "hard guardrail" (incomplete config -> exit 1)
// is the deploy-blocking contract, so it gets first-class coverage.
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
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
      },
    },
  },
};

function runForge(opts: { snapshot?: string; githubActions?: boolean } = {}) {
  const ghEnv = join(mkdtempSync(join(tmpdir(), "forge-")), "github_env");
  writeFileSync(ghEnv, "");
  const env: NodeJS.ProcessEnv = { ...process.env };
  // Neutralise anything the host might inject so each case is deterministic.
  delete env.RELEASE_SNAPSHOT;
  delete env.RELEASE_SNAPSHOT_FILE;
  delete env.NEXT_PUBLIC_API_BASE;
  delete env.GITHUB_ACTIONS;
  env.GITHUB_ENV = ghEnv;
  env.FORGE_REPO = "tyjau/showcase";
  if (opts.snapshot !== undefined) env.RELEASE_SNAPSHOT = opts.snapshot;
  if (opts.githubActions) env.GITHUB_ACTIONS = "true";

  let status = 0;
  let stdout = "";
  let stderr = "";
  try {
    stdout = execFileSync("node", ["scripts/forge-config.mjs"], { env, encoding: "utf8" });
  } catch (e: any) {
    status = e.status ?? 1;
    stdout = e.stdout ?? "";
    stderr = e.stderr ?? "";
  }
  return { status, stdout, stderr, ghEnv: readFileSync(ghEnv, "utf8") };
}

describe("forge-config", () => {
  it("emits the build env vars from a complete snapshot", () => {
    const r = runForge({ snapshot: JSON.stringify(FULL) });
    expect(r.status).toBe(0);
    expect(r.ghEnv).toContain("NEXT_PUBLIC_API_BASE=https://api.example.test");
    expect(r.ghEnv).toContain("GUARDIAN_URL=https://guardian.example.test");
    expect(r.ghEnv).toContain("CATALOG_API_KEY=key_abc123");
    expect(r.ghEnv).toContain("NEXT_PUBLIC_TURNSTILE_SITEKEY=0xSITEKEY_test");
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
