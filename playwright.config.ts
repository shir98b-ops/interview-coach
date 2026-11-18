import { defineConfig, devices } from "@playwright/test";

const port = 3100;

/**
 * End-to-end tests run the production build in a real browser. They cover
 * what a signed-out visitor sees; signed-in flows need a Google account and
 * are checked by hand on each preview deployment.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${port}`, trace: "off" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run start -- --port ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
