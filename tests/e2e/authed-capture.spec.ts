import { test } from "@playwright/test";

// Authed UI captures use MOCKED guardian responses. Rationale: the local dev backend runs
// from a PHAR that re-evals a ~110MB engine per request and hangs under the concurrent
// fetches an authed dashboard fires (verified: 1 request = 200, 4 concurrent = timeout).
// That's a dev-only backend limitation, not a front or production issue. Mocking gives
// deterministic, fast UI verification. Login itself is validated live elsewhere.

const FIXTURES: Record<string, unknown> = {
  pay_order: { already_active: true },
  my_consumption: {
    has_subscription: true, order_status: "active", currency: "EUR", billing_unit: "per_employee",
    seats: 25, active_modules: 8, total: 175, period_start: "2026-06-01", period_end: "2026-06-30",
    lines: [{ kind: "plan", label: "Business", quantity: 25, unit_amount: 7, amount: 175 }],
  },
  my_referrals: {
    is_referrer: true, code: "ACME", brand_name: "Acme HR", reward_type: "percent", reward_value: 20,
    currency: "EUR", reward_total: 120,
    brand: { logo_url: null, primary_color: "#2563eb", secondary_color: "#0f172a", domain: "acme.skyrh.app" },
    referrals: [
      { referred_email: "lead1@x.io", status: "converted", reward_amount: 60, created_at: "2026-05-02", converted_at: "2026-05-20" },
      { referred_email: "lead2@x.io", status: "pending", reward_amount: null, created_at: "2026-06-01", converted_at: null },
    ],
  },
};

async function mockGuardian(page: import("@playwright/test").Page) {
  await page.route("**/auth.php?c=*", (route) => {
    const url = route.request().url();
    const action = url.split("?c=")[1]?.split("&")[0] ?? "";
    const data = FIXTURES[action] ?? {};
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ meta: { code: 200 }, data }),
    });
  });
}

test("account (mocked) capture", async ({ page }) => {
  await mockGuardian(page);
  await page.addInitScript(() => {
    localStorage.setItem("skyrh.portal.token", "header.eyJzY29wZSI6ImJpbGxpbmcifQ.sig");
    localStorage.setItem("skyrh.portal.workspace", "globex");
    localStorage.setItem("skyrh.theme", "dark");
  });
  for (const [w, h, tag] of [[1440, 1000, "desktop"], [390, 900, "mobile"]] as const) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/fr/account");
    await page.waitForTimeout(800);
    await page.screenshot({ path: `tests/visual/__captures__/authed/account-${tag}.png`, fullPage: true });
  }
});

test("partner portal (mocked) capture", async ({ page }) => {
  await mockGuardian(page);
  await page.addInitScript(() => {
    localStorage.setItem("skyrh.portal.token", "header.eyJzY29wZSI6InBhcnRuZXIifQ.sig");
    localStorage.setItem("skyrh.theme", "dark");
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/fr/partner");
  await page.waitForTimeout(800);
  await page.screenshot({ path: "tests/visual/__captures__/authed/partner-desktop.png", fullPage: true });
});
