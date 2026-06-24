import { test, expect } from "@playwright/test";

test("home payroll card resolves to a real module page (no 404)", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("skyrh.theme", "dark"));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/fr");
  const link = page.locator('a[href*="/features/WAGE"]').first();
  const href = await link.getAttribute("href");
  const resp = await page.goto(href!);
  expect(resp!.status()).toBeLessThan(400);
  await expect(page.locator("h1")).toBeVisible();
  await page.screenshot({ path: "tests/visual/__captures__/l4/module-paie.png", fullPage: true });
});
