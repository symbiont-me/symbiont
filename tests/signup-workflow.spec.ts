import { test, expect } from '@playwright/test';

test.describe('Sign Up Form Validation', () => {
  test('should display sign-up form with all required elements', async ({ page }) => {
    // Navigate to sign-in page and switch to sign-up
    await page.goto('http://localhost:4000/sign-in');
    await page.getByRole('button', { name: 'Don\'t have an account? Sign Up' }).click();
    
    // Verify sign-up form elements
    await expect(page.getByRole('heading', { name: 'Sign Up to Symbiont' })).toBeVisible();
    await expect(page.getByText('Enter your details below to create your account.')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
  });

  test('should handle form input correctly', async ({ page }) => {
    await page.goto('http://localhost:4000/sign-in');
    await page.getByRole('button', { name: 'Don\'t have an account? Sign Up' }).click();
    
    // Test form inputs work correctly
    const testEmail = 'validation-test@example.com';
    const testPassword = 'validation-password-123';
    
    await page.getByRole('textbox', { name: 'Email' }).fill(testEmail);
    await page.getByRole('textbox', { name: 'Password' }).fill(testPassword);
    
    // Verify values are filled correctly
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue(testEmail);
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveValue(testPassword);
  });

  test('should navigate to sign-up from landing page', async ({ page }) => {
    // Navigate to landing page
    await page.goto('http://localhost:4000/');
    
    // Click Sign Up from landing page
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // Should navigate to sign-in page (shows sign-in by default)
    await expect(page).toHaveURL('http://localhost:4000/sign-in');
    await expect(page.getByRole('heading', { name: 'Sign In to Symbiont' })).toBeVisible();
  });
});