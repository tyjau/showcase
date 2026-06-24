import { test, expect } from "@playwright/test";

// The contact form posts to guardian's request_demo (added in source; activates on the
// next backend PHAR build). We mock that response here so the front behaviour — subject
// prefill, validation, sent state — is verified deterministically.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("skyrh.theme", "dark"));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.route("**/auth.php?c=request_demo", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ meta: { code: 200 }, data: { message: "Request received" } }),
    }),
  );
});

test("subject is prefilled from ?sujet=", async ({ page }) => {
  await page.goto("/fr/contact?sujet=produit");
  await expect(page.locator("select")).toHaveValue("produit");
});

test("validation blocks an empty/invalid submission", async ({ page }) => {
  await page.goto("/fr/contact");
  await page.getByRole("button", { name: /Envoyer le message/ }).click();
  await expect(page.getByText(/e-mail valide/i)).toBeVisible();
});

test("a valid submission reaches the sent confirmation", async ({ page }) => {
  await page.goto("/fr/contact?sujet=demo");
  await page.getByRole("textbox", { name: "E-mail" }).fill("lead@example.com");
  // Message is the last textbox (textarea).
  await page.locator("textarea").fill("On aimerait une démo de la paie multi-pays.");
  await page.getByRole("button", { name: /Envoyer le message/ }).click();
  await expect(page.getByText("Message envoyé")).toBeVisible();
  await page.screenshot({ path: "tests/visual/__captures__/l4/contact-sent.png", fullPage: true });
});

test("capture the contact form", async ({ page }) => {
  await page.goto("/fr/contact?sujet=demo");
  await page.screenshot({ path: "tests/visual/__captures__/l4/contact-form.png", fullPage: true });
});
