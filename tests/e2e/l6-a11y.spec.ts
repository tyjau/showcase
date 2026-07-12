import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Full WCAG AA audit (incl. color-contrast) in both themes. The accessible-accent
// (--brand-sky-strong fills + --sky-text) brings the locked #0F9ED5 brand to AA while
// keeping the vivid colour for identity/decorative. Asserts zero critical/serious.
const PAGES = ["/fr", "/fr/pricing", "/fr/contact", "/fr/enterprise", "/fr/careers", "/fr/legal/terms", "/fr/signup", "/fr/login", "/fr/status",
  // Pages ajoutées cette itération (SEO-06 comparatifs + hub géo 24 pays + Trust Center) — désormais
  // sous l'audit WCAG AA (une comparative, un pays OHADA en échantillon des routes dynamiques).
  "/fr/compare", "/fr/compare/payfit", "/fr/solutions", "/fr/solutions/senegal", "/fr/trust"];

for (const theme of ["dark", "light"] as const) {
  for (const p of PAGES) {
    test(`a11y ${p} (${theme})`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("skyrh.theme", t as string), theme);
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(p);
      await page.waitForTimeout(300);
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      const serious = r.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
      expect(serious.map((v) => `${v.id}(${v.nodes.length})`), serious.map((v) => v.id).join(", ")).toEqual([]);
    });
  }
}
