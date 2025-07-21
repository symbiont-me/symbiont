import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000/');
  });

  test('should load landing page with all key elements', async ({ page }) => {
    // Check page title and main heading
    await expect(page.getByRole('heading', { name: 'Open Source AI-Powered Research Tool' })).toBeVisible();
    
    // Check navigation elements
    await expect(page.getByRole('heading', { name: 'Symbiont' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Docs' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Blog' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Contact' })).toBeVisible();
    
    // Check call-to-action buttons
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
    
    // Check feature highlights
    await expect(page.getByText('Free to use with API Key')).toBeVisible();
    await expect(page.getByText('Large number of LLMs available including Open Source ones')).toBeVisible();
    await expect(page.getByText('Search through text, video and audio files')).toBeVisible();
    await expect(page.getByText('Fact-check information quickly and easily across multiple sources')).toBeVisible();
    
    // Check FAQ section
    await expect(page.getByRole('heading', { name: 'FAQs' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'What is Symbiont?' })).toBeVisible();
    
    // Check footer
    await expect(page.getByText('Made with ❤️ by the team at Symbiont')).toBeVisible();
  });

  test('should display product screenshots/mockups', async ({ page }) => {
    // Check that product demonstration images are present
    await expect(page.getByAltText('symbiont writer')).toBeVisible();
    await expect(page.getByAltText('symbiont pdf viewer')).toBeVisible();
    await expect(page.getByAltText('symbiont video viewer')).toBeVisible();
    await expect(page.getByAltText('symbiont add resources')).toBeVisible();
    await expect(page.getByAltText('symbiont settings')).toBeVisible();
  });
});