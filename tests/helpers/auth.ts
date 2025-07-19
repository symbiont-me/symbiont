import { Page, expect } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Attempt to sign in with test credentials
   * This is a flexible helper that adapts to different auth implementations
   */
  async signIn(email: string = 'test@example.com', password: string = 'testpassword') {
    await this.page.goto('/sign-in');
    await this.page.waitForLoadState('networkidle');

    // Try to find email/username input
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="username" i]'
    ];

    let emailInput;
    for (const selector of emailSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0 && await element.isVisible({ timeout: 2000 })) {
        emailInput = element.first();
        break;
      }
    }

    // Try to find password input
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]'
    ];

    let passwordInput;
    for (const selector of passwordSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0 && await element.isVisible({ timeout: 2000 })) {
        passwordInput = element.first();
        break;
      }
    }

    if (emailInput && passwordInput) {
      await emailInput.fill(email);
      await passwordInput.fill(password);

      // Find and click submit button
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Sign In")',
        'button:has-text("Login")',
        'button:has-text("Sign in")',
        'input[type="submit"]'
      ];

      for (const selector of submitSelectors) {
        const element = this.page.locator(selector);
        if (await element.count() > 0 && await element.isVisible({ timeout: 2000 })) {
          await element.first().click();
          break;
        }
      }

      // Wait for navigation or response
      await this.page.waitForTimeout(3000);
      
      return true;
    }

    return false;
  }

  /**
   * Check if user is authenticated by looking for auth indicators
   */
  async isAuthenticated(): Promise<boolean> {
    // Look for common authenticated user indicators
    const authIndicators = [
      '[data-testid="user-menu"]',
      '.user-avatar',
      'button:has-text("Sign Out")',
      'button:has-text("Logout")',
      '.dashboard',
      '[href="/dashboard"]'
    ];

    for (const selector of authIndicators) {
      const element = this.page.locator(selector);
      if (await element.count() > 0) {
        return true;
      }
    }

    // Check URL patterns
    const url = this.page.url();
    if (url.includes('dashboard') || url.includes('studies') || url.includes('profile')) {
      return true;
    }

    return false;
  }

  /**
   * Sign out user
   */
  async signOut() {
    const signOutSelectors = [
      'button:has-text("Sign Out")',
      'button:has-text("Logout")',
      'a:has-text("Sign Out")',
      'a:has-text("Logout")',
      '[data-testid="logout"]'
    ];

    for (const selector of signOutSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0 && await element.isVisible({ timeout: 2000 })) {
        await element.first().click();
        await this.page.waitForTimeout(2000);
        return true;
      }
    }

    return false;
  }

  /**
   * Wait for authentication state to settle
   */
  async waitForAuthState(timeout: number = 5000) {
    await this.page.waitForTimeout(2000);
    
    // Wait for either sign-in form or authenticated content
    try {
      await this.page.waitForSelector([
        'input[type="email"]',
        'input[type="password"]',
        '[data-testid="user-menu"]',
        '.dashboard'
      ].join(', '), { timeout });
    } catch (error) {
      // If neither appears, continue - page might handle auth differently
    }
  }
}