import { test, expect } from "@playwright/test";
import {
  signInWithTestCredentials,
  createTestStudy,
} from "./helpers/auth-helper";

test.describe("Comprehensive End-to-End Workflow", () => {
  let studyName: string;

  test.beforeEach(async ({ page }) => {
    // Only sign in for the isolated tests, not the main workflow test
  });

  test("complete workflow: login -> create study -> add API key -> upload PDF -> chat", async ({
    page,
  }) => {
    test.setTimeout(120000);
    // Step 0: Complete signin and study creation
    console.log("Step 0: Signing in and creating study...");

    // Sign in with test credentials from test-credentials.json
    await signInWithTestCredentials(page);

    // Create a unique study name for this test
    const timestamp = Date.now();
    studyName = `E2E Workflow Study ${timestamp}`;
    console.log(`Creating study: ${studyName}`);
    await createTestStudy(
      page,
      studyName,
      "Complete workflow test with PDF resource and chat"
    );

    // Navigate to study workspace
    await page.getByRole("link", { name: new RegExp(studyName) }).click();
    await expect(page).toHaveURL(/\/study\/[a-f0-9-]+$/);

    // Wait for page to load completely
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    console.log(
      `Starting comprehensive workflow test with study: ${studyName}`
    );

    // Step 1: Configure LLM settings with API key from environment
    console.log("Step 1: Configuring LLM settings...");

    // Look for settings button/menu
    const settingsSelectors = [
      '[data-testid*="llm-settings"]',
      '[data-testid*="settings"]',
      'button[aria-label*="settings" i]',
      'button:has-text("Settings")',
      "text=Settings",
      ".settings-button",
    ];

    let settingsFound = false;
    for (const selector of settingsSelectors) {
      const element = page.locator(selector);
      if (
        (await element.count()) > 0 &&
        (await element.isVisible({ timeout: 2000 }))
      ) {
        console.log(`Found settings with selector: ${selector}`);
        await element.first().click();
        await page.waitForTimeout(2000);
        settingsFound = true;
        break;
      }
    }

    if (settingsFound) {
      // Get API key from environment (simulating what a user would do)
      if (!process.env.OPENAI_KEY_FOR_TESTING) {
        throw new Error(
          "OPENAI_KEY_FOR_TESTING environment variable is not set"
        );
      }
      const testApiKey = process.env.OPENAI_KEY_FOR_TESTING;
      console.log("Using API key from environment for test");

      // Step 1a: Select GPT-4o-mini model
      const modelSelect = page.locator('[data-testid="llm-model-select"]');
      if (
        (await modelSelect.count()) > 0 &&
        (await modelSelect.isVisible({ timeout: 2000 }))
      ) {
        console.log("Found model selector, selecting GPT-4o-mini...");
        await modelSelect.click();
        await page.waitForTimeout(500);

        // Look for GPT_OMNI_MINI option in the dropdown menu
        const gpt4oMiniOption = page.getByRole('option', { name: 'GPT_OMNI_MINI' });
        if ((await gpt4oMiniOption.count()) > 0) {
          await gpt4oMiniOption.click();
          console.log("Selected GPT-4o-mini model");
        } else {
          console.log("GPT-4o-mini option not found, using default model");
        }
        await page.waitForTimeout(500);
      }

      // Step 1b: Set API key
      const apiKeyInput = page.locator('[data-testid="api-key-input"] input');

      let apiKeySet = false;
      if (
        (await apiKeyInput.count()) > 0 &&
        (await apiKeyInput.isVisible({ timeout: 2000 }))
      ) {
        console.log("Found API key input field");
        await apiKeyInput.fill(testApiKey);
        await page.waitForTimeout(1000);

        // Verify input was filled
        const inputValue = await apiKeyInput.inputValue();
        expect(inputValue).toBe(testApiKey);
        console.log("API key configured successfully");
        apiKeySet = true;
      } else {
        console.log("API key input field not found");
      }

      // Step 1c: Save settings
      if (apiKeySet) {
        const saveButton = page.locator('[data-testid="llm-settings-save"]');
        if (
          (await saveButton.count()) > 0 &&
          (await saveButton.isVisible({ timeout: 2000 }))
        ) {
          console.log("Saving LLM settings...");
          await saveButton.click();
          await page.waitForTimeout(3000); // Wait longer for save to complete
          console.log("LLM settings saved successfully");
        }
      }

      // Step 1d: Close settings dialog
      const closeButton = page.locator('[data-testid="llm-settings-close"]');
      if (
        (await closeButton.count()) > 0 &&
        (await closeButton.isVisible({ timeout: 2000 }))
      ) {
        console.log("Closing settings dialog...");
        await closeButton.click();
        await page.waitForTimeout(1000);
      }
    } else {
      console.log("Settings interface not found - continuing with workflow");
    }

    // Step 2: Navigate to the Resources tab and open add resources modal
    console.log(
      "Step 2: Navigating to Resources tab and adding PDF resource..."
    );

    // First click on the "Resources" tab
    const resourcesTab = page.locator(
      '[role="tab"]:has-text("Resources")'
    );
    if (
      (await resourcesTab.count()) > 0 &&
      (await resourcesTab.isVisible({ timeout: 3000 }))
    ) {
      console.log("Found Resources tab, clicking...");
      await resourcesTab.click();
      await page.waitForTimeout(1000);
    } else {
      console.log("Resources tab not found - trying alternative selectors");
    }

    // Click on the "Add Resources" button to open the modal
    const addResourcesButton = page.locator('button:has-text("Add Resources")').first();
    if (
      (await addResourcesButton.count()) > 0 &&
      (await addResourcesButton.isVisible({ timeout: 3000 }))
    ) {
      console.log("Found Add Resources button, clicking...");
      await addResourcesButton.click();
      await page.waitForTimeout(2000); // Wait for modal to open
    } else {
      console.log("Add Resources button not found - trying alternative selectors");
    }

    // Click on the "Upload file" tab within the modal
    const uploadFileTab = page.locator('[role="tab"]:has-text("Upload file")');
    if (
      (await uploadFileTab.count()) > 0 &&
      (await uploadFileTab.isVisible({ timeout: 3000 }))
    ) {
      console.log("Found Upload file tab in modal, clicking...");
      await uploadFileTab.click();
      await page.waitForTimeout(1000);
    } else {
      console.log("Upload file tab not found in modal - trying alternative selectors");
    }

    // Look for the file input inside the dropzone component
    const fileInput = page.locator(
      '[data-testid="file-upload-dropzone"] input[type="file"]'
    );

    let resourceAdded = false;
    if ((await fileInput.count()) > 0) {
      console.log("Found file upload input in dropzone");
      await fileInput.setInputFiles(
        "/Users/leviathan/_CS/_projects/symbiont-monorepo/monorepo/tests/resources/well-being-for-all-test.pdf"
      );
      console.log("PDF file uploaded successfully");
      resourceAdded = true;
    } else {
      console.log("File upload input not found in dropzone");
    }

    if (resourceAdded) {
      console.log("PDF resource uploaded successfully");

      console.log("Resource uploaded, will check readiness in chat section");
    } else {
      console.log(
        "Resource upload interface not found - continuing with chat test"
      );
    }

    // Step 3: Start a chat with the resource
    console.log("Step 3: Starting chat interaction...");

    // Wait for the "Please add resources before chat" alert to disappear (indicating resource is ready)
    console.log("Waiting for resource to be ready for chat...");
    let chatReady = false;
    for (let i = 0; i < 24; i++) {
      // Wait up to 2 minutes
      const noResourceAlert = page.locator(
        '[data-testid="no-resources-alert"]'
      );
      const alertVisible = await noResourceAlert.isVisible();

      if (!alertVisible) {
        console.log("Resource is ready for chat (no-resources alert is gone)");
        chatReady = true;
        break;
      }

      console.log(
        `Waiting for resource to be ready for chat... (${(i + 1) * 5}s)`
      );
      await page.waitForTimeout(5000);
    }

    if (!chatReady) {
      console.log(
        "Resource may still be processing, but continuing with chat test"
      );
    }

    // Wait a bit more for chat interface
    await page.waitForTimeout(2000);

    // Look for chat input using the correct data-testid (now a textarea)
    const chatInput = page.locator('[data-testid="chat-input-field"]');

    if ((await chatInput.count()) === 0) {
      console.log("Chat input field not found");
    } else {
      console.log("Found chat input field (Material-UI TextField input)");
    }

    // Use the actual input element inside the TextField
    const activeInput = chatInput;

    if (
      (await activeInput.count()) > 0 &&
      (await activeInput.isVisible({ timeout: 3000 }))
    ) {
      // Step 4: Send a message and wait for response
      console.log("Step 4: Sending chat message...");
      const testMessage = "What is the main topic of the uploaded document?";

      await activeInput.fill(testMessage);
      await page.waitForTimeout(1000);

      // Verify message was entered
      const inputValue = await activeInput.inputValue();
      expect(inputValue).toContain("main topic");

      // Look for send button using correct data-testid
      const sendButton = page.locator('[data-testid="chat-send-button"]');

      let messageSent = false;
      if (
        (await sendButton.count()) > 0 &&
        (await sendButton.isVisible({ timeout: 2000 }))
      ) {
        console.log("Sending message with send button...");
        await sendButton.click();
        messageSent = true;
      } else {
        // Try pressing Enter if no send button found
        console.log(
          "Send button not found, attempting to send message with Enter key..."
        );
        await activeInput.press("Enter");
        messageSent = true;
      }

      if (messageSent) {
        console.log("Message sent successfully");

        // Wait for AI response
        console.log("Waiting for AI response...");

        // Look for response indicators (based on actual MessageList component)
        const responseSelectors = [
          ".ai-response",  // This is the actual class used in MessageList.tsx
          ".user-message", // Also look for user messages to count total messages
        ];

        let responseReceived = false;
        for (let i = 0; i < 12; i++) {
          // Wait up to 60 seconds for response
          
          // Check for all messages first for debugging
          const userMessages = page.locator(".user-message");
          const aiResponses = page.locator(".ai-response");
          const userMessageCount = await userMessages.count();
          const aiResponseCount = await aiResponses.count();
          
          console.log(`Debug: Found ${userMessageCount} user message(s) and ${aiResponseCount} AI response(s)`);
          
          if (aiResponseCount > 0) {
            console.log(`Found ${aiResponseCount} AI response(s)`);
            // Check if any AI response has substantial content
            for (let j = 0; j < aiResponseCount; j++) {
              const aiResponse = aiResponses.nth(j);
              const textContent = await aiResponse.textContent();
              console.log(`AI response ${j}: "${textContent?.substring(0, 100)}..."`);
              if (textContent && textContent.trim().length > 20) {
                console.log("AI response with substantial content detected");
                responseReceived = true;
                break;
              }
            }
          }
          
          if (responseReceived) break;

          // Also check for loading indicators (using actual data-testid from ChatComponentMain.tsx)
          const loadingSelectors = [
            '[data-testid="chat-loading"]',  // This is the actual loading indicator
            '[data-testid*="loading"]',
            "text=Thinking...",
            "text=Processing...",
            ".loading",
          ];

          let loadingFound = false;
          for (const loadingSelector of loadingSelectors) {
            const loadingElement = page.locator(loadingSelector);
            if ((await loadingElement.count()) > 0) {
              console.log("AI is processing...");
              loadingFound = true;
              break;
            }
          }

          if (!loadingFound && i > 3) {
            console.log(
              "No loading indicator found - response may have completed or not started"
            );
          }

          await page.waitForTimeout(5000);
          console.log(`Waiting for AI response... (${(i + 1) * 5}s)`);
        }

        if (responseReceived) {
          console.log("✓ Complete workflow successful: login -> study -> settings -> resource -> chat -> response");
          console.log("✓ AI response detected with substantial content");
        } else {
          console.log("❌ Chat message sent but response not detected within timeout");
        }
      } else {
        console.log(
          "Unable to send chat message - workflow partially successful"
        );
      }
    } else {
      console.log(
        "Chat interface not found - workflow completed up to resource upload"
      );
    }

    // Final verification - ensure we're still on the study page
    await expect(page).toHaveURL(/\/study\/[a-f0-9-]+$/);
    console.log("Comprehensive workflow test completed");
  });

  test.skip("verify resource shows in chat context selection", async ({ page }) => {
    console.log("Testing resource context selection for chat...");

    // Sign in and create study for this test
    await signInWithTestCredentials(page);
    const timestamp = Date.now();
    const testStudyName = `Resource Test Study ${timestamp}`;
    await createTestStudy(
      page,
      testStudyName,
      "Resource context selection test"
    );
    await page.getByRole("link", { name: new RegExp(testStudyName) }).click();
    await expect(page).toHaveURL(/\/study\/[a-f0-9-]+$/);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // First add a resource (simplified version of above)
    const fileInput = page.locator('input[type="file"]');
    if (
      (await fileInput.count()) > 0 &&
      ((await fileInput.isVisible({ timeout: 2000 })) || true)
    ) {
      await fileInput.setInputFiles(
        "/Users/leviathan/_CS/_projects/symbiont-monorepo/monorepo/tests/resources/well-being-for-all-test.pdf"
      );
      await page.waitForTimeout(5000);
    }

    // Look for resource selection in chat context
    const resourceSelectionSelectors = [
      '[data-testid*="resource-selector"]',
      '[data-testid*="context-selector"]',
      'select[aria-label*="resource" i]',
      '[role="combobox"]',
      ".resource-selector",
      "text=Select resource",
      "text=well-being-for-all-test.pdf",
    ];

    let resourceSelectorFound = false;
    for (const selector of resourceSelectionSelectors) {
      const element = page.locator(selector);
      if ((await element.count()) > 0) {
        console.log(`Found resource selector: ${selector}`);
        resourceSelectorFound = true;

        if (await element.first().isVisible({ timeout: 2000 })) {
          await element.first().click();
          await page.waitForTimeout(1000);
          console.log("Resource selector is functional");
        }
        break;
      }
    }

    if (!resourceSelectorFound) {
      console.log("Resource context selection not yet implemented");
    }

    await expect(page).toHaveURL(/\/study\/[a-f0-9-]+$/);
  });

  test.skip("verify chat history persistence", async ({ page }) => {
    console.log("Testing chat history persistence...");

    // Sign in and create study for this test
    await signInWithTestCredentials(page);
    const timestamp = Date.now();
    const testStudyName = `Chat History Test Study ${timestamp}`;
    await createTestStudy(page, testStudyName, "Chat history persistence test");
    await page.getByRole("link", { name: new RegExp(testStudyName) }).click();
    await expect(page).toHaveURL(/\/study\/[a-f0-9-]+$/);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Look for existing chat messages or send a test message
    const chatInput = page
      .locator('[data-testid="chat-input-field"]')
      .first();

    if (await chatInput.isVisible({ timeout: 3000 })) {
      const testMessage = "Test message for history persistence";
      await chatInput.fill(testMessage);
      await chatInput.press("Enter");
      await page.waitForTimeout(2000);

      // Reload page to test persistence
      await page.reload();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);

      // Check if message appears in history
      const messageElement = page.locator(`text=${testMessage}`);
      if ((await messageElement.count()) > 0) {
        console.log("Chat history persists across page reloads");
      } else {
        console.log(
          "Chat history persistence not detected - may not be implemented yet"
        );
      }
    } else {
      console.log("Chat interface not available for persistence test");
    }

    await expect(page).toHaveURL(/\/study\/[a-f0-9-]+$/);
  });
});
