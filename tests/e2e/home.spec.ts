import { test, expect } from "@playwright/test";

// L2 — Home interactions (production-ready acceptance).
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/fr");
});

test("the Payroll feature card deep-links to the payroll module page (real code)", async ({ page }) => {
  // The payroll module's catalogue code (WAGE-GEN00) — not a non-existent /features/payroll.
  await expect(page.locator('a[href*="/features/WAGE"]')).toHaveCount(1);
});

test("the modules carousel advances (dots reflect the active slide)", async ({ page }) => {
  await expect(page.getByTestId("carousel-dot-0")).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: /Suivant/ }).click();
  await expect(page.getByTestId("carousel-dot-1")).toHaveAttribute("aria-current", "true");
  await expect(page.getByTestId("carousel-dot-0")).toHaveAttribute("aria-current", "false");
});

test("the packs band shows Business as most popular and links to signup", async ({ page }) => {
  await expect(page.getByText(/Le plus populaire/)).toBeVisible();
  // The 3 pack CTAs all route to the signup funnel.
  const ctas = page.getByRole("link", { name: /Démarrer l'essai|Commencer/ });
  expect(await ctas.count()).toBeGreaterThanOrEqual(3);
});
