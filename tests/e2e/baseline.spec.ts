import { test } from "@playwright/test";

// L0 baseline — captures the CURRENT state of every public route across the full matrix
// (project[desktop|mobile] × lang[en|fr] × theme[light|dark]). These are the "before"
// references we diff each page against as the handoff lots upgrade it. Output is gitignored
// (tests/visual/__captures__/), regenerated on demand: `npm run baseline`.

const ROUTES: { name: string; path: string }[] = [
  { name: "home", path: "" },
  { name: "features", path: "features" },
  { name: "pricing", path: "pricing" },
  { name: "platform", path: "platform" },
  { name: "company", path: "company" },
  { name: "partners", path: "partners" },
  { name: "resources", path: "resources" },
  { name: "help", path: "help" },
  { name: "legal", path: "legal/terms" },
  { name: "signup", path: "signup" },
  { name: "login", path: "login" },
  { name: "contact", path: "contact" },
  { name: "status", path: "status" },
  { name: "careers", path: "careers" },
  { name: "become-partner", path: "become-partner" },
  { name: "partner-login", path: "partner/login" },
];

const LANGS = ["en", "fr"] as const;
const THEMES = ["light", "dark"] as const;

for (const theme of THEMES) {
  for (const lang of LANGS) {
    test(`baseline · ${lang} · ${theme}`, async ({ page }, testInfo) => {
      // Seed the persisted theme before the no-flash boot script reads it.
      await page.addInitScript((t) => {
        try {
          localStorage.setItem("skyrh.theme", t as string);
        } catch {
          /* storage unavailable */
        }
      }, theme);

      for (const r of ROUTES) {
        await page.goto(`/${lang}/${r.path}`, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(500); // let fonts/layout settle
        await page.screenshot({
          path: `tests/visual/__captures__/${testInfo.project.name}/${lang}/${theme}/${r.name}.png`,
          fullPage: true,
        });
      }
    });
  }
}
