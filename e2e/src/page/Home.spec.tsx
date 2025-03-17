import { expect, test } from "@playwright/test";

test("home page", async ({ page }) => {
  await page.goto("/");

  await page.waitForTimeout(1000);
  await expect(page).toHaveScreenshot()
});
