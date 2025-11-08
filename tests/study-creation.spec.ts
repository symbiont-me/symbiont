import { test, expect } from '@playwright/test';
import { signInWithTestCredentials } from './helpers/auth-helper';

test.describe('Study Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in with test credentials
    await signInWithTestCredentials(page);
  });

  test('should create a new study successfully', async ({ page }) => {
    // Click the Add Study button
    await page.getByTestId('new-study-button').click();
    
    // Verify Create Study dialog opened
    await expect(page.getByRole('dialog', { name: 'Create Study' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create Study' })).toBeVisible();
    await expect(page.getByText('Create a new study and begin collecting data and writing your paper.')).toBeVisible();
    
    // Verify form fields are present
    await expect(page.getByRole('textbox', { name: 'Study Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Image' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Description' })).toBeVisible();
    
    // Fill out the form
    const studyName = 'AI Research Study';
    const description = 'A comprehensive study on AI applications in research and data analysis';
    
    await page.getByRole('textbox', { name: 'Study Name' }).fill(studyName);
    await page.getByRole('textbox', { name: 'Description' }).fill(description);
    
    // Submit the form
    await page.getByTestId('create-study-submit').click();
    
    // Verify study was created and appears on dashboard
    await expect(page.getByRole('heading', { name: studyName })).toBeVisible();
    await expect(page.getByText(description)).toBeVisible();
    
    // Verify study has a delete button
    await expect(page.getByRole('button', { name: 'delete' })).toBeVisible();
    
    // Verify study has a timestamp
    await expect(page.locator('text=/2025-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}/').first()).toBeVisible();
  });

  test('should cancel study creation', async ({ page }) => {
    // Open Create Study dialog
    await page.getByTestId('new-study-button').click();
    await expect(page.getByRole('dialog', { name: 'Create Study' })).toBeVisible();
    
    // Fill partial form data
    await page.getByRole('textbox', { name: 'Study Name' }).fill('Test Study');
    
    // Cancel the dialog
    await page.getByRole('button', { name: 'Cancel' }).click();
    
    // Verify dialog is closed and no study was created
    await expect(page.getByRole('dialog', { name: 'Create Study' })).not.toBeVisible();
    await expect(page.getByText('Test Study')).not.toBeVisible();
    
    // Verify we're still on the empty dashboard
    await expect(page.getByRole('heading', { name: 'Add Study' })).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Open Create Study dialog
    await page.getByTestId('new-study-button').click();
    
    // Verify required field indicators
    await expect(page.getByText('Study Name *')).toBeVisible();
    await expect(page.getByText('Description *')).toBeVisible();
    
    // Try to submit empty form (should not work or show validation)
    await page.getByTestId('create-study-submit').click();
    
    // Dialog should still be visible (form didn't submit)
    await expect(page.getByRole('dialog', { name: 'Create Study' })).toBeVisible();
  });

  test('should create study and navigate to study workspace', async ({ page }) => {
    // Create a study
    await page.getByTestId('new-study-button').click();
    await page.getByRole('textbox', { name: 'Study Name' }).fill('Navigation Test Study');
    await page.getByRole('textbox', { name: 'Description' }).fill('Testing navigation to study workspace');
    await page.getByTestId('create-study-submit').click();
    
    // Click on the created study to navigate to it
    await page.getByRole('link', { name: /Navigation Test Study/ }).click();
    
    // Verify we're in the study workspace
    await expect(page).toHaveURL(/\/study\/[a-f0-9-]+$/);
    
    // Verify tab navigation is present
    await expect(page.getByRole('tab', { name: 'writer' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'PDF viewer' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'video viewer' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'summaries' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'add resources' })).toBeVisible();
    
    // Verify the writer tab is selected by default
    await expect(page.getByRole('tab', { name: 'writer', selected: true })).toBeVisible();
  });
});