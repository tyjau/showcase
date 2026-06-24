import { test, expect } from "@playwright/test";

const PAGES = [
  "/fr", "/fr/features", "/fr/pricing", "/fr/platform", "/fr/enterprise", "/fr/company",
  "/fr/resources", "/fr/help", "/fr/legal/terms", "/fr/contact", "/fr/status", "/fr/careers",
  "/fr/partners", "/fr/signup", "/fr/login", "/fr/become-partner", "/fr/partner/login",
];

test("no dead INTERNAL links across the site", async ({ page, request }) => {
  const checked = new Set<string>();
  const broken: string[] = [];
  for (const p of PAGES) {
    await page.goto(p);
    const hrefs = await page.locator("a[href]").evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).getAttribute("href")),
    );
    for (const h of hrefs) {
      if (!h || !h.startsWith("/")) continue; // internal only
      const url = h.split("#")[0];
      if (!url || checked.has(url)) continue;
      checked.add(url);
      const resp = await request.get(url).catch(() => null);
      if (!resp || resp.status() >= 400) broken.push(`${url} -> ${resp?.status() ?? "ERR"}`);
    }
  }
  expect(broken, `Broken: ${broken.join(" | ")}`).toEqual([]);
});

test("footer social icons are EXTERNAL links (target=_blank, rel=noopener)", async ({ page }) => {
  await page.goto("/fr");
  const socials = page.locator('footer a[target="_blank"]');
  expect(await socials.count()).toBeGreaterThanOrEqual(4);
  for (const a of await socials.all()) {
    expect(await a.getAttribute("href")).toMatch(/^https:\/\//);
    expect(await a.getAttribute("rel")).toContain("noopener");
  }
});

for (const w of [360, 1440]) {
  test(`no horizontal overflow @ ${w}px`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    const offenders: string[] = [];
    for (const p of PAGES) {
      await page.goto(p);
      await page.waitForTimeout(250);
      const over = await page.evaluate(() => {
        const el = document.documentElement;
        return el.scrollWidth - el.clientWidth;
      });
      if (over > 2) offenders.push(`${p} (+${over}px)`);
    }
    expect(offenders, `Overflow: ${offenders.join(" | ")}`).toEqual([]);
  });
}
