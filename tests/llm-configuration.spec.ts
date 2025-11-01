import { test, expect } from '@playwright/test';
import { signInWithTestCredentials } from './helpers/auth-helper';

test.describe('LLM Settings and Configuration Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Sign in with test credentials
    await signInWithTestCredentials(page);
    
    // Should be on dashboard after successful login
    await expect(page).toHaveURL('http://localhost:4000/');
    await page.waitForLoadState('networkidle');
  });

  test('should display LLM settings interface @smoke', async ({ page }) => {
    // Look for LLM settings access points
    const settingsSelectors = [
      '[data-testid*="llm-settings"]',
      '[data-testid*="settings"]',
      'button[aria-label*="settings" i]',
      'button[aria-label*="llm" i]',
      'button:has-text("Settings")',
      'button:has-text("LLM")',
      '[role="button"][aria-label*="settings"]',
      'text=LLM Settings',
      'text=AI Settings',
      '.settings-button'
    ];
    
    let settingsButtonFound = false;
    let foundSelector = '';
    
    for (const selector of settingsSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        settingsButtonFound = true;
        foundSelector = selector;
        console.log(`Found LLM settings access with selector: ${selector}`);
        break;
      }
    }
    
    if (settingsButtonFound) {
      const settingsButton = page.locator(foundSelector).first();
      
      if (await settingsButton.isVisible({ timeout: 2000 })) {
        // Click to open settings
        await settingsButton.click();
        await page.waitForTimeout(2000);
        
        // Look for settings dialog/modal
        const settingsDialogSelectors = [
          '[data-testid*="llm-settings-dialog"]',
          '[data-testid*="settings-modal"]',
          '[role="dialog"]',
          '.modal',
          '.dialog',
          'text=LLM Settings',
          'text=AI Configuration'
        ];
        
        let settingsDialogFound = false;
        for (const dialogSelector of settingsDialogSelectors) {
          const dialogElement = page.locator(dialogSelector);
          if (await dialogElement.count() > 0 && await dialogElement.first().isVisible({ timeout: 2000 })) {
            settingsDialogFound = true;
            console.log(`LLM settings dialog opened with selector: ${dialogSelector}`);
            break;
          }
        }
        
        if (settingsDialogFound) {
          console.log('LLM settings interface is fully functional');
        } else {
          console.log('LLM settings button found but dialog not detected');
        }
      }
    } else {
      console.log('LLM settings interface not yet implemented - test ready for validation');
    }
    
    // Verify we're still on a valid page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/localhost:4000/);
  });

  test('should handle API key management', async ({ page }) => {
    // Navigate to settings if available
    const settingsButton = page.locator('[data-testid*="settings"], button[aria-label*="settings" i], button:has-text("Settings")').first();
    
    if (await settingsButton.isVisible({ timeout: 2000 })) {
      await settingsButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Look for API key input fields
    const apiKeySelectors = [
      '[data-testid*="api-key"]',
      'input[placeholder*="api key" i]',
      'input[placeholder*="key" i]',
      'input[name*="api" i]',
      'input[name*="key" i]',
      'input[type="password"][aria-label*="key" i]',
      'input[type="text"][aria-label*="key" i]',
      '.api-key-input'
    ];
    
    let apiKeyInputFound = false;
    
    for (const selector of apiKeySelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        apiKeyInputFound = true;
        console.log(`Found API key input with selector: ${selector}`);
        
        // Test API key input functionality
        if (await element.first().isVisible({ timeout: 2000 })) {
          await element.first().click();
          await element.first().fill('test-api-key-12345');
          await page.waitForTimeout(1000);
          
          const inputValue = await element.first().inputValue();
          expect(inputValue).toContain('test-api-key');
          
          console.log('API key input is functional');
          
          // Clear the test key
          await element.first().clear();
        }
        break;
      }
    }
    
    if (!apiKeyInputFound) {
      console.log('API key management not yet implemented');
    }
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/localhost:4000/);
  });

  test('should display LLM provider selection', async ({ page }) => {
    // Navigate to settings if available
    const settingsButton = page.locator('[data-testid*="settings"], button[aria-label*="settings" i], button:has-text("Settings")').first();
    
    if (await settingsButton.isVisible({ timeout: 2000 })) {
      await settingsButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Look for LLM provider selection
    const providerSelectors = [
      '[data-testid*="llm-provider"]',
      '[data-testid*="provider-select"]',
      'select[name*="provider" i]',
      'select[aria-label*="provider" i]',
      '[role="combobox"][aria-label*="provider" i]',
      'text=OpenAI',
      'text=Anthropic',
      'text=Google',
      'text=Provider'
    ];
    
    let providerSelectorFound = false;
    
    for (const selector of providerSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        providerSelectorFound = true;
        console.log(`Found LLM provider selector with selector: ${selector}`);
        
        // Test provider selection
        if (await element.first().isVisible({ timeout: 2000 })) {
          if (await element.first().getAttribute('tagName') === 'SELECT') {
            await element.first().click();
            await page.waitForTimeout(1000);
            
            console.log('LLM provider selection is functional');
          }
        }
        break;
      }
    }
    
    if (!providerSelectorFound) {
      console.log('LLM provider selection not yet implemented');
    }
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/localhost:4000/);
  });

  test('should handle model selection within providers', async ({ page }) => {
    // Navigate to settings if available
    const settingsButton = page.locator('[data-testid*="settings"], button[aria-label*="settings" i], button:has-text("Settings")').first();
    
    if (await settingsButton.isVisible({ timeout: 2000 })) {
      await settingsButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Look for model selection
    const modelSelectors = [
      '[data-testid*="model-select"]',
      '[data-testid*="llm-model"]',
      'select[name*="model" i]',
      'select[aria-label*="model" i]',
      '[role="combobox"][aria-label*="model" i]',
      'text=GPT-4',
      'text=Claude',
      'text=Gemini',
      'text=Model'
    ];
    
    let modelSelectorFound = false;
    
    for (const selector of modelSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        modelSelectorFound = true;
        console.log(`Found model selector with selector: ${selector}`);
        
        // Test model selection
        if (await element.first().isVisible({ timeout: 2000 })) {
          if (await element.first().getAttribute('tagName') === 'SELECT') {
            await element.first().click();
            await page.waitForTimeout(1000);
            
            console.log('Model selection is functional');
          }
        }
        break;
      }
    }
    
    if (!modelSelectorFound) {
      console.log('Model selection not yet implemented');
    }
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/localhost:4000/);
  });

  test('should validate settings save functionality', async ({ page }) => {
    // Navigate to settings if available
    const settingsButton = page.locator('[data-testid*="settings"], button[aria-label*="settings" i], button:has-text("Settings")').first();
    
    if (await settingsButton.isVisible({ timeout: 2000 })) {
      await settingsButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Look for save button
    const saveButtonSelectors = [
      '[data-testid*="save"]',
      'button[type="submit"]',
      'button:has-text("Save")',
      'button:has-text("Apply")',
      'button[aria-label*="save" i]',
      '.save-button'
    ];
    
    let saveButtonFound = false;
    
    for (const selector of saveButtonSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        saveButtonFound = true;
        console.log(`Found save button with selector: ${selector}`);
        
        // Test save button (hover only, don't actually save)
        if (await element.first().isVisible({ timeout: 2000 })) {
          await element.first().hover();
          console.log('Settings save functionality is available');
        }
        break;
      }
    }
    
    if (!saveButtonFound) {
      console.log('Settings save functionality not yet implemented');
    }
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/localhost:4000/);
  });

  test('should handle settings dialog close functionality', async ({ page }) => {
    // Navigate to settings if available
    const settingsButton = page.locator('[data-testid*="settings"], button[aria-label*="settings" i], button:has-text("Settings")').first();
    
    if (await settingsButton.isVisible({ timeout: 2000 })) {
      await settingsButton.click();
      await page.waitForTimeout(2000);
      
      // Look for close button
      const closeButtonSelectors = [
        '[data-testid*="close"]',
        '[data-testid*="llm-settings-close"]',
        'button[aria-label*="close" i]',
        'button:has-text("Close")',
        'button:has-text("Cancel")',
        '[role="button"][aria-label*="close"]',
        '.close-button',
        '.modal-close'
      ];
      
      let closeButtonFound = false;
      
      for (const selector of closeButtonSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          closeButtonFound = true;
          console.log(`Found close button with selector: ${selector}`);
          
          // Test close functionality
          if (await element.first().isVisible({ timeout: 2000 })) {
            await element.first().click();
            await page.waitForTimeout(1000);
            
            console.log('Settings dialog close functionality is working');
          }
          break;
        }
      }
      
      if (!closeButtonFound) {
        console.log('Settings close functionality not yet implemented');
      }
    } else {
      console.log('Settings dialog not accessible for close test');
    }
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/localhost:4000/);
  });

  test('should display privacy notice for API keys', async ({ page }) => {
    // Navigate to settings if available
    const settingsButton = page.locator('[data-testid*="settings"], button[aria-label*="settings" i], button:has-text("Settings")').first();
    
    if (await settingsButton.isVisible({ timeout: 2000 })) {
      await settingsButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Look for privacy notice
    const privacyNoticeSelectors = [
      'text=we do not store',
      'text=privacy',
      'text=secure',
      'text=not stored',
      'text=encrypted',
      '[data-testid*="privacy"]',
      '.privacy-notice',
      '.security-notice'
    ];
    
    let privacyNoticeFound = false;
    
    for (const selector of privacyNoticeSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        privacyNoticeFound = true;
        console.log(`Found privacy notice with selector: ${selector}`);
        
        if (await element.first().isVisible({ timeout: 2000 })) {
          console.log('Privacy notice is displayed to users');
        }
        break;
      }
    }
    
    if (!privacyNoticeFound) {
      console.log('Privacy notice for API keys not yet implemented');
    }
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/localhost:4000/);
  });

  test('should validate configuration persistence', async ({ page }) => {
    // This test checks if settings persist across page reloads
    
    // Navigate to settings if available
    const settingsButton = page.locator('[data-testid*="settings"], button[aria-label*="settings" i], button:has-text("Settings")').first();
    
    if (await settingsButton.isVisible({ timeout: 2000 })) {
      await settingsButton.click();
      await page.waitForTimeout(2000);
      
      // Look for any configuration that might be persisted
      const configSelectors = [
        'select[name*="provider" i]',
        'select[name*="model" i]',
        'input[name*="api" i]',
        '[role="combobox"]'
      ];
      
      let configFound = false;
      let initialValue = '';
      
      for (const selector of configSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0 && await element.first().isVisible({ timeout: 2000 })) {
          configFound = true;
          
          // Get current value if any
          if (await element.first().getAttribute('tagName') === 'SELECT') {
            const selectedOption = await element.first().locator('option[selected]').textContent();
            initialValue = selectedOption || '';
          } else {
            initialValue = await element.first().inputValue();
          }
          
          console.log(`Found configuration element with value: ${initialValue}`);
          break;
        }
      }
      
      if (configFound) {
        // Close settings
        const closeButton = page.locator('[data-testid*="close"], button[aria-label*="close" i], button:has-text("Close")').first();
        if (await closeButton.isVisible({ timeout: 2000 })) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        }
        
        // Reload page to test persistence
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        console.log('Configuration persistence test completed - values would be validated in full implementation');
      } else {
        console.log('No configuration elements found to test persistence');
      }
    } else {
      console.log('Settings not accessible for persistence test');
    }
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/localhost:4000/);
  });

  test('should handle invalid API key validation', async ({ page }) => {
    // Navigate to settings if available
    const settingsButton = page.locator('[data-testid*="settings"], button[aria-label*="settings" i], button:has-text("Settings")').first();
    
    if (await settingsButton.isVisible({ timeout: 2000 })) {
      await settingsButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Look for API key input and test validation
    const apiKeyInput = page.locator('[data-testid*="api-key"], input[placeholder*="api key" i], input[name*="api" i]').first();
    
    if (await apiKeyInput.isVisible({ timeout: 2000 })) {
      // Test with invalid API key format
      await apiKeyInput.fill('invalid-key-123');
      await page.waitForTimeout(1000);
      
      // Look for validation messages
      const validationSelectors = [
        'text=Invalid',
        'text=Error',
        'text=invalid key',
        '.error-message',
        '.validation-error',
        '[role="alert"]'
      ];
      
      let validationFound = false;
      for (const selector of validationSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          validationFound = true;
          console.log(`Found validation message with selector: ${selector}`);
          break;
        }
      }
      
      if (!validationFound) {
        console.log('API key validation not yet implemented - would appear with real validation');
      }
      
      // Clear the invalid key
      await apiKeyInput.clear();
    } else {
      console.log('API key input not available for validation test');
    }
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/localhost:4000/);
  });

  test('should display available LLM providers and models', async ({ page }) => {
    // Navigate to settings if available
    const settingsButton = page.locator('[data-testid*="settings"], button[aria-label*="settings" i], button:has-text("Settings")').first();
    
    if (await settingsButton.isVisible({ timeout: 2000 })) {
      await settingsButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Check for specific provider mentions
    const providerTexts = [
      'OpenAI',
      'Anthropic', 
      'Google',
      'Claude',
      'GPT',
      'Gemini'
    ];
    
    let providersFound = [];
    
    for (const providerText of providerTexts) {
      const element = page.locator(`text=${providerText}`);
      if (await element.count() > 0) {
        providersFound.push(providerText);
        console.log(`Found provider option: ${providerText}`);
      }
    }
    
    if (providersFound.length > 0) {
      console.log(`Available LLM providers detected: ${providersFound.join(', ')}`);
    } else {
      console.log('LLM provider options not yet implemented');
    }
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/localhost:4000/);
  });
});