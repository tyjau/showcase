import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("skyrh.theme", "dark"));
  await page.setViewportSize({ width: 1440, height: 1000 });
});

test("enterprise page renders the offer (Sur devis + deploy modes) and CTA -> quote", async ({ page }) => {
  await page.goto("/fr/enterprise");
  await expect(page.getByText("Sur devis")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Cloud/ })).toBeVisible();
  await expect(page.locator('a[href*="sujet=devis"]').first()).toBeVisible();
  await page.screenshot({ path: "tests/visual/__captures__/l4/enterprise.png", fullPage: true });
});

test("nav Entreprise -> /enterprise; footer A propos -> /company", async ({ page }) => {
  await page.goto("/fr");
  await expect(
    page.getByTestId("primary-nav").getByRole("link", { name: "Entreprise" }),
  ).toHaveAttribute("href", /\/enterprise/);
  await expect(page.locator('footer a[href*="/company"]')).toHaveCount(1);
});
