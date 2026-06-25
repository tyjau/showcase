import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("skyrh.theme", "dark"));
  await page.setViewportSize({ width: 1440, height: 1000 });
});

test("careers — team filter narrows the job list", async ({ page }) => {
  await page.goto("/fr/careers");
  const apply = page.getByRole("link", { name: "Postuler" });
  await expect(apply).toHaveCount(6);
  await page.getByRole("button", { name: "Engineering", exact: true }).click();
  await expect(apply).toHaveCount(2);
  await page.getByRole("button", { name: "Toutes les équipes" }).click();
  await expect(apply).toHaveCount(6);
  await page.screenshot({ path: "tests/visual/__captures__/l4/careers.png", fullPage: true });
});

test("status — services list with a degraded pill", async ({ page }) => {
  await page.goto("/fr/status");
  await expect(page.getByText("Moteur de paie")).toBeVisible();
  await expect(page.getByText("Dégradé", { exact: true })).toBeVisible();
  await page.screenshot({ path: "tests/visual/__captures__/l4/status.png", fullPage: true });
});

test("partners — 'Devenir partenaire' routes to the application form", async ({ page }) => {
  await page.goto("/fr/partners");
  await expect(page.locator('a[href*="/become-partner"]')).toHaveCount(1);
});
