import { test } from "@playwright/test";

// L2 visual — Home hero (and full page) for diff vs handoff 01-Home.
const CASES = [
  { w: 1440, h: 1000, theme: "dark", lang: "fr", name: "hero-desktop-dark" },
  { w: 1440, h: 1000, theme: "light", lang: "fr", name: "hero-desktop-light" },
  { w: 390, h: 900, theme: "dark", lang: "fr", name: "hero-mobile-dark" },
];

for (const c of CASES) {
  test(`home ${c.name}`, async ({ page }) => {
    await page.addInitScript((t) => localStorage.setItem("skyrh.theme", t as string), c.theme);
    await page.setViewportSize({ width: c.w, height: c.h });
    await page.goto(`/${c.lang}`);
    await page.waitForTimeout(600);
    await page.screenshot({ path: `tests/visual/__captures__/l2/${c.name}.png` });
    await page.screenshot({
      path: `tests/visual/__captures__/l2/${c.name}-full.png`,
      fullPage: true,
    });
  });
}
