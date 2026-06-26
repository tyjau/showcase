// Black-box tests of scripts/gen-config-keys.mjs — the generator/checker for the config
// contract (deploy/config-keys.json), derived from the `cfg.X` reads in forge-config.mjs.
// The `--check` gate is wired into CI, so we assert both that the committed contract is
// in sync (the gate the repo must keep green) and that a stale contract is caught.
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SCRIPT_REL = "scripts/gen-config-keys.mjs";
const SCRIPT_ABS = join(process.cwd(), SCRIPT_REL);
const FORGE_ABS = join(process.cwd(), "scripts/forge-config.mjs");

function run(script: string, args: string[], cwd: string) {
  try {
    const stdout = execFileSync("node", [script, ...args], { cwd, encoding: "utf8" });
    return { status: 0, stdout, stderr: "" };
  } catch (e: any) {
    return { status: e.status ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

/** A throwaway repo-shaped dir holding the real forge source + a given contract file. */
function scaffold(contract: string) {
  const dir = mkdtempSync(join(tmpdir(), "genck-"));
  mkdirSync(join(dir, "scripts"), { recursive: true });
  mkdirSync(join(dir, "deploy"), { recursive: true });
  copyFileSync(FORGE_ABS, join(dir, "scripts/forge-config.mjs"));
  writeFileSync(join(dir, "deploy/config-keys.json"), contract);
  return dir;
}

describe("gen-config-keys", () => {
  it("--check passes: the committed contract matches the forge source (the CI gate)", () => {
    const r = run(SCRIPT_REL, ["--check"], process.cwd());
    expect(r.status).toBe(0);
  });

  it("--check fails (exit 1) on a stale contract", () => {
    const dir = scaffold(JSON.stringify({ product: "tyjau/showcase", keys: ["stale_key"] }) + "\n");
    const r = run(SCRIPT_ABS, ["--check"], dir);
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/obsolète|gen:config-keys/);
  });

  it("regenerates the contract as the sorted snake-case keys read from the forge", () => {
    const dir = scaffold("{}\n");
    const r = run(SCRIPT_ABS, [], dir);
    expect(r.status).toBe(0);
    const out = JSON.parse(readFileSync(join(dir, "deploy/config-keys.json"), "utf8"));
    expect(out).toEqual({
      product: "tyjau/showcase",
      keys: ["api_base_url", "catalog_api_key", "guardian_url", "turnstile_sitekey"],
    });
  });
});
