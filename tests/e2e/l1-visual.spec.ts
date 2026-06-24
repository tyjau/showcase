import { test } from "@playwright/test";

// L1 visual check — capture the shared chrome at the breakpoint-relevant widths
// (header 1123 ; footer 880/600) in the default (dark) theme, for review vs handoff.
const WIDTHS = [1440, 1000, 700, 420];

for (const w of WIDTHS) {
  test(`chrome @ ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto("/fr");
    await page.locator("header").screenshot({
      path: `tests/visual/__captures__/l1/header-${w}.png`,
    });
    // Open the burger below 1123 to verify Devise/Langue/Thème/Se connecter moved in.
    if (w < 1123) {
      await page.getByTestId("burger").click();
      await page.locator("header").screenshot({
        path: `tests/visual/__captures__/l1/menu-${w}.png`,
      });
    }
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.locator("footer").screenshot({
      path: `tests/visual/__captures__/l1/footer-${w}.png`,
    });
  });
}
