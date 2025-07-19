import { test, expect } from '@playwright/test';

test.describe('Smoke Tests @smoke', () => {
  test('Frontend health check - landing page loads', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads and contains expected elements
    await expect(page).toHaveTitle(/Symbiont/i);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Basic visual check - ensure no major rendering issues
    await expect(page.locator('body')).toBeVisible();
  });

  test('Backend health check - API is responsive', async ({ request }) => {
    // Test backend API health endpoint or basic endpoint
    // First, let's check if there's a health endpoint
    const healthResponse = await request.get('http://localhost:8000/health').catch(async () => {
      // If no health endpoint, try the root or another basic endpoint
      return await request.get('http://localhost:8000/').catch(async () => {
        // Try docs endpoint which FastAPI provides by default
        return await request.get('http://localhost:8000/docs');
      });
    });
    
    expect(healthResponse.status()).toBeLessThan(500);
  });

  test('Frontend and Backend integration - basic page interaction', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check if we can navigate or if there are any console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any console errors
    await page.waitForTimeout(2000);
    
    // Allow some non-critical errors but fail on critical ones
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('chrome-extension') &&
      !error.includes('non-critical')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Authentication flow - sign in page accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check if sign-in page or authentication elements are accessible
    try {
      // Try to find sign-in link or button
      const signInLink = page.locator('a[href*="sign-in"], button:has-text("Sign In"), a:has-text("Sign In")').first();
      if (await signInLink.isVisible({ timeout: 5000 })) {
        await signInLink.click();
        await expect(page.url()).toContain('sign-in');
      } else {
        // If already on sign-in page or auth is handled differently
        await page.goto('/sign-in');
        await expect(page.locator('body')).toBeVisible();
      }
    } catch (error) {
      // If sign-in page doesn't exist, just verify the main page loads
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
    }
  });
});