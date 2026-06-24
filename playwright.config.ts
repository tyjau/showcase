import { defineConfig, devices } from "@playwright/test";

// E2E + visual-capture harness. Runs against `next dev` (dynamic render → live catalog
// fetch from the Laragon guardian). `ignoreHTTPSErrors` because client-side API calls
// hit the self-signed saas.test cert. Two viewport projects (desktop 1440 / mobile 390)
// feed the full capture matrix; locale (URL) and theme (localStorage) are looped in-spec.
export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "tests/e2e/.results",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    ignoreHTTPSErrors: true,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/en",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
