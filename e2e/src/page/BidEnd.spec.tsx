import { expect, test } from "@playwright/test";

// FIXME: add scenario login before test this case
test("bid end page", async ({ page }) => {
  await page.goto("/bid-end/0");

  await page.waitForTimeout(1000);
  await expect(page).toHaveScreenshot();
});
