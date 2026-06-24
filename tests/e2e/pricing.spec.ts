import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("skyrh.theme", "dark"));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/fr/pricing");
});

test("the three tabs are present (Packages · Comparatif · À la carte)", async ({ page }) => {
  for (const name of ["Packages", "Comparatif", "À la carte"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  }
});

test("data bug fixed: no English package description leaks in the FR page", async ({ page }) => {
  await expect(page.getByText("Self-serve HR for small teams")).toHaveCount(0);
  await expect(page.getByText("Hire, develop and steer your teams")).toHaveCount(0);
});

test("the Comparatif tab renders a comparison matrix with package columns", async ({ page }) => {
  await page.getByRole("button", { name: "Comparatif", exact: true }).click();
  const table = page.locator("table");
  await expect(table).toBeVisible();
  await expect(table.getByText("Business")).toBeVisible();
  await page.screenshot({ path: "tests/visual/__captures__/l3/pricing-compare.png", fullPage: true });
});

test("capture packages tab", async ({ page }) => {
  await page.screenshot({ path: "tests/visual/__captures__/l3/pricing-packages.png", fullPage: true });
});
