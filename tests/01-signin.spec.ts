import { test, expect } from '@playwright/test';
import { loadTestCredentials } from './helpers/auth-helper';

test.describe('Sign In Flow', () => {
  test('should sign in with test credentials successfully', async ({ page }) => {
    const credentials = loadTestCredentials();
    
    // Navigate to sign-in page
    await page.goto('http://localhost:4000/sign-in');
    
    // Verify sign-in form is displayed
    await expect(page.getByRole('heading', { name: 'Sign In to Symbiont' })).toBeVisible();
    await expect(page.getByText('Enter your details below to access your account.')).toBeVisible();
    
    // Fill in test credentials
    await page.getByRole('textbox', { name: 'Email' }).fill(credentials.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
    
    // Verify form values are filled correctly
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveValue(credentials.email);
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveValue(credentials.password);
    
    // Submit sign-in form
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should navigate to dashboard after successful sign-in
    await expect(page).toHaveURL('http://localhost:4000/');
    
    // Verify dashboard elements are visible
    await expect(page.getByText('This app is currently in development and test mode.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Add Study' })).toBeVisible();
    
    // Verify navigation sidebar is present
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Library' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });

  test('should switch between sign-in and sign-up forms', async ({ page }) => {
    await page.goto('http://localhost:4000/sign-in');
    
    // Start with sign-in form
    await expect(page.getByRole('heading', { name: 'Sign In to Symbiont' })).toBeVisible();
    
    // Switch to sign-up form
    await page.getByRole('button', { name: 'Don\'t have an account? Sign Up' }).click();
    await expect(page.getByRole('heading', { name: 'Sign Up to Symbiont' })).toBeVisible();
    
    // Switch back to sign-in form
    await page.getByRole('button', { name: 'Already have an account? Sign In' }).click();
    await expect(page.getByRole('heading', { name: 'Sign In to Symbiont' })).toBeVisible();
  });

  test('should navigate back to home from sign-in page', async ({ page }) => {
    await page.goto('http://localhost:4000/sign-in');
    
    // Click Back button
    await page.getByRole('button', { name: 'Back' }).click();
    
    // Should return to landing page
    await expect(page).toHaveURL('http://localhost:4000/');
    await expect(page.getByRole('heading', { name: 'Open Source AI-Powered Research Tool' })).toBeVisible();
  });
});