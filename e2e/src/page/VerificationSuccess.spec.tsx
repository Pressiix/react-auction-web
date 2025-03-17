import { expect, test } from "@playwright/test";

test("verification success page", async ({ page }) => {
  await page.goto("/verification-success");

  await page.waitForTimeout(1000);
  await expect(page).toHaveScreenshot()
});
