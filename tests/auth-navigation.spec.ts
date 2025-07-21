import { test, expect } from '@playwright/test';

test.describe('Authentication Navigation', () => {
  test('should navigate to sign-in page when Sign Up button is clicked', async ({ page }) => {
    await page.goto('http://localhost:4000/');
    
    // Click Sign Up button from header
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // Should navigate to sign-in page and show sign-in form initially
    await expect(page).toHaveURL('http://localhost:4000/sign-in');
    await expect(page.getByRole('heading', { name: 'Sign In to Symbiont' })).toBeVisible();
    await expect(page.getByText('Enter your details below to access your account.')).toBeVisible();
  });

  test('should navigate to sign-in page when Log in button is clicked', async ({ page }) => {
    await page.goto('http://localhost:4000/');
    
    // Click Log in button from main content area
    await page.getByRole('button', { name: 'Log in' }).click();
    
    // Should navigate to sign-in page
    await expect(page).toHaveURL('http://localhost:4000/sign-in');
    await expect(page.getByRole('heading', { name: 'Sign In to Symbiont' })).toBeVisible();
  });

  test('should switch between sign-in and sign-up forms', async ({ page }) => {
    await page.goto('http://localhost:4000/sign-in');
    
    // Should start with sign-in form
    await expect(page.getByRole('heading', { name: 'Sign In to Symbiont' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    
    // Click to switch to sign-up
    await page.getByRole('button', { name: 'Don\'t have an account? Sign Up' }).click();
    
    // Should show sign-up form
    await expect(page.getByRole('heading', { name: 'Sign Up to Symbiont' })).toBeVisible();
    await expect(page.getByText('Enter your details below to create your account.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    
    // Click to switch back to sign-in
    await page.getByRole('button', { name: 'Already have an account? Sign In' }).click();
    
    // Should show sign-in form again
    await expect(page.getByRole('heading', { name: 'Sign In to Symbiont' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should have working form elements on sign-in page', async ({ page }) => {
    await page.goto('http://localhost:4000/sign-in');
    
    // Check form elements are present and functional
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    
    // Test that inputs are functional
    await emailInput.fill('test@example.com');
    await passwordInput.fill('testpassword');
    
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('testpassword');
  });

  test('should have working form elements on sign-up page', async ({ page }) => {
    await page.goto('http://localhost:4000/sign-in');
    
    // Switch to sign-up form
    await page.getByRole('button', { name: 'Don\'t have an account? Sign Up' }).click();
    
    // Check form elements are present and functional
    const emailInput = page.getByRole('textbox', { name: 'Email' });
    const passwordInput = page.getByRole('textbox', { name: 'Password' });
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    
    // Test that inputs are functional
    await emailInput.fill('newuser@example.com');
    await passwordInput.fill('newpassword');
    
    await expect(emailInput).toHaveValue('newuser@example.com');
    await expect(passwordInput).toHaveValue('newpassword');
  });

  test('should navigate back to home page from auth forms', async ({ page }) => {
    await page.goto('http://localhost:4000/sign-in');
    
    // Click Back button
    await page.getByRole('button', { name: 'Back' }).click();
    
    // Should return to home page
    await expect(page).toHaveURL('http://localhost:4000/');
    await expect(page.getByRole('heading', { name: 'Open Source AI-Powered Research Tool' })).toBeVisible();
  });
});