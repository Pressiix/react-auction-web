import { expect, test } from "@playwright/test";

test("signup page", async ({ page }) => {
  await page.goto("/signup");

  await page.waitForTimeout(1000);
  await expect(page).toHaveScreenshot()
});
