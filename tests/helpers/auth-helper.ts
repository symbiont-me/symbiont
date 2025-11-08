import { Page, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export interface TestCredentials {
  email: string;
  password: string;
}

/**
 * Load test credentials from the setup test
 */
export function loadTestCredentials(): TestCredentials {
  const credentialsPath = path.join(__dirname, '../test-credentials.json');
  
  if (!fs.existsSync(credentialsPath)) {
    throw new Error('Test credentials not found. Make sure the setup test has run first.');
  }
  
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
  return credentials;
}

/**
 * Sign in with test credentials and verify successful login
 */
export async function signInWithTestCredentials(page: Page): Promise<void> {
  const credentials = loadTestCredentials();
  
  // Navigate to sign-in page
  await page.goto('http://localhost:4000/sign-in');
  
  // Fill in credentials
  await page.getByRole('textbox', { name: 'Email address' }).fill(credentials.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
  
  // Submit sign-in form
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Verify successful sign-in by checking we're on studies page
  await expect(page).toHaveURL('http://localhost:4000/studies');
  await expect(page.getByRole('heading', { name: 'My Studies' })).toBeVisible();
}

/**
 * Create a test study and return to dashboard
 */
export async function createTestStudy(page: Page, studyName: string, description: string): Promise<void> {
  // Ensure we're on dashboard
  await expect(page.getByRole('heading', { name: 'My Studies' })).toBeVisible();
  
  // Wait a bit for page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Check if new study button is visible before clicking
  await expect(page.getByTestId('new-study-button')).toBeVisible();
  
  // Click Add Study button using data-testid
  await page.getByTestId('new-study-button').click();
  
  // Wait for modal to open and inputs to be visible with longer timeout
  await expect(page.getByTestId('study-name-input')).toBeVisible({ timeout: 15000 });
  
  // Fill out study form using data-testid (inputs are now direct inputs)
  await page.getByTestId('study-name-input').fill(studyName);
  await page.getByTestId('study-description-input').fill(description);
  
  // Submit form using data-testid
  await page.getByTestId('create-study-submit').click();
  
  // Wait for modal to close and study to appear
  await page.waitForTimeout(3000);
  
  // Verify study was created (use first occurrence to avoid conflicts)
  await expect(page.getByRole('heading', { name: studyName }).first()).toBeVisible({ timeout: 10000 });
}

/**
 * Navigate to study workspace
 */
export async function navigateToStudyWorkspace(page: Page, studyName: string): Promise<void> {
  // Click on study link
  await page.getByRole('link', { name: new RegExp(studyName) }).click();
  
  // Verify we're in study workspace
  await expect(page).toHaveURL(/\/studies\/[a-f0-9-]+$/);
  
  // Wait for page to fully load and tabs to appear (with longer timeout)
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('tab', { name: 'writer' })).toBeVisible({ timeout: 15000 });
}