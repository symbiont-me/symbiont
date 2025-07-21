import { test, expect } from "@playwright/test";

test.describe("Sign Up Navigation", () => {
  test("should navigate to sign-up form from homepage and sign-in page", async ({ page }) => {
    // Go to the homepage
    await page.goto("/");

    // Click the Sign Up button in the header
    const signUpButton = page.getByRole("button", { name: "Sign Up" });
    await expect(signUpButton).toBeVisible();
    await signUpButton.click();

    // On the sign-in page, click the 'Don\'t have an account? Sign Up' button
    const dontHaveAccountButton = page.getByRole("button", { name: /Don\'t have an account\? Sign Up/i });
    await expect(dontHaveAccountButton).toBeVisible();
    await dontHaveAccountButton.click();

    // Assert that the sign-up form is visible
    await expect(page.getByRole("heading", { name: /Sign Up to Symbiont/i })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible();
  });
});
