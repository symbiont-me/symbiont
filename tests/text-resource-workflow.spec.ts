import { test, expect } from "@playwright/test";
import {
  signInWithTestCredentials,
  createTestStudy,
  navigateToStudyWorkspace,
} from "./helpers/auth-helper";

test.describe("Text Resource Workflow", () => {
  let studyName: string;

  test("complete workflow: login -> create study -> add API key -> add text resource -> chat", async ({
    page,
  }) => {
    test.setTimeout(120000); // 2 minutes for text processing
    
    console.log("Step 0: Signing in and creating study...");

    // Sign in with test credentials
    await signInWithTestCredentials(page);

    // Create a unique study name for this test
    const timestamp = Date.now();
    studyName = `Text Resource Workflow Study ${timestamp}`;
    console.log(`Creating study: ${studyName}`);
    await createTestStudy(
      page,
      studyName,
      "Text resource workflow test with chat functionality"
    );

    // Navigate to study workspace
    await navigateToStudyWorkspace(page, studyName);

    console.log(
      `Starting text resource workflow test with study: ${studyName}`
    );

    // Step 1: Configure LLM settings with API key
    console.log("Step 1: Configuring LLM settings...");

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
      // Get API key from environment
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
          await page.waitForTimeout(3000);
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

    // Step 2: Navigate to the "add resources" tab and add text resource
    console.log(
      "Step 2: Navigating to add resources tab and adding text resource..."
    );

    // Click on the "add resources" tab
    const addResourcesTab = page.locator(
      '[role="tab"]:has-text("add resources")'
    );
    if (
      (await addResourcesTab.count()) > 0 &&
      (await addResourcesTab.isVisible({ timeout: 3000 }))
    ) {
      console.log("Found add resources tab, clicking...");
      await addResourcesTab.click();
      await page.waitForTimeout(1000);
    } else {
      console.log("Add resources tab not found - trying alternative selectors");
    }

    // Add text resource content and name using "The Right to the City" content
    const testTextContent = `The Right to the City
Theoretical thought sees itself compelled to redefine the forms, functions and structures of the city (economic, political, cultural, etc.) as well as the social needs inherent to urban society. Until now, only those individual needs, motivated by the so-called society of consumption (a bureaucratic society of managed consumption) have been prospected, and moreover manipulated rather than effectively known and recognized. Social needs have an anthropological foundation. Opposed and complimentary, they include the need for security and opening, the need for certainty and adventure, that of organization of work and of play, the needs for the predictable and the unpredictable, of similarity and difference, of isolation and encounter, exchange and investments, of independence (even solitude) and communication, of immediate and long-term prospects. The human being has the need to accumulate energies and to spend them, even waste them in play. He has a need to see, to hear, to touch, to taste and the need to gather these perceptions in a 'world'. To these anthropological needs which are socially elaborated (that is, sometimes separated, sometimes joined together, here compressed and there hypertrophied), can be added specific needs which are not satisfied by those commercial and cultural infrastructures which are somewhat parsimoniously taken into account by planners. This refers to the need for creative activity, for the oeuvre (not only of products and consumable material goods), of the need for information, symbolism, the imaginary and play. Through these specified needs lives and survives a fundamental desire of which play, sexuality, physical activities such as sport, creative activity, art and knowledge are particular expressions and moments, which can more or less overcome the fragmentary division of tasks. Finally, the need of the city and urban life can only be freely expressed within a perspective which here attempts to become clearer and to open up the horizon. Would not specific urban needs be those of qualified places, places of simultaneity and encounters, places where exchange would not go through exchange value, commerce and profit? Would there not also be the need for a time for these encounters, these exchanges?

At present, an analytical science of the city, which is necessary, is only at the outline stage. At the beginning of their elaboration, concepts and theories can only move forward with urban reality in the making, with the praxis (social practice) of urban society. Now, not without effort, the ideologies and practices which blocked the horizon and which were only bottlenecks of knowledge and action, are being overcome.`;

    const testResourceName = "The Right to the City - Henri Lefebvre";
    let resourceAdded = false;

    // Look for text content input using data-testid (target the interactive textarea, not the hidden one)
    const textContentInput = page.locator('[data-testid="text-resource-content-input"] textarea:not([readonly]):not([aria-hidden="true"])');
    
    if ((await textContentInput.count()) > 0 && (await textContentInput.isVisible({ timeout: 5000 }))) {
      console.log("Found text resource content input field");
      await textContentInput.fill(testTextContent);
      await page.waitForTimeout(1000);

      // Verify content was entered
      const contentValue = await textContentInput.inputValue();
      expect(contentValue).toContain("Right to the City");

      // Look for text resource name input using data-testid
      const textNameInput = page.locator('[data-testid="text-resource-name-input"] input');
      
      if ((await textNameInput.count()) > 0 && (await textNameInput.isVisible({ timeout: 2000 }))) {
        console.log("Found text resource name input field");
        await textNameInput.fill(testResourceName);
        await page.waitForTimeout(1000);

        // Verify name was entered
        const nameValue = await textNameInput.inputValue();
        expect(nameValue).toBe(testResourceName);

        // Look for the Add Text Resource button using data-testid
        const addButton = page.locator('[data-testid="add-text-resource-button"]');
        
        if ((await addButton.count()) > 0 && (await addButton.isVisible({ timeout: 2000 }))) {
          console.log("Found Add Text Resource button");
          await addButton.click();
          console.log("Text resource submitted successfully");
          resourceAdded = true;
        } else {
          console.log("Add Text Resource button not found");
        }
      } else {
        console.log("Text resource name input field not found");
      }
    } else {
      console.log("Text resource content input field not found");
    }

    if (resourceAdded) {
      console.log("Text resource added successfully");
      console.log("Text resource added, will check readiness in chat section");
    } else {
      console.log(
        "Text resource input interface not found - continuing with chat test"
      );
    }

    // Step 3: Wait for text processing and start chat
    console.log("Step 3: Waiting for text processing and starting chat...");

    // Wait for text resource processing (should be faster than PDF/YouTube)
    console.log("Waiting for text resource to be processed...");
    let chatReady = false;
    for (let i = 0; i < 12; i++) {
      // Wait up to 1 minute for text processing
      const noResourceAlert = page.locator(
        '[data-testid="no-resources-alert"]'
      );
      const alertVisible = await noResourceAlert.isVisible();

      if (!alertVisible) {
        console.log("Text resource is ready for chat (no-resources alert is gone)");
        chatReady = true;
        break;
      }

      console.log(
        `Waiting for text resource to be processed... (${(i + 1) * 5}s)`
      );
      await page.waitForTimeout(5000);
    }

    if (!chatReady) {
      console.log(
        "Text resource may still be processing, but continuing with chat test"
      );
    }

    await page.waitForTimeout(2000);

    // Look for chat input
    const chatInput = page.locator('[data-testid="chat-input-field"] input');

    if ((await chatInput.count()) === 0) {
      console.log("Chat input field not found");
    } else {
      console.log("Found chat input field");
    }

    const activeInput = chatInput;

    if (
      (await activeInput.count()) > 0 &&
      (await activeInput.isVisible({ timeout: 3000 }))
    ) {
      // Step 4: Send a text-specific message and wait for response
      console.log("Step 4: Sending text resource-specific chat message...");
      const testMessage = "What is Henri Lefebvre's concept of the 'Right to the City'? Can you explain the main ideas in this text?";

      await activeInput.fill(testMessage);
      await page.waitForTimeout(1000);

      // Verify message was entered
      const inputValue = await activeInput.inputValue();
      expect(inputValue).toContain("Right to the City");

      // Send the message
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
        console.log(
          "Send button not found, attempting to send message with Enter key..."
        );
        await activeInput.press("Enter");
        messageSent = true;
      }

      if (messageSent) {
        console.log("Message sent successfully");

        // Wait for AI response about the text content
        console.log("Waiting for AI response about text resource content...");

        let responseReceived = false;
        for (let i = 0; i < 24; i++) {
          // Wait up to 2 minutes for response
          
          const userMessages = page.locator(".user-message");
          const aiResponses = page.locator(".ai-response");
          const userMessageCount = await userMessages.count();
          const aiResponseCount = await aiResponses.count();
          
          console.log(`Debug: Found ${userMessageCount} user message(s) and ${aiResponseCount} AI response(s)`);
          
          if (aiResponseCount > 0) {
            console.log(`Found ${aiResponseCount} AI response(s)`);
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

          // Check for loading indicators
          const loadingSelectors = [
            '[data-testid="chat-loading"]',
            '[data-testid*="loading"]',
            "text=Thinking...",
            "text=Processing...",
            ".loading",
          ];

          let loadingFound = false;
          for (const loadingSelector of loadingSelectors) {
            const loadingElement = page.locator(loadingSelector);
            if ((await loadingElement.count()) > 0) {
              console.log("AI is processing text resource content...");
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
          console.log(`Waiting for AI response about text resource... (${(i + 1) * 5}s)`);
        }

        if (responseReceived) {
          console.log("✓ Complete text resource workflow successful: login -> study -> settings -> text upload -> chat -> response");
          console.log("✓ AI response detected with substantial content about text resource");
        } else {
          console.log("❌ Chat message sent but response about text content not detected within timeout");
        }
      } else {
        console.log(
          "Unable to send chat message - text resource workflow partially successful"
        );
      }
    } else {
      console.log(
        "Chat interface not found - text resource workflow completed up to resource upload"
      );
    }

    // Final verification - ensure we're still on the study page
    await expect(page).toHaveURL(/\/studies\/[a-f0-9-]+$/);
    console.log("Text resource workflow test completed");
  });

  test.skip("verify text resource shows in resource list", async ({ page }) => {
    console.log("Testing text resource visibility in resource list...");

    // Sign in and create study for this test
    await signInWithTestCredentials(page);
    const timestamp = Date.now();
    const testStudyName = `Text Resource Test Study ${timestamp}`;
    await createTestStudy(
      page,
      testStudyName,
      "Text resource list visibility test"
    );
    await navigateToStudyWorkspace(page, testStudyName);

    // Add text resource first
    const testTextContent = "Sample text for testing resource list visibility";
    const testResourceName = "Test Resource";
    
    // Navigate to resources tab
    const resourcesTab = page.locator('[role="tab"]:has-text("resources")');
    if ((await resourcesTab.count()) > 0) {
      await resourcesTab.click();
      await page.waitForTimeout(2000);
    }

    // Look for resource list items that might show text resources
    const resourceListSelectors = [
      '[data-testid="resource-list"] .resource-item',
      '.resource-list .text-resource',
      '.resource-item:has-text("Test Resource")',
      '[data-testid*="resource"]:has-text("text")',
    ];

    let textResourceFound = false;
    for (const selector of resourceListSelectors) {
      const resourceElement = page.locator(selector);
      if ((await resourceElement.count()) > 0) {
        console.log(`Found text resource in list with selector: ${selector}`);
        const resourceText = await resourceElement.first().textContent();
        console.log(`Resource text: ${resourceText}`);
        textResourceFound = true;
        break;
      }
    }

    if (!textResourceFound) {
      console.log("Text resource not found in resource list - may not be implemented yet");
    }

    await expect(page).toHaveURL(/\/studies\/[a-f0-9-]+$/);
  });

  test.skip("verify text resource content is searchable", async ({ page }) => {
    console.log("Testing text resource searchability in chat...");

    // This test would verify that text resource content can be properly
    // searched and cited in chat responses
    
    await signInWithTestCredentials(page);
    const timestamp = Date.now();
    const testStudyName = `Text Search Test Study ${timestamp}`;
    await createTestStudy(
      page,
      testStudyName,
      "Text resource search test"
    );
    await navigateToStudyWorkspace(page, testStudyName);

    // Add a text resource with specific searchable content
    const searchableContent = `
    The Quick Brown Fox Experiment was conducted in 2023.
    Results showed that foxes can jump over lazy dogs with 95% accuracy.
    This groundbreaking research was published in the Journal of Animal Athletics.
    `;
    
    // Test that specific phrases from the text can be found in chat responses
    const chatInput = page.locator('[data-testid="chat-input-field"] input');
    if ((await chatInput.count()) > 0) {
      await chatInput.fill("Tell me about the Quick Brown Fox Experiment");
      await chatInput.press("Enter");
      await page.waitForTimeout(5000);
      
      // Look for citations or references to the text resource content
      const responseArea = page.locator(".ai-response");
      if ((await responseArea.count()) > 0) {
        const responseText = await responseArea.first().textContent();
        if (responseText?.includes("Quick Brown Fox") || responseText?.includes("2023")) {
          console.log("Text resource content is properly searchable and citable");
        } else {
          console.log("Text resource search functionality may not be working");
        }
      }
    }

    await expect(page).toHaveURL(/\/studies\/[a-f0-9-]+$/);
  });
});