import { test, expect } from "@playwright/test";

const shouldRun = process.env.E2E === "1";

(shouldRun ? test : test.skip)("opens app root (smoke)", async ({ page }) => {
  await page.goto("/");
  await expect(page).toPass();
});
