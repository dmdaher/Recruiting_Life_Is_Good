import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3001",
    headless: true,
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "PORT=3001 npx next dev --port 3001",
    port: 3001,
    timeout: 30000,
    reuseExistingServer: true,
  },
});
