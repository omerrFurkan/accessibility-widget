import { defineConfig } from "@playwright/test";

/**
 * End-user (E2E) tests run against the real demo page in a real browser.
 * Uses the system Edge channel so no Chromium download is required.
 * The vite demo server is started automatically by `webServer`.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 30000,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5199",
    channel: "msedge",
  },
  webServer: {
    command: "npx vite --config vite.demo.config.ts --port 5199 --strictPort",
    url: "http://localhost:5199",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
