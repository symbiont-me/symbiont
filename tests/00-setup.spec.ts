import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Test credentials that will be used across all tests
const timestamp = Date.now();
const TEST_CREDENTIALS = {
  email: `playwright-test-${timestamp}@example.com`,
  password: 'playwright-test-password-123'
};

test.describe.serial('Setup', () => {
  test('should create test user account for other tests', async ({ page }) => {
    // Navigate to sign-up page
    await page.goto('http://localhost:4000/sign-in');
    
    // Switch to sign-up form
    await page.getByRole('button', { name: 'Don\'t have an account? Sign up' }).click();
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    
    // Fill out sign-up form with consistent test credentials
    await page.getByRole('textbox', { name: 'Email address' }).fill(TEST_CREDENTIALS.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CREDENTIALS.password);
    
    // Submit sign-up form
    await page.getByRole('button', { name: 'Create account' }).click();
    
    // Wait a bit for sign-up processing and redirect
    await page.waitForTimeout(2000);
    
    // Should navigate to studies page after successful sign-up
    await expect(page).toHaveURL('http://localhost:4000/studies', { timeout: 10000 });
    
    // Verify sign-up was successful by checking studies dashboard
    await expect(page.getByRole('heading', { name: 'My Studies' })).toBeVisible();
    
    // Save credentials to file for other tests to use
    const credentialsPath = path.join(__dirname, 'test-credentials.json');
    fs.writeFileSync(credentialsPath, JSON.stringify(TEST_CREDENTIALS, null, 2));
    
    console.log('✅ Test user account created successfully');
    console.log(`📧 Email: ${TEST_CREDENTIALS.email}`);
    console.log(`🔐 Password: ${TEST_CREDENTIALS.password}`);
  });
});