import { test, expect } from "@playwright/test";

// L1 — shared chrome acceptance: dark-by-default, the 1123px header breakpoint, and the
// always-visible "Essai gratuit" CTA. Viewports are forced per test so the assertions hold
// regardless of the project (desktop/mobile) they run under.

test.describe("theme default", () => {
  test("first visit (no stored choice) boots dark", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("an explicit light choice is honoured", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("skyrh.theme", "light"));
    await page.goto("/en");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
  });
});

test.describe("header responsive @ 1123px", () => {
  const nav = (page: import("@playwright/test").Page) =>
    page.getByTestId("primary-nav");
  const burger = (page: import("@playwright/test").Page) => page.getByTestId("burger");
  const trial = (page: import("@playwright/test").Page) =>
    page.locator("header").getByRole("link", { name: /free trial|essai gratuit/i });

  test("≥1123: desktop nav shown, burger hidden, trial visible", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    await expect(nav(page)).toBeVisible();
    await expect(burger(page)).toBeHidden();
    await expect(trial(page)).toBeVisible();
  });

  test("<1123: desktop nav collapses to burger, trial STILL visible", async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 900 });
    await page.goto("/en");
    await expect(nav(page)).toBeHidden();
    await expect(burger(page)).toBeVisible();
    await expect(trial(page)).toBeVisible(); // the handoff guarantee
  });
});
