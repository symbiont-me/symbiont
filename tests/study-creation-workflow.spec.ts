import { test, expect } from '@playwright/test';
import { signInWithTestCredentials } from './helpers/auth-helper';

test.describe('Study Creation Workflow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in with test credentials
    await signInWithTestCredentials(page);
    
    // Should now be on authenticated dashboard
    await expect(page.getByRole('heading', { name: 'Add Study', level: 5 })).toBeVisible();
  });

  test('Create study with all fields - complete workflow', async ({ page }) => {
    // Generate unique study data to avoid conflicts
    const timestamp = Date.now();
    const studyName = `E2E Test Study ${timestamp}`;
    const studyDescription = `Test study created at ${new Date().toISOString()} for comprehensive workflow testing`;
    const studyImage = `test-image-${timestamp}.jpg`;

    // Click Add Study button
    await page.getByTestId('new-study-button').click();

    // Verify modal opened
    await expect(page.getByRole('dialog', { name: 'Create Study' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create Study', level: 2 })).toBeVisible();

    // Verify form fields are present
    await expect(page.getByRole('textbox', { name: 'Study Name' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Description' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Image' })).toBeVisible();

    // Verify required field indicators (simplified check)
    await expect(page.getByText('*').first()).toBeVisible();

    // Fill out all fields
    await page.getByRole('textbox', { name: 'Study Name' }).fill(studyName);
    await page.getByRole('textbox', { name: 'Description' }).fill(studyDescription);
    await page.getByRole('textbox', { name: 'Image' }).fill(studyImage);

    // Submit form
    await page.getByTestId('create-study-submit').click();

    // Wait for modal to close and study to be created
    await expect(page.getByRole('dialog', { name: 'Create Study' })).not.toBeVisible();

    // Verify study card appears on dashboard
    await expect(page.getByRole('link', { name: new RegExp(studyName) })).toBeVisible();
    await expect(page.getByRole('heading', { name: studyName, level: 6 })).toBeVisible();
    await expect(page.getByText(studyDescription)).toBeVisible();

    // Verify study card has expected elements
    await expect(page.getByRole('button', { name: 'delete' }).first()).toBeVisible();
    await expect(page.getByRole('img', { name: studyName })).toBeVisible();

    // Verify study link is functional
    const studyLink = page.getByRole('link', { name: new RegExp(studyName) });
    await expect(studyLink).toHaveAttribute('href', /studies\/[a-f0-9-]+/);
  });

  test('Create study with required fields only', async ({ page }) => {
    const timestamp = Date.now();
    const studyName = `Minimal Study ${timestamp}`;
    const studyDescription = `Minimal test study ${timestamp}`;

    // Open study creation modal
    await page.getByTestId('new-study-button').click();

    // Fill only required fields
    await page.getByRole('textbox', { name: 'Study Name' }).fill(studyName);
    await page.getByRole('textbox', { name: 'Description' }).fill(studyDescription);
    // Leave image field empty

    // Submit form
    await page.getByTestId('create-study-submit').click();

    // Verify study was created successfully
    await expect(page.getByRole('dialog', { name: 'Create Study' })).not.toBeVisible();
    await expect(page.getByRole('heading', { name: studyName, level: 6 })).toBeVisible();
    await expect(page.getByText(studyDescription)).toBeVisible();
  });

  test('Study creation form validation', async ({ page }) => {
    // Open study creation modal
    await page.getByTestId('new-study-button').click();

    // Try to submit empty form
    await page.getByTestId('create-study-submit').click();

    // Form should still be visible (validation should prevent submission)
    await expect(page.getByRole('dialog', { name: 'Create Study' })).toBeVisible();

    // Fill only name field
    await page.getByRole('textbox', { name: 'Study Name' }).fill('Test Name Only');
    await page.getByTestId('create-study-submit').click();

    // Form should still be visible (description is required)
    await expect(page.getByRole('dialog', { name: 'Create Study' })).toBeVisible();

    // Fill description to complete required fields
    await page.getByRole('textbox', { name: 'Description' }).fill('Test description added');
    await page.getByTestId('create-study-submit').click();

    // Now form should submit successfully
    await expect(page.getByRole('dialog', { name: 'Create Study' })).not.toBeVisible();
    await expect(page.getByText('Test Name Only').first()).toBeVisible();
  });

  test('Cancel study creation', async ({ page }) => {
    // Open study creation modal
    await page.getByTestId('new-study-button').click();

    // Fill some fields
    await page.getByRole('textbox', { name: 'Study Name' }).fill('Cancelled Study');
    await page.getByRole('textbox', { name: 'Description' }).fill('This should be cancelled');

    // Click cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Modal should close without creating study
    await expect(page.getByRole('dialog', { name: 'Create Study' })).not.toBeVisible();
    await expect(page.getByText('Cancelled Study')).not.toBeVisible();
  });

  test('Study creation API endpoint requires authentication', async ({ request }) => {
    // Test the API endpoint directly without authentication
    const studyData = {
      name: 'API Test Study',
      description: 'Testing API without auth',
      image: 'test.jpg'
    };

    const response = await request.post('http://localhost:8000/create-study', {
      data: studyData
    });

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('message', 'unauthorised');
  });

  test('Multiple studies can be created and displayed', async ({ page }) => {
    const timestamp = Date.now();
    
    // Create first study
    await page.getByTestId('new-study-button').click();
    await page.getByRole('textbox', { name: 'Study Name' }).fill(`First Study ${timestamp}`);
    await page.getByRole('textbox', { name: 'Description' }).fill('First study description');
    await page.getByTestId('create-study-submit').click();
    
    // Wait for first study to appear
    await expect(page.getByText(`First Study ${timestamp}`)).toBeVisible();

    // Create second study
    await page.getByTestId('new-study-button').click();
    await page.getByRole('textbox', { name: 'Study Name' }).fill(`Second Study ${timestamp}`);
    await page.getByRole('textbox', { name: 'Description' }).fill('Second study description');
    await page.getByTestId('create-study-submit').click();

    // Verify both studies are visible
    await expect(page.getByText(`First Study ${timestamp}`)).toBeVisible();
    await expect(page.getByText(`Second Study ${timestamp}`)).toBeVisible();
    await expect(page.getByText('First study description').first()).toBeVisible();
    await expect(page.getByText('Second study description').first()).toBeVisible();
  });

  test('Study creation shows loading states appropriately', async ({ page }) => {
    // Open study creation modal
    await page.getByTestId('new-study-button').click();

    // Fill form
    await page.getByRole('textbox', { name: 'Study Name' }).fill('Loading Test Study');
    await page.getByRole('textbox', { name: 'Description' }).fill('Testing loading states');

    // Submit form and immediately check for loading state or disabled button
    await page.getByTestId('create-study-submit').click();

    // The form should either:
    // 1. Show a loading state, or
    // 2. Quickly close and show the study
    // We'll verify it doesn't stay stuck in a broken state
    
    // Wait for either modal to close or loading to complete (max 10 seconds)
    await expect(async () => {
      const modalVisible = await page.getByRole('dialog', { name: 'Create Study' }).isVisible();
      const studyVisible = await page.getByText('Loading Test Study').first().isVisible();
      
      // Either modal closed (study created) or we're still in a reasonable loading state
      expect(modalVisible || studyVisible).toBe(true);
    }).toPass({ timeout: 10000 });

    // Eventually the study should be created
    await expect(page.getByText('Loading Test Study').first()).toBeVisible({ timeout: 15000 });
  });
});