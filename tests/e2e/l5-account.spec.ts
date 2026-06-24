import { test, expect, type Page } from "@playwright/test";

const FIXTURES: Record<string, unknown> = {
  pay_order: { already_active: true },
  my_consumption: {
    has_subscription: true, order_status: "active", currency: "EUR", billing_unit: "per_employee",
    seats: 25, active_modules: 8, total: 175, period_start: "2026-06-01", period_end: "2026-06-30",
    lines: [{ kind: "plan", label: "Business", quantity: 25, unit_amount: 7, amount: 175 }],
  },
};
async function mockGuardian(page: Page) {
  await page.route("**/auth.php?c=*", (route) => {
    const action = route.request().url().split("?c=")[1]?.split("&")[0] ?? "";
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ meta: { code: 200 }, data: FIXTURES[action] ?? {} }) });
  });
}

test.beforeEach(async ({ page }) => {
  await mockGuardian(page);
  await page.addInitScript(() => {
    localStorage.setItem("skyrh.portal.token", "h.eyJzY29wZSI6ImJpbGxpbmcifQ.s");
    localStorage.setItem("skyrh.portal.workspace", "globex");
    localStorage.setItem("skyrh.theme", "dark");
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
});

test("account — sidebar + plan tab default, current offer + active state chip", async ({ page }) => {
  await page.goto("/fr/account");
  await expect(page.getByText("Offre actuelle")).toBeVisible();
  await expect(page.getByText("Mon espace Harmony")).toBeVisible();
  await page.screenshot({ path: "tests/visual/__captures__/authed/account-plan.png", fullPage: true });
});

test("account — staging a module shows the unsaved bar with a recomputed total", async ({ page }) => {
  await page.goto("/fr/account");
  await expect(page.getByText("Modifications non enregistrées")).toHaveCount(0);
  await page.locator('button:has-text("+€")').first().click();
  await expect(page.getByText("Modifications non enregistrées")).toBeVisible();
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Modifications non enregistrées")).toHaveCount(0);
  await expect(page.getByText("Modifications enregistrées")).toBeVisible();
});
