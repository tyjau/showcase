import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("skyrh.theme", "dark"));
  await page.setViewportSize({ width: 1440, height: 1000 });
});

test("legal — the document selector sits above the content, active tab marked", async ({ page }) => {
  await page.goto("/fr/legal/terms");
  const tabs = page.getByTestId("legal-tabs");
  await expect(tabs).toBeVisible();
  await expect(tabs.locator('a[aria-current="page"]')).toContainText(/Conditions/i);

  // The selector sits above the first content section heading.
  const navY = (await tabs.boundingBox())!.y;
  const h2Y = (await page.locator("h2").first().boundingBox())!.y;
  expect(navY).toBeLessThan(h2Y);

  await page.screenshot({ path: "tests/visual/__captures__/l4/legal-top.png", fullPage: true });
});

test("legal — switching tab navigates to the right doc", async ({ page }) => {
  await page.goto("/fr/legal/terms");
  await page.getByTestId("legal-tabs").getByRole("link", { name: /Confidentialité/i }).click();
  await expect(page).toHaveURL(/\/legal\/privacy/);
});
