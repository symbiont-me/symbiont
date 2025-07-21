import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should navigate to sign-in page when Log in button is clicked", async ({ page }) => {
    // Go to the homepage
    await page.goto("/");

    // Wait for the Log in button to be visible and click it
    const loginButton = page.getByRole("button", { name: "Log in" });
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // Assert that the URL contains 'sign-in' and the sign-in form is visible
    await expect(page).toHaveURL(/sign-in/);
    await expect(page.getByRole("heading", { name: /sign in to symbiont/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });
});
