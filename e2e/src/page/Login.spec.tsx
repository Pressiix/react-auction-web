import { expect, test } from "@playwright/test";

test("login page", async ({ page }) => {
  await page.goto("/login");

  await page.waitForTimeout(1000);
  await expect(page).toHaveScreenshot()
});
