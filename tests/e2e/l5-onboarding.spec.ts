import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("skyrh.theme", "dark"));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/fr/signup");
});

test("onboarding — stepper + login toggle present", async ({ page }) => {
  for (const s of ["Offre", "Espace", "Compte", "Récapitulatif"]) {
    await expect(page.getByText(s, { exact: true }).first()).toBeVisible();
  }
  await expect(
    page.locator("main").getByRole("link", { name: "Se connecter" }),
  ).toHaveAttribute("href", /\/login/);
  await page.screenshot({ path: "tests/visual/__captures__/l5/onboarding.png", fullPage: true });
});

test("onboarding — CGU gate: submit stays disabled until terms are accepted", async ({ page }) => {
  await page.getByRole("button", { name: /Continuer/ }).click(); // step0 -> 1
  await page.getByPlaceholder("Acme SARL").fill("Globex");
  await page.getByPlaceholder("Où vous opérez").fill("France");
  await page.getByRole("button", { name: /Continuer/ }).click(); // step1 -> 2
  const boxes = page.getByRole("textbox");
  await boxes.nth(0).fill("Awa");
  await boxes.nth(1).fill("Diallo");
  await page.getByPlaceholder("vous@entreprise.com").fill("awa@globex.io");
  await page.getByRole("button", { name: /Continuer/ }).click(); // step2 -> 3 (review)

  const submit = page.getByRole("button", { name: "Créer l'espace" });
  await expect(submit).toBeDisabled();
  await page.getByRole("checkbox").check();
  await expect(submit).toBeEnabled();
});
