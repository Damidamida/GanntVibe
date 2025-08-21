import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  retries: 0,
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:5173",
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
  reporter: [["list"]],
});
