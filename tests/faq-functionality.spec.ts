import { test, expect } from '@playwright/test';

test.describe('FAQ Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4000/');
  });

  test('should expand and show content when FAQ item is clicked', async ({ page }) => {
    const faqButton = page.getByRole('button', { name: 'What is Symbiont?' });
    
    // Initially, the FAQ content should not be visible
    await expect(page.getByText('Symbiont is an AI powered research tool. It can find information in a large corpus and answer specific questions.')).not.toBeVisible();
    
    // Click the FAQ button
    await faqButton.click();
    
    // Verify the button is now expanded
    await expect(faqButton).toHaveAttribute('aria-expanded', 'true');
    
    // Verify the content is now visible
    await expect(page.getByText('Symbiont is an AI powered research tool. It can find information in a large corpus and answer specific questions.')).toBeVisible();
  });

  test('should expand second FAQ item and show different content', async ({ page }) => {
    const faqButton = page.getByRole('button', { name: 'How is Symbiont different from LLMs?' });
    
    // Click the second FAQ button
    await faqButton.click();
    
    // Verify the button is expanded
    await expect(faqButton).toHaveAttribute('aria-expanded', 'true');
    
    // Verify the specific content for this FAQ
    await expect(page.getByText('Symbiont is designed to answer questions based on the resources provided. It is much less likely to hallucinate information (i.e. make up things)')).toBeVisible();
  });

  test('should allow multiple FAQ items to be expanded simultaneously', async ({ page }) => {
    // Expand first FAQ
    await page.getByRole('button', { name: 'What is Symbiont?' }).click();
    await expect(page.getByText('Symbiont is an AI powered research tool. It can find information in a large corpus and answer specific questions.')).toBeVisible();
    
    // Expand second FAQ
    await page.getByRole('button', { name: 'How is Symbiont different from LLMs?' }).click();
    await expect(page.getByText('Symbiont is designed to answer questions based on the resources provided. It is much less likely to hallucinate information (i.e. make up things)')).toBeVisible();
    
    // Both should remain visible
    await expect(page.getByText('Symbiont is an AI powered research tool. It can find information in a large corpus and answer specific questions.')).toBeVisible();
    await expect(page.getByText('Symbiont is designed to answer questions based on the resources provided. It is much less likely to hallucinate information (i.e. make up things)')).toBeVisible();
  });

  test('should have all FAQ questions available', async ({ page }) => {
    const expectedFaqQuestions = [
      'What is Symbiont?',
      'How is Symbiont different from LLMs?',
      'What is the price of Symbiont?',
      'Where can I get the API key?',
      'What will my API key be used for?',
      'How can I request new features?'
    ];

    for (const question of expectedFaqQuestions) {
      await expect(page.getByRole('button', { name: question })).toBeVisible();
    }
  });

  test('should collapse FAQ when clicked again', async ({ page }) => {
    const faqButton = page.getByRole('button', { name: 'What is Symbiont?' });
    
    // Expand FAQ
    await faqButton.click();
    await expect(page.getByText('Symbiont is an AI powered research tool. It can find information in a large corpus and answer specific questions.')).toBeVisible();
    
    // Collapse FAQ by clicking again
    await faqButton.click();
    await expect(page.getByText('Symbiont is an AI powered research tool. It can find information in a large corpus and answer specific questions.')).not.toBeVisible();
    await expect(faqButton).toHaveAttribute('aria-expanded', 'false');
  });
});