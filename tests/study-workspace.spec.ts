import { test, expect } from '@playwright/test';
import { signInWithTestCredentials, createTestStudy, navigateToStudyWorkspace } from './helpers/auth-helper';

test.describe('Study Workspace', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Sign in with test credentials
    await signInWithTestCredentials(page);
    
    // Create a unique study name for each test
    const studyName = `Workspace Test ${testInfo.title.substring(0, 20)} ${Date.now()}`;
    await createTestStudy(page, studyName, 'Testing workspace functionality');
    
    // Navigate to study workspace
    await navigateToStudyWorkspace(page, studyName);
  });

  test('should display all tab navigation options', async ({ page }) => {
    const expectedTabs = ['writer', 'PDF viewer', 'video viewer', 'summaries', 'add resources'];
    
    for (const tabName of expectedTabs) {
      await expect(page.getByRole('tab', { name: tabName })).toBeVisible();
    }
    
    // Writer should be selected by default
    await expect(page.getByRole('tab', { name: 'writer', selected: true })).toBeVisible();
  });

  test('should switch between tabs correctly', async ({ page }) => {
    // Start with writer tab selected
    await expect(page.getByRole('tab', { name: 'writer', selected: true })).toBeVisible();
    
    // Click on add resources tab
    await page.getByRole('tab', { name: 'add resources' }).click();
    await expect(page.getByRole('tab', { name: 'add resources', selected: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'writer', selected: false })).toBeVisible();
    
    // Click back to writer tab
    await page.getByRole('tab', { name: 'writer' }).click();
    await expect(page.getByRole('tab', { name: 'writer', selected: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'add resources', selected: false })).toBeVisible();
  });

  test('should display rich text editor in writer tab', async ({ page }) => {
    // Ensure we're on writer tab
    await page.getByRole('tab', { name: 'writer' }).click();
    
    // Verify rich text editor toolbar elements
    await expect(page.getByRole('button', { name: 'Normal' })).toBeVisible();
    
    // Verify formatting options are available (look for text styling buttons)
    const formatButtons = page.locator('[role="toolbar"] button');
    await expect(formatButtons.first()).toBeVisible();
    
    // Verify text area/editor is present
    await expect(page.locator('.ProseMirror, [contenteditable="true"], textarea').first()).toBeVisible();
  });

  test('should display resource management in add resources tab', async ({ page }) => {
    // Navigate to add resources tab
    await page.getByRole('tab', { name: 'add resources' }).click();
    
    // Verify file upload option
    await expect(page.getByText('Upload file')).toBeVisible();
    
    // Verify web resource input
    await expect(page.getByText('Add Web Resource')).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Add Web Resource/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Webpages' })).toBeVisible();
    
    // Verify text resource input
    await expect(page.getByText('Add Text Resource')).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Multiline Text/ })).toBeVisible();
    await expect(page.getByText('Text Resource Name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Text Resource' })).toBeVisible();
    
    // Verify YouTube link input
    await expect(page.getByText('Add Youtube Link')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Youtube Link' })).toBeVisible();
  });

  test('should display chat interface with resource selector', async ({ page }) => {
    // Chat interface should be visible regardless of tab
    await expect(page.getByRole('textbox', { name: 'Ask any question...' })).toBeVisible();
    
    // Verify resource selector dropdown
    await expect(page.getByRole('combobox')).toBeVisible();
    
    // Verify combine resources checkbox
    await expect(page.getByRole('checkbox', { name: 'Combine Resources' })).toBeVisible();
    await expect(page.getByText('Combine Resources')).toBeVisible();
    
    // Verify clear chat button
    await expect(page.getByRole('button', { name: 'Clear Chat' })).toBeVisible();
    
    // Verify alert about adding resources
    await expect(page.getByText('Please add resources before chat')).toBeVisible();
  });

  test('should access LLM settings from sidebar', async ({ page }) => {
    // Click settings button
    await page.getByRole('button', { name: 'settings Settings' }).click();
    
    // Verify settings dialog opened
    await expect(page.getByText('LLM Settings')).toBeVisible();
    
    // Verify LLM model selector
    await expect(page.getByText('LLM Model')).toBeVisible();
    await expect(page.getByRole('combobox')).toBeVisible();
    
    // Verify API key input
    await expect(page.getByRole('textbox', { name: 'API Key' })).toBeVisible();
    
    // Verify privacy notice
    await expect(page.getByText('we do not store your api keys')).toBeVisible();
    
    // Verify close and save buttons
    await expect(page.getByTestId('llm-settings-close')).toBeVisible();
    await expect(page.getByRole('button', { name: 'save' })).toBeVisible();
    
    // Close settings dialog
    await page.getByTestId('llm-settings-close').click();
    
    // Verify dialog is closed
    await expect(page.getByText('LLM Settings')).not.toBeVisible();
  });

  test('should have working navigation sidebar', async ({ page }) => {
    // Verify all navigation options are present
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Library' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'github Github' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'settings Settings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    
    // Test Home navigation
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('http://localhost:4000/');
    
    // Verify we're back on dashboard (check for Add Study instead of specific study name)
    await expect(page.getByRole('heading', { name: 'Add Study' })).toBeVisible();
  });

  test('should maintain workspace state when navigating between tabs', async ({ page }) => {
    // Add some text in writer tab (if possible)
    await page.getByRole('tab', { name: 'writer' }).click();
    
    // Switch to add resources tab
    await page.getByRole('tab', { name: 'add resources' }).click();
    await expect(page.getByText('Upload file')).toBeVisible();
    
    // Switch to video viewer tab
    await page.getByRole('tab', { name: 'video viewer' }).click();
    
    // Switch to summaries tab
    await page.getByRole('tab', { name: 'summaries' }).click();
    
    // Switch to PDF viewer tab
    await page.getByRole('tab', { name: 'PDF viewer' }).click();
    
    // Switch back to writer tab
    await page.getByRole('tab', { name: 'writer' }).click();
    
    // Verify rich text editor is still there
    await expect(page.getByRole('button', { name: 'Normal' })).toBeVisible();
  });
});