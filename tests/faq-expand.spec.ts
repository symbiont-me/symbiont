import { test, expect } from "@playwright/test";

test.describe("FAQ Section", () => {
  test('should expand and show answer for "What is Symbiont?"', async ({ page }) => {
    // Go to the homepage
    await page.goto("/");

    // Find and click the FAQ button
    const faqButton = page.getByRole("button", { name: "What is Symbiont?" });
    await expect(faqButton).toBeVisible();
    await faqButton.click();

    // Assert that the answer region is visible and contains expected text
    const answerRegion = page.getByRole("region", { name: "What is Symbiont?" });
    await expect(answerRegion).toBeVisible();
    await expect(answerRegion).toContainText("AI powered research tool");
  });
});
