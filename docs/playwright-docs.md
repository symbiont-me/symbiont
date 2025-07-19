(Files content cropped to 300k characters, download full ingest to see more)
================================================
FILE: docs/src/accessibility-testing-java.md
================================================
---
id: accessibility-testing
title: "Accessibility testing"
---

## Introduction

Playwright can be used to test your application for many types of accessibility issues.

A few examples of problems this can catch include:
- Text that would be hard to read for users with vision impairments due to poor color contrast with the background behind it
- UI controls and form elements without labels that a screen reader could identify
- Interactive elements with duplicate IDs which can confuse assistive technologies

The following examples rely on the [`com.deque.html.axe-core/playwright`](https://mvnrepository.com/artifact/com.deque.html.axe-core/playwright) Maven package which adds support for running the [axe accessibility testing engine](https://www.deque.com/axe/) as part of your Playwright tests.

## Disclaimer

Automated accessibility tests can detect some common accessibility problems such as missing or invalid properties. But many accessibility problems can only be discovered through manual testing. We recommend using a combination of automated testing, manual accessibility assessments, and inclusive user testing.

For manual assessments, we recommend [Accessibility Insights for Web](https://accessibilityinsights.io/docs/web/overview/?referrer=playwright-accessibility-testing-java), a free and open source dev tool that walks you through assessing a website for [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa) coverage.

## Example accessibility tests

Accessibility tests work just like any other Playwright test. You can either create separate test cases for them, or integrate accessibility scans and assertions into your existing test cases.

The following examples demonstrate a few basic accessibility testing scenarios.

### Example 1: Scanning an entire page

This example demonstrates how to test an entire page for automatically detectable accessibility violations. The test:
1. Imports the [`com.deque.html.axe-core/playwright`](https://mvnrepository.com/artifact/com.deque.html.axe-core/playwright) package
1. Uses normal JUnit 5 `@Test` syntax to define a test case
1. Uses normal Playwright syntax to open a browser and navigate to the page under test
1. Invokes `AxeBuilder.analyze()` to run the accessibility scan against the page
1. Uses normal JUnit 5 test assertions to verify that there are no violations in the returned scan results

```java
import com.deque.html.axecore.playwright.*; // 1
import com.deque.html.axecore.utilities.axeresults.*;

import org.junit.jupiter.api.*;
import com.microsoft.playwright.*;

import static org.junit.jupiter.api.Assertions.*;

public class HomepageTests {
  @Test // 2
  void shouldNotHaveAutomaticallyDetectableAccessibilityIssues() throws Exception {
    Playwright playwright = Playwright.create();
    Browser browser = playwright.chromium().launch();
    BrowserContext context = browser.newContext();
    Page page = context.newPage();

    page.navigate("https://your-site.com/"); // 3

    AxeResults accessibilityScanResults = new AxeBuilder(page).analyze(); // 4

    assertEquals(Collections.emptyList(), accessibilityScanResults.getViolations()); // 5
  }
}
```

### Example 2: Configuring axe to scan a specific part of a page

`com.deque.html.axe-core/playwright` supports many configuration options for axe. You can specify these options by using a Builder pattern with the `AxeBuilder` class.

For example, you can use [`AxeBuilder.include()`](https://github.com/dequelabs/axe-core-maven-html/blob/develop/playwright/README.md#axebuilderincludeliststring-selector) to constrain an accessibility scan to only run against one specific part of a page.

`AxeBuilder.analyze()` will scan the page *in its current state* when you call it. To scan parts of a page that are revealed based on UI interactions, use [Locators](./locators.md) to interact with the page before invoking `analyze()`:

```java
public class HomepageTests {
  @Test
  void navigationMenuFlyoutShouldNotHaveAutomaticallyDetectableAccessibilityViolations() throws Exception {
    page.navigate("https://your-site.com/");

    page.locator("button[aria-label=\"Navigation Menu\"]").click();

    // It is important to waitFor() the page to be in the desired
    // state *before* running analyze(). Otherwise, axe might not
    // find all the elements your test expects it to scan.
    page.locator("#navigation-menu-flyout").waitFor();

    AxeResults accessibilityScanResults = new AxeBuilder(page)
      .include(Arrays.asList("#navigation-menu-flyout"))
      .analyze();

    assertEquals(Collections.emptyList(), accessibilityScanResults.getViolations());
  }
}
```

### Example 3: Scanning for WCAG violations

By default, axe checks against a wide variety of accessibility rules. Some of these rules correspond to specific success criteria from the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/TR/WCAG21/), and others are "best practice" rules that are not specifically required by any WCAG criterion.

You can constrain an accessibility scan to only run those rules which are "tagged" as corresponding to specific WCAG success criteria by using [`AxeBuilder.withTags()`](https://github.com/dequelabs/axe-core-maven-html/blob/develop/playwright/README.md#axebuilderwithtagsliststring-rules). For example, [Accessibility Insights for Web's Automated Checks](https://accessibilityinsights.io/docs/web/getstarted/fastpass/?referrer=playwright-accessibility-testing-java) only include axe rules that test for violations of WCAG A and AA success criteria; to match that behavior, you would use the tags `wcag2a`, `wcag2aa`, `wcag21a`, and `wcag21aa`.

Note that [automated testing cannot detect all types of WCAG violations](#disclaimer).

```java
AxeResults accessibilityScanResults = new AxeBuilder(page)
  .withTags(Arrays.asList("wcag2a", "wcag2aa", "wcag21a", "wcag21aa"))
  .analyze();

assertEquals(Collections.emptyList(), accessibilityScanResults.getViolations());
```

You can find a complete listing of the rule tags axe-core supports in [the "Axe-core Tags" section of the axe API documentation](https://www.deque.com/axe/core-documentation/api-documentation/#axecore-tags).

## Handling known issues

A common question when adding accessibility tests to an application is "how do I suppress known violations?" The following examples demonstrate a few techniques you can use.

### Excluding individual elements from a scan

If your application contains a few specific elements with known issues, you can use [`AxeBuilder.exclude()`](https://github.com/dequelabs/axe-core-maven-html/blob/develop/playwright/README.md#axebuilderexcludeliststring-selector) to exclude them from being scanned until you're able to fix the issues.

This is usually the simplest option, but it has some important downsides:
* `exclude()` will exclude the specified elements *and all of their descendants*. Avoid using it with components that contain many children.
* `exclude()` will prevent *all* rules from running against the specified elements, not just the rules corresponding to known issues.

Here is an example of excluding one element from being scanned in one specific test:

```java
AxeResults accessibilityScanResults = new AxeBuilder(page)
  .exclude(Arrays.asList("#element-with-known-issue"))
  .analyze();

assertEquals(Collections.emptyList(), accessibilityScanResults.getViolations());
```

If the element in question is used repeatedly in many pages, consider [using a test fixture](#using-a-test-fixture-for-common-axe-configuration) to reuse the same `AxeBuilder` configuration across multiple tests.

### Disabling individual scan rules

If your application contains many different preexisting violations of a specific rule, you can use [`AxeBuilder.disableRules()`](https://github.com/dequelabs/axe-core-maven-html/blob/develop/playwright/README.md#axebuilderdisablerulesliststring-rules) to temporarily disable individual rules until you're able to fix the issues.

You can find the rule IDs to pass to `disableRules()` in the `id` property of the violations you want to suppress. A [complete list of axe's rules](https://github.com/dequelabs/axe-core/blob/master/doc/rule-descriptions.md) can be found in `axe-core`'s documentation.

```java
AxeResults accessibilityScanResults = new AxeBuilder(page)
  .disableRules(Arrays.asList("duplicate-id"))
  .analyze();

assertEquals(Collections.emptyList(), accessibilityScanResults.getViolations());
```

### Using violation fingerprints to specific known issues

If you would like to allow for a more granular set of known issues, you can use the following pattern:

1. Perform an accessibility scan which is expected to find some known violations
1. Convert the violations into "violation fingerprint" objects
1. Assert that the set of fingerprints is equivalent to the expected ones

This approach avoids the downsides of using `AxeBuilder.exclude()` at the cost of slightly more complexity and fragility.

Here is an example of using fingerprints based on only rule IDs and "target" selectors pointing to each violation:

```java
public class HomepageTests {
  @Test
  shouldOnlyHaveAccessibilityViolationsMatchingKnownFingerprints() throws Exception {
    page.navigate("https://your-site.com/");

    AxeResults accessibilityScanResults = new AxeBuilder(page).analyze();

    List<ViolationFingerprint> violationFingerprints = fingerprintsFromScanResults(accessibilityScanResults);

    assertEquals(Arrays.asList(
      new ViolationFingerprint("aria-roles", "[span[role=\"invalid\"]]"),
      new ViolationFingerprint("color-contrast", "[li:nth-child(2) > span]"),
      new ViolationFingerprint("label", "[input]")
    ), violationFingerprints);
  }

  // You can make your "fingerprint" as specific as you like. This one considers a violation to be
  // "the same" if it corresponds the same Axe rule on the same element.
  //
  // Using a record type makes it easy to compare fingerprints with assertEquals
  public record ViolationFingerprint(String ruleId, String target) { }

  public List<ViolationFingerprint> fingerprintsFromScanResults(AxeResults results) {
    return results.getViolations().stream()
      // Each violation refers to one rule and multiple "nodes" which violate it
      .flatMap(violation -> violation.getNodes().stream()
        .map(node -> new ViolationFingerprint(
          violation.getId(),
          // Each node contains a "target", which is a CSS selector that uniquely identifies it
          // If the page involves iframes or shadow DOMs, it may be a chain of CSS selectors
          node.getTarget().toString()
        )))
      .collect(Collectors.toList());
  }
}
```

## Using a test fixture for common axe configuration

A [`TestFixtures` class](./test-runners#running-tests-in-parallel) is a good way to share common `AxeBuilder` configuration across many tests. Some scenarios where this might be useful include:
* Using a common set of rules among all of your tests
* Suppressing a known violation in a common element which appears in many different pages
* Attaching standalone accessibility reports consistently for many scans

The following example demonstrates extending the `TestFixtures` class from the [Test Runners example](./test-runners#running-tests-in-parallel) with a new fixture that contains some common `AxeBuilder` configuration.

### Creating a fixture

This example fixture creates an `AxeBuilder` object which is pre-configured with shared `withTags()` and `exclude()` configuration.

```java
class AxeTestFixtures extends TestFixtures {
 AxeBuilder makeAxeBuilder() {
   return new AxeBuilder(page)
     .withTags(new String[]{"wcag2a", "wcag2aa", "wcag21a", "wcag21aa"})
     .exclude("#commonly-reused-element-with-known-issue");
 }
}
```

### Using a fixture

To use the fixture, replace the earlier examples' `new AxeBuilder(page)` with the newly defined `makeAxeBuilder` fixture:

```java
public class HomepageTests extends AxeTestFixtures {
  @Test
  void exampleUsingCustomFixture() throws Exception {
    page.navigate("https://your-site.com/");

    AxeResults accessibilityScanResults = makeAxeBuilder()
      // Automatically uses the shared AxeBuilder configuration,
      // but supports additional test-specific configuration too
      .include("#specific-element-under-test")
      .analyze();

    assertEquals(Collections.emptyList(), accessibilityScanResults.getViolations());
  }
}
```

See experimental [JUnit integration](./junit.md) to automatically initialize Playwright objects and more.



================================================
FILE: docs/src/accessibility-testing-js.md
================================================
---
id: accessibility-testing
title: "Accessibility testing"
---

## Introduction

Playwright can be used to test your application for many types of accessibility issues.

A few examples of problems this can catch include:
- Text that would be hard to read for users with vision impairments due to poor color contrast with the background behind it
- UI controls and form elements without labels that a screen reader could identify
- Interactive elements with duplicate IDs which can confuse assistive technologies

The following examples rely on the [`@axe-core/playwright`](https://npmjs.org/@axe-core/playwright) package which adds support for running the [axe accessibility testing engine](https://www.deque.com/axe/) as part of your Playwright tests.

:::note[Disclaimer]
Automated accessibility tests can detect some common accessibility problems such as missing or invalid properties. But many accessibility problems can only be discovered through manual testing. We recommend using a combination of automated testing, manual accessibility assessments, and inclusive user testing.

For manual assessments, we recommend [Accessibility Insights for Web](https://accessibilityinsights.io/docs/web/overview/?referrer=playwright-accessibility-testing-js), a free and open source dev tool that walks you through assessing a website for [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa) coverage.
:::
## Example accessibility tests

Accessibility tests work just like any other Playwright test. You can either create separate test cases for them, or integrate accessibility scans and assertions into your existing test cases.

The following examples demonstrate a few basic accessibility testing scenarios.

### Scanning an entire page

This example demonstrates how to test an entire page for automatically detectable accessibility violations. The test:
1. Imports the `@axe-core/playwright` package
1. Uses normal Playwright Test syntax to define a test case
1. Uses normal Playwright syntax to navigate to the page under test
1. Awaits `AxeBuilder.analyze()` to run the accessibility scan against the page
1. Uses normal Playwright Test [assertions](./test-assertions) to verify that there are no violations in the returned scan results

```js tab=js-ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright'; // 1

test.describe('homepage', () => { // 2
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('https://your-site.com/'); // 3

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze(); // 4

    expect(accessibilityScanResults.violations).toEqual([]); // 5
  });
});
```

```js tab=js-js
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default; // 1

test.describe('homepage', () => { // 2
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('https://your-site.com/'); // 3

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze(); // 4

    expect(accessibilityScanResults.violations).toEqual([]); // 5
  });
});
```

### Configuring axe to scan a specific part of a page

`@axe-core/playwright` supports many configuration options for axe. You can specify these options by using a Builder pattern with the `AxeBuilder` class.

For example, you can use [`AxeBuilder.include()`](https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md#axebuilderincludeselector-string--string) to constrain an accessibility scan to only run against one specific part of a page.

`AxeBuilder.analyze()` will scan the page *in its current state* when you call it. To scan parts of a page that are revealed based on UI interactions, use [Locators](./locators.md) to interact with the page before invoking `analyze()`:

```js
test('navigation menu should not have automatically detectable accessibility violations', async ({
  page,
}) => {
  await page.goto('https://your-site.com/');

  await page.getByRole('button', { name: 'Navigation Menu' }).click();

  // It is important to waitFor() the page to be in the desired
  // state *before* running analyze(). Otherwise, axe might not
  // find all the elements your test expects it to scan.
  await page.locator('#navigation-menu-flyout').waitFor();

  const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#navigation-menu-flyout')
      .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Scanning for WCAG violations

By default, axe checks against a wide variety of accessibility rules. Some of these rules correspond to specific success criteria from the [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/TR/WCAG21/), and others are "best practice" rules that are not specifically required by any WCAG criterion.

You can constrain an accessibility scan to only run those rules which are "tagged" as corresponding to specific WCAG success criteria by using [`AxeBuilder.withTags()`](https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md#axebuilderwithtagstags-stringarray). For example, [Accessibility Insights for Web's Automated Checks](https://accessibilityinsights.io/docs/web/getstarted/fastpass/?referrer=playwright-accessibility-testing-js) only include axe rules that test for violations of WCAG A and AA success criteria; to match that behavior, you would use the tags `wcag2a`, `wcag2aa`, `wcag21a`, and `wcag21aa`.

Note that automated testing cannot detect all types of WCAG violations.

```js
test('should not have any automatically detectable WCAG A or AA violations', async ({ page }) => {
  await page.goto('https://your-site.com/');

  const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

You can find a complete listing of the rule tags axe-core supports in [the "Axe-core Tags" section of the axe API documentation](https://www.deque.com/axe/core-documentation/api-documentation/#axecore-tags).

## Handling known issues

A common question when adding accessibility tests to an application is "how do I suppress known violations?" The following examples demonstrate a few techniques you can use.

### Excluding individual elements from a scan

If your application contains a few specific elements with known issues, you can use [`AxeBuilder.exclude()`](https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md#axebuilderexcludeselector-string--string) to exclude them from being scanned until you're able to fix the issues.

This is usually the simplest option, but it has some important downsides:
* `exclude()` will exclude the specified elements *and all of their descendants*. Avoid using it with components that contain many children.
* `exclude()` will prevent *all* rules from running against the specified elements, not just the rules corresponding to known issues.

Here is an example of excluding one element from being scanned in one specific test:

```js
test('should not have any accessibility violations outside of elements with known issues', async ({
  page,
}) => {
  await page.goto('https://your-site.com/page-with-known-issues');

  const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#element-with-known-issue')
      .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

If the element in question is used repeatedly in many pages, consider [using a test fixture](#using-a-test-fixture-for-common-axe-configuration) to reuse the same `AxeBuilder` configuration across multiple tests.

### Disabling individual scan rules

If your application contains many different preexisting violations of a specific rule, you can use [`AxeBuilder.disableRules()`](https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md#axebuilderdisablerulesrules-stringarray) to temporarily disable individual rules until you're able to fix the issues.

You can find the rule IDs to pass to `disableRules()` in the `id` property of the violations you want to suppress. A [complete list of axe's rules](https://github.com/dequelabs/axe-core/blob/master/doc/rule-descriptions.md) can be found in `axe-core`'s documentation.

```js
test('should not have any accessibility violations outside of rules with known issues', async ({
  page,
}) => {
  await page.goto('https://your-site.com/page-with-known-issues');

  const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['duplicate-id'])
      .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### Using snapshots to allow specific known issues

If you would like to allow for a more granular set of known issues, you can use [Snapshots](./test-snapshots.md) to verify that a set of preexisting violations has not changed. This approach avoids the downsides of using `AxeBuilder.exclude()` at the cost of slightly more complexity and fragility.

Do not use a snapshot of the entire `accessibilityScanResults.violations` array. It contains implementation details of the elements in question, such as a snippet of their rendered HTML; if you include these in your snapshots, it will make your tests prone to breaking every time one of the components in question changes for an unrelated reason:

```js
// Don't do this! This is fragile.
expect(accessibilityScanResults.violations).toMatchSnapshot();
```

Instead, create a *fingerprint* of the violation(s) in question that contains only enough information to uniquely identify the issue, and use a snapshot of the fingerprint:

```js
// This is less fragile than snapshotting the entire violations array.
expect(violationFingerprints(accessibilityScanResults)).toMatchSnapshot();

// my-test-utils.js
function violationFingerprints(accessibilityScanResults) {
  const violationFingerprints = accessibilityScanResults.violations.map(violation => ({
    rule: violation.id,
    // These are CSS selectors which uniquely identify each element with
    // a violation of the rule in question.
    targets: violation.nodes.map(node => node.target),
  }));

  return JSON.stringify(violationFingerprints, null, 2);
}
```

## Exporting scan results as a test attachment

Most accessibility tests are primarily concerned with the `violations` property of the axe scan results. However, the scan results contain more than just `violations`. For example, the results also contain information about rules which passed and about elements which axe found to have inconclusive results for some rules. This information can be useful for debugging tests that aren't detecting all the violations you expect them to.

To include *all* of the scan results as part of your test results for debugging purposes, you can add the scan results as a test attachment with [`testInfo.attach()`](./api/class-testinfo#test-info-attach). [Reporters](./test-reporters) can then embed or link the full results as part of your test output.

The following example demonstrates attaching scan results to a test:

```js
test('example with attachment', async ({ page }, testInfo) => {
  await page.goto('https://your-site.com/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  await testInfo.attach('accessibility-scan-results', {
    body: JSON.stringify(accessibilityScanResults, null, 2),
    contentType: 'application/json'
  });

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Using a test fixture for common axe configuration

[Test fixtures](./test-fixtures) are a good way to share common `AxeBuilder` configuration across many tests. Some scenarios where this might be useful include:
* Using a common set of rules among all of your tests
* Suppressing a known violation in a common element which appears in many different pages
* Attaching standalone accessibility reports consistently for many scans

The following example demonstrates creating and using a test fixture that covers each of those scenarios.

### Creating a fixture

This example fixture creates an `AxeBuilder` object which is pre-configured with shared `withTags()` and `exclude()` configuration.

```js tab=js-ts title="axe-test.ts"
import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

// Extend base test by providing "makeAxeBuilder"
//
// This new "test" can be used in multiple test files, and each of them will get
// a consistently configured AxeBuilder instance.
export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () => new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('#commonly-reused-element-with-known-issue');

    await use(makeAxeBuilder);
  }
});
export { expect } from '@playwright/test';
```

```js tab=js-js title="axe-test.js"
const base = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

// Extend base test by providing "makeAxeBuilder"
//
// This new "test" can be used in multiple test files, and each of them will get
// a consistently configured AxeBuilder instance.
exports.test = base.test.extend({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () => new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('#commonly-reused-element-with-known-issue');

    await use(makeAxeBuilder);
  }
});
exports.expect = base.expect;
```

### Using a fixture

To use the fixture, replace the earlier examples' `new AxeBuilder({ page })` with the newly defined `makeAxeBuilder` fixture:

```js
const { test, expect } = require('./axe-test');

test('example using custom fixture', async ({ page, makeAxeBuilder }) => {
  await page.goto('https://your-site.com/');

  const accessibilityScanResults = await makeAxeBuilder()
      // Automatically uses the shared AxeBuilder configuration,
      // but supports additional test-specific configuration too
      .include('#specific-element-under-test')
      .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```



================================================
FILE: docs/src/actionability.md
================================================
---
id: actionability
title: "Auto-waiting"
---

## Introduction

Playwright performs a range of actionability checks on the elements before making actions to ensure these actions
behave as expected. It auto-waits for all the relevant checks to pass and only then performs the requested action. If the required checks do not pass within the given `timeout`, action fails with the `TimeoutError`.

For example, for [`method: Locator.click`], Playwright will ensure that:
- locator resolves to exactly one element
- element is [Visible]
- element is [Stable], as in not animating or completed animation
- element [Receives Events], as in not obscured by other elements
- element is [Enabled]

Here is the complete list of actionability checks performed for each action:

| Action | [Visible] | [Stable] | [Receives Events] | [Enabled] | [Editable] |
| :- | :-: | :-: | :-: | :-: | :-: |
| [`method: Locator.check`] | Yes | Yes | Yes | Yes | - |
| [`method: Locator.click`] | Yes | Yes | Yes | Yes | - |
| [`method: Locator.dblclick`] | Yes | Yes | Yes | Yes | - |
| [`method: Locator.setChecked`] | Yes | Yes | Yes | Yes | - |
| [`method: Locator.tap`] | Yes | Yes | Yes | Yes | - |
| [`method: Locator.uncheck`] | Yes | Yes | Yes | Yes | - |
| [`method: Locator.hover`] | Yes | Yes | Yes | - | - |
| [`method: Locator.dragTo`] | Yes | Yes | Yes | - | - |
| [`method: Locator.screenshot`] | Yes | Yes | - | - | - |
| [`method: Locator.fill`] | Yes | - | - | Yes | Yes |
| [`method: Locator.clear`] | Yes | - | - | Yes | Yes |
| [`method: Locator.selectOption`] | Yes | - | - | Yes | - |
| [`method: Locator.selectText`] | Yes | - | - | - | - |
| [`method: Locator.scrollIntoViewIfNeeded`] | - | Yes | - | - | - |
| [`method: Locator.blur`] | - | - | - | - | - |
| [`method: Locator.dispatchEvent`] | - | - | - | - | - |
| [`method: Locator.focus`] | - | - | - | - | - |
| [`method: Locator.press`] | - | - | - | - | - |
| [`method: Locator.pressSequentially`] | - | - | - | - | - |
| [`method: Locator.setInputFiles`] | - | - | - | - | - |

## Forcing actions

Some actions like [`method: Locator.click`] support `force` option that disables non-essential actionability checks,
for example passing truthy `force` to [`method: Locator.click`] method will not check that the target element actually
receives click events.

## Assertions

Playwright includes auto-retrying assertions that remove flakiness by waiting until the condition is met, similarly to auto-waiting before actions.

| Assertion | Description |
| :- | :- |
| [`method: LocatorAssertions.toBeAttached`] | Element is attached |
| [`method: LocatorAssertions.toBeChecked`] | Checkbox is checked |
| [`method: LocatorAssertions.toBeDisabled`] | Element is disabled |
| [`method: LocatorAssertions.toBeEditable`] | Element is editable |
| [`method: LocatorAssertions.toBeEmpty`] | Container is empty |
| [`method: LocatorAssertions.toBeEnabled`] | Element is enabled |
| [`method: LocatorAssertions.toBeFocused`] | Element is focused |
| [`method: LocatorAssertions.toBeHidden`] | Element is not visible |
| [`method: LocatorAssertions.toBeInViewport`] | Element intersects viewport |
| [`method: LocatorAssertions.toBeVisible`] | Element is visible |
| [`method: LocatorAssertions.toContainText`] | Element contains text |
| [`method: LocatorAssertions.toHaveAttribute`] | Element has a DOM attribute |
| [`method: LocatorAssertions.toHaveClass`] | Element has a class property |
| [`method: LocatorAssertions.toHaveCount`] | List has exact number of children |
| [`method: LocatorAssertions.toHaveCSS`] | Element has CSS property |
| [`method: LocatorAssertions.toHaveId`] | Element has an ID |
| [`method: LocatorAssertions.toHaveJSProperty`] | Element has a JavaScript property |
| [`method: LocatorAssertions.toHaveText`] | Element matches text |
| [`method: LocatorAssertions.toHaveValue`] | Input has a value |
| [`method: LocatorAssertions.toHaveValues`] | Select has options selected |
| [`method: PageAssertions.toHaveTitle`] | Page has a title |
| [`method: PageAssertions.toHaveURL`] | Page has a URL |
| [`method: APIResponseAssertions.toBeOK`] | Response has an OK status |

Learn more in the [assertions guide](./test-assertions.md).

## Visible

Element is considered visible when it has non-empty bounding box and does not have `visibility:hidden` computed style.

Note that according to this definition:
* Elements of zero size **are not** considered visible.
* Elements with `display:none` **are not** considered visible.
* Elements with `opacity:0` **are** considered visible.

## Stable

Element is considered stable when it has maintained the same bounding box for at least two consecutive animation frames.

## Enabled

Element is considered enabled when it is **not disabled**.

Element is **disabled** when:
- it is a `<button>`, `<select>`, `<input>`, `<textarea>`, `<option>` or `<optgroup>` with a `[disabled]` attribute;
- it is a `<button>`, `<select>`, `<input>`, `<textarea>`, `<option>` or `<optgroup>` that is a part of a `<fieldset>` with a `[disabled]` attribute;
- it is a descendant of an element with `[aria-disabled=true]` attribute.

## Editable

Element is considered editable when it is [enabled] and is **not readonly**.

Element is **readonly** when:
- it is a `<select>`, `<input>` or `<textarea>` with a `[readonly]` attribute;
- it has an `[aria-readonly=true]` attribute and an aria role that [supports it](https://w3c.github.io/aria/#aria-readonly).

## Receives Events

Element is considered receiving pointer events when it is the hit target of the pointer event at the action point. For example, when clicking at the point `(10;10)`, Playwright checks whether some other element (usually an overlay) will instead capture the click at `(10;10)`.


For example, consider a scenario where Playwright will click `Sign Up` button regardless of when the [`method: Locator.click`] call was made:
- page is checking that user name is unique and `Sign Up` button is disabled;
- after checking with the server, the disabled `Sign Up` button is replaced with another one that is now enabled.

[Visible]: #visible "Visible"
[Stable]: #stable "Stable"
[Enabled]: #enabled "Enabled"
[Editable]: #editable "Editable"
[Receives Events]: #receives-events "Receives Events"



================================================
FILE: docs/src/api-testing-csharp.md
================================================
---
id: api-testing
title: "API testing"
---

## Introduction

Playwright can be used to get access to the [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) API of
your application.

Sometimes you may want to send requests to the server directly from .NET without loading a page and running js code in it.
A few examples where it may come in handy:
- Test your server API.
- Prepare server side state before visiting the web application in a test.
- Validate server side post-conditions after running some actions in the browser.

All of that could be achieved via [APIRequestContext] methods.

The following examples rely on the [`Microsoft.Playwright.MSTest`](./test-runners.md) package which creates a Playwright and Page instance for each test.

## Writing API Test

[APIRequestContext] can send all kinds of HTTP(S) requests over network.

The following example demonstrates how to use Playwright to test issues creation via [GitHub API](https://docs.github.com/en/rest). The test suite will do the following:
- Create a new repository before running tests.
- Create a few issues and validate server state.
- Delete the repository after running tests.

### Configure

GitHub API requires authorization, so we'll configure the token once for all tests. While at it, we'll also set the `baseURL` to simplify the tests.

```csharp
using Microsoft.Playwright;
using Microsoft.Playwright.MSTest;

namespace PlaywrightTests;

[TestClass]
public class TestGitHubAPI : PlaywrightTest
{
    static string? API_TOKEN = Environment.GetEnvironmentVariable("GITHUB_API_TOKEN");

    private IAPIRequestContext Request = null!;

    [TestInitialize]
    public async Task SetUpAPITesting()
    {
        await CreateAPIRequestContext();
    }

    private async Task CreateAPIRequestContext()
    {
        var headers = new Dictionary<string, string>();
        // We set this header per GitHub guidelines.
        headers.Add("Accept", "application/vnd.github.v3+json");
        // Add authorization token to all requests.
        // Assuming personal access token available in the environment.
        headers.Add("Authorization", "token " + API_TOKEN);

        Request = await this.Playwright.APIRequest.NewContextAsync(new() {
            // All requests we send go to this API endpoint.
            BaseURL = "https://api.github.com",
            ExtraHTTPHeaders = headers,
        });
    }

    [TestCleanup]
    public async Task TearDownAPITesting()
    {
        await Request.DisposeAsync();
    }
}
```

### Write tests

Now that we initialized request object we can add a few tests that will create new issues in the repository.
```csharp
using System.Text.Json;
using Microsoft.Playwright;
using Microsoft.Playwright.MSTest;

namespace PlaywrightTests;

[TestClass]
public class TestGitHubAPI : PlaywrightTest
{
    static string REPO = "test";
    static string USER = Environment.GetEnvironmentVariable("GITHUB_USER");
    static string? API_TOKEN = Environment.GetEnvironmentVariable("GITHUB_API_TOKEN");

    private IAPIRequestContext Request = null!;

    [TestMethod]
    public async Task ShouldCreateBugReport()
    {
        var data = new Dictionary<string, string>
        {
            { "title", "[Bug] report 1" },
            { "body", "Bug description" }
        };
        var newIssue = await Request.PostAsync("/repos/" + USER + "/" + REPO + "/issues", new() { DataObject = data });
        await Expect(newIssue).ToBeOKAsync();

        var issues = await Request.GetAsync("/repos/" + USER + "/" + REPO + "/issues");
        await Expect(newIssue).ToBeOKAsync();
        var issuesJsonResponse = await issues.JsonAsync();
        JsonElement? issue = null;
        foreach (JsonElement issueObj in issuesJsonResponse?.EnumerateArray())
        {
            if (issueObj.TryGetProperty("title", out var title) == true)
            {
                if (title.GetString() == "[Bug] report 1")
                {
                    issue = issueObj;
                }
            }
        }
        Assert.IsNotNull(issue);
        Assert.AreEqual("Bug description", issue?.GetProperty("body").GetString());
    }

    [TestMethod]
    public async Task ShouldCreateFeatureRequests()
    {
        var data = new Dictionary<string, string>
        {
            { "title", "[Feature] request 1" },
            { "body", "Feature description" }
        };
        var newIssue = await Request.PostAsync("/repos/" + USER + "/" + REPO + "/issues", new() { DataObject = data });
        await Expect(newIssue).ToBeOKAsync();

        var issues = await Request.GetAsync("/repos/" + USER + "/" + REPO + "/issues");
        await Expect(newIssue).ToBeOKAsync();
        var issuesJsonResponse = await issues.JsonAsync();

        JsonElement? issue = null;
        foreach (JsonElement issueObj in issuesJsonResponse?.EnumerateArray())
        {
            if (issueObj.TryGetProperty("title", out var title) == true)
            {
                if (title.GetString() == "[Feature] request 1")
                {
                    issue = issueObj;
                }
            }
        }
        Assert.IsNotNull(issue);
        Assert.AreEqual("Feature description", issue?.GetProperty("body").GetString());
    }

    // ...
}
```

### Setup and teardown

These tests assume that repository exists. You probably want to create a new one before running tests and delete it afterwards. Use `[SetUp]` and `[TearDown]` hooks for that.

```csharp
using System.Text.Json;
using Microsoft.Playwright;
using Microsoft.Playwright.MSTest;

namespace PlaywrightTests;

[TestClass]
public class TestGitHubAPI : PlaywrightTest
{
    // ...
    [TestInitialize]
    public async Task SetUpAPITesting()
    {
        await CreateAPIRequestContext();
        await CreateTestRepository();
    }

    private async Task CreateTestRepository()
    {
        var resp = await Request.PostAsync("/user/repos", new()
        {
            DataObject = new Dictionary<string, string>()
            {
                ["name"] = REPO,
            },
        });
        await Expect(resp).ToBeOKAsync();
    }

    [TestCleanup]
    public async Task TearDownAPITesting()
    {
        await DeleteTestRepository();
        await Request.DisposeAsync();
    }

    private async Task DeleteTestRepository()
    {
        var resp = await Request.DeleteAsync("/repos/" + USER + "/" + REPO);
        await Expect(resp).ToBeOKAsync();
    }
}
```

### Complete test example

Here is the complete example of an API test:

```csharp
using System.Text.Json;
using Microsoft.Playwright;
using Microsoft.Playwright.MSTest;

namespace PlaywrightTests;

[TestClass]
public class TestGitHubAPI : PlaywrightTest
{
    static string REPO = "test-repo-2";
    static string USER = Environment.GetEnvironmentVariable("GITHUB_USER");
    static string? API_TOKEN = Environment.GetEnvironmentVariable("GITHUB_API_TOKEN");

    private IAPIRequestContext Request = null!;

    [TestMethod]
    public async Task ShouldCreateBugReport()
    {
        var data = new Dictionary<string, string>
        {
            { "title", "[Bug] report 1" },
            { "body", "Bug description" }
        };
        var newIssue = await Request.PostAsync("/repos/" + USER + "/" + REPO + "/issues", new() { DataObject = data });
        await Expect(newIssue).ToBeOKAsync();

        var issues = await Request.GetAsync("/repos/" + USER + "/" + REPO + "/issues");
        await Expect(newIssue).ToBeOKAsync();
        var issuesJsonResponse = await issues.JsonAsync();
        JsonElement? issue = null;
        foreach (JsonElement issueObj in issuesJsonResponse?.EnumerateArray())
        {
            if (issueObj.TryGetProperty("title", out var title) == true)
            {
                if (title.GetString() == "[Bug] report 1")
                {
                    issue = issueObj;
                }
            }
        }
        Assert.IsNotNull(issue);
        Assert.AreEqual("Bug description", issue?.GetProperty("body").GetString());
    }

    [TestMethod]
    public async Task ShouldCreateFeatureRequests()
    {
        var data = new Dictionary<string, string>
        {
            { "title", "[Feature] request 1" },
            { "body", "Feature description" }
        };
        var newIssue = await Request.PostAsync("/repos/" + USER + "/" + REPO + "/issues", new() { DataObject = data });
        await Expect(newIssue).ToBeOKAsync();

        var issues = await Request.GetAsync("/repos/" + USER + "/" + REPO + "/issues");
        await Expect(newIssue).ToBeOKAsync();
        var issuesJsonResponse = await issues.JsonAsync();

        JsonElement? issue = null;
        foreach (JsonElement issueObj in issuesJsonResponse?.EnumerateArray())
        {
            if (issueObj.TryGetProperty("title", out var title) == true)
            {
                if (title.GetString() == "[Feature] request 1")
                {
                    issue = issueObj;
                }
            }
        }
        Assert.IsNotNull(issue);
        Assert.AreEqual("Feature description", issue?.GetProperty("body").GetString());
    }

    [TestInitialize]
    public async Task SetUpAPITesting()
    {
        await CreateAPIRequestContext();
        await CreateTestRepository();
    }

    private async Task CreateAPIRequestContext()
    {
        var headers = new Dictionary<string, string>
        {
            // We set this header per GitHub guidelines.
            { "Accept", "application/vnd.github.v3+json" },
            // Add authorization token to all requests.
            // Assuming personal access token available in the environment.
            { "Authorization", "token " + API_TOKEN }
        };

        Request = await Playwright.APIRequest.NewContextAsync(new()
        {
            // All requests we send go to this API endpoint.
            BaseURL = "https://api.github.com",
            ExtraHTTPHeaders = headers,
        });
    }

    private async Task CreateTestRepository()
    {
        var resp = await Request.PostAsync("/user/repos", new()
        {
            DataObject = new Dictionary<string, string>()
            {
                ["name"] = REPO,
            },
        });
        await Expect(resp).ToBeOKAsync();
    }

    [TestCleanup]
    public async Task TearDownAPITesting()
    {
        await DeleteTestRepository();
        await Request.DisposeAsync();
    }

    private async Task DeleteTestRepository()
    {
        var resp = await Request.DeleteAsync("/repos/" + USER + "/" + REPO);
        await Expect(resp).ToBeOKAsync();
    }
}
```

## Prepare server state via API calls

The following test creates a new issue via API and then navigates to the list of all issues in the
project to check that it appears at the top of the list. The check is performed using [LocatorAssertions].

```csharp
class TestGitHubAPI : PageTest
{
    [TestMethod]
    public async Task LastCreatedIssueShouldBeFirstInTheList()
    {
        var data = new Dictionary<string, string>
        {
            { "title", "[Feature] request 1" },
            { "body", "Feature description" }
        };
        var newIssue = await Request.PostAsync("/repos/" + USER + "/" + REPO + "/issues", new() { DataObject = data });
        await Expect(newIssue).ToBeOKAsync();

        // When inheriting from 'PlaywrightTest' it only gives you a Playwright instance. To get a Page instance, either start
        // a browser, context, and page manually or inherit from 'PageTest' which will launch it for you.
        await Page.GotoAsync("https://github.com/" + USER + "/" + REPO + "/issues");
        var firstIssue = Page.Locator("a[data-hovercard-type='issue']").First;
        await Expect(firstIssue).ToHaveTextAsync("[Feature] request 1");
    }
}
```

## Check the server state after running user actions

The following test creates a new issue via user interface in the browser and then checks via API if
it was created:

```csharp
// Make sure to extend from PageTest if you want to use the Page class.
class GitHubTests : PageTest
{
    [TestMethod]
    public async Task LastCreatedIssueShouldBeOnTheServer()
    {
        await Page.GotoAsync("https://github.com/" + USER + "/" + REPO + "/issues");
        await Page.Locator("text=New Issue").ClickAsync();
        await Page.Locator("[aria-label='Title']").FillAsync("Bug report 1");
        await Page.Locator("[aria-label='Comment body']").FillAsync("Bug description");
        await Page.Locator("text=Submit new issue").ClickAsync();
        var issueId = Page.Url.Substring(Page.Url.LastIndexOf('/'));

        var newIssue = await Request.GetAsync("https://github.com/" + USER + "/" + REPO + "/issues/" + issueId);
        await Expect(newIssue).ToBeOKAsync();
        StringAssert.Contains(await newIssue.TextAsync(), "Bug report 1");
    }
}
```

## Reuse authentication state

Web apps use cookie-based or token-based authentication, where authenticated
state is stored as [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).
Playwright provides [`method: APIRequestContext.storageState`] method that can be used to
retrieve storage state from an authenticated context and then create new contexts with that state.

Storage state is interchangeable between [BrowserContext] and [APIRequestContext]. You can
use it to log in via API calls and then create a new context with cookies already there.
The following code snippet retrieves state from an authenticated [APIRequestContext] and
creates a new [BrowserContext] with that state.

```csharp
var requestContext = await Playwright.APIRequest.NewContextAsync(new()
{
    HttpCredentials = new()
    {
        Username = "user",
        Password = "passwd"
    },
});
await requestContext.GetAsync("https://api.example.com/login");
// Save storage state into a variable.
var state = await requestContext.StorageStateAsync();

// Create a new context with the saved storage state.
var context = await Browser.NewContextAsync(new() { StorageState = state });
```



================================================
FILE: docs/src/api-testing-java.md
================================================
---
id: api-testing
title: "API testing"
---

## Introduction

Playwright can be used to get access to the [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) API of
your application.

Sometimes you may want to send requests to the server directly from Java without loading a page and running js code in it.
A few examples where it may come in handy:
- Test your server API.
- Prepare server side state before visiting the web application in a test.
- Validate server side post-conditions after running some actions in the browser.

All of that could be achieved via [APIRequestContext] methods.

## Writing API Test

[APIRequestContext] can send all kinds of HTTP(S) requests over network.

The following example demonstrates how to use Playwright to test issues creation via [GitHub API](https://docs.github.com/en/rest). The test suite will do the following:
- Create a new repository before running tests.
- Create a few issues and validate server state.
- Delete the repository after running tests.

### Configure

GitHub API requires authorization, so we'll configure the token once for all tests. While at it, we'll also set the `baseURL` to simplify the tests.

```java
package org.example;

import com.microsoft.playwright.APIRequest;
import com.microsoft.playwright.APIRequestContext;
import com.microsoft.playwright.Playwright;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.TestInstance;

import java.util.HashMap;
import java.util.Map;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class TestGitHubAPI {
  private static final String API_TOKEN = System.getenv("GITHUB_API_TOKEN");

  private Playwright playwright;
  private APIRequestContext request;

  void createPlaywright() {
    playwright = Playwright.create();
  }

  void createAPIRequestContext() {
    Map<String, String> headers = new HashMap<>();
    // We set this header per GitHub guidelines.
    headers.put("Accept", "application/vnd.github.v3+json");
    // Add authorization token to all requests.
    // Assuming personal access token available in the environment.
    headers.put("Authorization", "token " + API_TOKEN);

    request = playwright.request().newContext(new APIRequest.NewContextOptions()
      // All requests we send go to this API endpoint.
      .setBaseURL("https://api.github.com")
      .setExtraHTTPHeaders(headers));
  }

  @BeforeAll
  void beforeAll() {
    createPlaywright();
    createAPIRequestContext();
  }

  void disposeAPIRequestContext() {
    if (request != null) {
      request.dispose();
      request = null;
    }
  }

  void closePlaywright() {
    if (playwright != null) {
      playwright.close();
      playwright = null;
    }
  }

  @AfterAll
  void afterAll() {
    disposeAPIRequestContext();
    closePlaywright();
  }
}
```

### Write tests

Now that we initialized request object we can add a few tests that will create new issues in the repository.
```java
package org.example;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.microsoft.playwright.APIRequest;
import com.microsoft.playwright.APIRequestContext;
import com.microsoft.playwright.APIResponse;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.options.RequestOptions;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class TestGitHubAPI {
  private static final String REPO = "test-repo-2";
  private static final String USER = System.getenv("GITHUB_USER");
  private static final String API_TOKEN = System.getenv("GITHUB_API_TOKEN");

  private Playwright playwright;
  private APIRequestContext request;

  // ...

  @Test
  void shouldCreateBugReport() {
    Map<String, String> data = new HashMap<>();
    data.put("title", "[Bug] report 1");
    data.put("body", "Bug description");
    APIResponse newIssue = request.post("/repos/" + USER + "/" + REPO + "/issues",
      RequestOptions.create().setData(data));
    assertTrue(newIssue.ok());

    APIResponse issues = request.get("/repos/" + USER + "/" + REPO + "/issues");
    assertTrue(issues.ok());
    JsonArray json = new Gson().fromJson(issues.text(), JsonArray.class);
    JsonObject issue = null;
    for (JsonElement item : json) {
      JsonObject itemObj = item.getAsJsonObject();
      if (!itemObj.has("title")) {
        continue;
      }
      if ("[Bug] report 1".equals(itemObj.get("title").getAsString())) {
        issue = itemObj;
        break;
      }
    }
    assertNotNull(issue);
    assertEquals("Bug description", issue.get("body").getAsString(), issue.toString());
  }

  @Test
  void shouldCreateFeatureRequest() {
    Map<String, String> data = new HashMap<>();
    data.put("title", "[Feature] request 1");
    data.put("body", "Feature description");
    APIResponse newIssue = request.post("/repos/" + USER + "/" + REPO + "/issues",
      RequestOptions.create().setData(data));
    assertTrue(newIssue.ok());

    APIResponse issues = request.get("/repos/" + USER + "/" + REPO + "/issues");
    assertTrue(issues.ok());
    JsonArray json = new Gson().fromJson(issues.text(), JsonArray.class);
    JsonObject issue = null;
    for (JsonElement item : json) {
      JsonObject itemObj = item.getAsJsonObject();
      if (!itemObj.has("title")) {
        continue;
      }
      if ("[Feature] request 1".equals(itemObj.get("title").getAsString())) {
        issue = itemObj;
        break;
      }
    }
    assertNotNull(issue);
    assertEquals("Feature description", issue.get("body").getAsString(), issue.toString());
  }
}

```

### Setup and teardown

These tests assume that repository exists. You probably want to create a new one before running tests and delete it afterwards. Use `@BeforeAll` and `@AfterAll` hooks for that.

```java
public class TestGitHubAPI {
  // ...

  void createTestRepository() {
    APIResponse newRepo = request.post("/user/repos",
      RequestOptions.create().setData(Collections.singletonMap("name", REPO)));
    assertTrue(newRepo.ok(), newRepo.text());
  }

  @BeforeAll
  void beforeAll() {
    createPlaywright();
    createAPIRequestContext();
    createTestRepository();
  }

  void deleteTestRepository() {
    if (request != null) {
      APIResponse deletedRepo = request.delete("/repos/" + USER + "/" + REPO);
      assertTrue(deletedRepo.ok());
    }
  }
  // ...

  @AfterAll
  void afterAll() {
    deleteTestRepository();
    disposeAPIRequestContext();
    closePlaywright();
  }
}
```

### Complete test example

Here is the complete example of an API test:

```java
package org.example;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.microsoft.playwright.APIRequest;
import com.microsoft.playwright.APIRequestContext;
import com.microsoft.playwright.APIResponse;
import com.microsoft.playwright.Playwright;
import com.microsoft.playwright.options.RequestOptions;
import org.junit.jupiter.api.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class TestGitHubAPI {
  private static final String REPO = "test-repo-2";
  private static final String USER = System.getenv("GITHUB_USER");
  private static final String API_TOKEN = System.getenv("GITHUB_API_TOKEN");

  private Playwright playwright;
  private APIRequestContext request;

  void createPlaywright() {
    playwright = Playwright.create();
  }

  void createAPIRequestContext() {
    Map<String, String> headers = new HashMap<>();
    // We set this header per GitHub guidelines.
    headers.put("Accept", "application/vnd.github.v3+json");
    // Add authorization token to all requests.
    // Assuming personal access token available in the environment.
    headers.put("Authorization", "token " + API_TOKEN);

    request = playwright.request().newContext(new APIRequest.NewContextOptions()
      // All requests we send go to this API endpoint.
      .setBaseURL("https://api.github.com")
      .setExtraHTTPHeaders(headers));
  }

  void createTestRepository() {
    APIResponse newRepo = request.post("/user/repos",
      RequestOptions.create().setData(Collections.singletonMap("name", REPO)));
    assertTrue(newRepo.ok(), newRepo.text());
  }

  @BeforeAll
  void beforeAll() {
    createPlaywright();
    createAPIRequestContext();
    createTestRepository();
  }

  void deleteTestRepository() {
    if (request != null) {
      APIResponse deletedRepo = request.delete("/repos/" + USER + "/" + REPO);
      assertTrue(deletedRepo.ok());
    }
  }

  void disposeAPIRequestContext() {
    if (request != null) {
      request.dispose();
      request = null;
    }
  }

  void closePlaywright() {
    if (playwright != null) {
      playwright.close();
      playwright = null;
    }
  }

  @AfterAll
  void afterAll() {
    deleteTestRepository();
    disposeAPIRequestContext();
    closePlaywright();
  }

  @Test
  void shouldCreateBugReport() {
    Map<String, String> data = new HashMap<>();
    data.put("title", "[Bug] report 1");
    data.put("body", "Bug description");
    APIResponse newIssue = request.post("/repos/" + USER + "/" + REPO + "/issues",
      RequestOptions.create().setData(data));
    assertTrue(newIssue.ok());

    APIResponse issues = request.get("/repos/" + USER + "/" + REPO + "/issues");
    assertTrue(issues.ok());
    JsonArray json = new Gson().fromJson(issues.text(), JsonArray.class);
    JsonObject issue = null;
    for (JsonElement item : json) {
      JsonObject itemObj = item.getAsJsonObject();
      if (!itemObj.has("title")) {
        continue;
      }
      if ("[Bug] report 1".equals(itemObj.get("title").getAsString())) {
        issue = itemObj;
        break;
      }
    }
    assertNotNull(issue);
    assertEquals("Bug description", issue.get("body").getAsString(), issue.toString());
  }

  @Test
  void shouldCreateFeatureRequest() {
    Map<String, String> data = new HashMap<>();
    data.put("title", "[Feature] request 1");
    data.put("body", "Feature description");
    APIResponse newIssue = request.post("/repos/" + USER + "/" + REPO + "/issues",
      RequestOptions.create().setData(data));
    assertTrue(newIssue.ok());

    APIResponse issues = request.get("/repos/" + USER + "/" + REPO + "/issues");
    assertTrue(issues.ok());
    JsonArray json = new Gson().fromJson(issues.text(), JsonArray.class);
    JsonObject issue = null;
    for (JsonElement item : json) {
      JsonObject itemObj = item.getAsJsonObject();
      if (!itemObj.has("title")) {
        continue;
      }
      if ("[Feature] request 1".equals(itemObj.get("title").getAsString())) {
        issue = itemObj;
        break;
      }
    }
    assertNotNull(issue);
    assertEquals("Feature description", issue.get("body").getAsString(), issue.toString());
  }
}
```

See experimental [JUnit integration](./junit.md) to automatically initialize Playwright objects and more.

## Prepare server state via API calls

The following test creates a new issue via API and then navigates to the list of all issues in the
project to check that it appears at the top of the list. The check is performed using [LocatorAssertions].

```java
public class TestGitHubAPI {
  @Test
  void lastCreatedIssueShouldBeFirstInTheList() {
    Map<String, String> data = new HashMap<>();
    data.put("title", "[Feature] request 1");
    data.put("body", "Feature description");
    APIResponse newIssue = request.post("/repos/" + USER + "/" + REPO + "/issues",
      RequestOptions.create().setData(data));
    assertTrue(newIssue.ok());

    page.navigate("https://github.com/" + USER + "/" + REPO + "/issues");
    Locator firstIssue = page.locator("a[data-hovercard-type='issue']").first();
    assertThat(firstIssue).hasText("[Feature] request 1");
  }
}
```

## Check the server state after running user actions

The following test creates a new issue via user interface in the browser and then checks via API if
it was created:

```java
public class TestGitHubAPI {
  @Test
  void lastCreatedIssueShouldBeOnTheServer() {
    page.navigate("https://github.com/" + USER + "/" + REPO + "/issues");
    page.locator("text=New Issue").click();
    page.locator("[aria-label='Title']").fill("Bug report 1");
    page.locator("[aria-label='Comment body']").fill("Bug description");
    page.locator("text=Submit new issue").click();
    String issueId = page.url().substring(page.url().lastIndexOf('/'));

    APIResponse newIssue = request.get("https://github.com/" + USER + "/" + REPO + "/issues/" + issueId);
    assertThat(newIssue).isOK();
    assertTrue(newIssue.text().contains("Bug report 1"));
  }
}
```

## Reuse authentication state

Web apps use cookie-based or token-based authentication, where authenticated
state is stored as [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).
Playwright provides [`method: APIRequestContext.storageState`] method that can be used to
retrieve storage state from an authenticated context and then create new contexts with that state.

Storage state is interchangeable between [BrowserContext] and [APIRequestContext]. You can
use it to log in via API calls and then create a new context with cookies already there.
The following code snippet retrieves state from an authenticated [APIRequestContext] and
creates a new [BrowserContext] with that state.

```java
APIRequestContext requestContext = playwright.request().newContext(
  new APIRequest.NewContextOptions().setHttpCredentials("user", "passwd"));
requestContext.get("https://api.example.com/login");
// Save storage state into a variable.
String state = requestContext.storageState();

// Create a new context with the saved storage state.
BrowserContext context = browser.newContext(new Browser.NewContextOptions().setStorageState(state));
```



================================================
FILE: docs/src/api-testing-js.md
================================================
---
id: api-testing
title: "API testing"
---

## Introduction

Playwright can be used to get access to the [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) API of
your application.

Sometimes you may want to send requests to the server directly from Node.js without loading a page and running js code in it.
A few examples where it may come in handy:
- Test your server API.
- Prepare server side state before visiting the web application in a test.
- Validate server side post-conditions after running some actions in the browser.

All of that could be achieved via [APIRequestContext] methods.

## Writing API Test

[APIRequestContext] can send all kinds of HTTP(S) requests over network.

The following example demonstrates how to use Playwright to test issues creation via [GitHub API](https://docs.github.com/en/rest). The test suite will do the following:
- Create a new repository before running tests.
- Create a few issues and validate server state.
- Delete the repository after running tests.

### Configuration

GitHub API requires authorization, so we'll configure the token once for all tests. While at it, we'll also set the `baseURL` to simplify the tests. You can either put them in the configuration file, or in the test file with `test.use()`.

```js title="playwright.config.ts"
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: {
    // All requests we send go to this API endpoint.
    baseURL: 'https://api.github.com',
    extraHTTPHeaders: {
      // We set this header per GitHub guidelines.
      'Accept': 'application/vnd.github.v3+json',
      // Add authorization token to all requests.
      // Assuming personal access token available in the environment.
      'Authorization': `token ${process.env.API_TOKEN}`,
    },
  }
});
```

**Proxy configuration**

If your tests need to run behind a proxy, you can specify this in the config and the `request` fixture
will pick it up automatically:

```js title="playwright.config.ts"
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: {
    proxy: {
      server: 'http://my-proxy:8080',
      username: 'user',
      password: 'secret'
    },
  }
});
```

### Writing tests

Playwright Test comes with the built-in `request` fixture that respects configuration options like `baseURL` or `extraHTTPHeaders` we specified and is ready to send some requests.

Now we can add a few tests that will create new issues in the repository.
```js
const REPO = 'test-repo-1';
const USER = 'github-username';

test('should create a bug report', async ({ request }) => {
  const newIssue = await request.post(`/repos/${USER}/${REPO}/issues`, {
    data: {
      title: '[Bug] report 1',
      body: 'Bug description',
    }
  });
  expect(newIssue.ok()).toBeTruthy();

  const issues = await request.get(`/repos/${USER}/${REPO}/issues`);
  expect(issues.ok()).toBeTruthy();
  expect(await issues.json()).toContainEqual(expect.objectContaining({
    title: '[Bug] report 1',
    body: 'Bug description'
  }));
});

test('should create a feature request', async ({ request }) => {
  const newIssue = await request.post(`/repos/${USER}/${REPO}/issues`, {
    data: {
      title: '[Feature] request 1',
      body: 'Feature description',
    }
  });
  expect(newIssue.ok()).toBeTruthy();

  const issues = await request.get(`/repos/${USER}/${REPO}/issues`);
  expect(issues.ok()).toBeTruthy();
  expect(await issues.json()).toContainEqual(expect.objectContaining({
    title: '[Feature] request 1',
    body: 'Feature description'
  }));
});
```

### Setup and teardown

These tests assume that repository exists. You probably want to create a new one before running tests and delete it afterwards. Use `beforeAll` and `afterAll` hooks for that.

```js
test.beforeAll(async ({ request }) => {
  // Create a new repository
  const response = await request.post('/user/repos', {
    data: {
      name: REPO
    }
  });
  expect(response.ok()).toBeTruthy();
});

test.afterAll(async ({ request }) => {
  // Delete the repository
  const response = await request.delete(`/repos/${USER}/${REPO}`);
  expect(response.ok()).toBeTruthy();
});
```

## Using request context

Behind the scenes, [`request` fixture](./api/class-fixtures#fixtures-request) will actually call [`method: APIRequest.newContext`]. You can always do that manually if you'd like more control. Below is a standalone script that does the same as `beforeAll` and `afterAll` from above.

```js
import { request } from '@playwright/test';
const REPO = 'test-repo-1';
const USER = 'github-username';

(async () => {
  // Create a context that will issue http requests.
  const context = await request.newContext({
    baseURL: 'https://api.github.com',
  });

  // Create a repository.
  await context.post('/user/repos', {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      // Add GitHub personal access token.
      'Authorization': `token ${process.env.API_TOKEN}`,
    },
    data: {
      name: REPO
    }
  });

  // Delete a repository.
  await context.delete(`/repos/${USER}/${REPO}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      // Add GitHub personal access token.
      'Authorization': `token ${process.env.API_TOKEN}`,
    }
  });
})();
```

## Sending API requests from UI tests

While running tests inside browsers you may want to make calls to the HTTP API of your application. It may be helpful if you need to prepare server state before running a test or to check some postconditions on the server after performing some actions in the browser. All of that could be achieved via [APIRequestContext] methods.

### Establishing preconditions

The following test creates a new issue via API and then navigates to the list of all issues in the
project to check that it appears at the top of the list.

```js
import { test, expect } from '@playwright/test';

const REPO = 'test-repo-1';
const USER = 'github-username';

// Request context is reused by all tests in the file.
let apiContext;

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    // All requests we send go to this API endpoint.
    baseURL: 'https://api.github.com',
    extraHTTPHeaders: {
      // We set this header per GitHub guidelines.
      'Accept': 'application/vnd.github.v3+json',
      // Add authorization token to all requests.
      // Assuming personal access token available in the environment.
      'Authorization': `token ${process.env.API_TOKEN}`,
    },
  });
});

test.afterAll(async ({ }) => {
  // Dispose all responses.
  await apiContext.dispose();
});

test('last created issue should be first in the list', async ({ page }) => {
  const newIssue = await apiContext.post(`/repos/${USER}/${REPO}/issues`, {
    data: {
      title: '[Feature] request 1',
    }
  });
  expect(newIssue.ok()).toBeTruthy();

  await page.goto(`https://github.com/${USER}/${REPO}/issues`);
  const firstIssue = page.locator(`a[data-hovercard-type='issue']`).first();
  await expect(firstIssue).toHaveText('[Feature] request 1');
});
```

### Validating postconditions

The following test creates a new issue via user interface in the browser and then uses checks if
it was created via API:

```js
import { test, expect } from '@playwright/test';

const REPO = 'test-repo-1';
const USER = 'github-username';

// Request context is reused by all tests in the file.
let apiContext;

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    // All requests we send go to this API endpoint.
    baseURL: 'https://api.github.com',
    extraHTTPHeaders: {
      // We set this header per GitHub guidelines.
      'Accept': 'application/vnd.github.v3+json',
      // Add authorization token to all requests.
      // Assuming personal access token available in the environment.
      'Authorization': `token ${process.env.API_TOKEN}`,
    },
  });
});

test.afterAll(async ({ }) => {
  // Dispose all responses.
  await apiContext.dispose();
});

test('last created issue should be on the server', async ({ page }) => {
  await page.goto(`https://github.com/${USER}/${REPO}/issues`);
  await page.getByText('New Issue').click();
  await page.getByRole('textbox', { name: 'Title' }).fill('Bug report 1');
  await page.getByRole('textbox', { name: 'Comment body' }).fill('Bug description');
  await page.getByText('Submit new issue').click();
  const issueId = new URL(page.url()).pathname.split('/').pop();

  const newIssue = await apiContext.get(
      `https://api.github.com/repos/${USER}/${REPO}/issues/${issueId}`
  );
  expect(newIssue.ok()).toBeTruthy();
  expect(newIssue.json()).toEqual(expect.objectContaining({
    title: 'Bug report 1'
  }));
});
```

## Reusing authentication state

Web apps use cookie-based or token-based authentication, where authenticated
state is stored as [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).
Playwright provides [`method: APIRequestContext.storageState`] method that can be used to
retrieve storage state from an authenticated context and then create new contexts with that state.

Storage state is interchangeable between [BrowserContext] and [APIRequestContext]. You can
use it to log in via API calls and then create a new context with cookies already there.
The following code snippet retrieves state from an authenticated [APIRequestContext] and
creates a new [BrowserContext] with that state.

```js
const requestContext = await request.newContext({
  httpCredentials: {
    username: 'user',
    password: 'passwd'
  }
});
await requestContext.get(`https://api.example.com/login`);
// Save storage state into the file.
await requestContext.storageState({ path: 'state.json' });

// Create a new context with the saved storage state.
const context = await browser.newContext({ storageState: 'state.json' });
```

## Context request vs global request

There are two types of [APIRequestContext]:
* associated with a [BrowserContext]
* isolated instance, created via [`method: APIRequest.newContext`]

The main difference is that [APIRequestContext] accessible via [`property: BrowserContext.request`] and
[`property: Page.request`] will populate request's `Cookie` header from the browser context and will
automatically update browser cookies if [APIResponse] has `Set-Cookie` header:

```js
test('context request will share cookie storage with its browser context', async ({
  page,
  context,
}) => {
  await context.route('https://www.github.com/', async route => {
    // Send an API request that shares cookie storage with the browser context.
    const response = await context.request.fetch(route.request());
    const responseHeaders = response.headers();

    // The response will have 'Set-Cookie' header.
    const responseCookies = new Map(responseHeaders['set-cookie']
        .split('\n')
        .map(c => c.split(';', 2)[0].split('=')));
    // The response will have 3 cookies in 'Set-Cookie' header.
    expect(responseCookies.size).toBe(3);
    const contextCookies = await context.cookies();
    // The browser context will already contain all the cookies from the API response.
    expect(new Map(contextCookies.map(({ name, value }) =>
      [name, value])
    )).toEqual(responseCookies);

    await route.fulfill({
      response,
      headers: { ...responseHeaders, foo: 'bar' },
    });
  });
  await page.goto('https://www.github.com/');
});
```

If you don't want [APIRequestContext] to use and update cookies from the browser context, you can manually
create a new instance of [APIRequestContext] which will have its own isolated cookies:

```js
test('global context request has isolated cookie storage', async ({
  page,
  context,
  browser,
  playwright
}) => {
  // Create a new instance of APIRequestContext with isolated cookie storage.
  const request = await playwright.request.newContext();
  await context.route('https://www.github.com/', async route => {
    const response = await request.fetch(route.request());
    const responseHeaders = response.headers();

    const responseCookies = new Map(responseHeaders['set-cookie']
        .split('\n')
        .map(c => c.split(';', 2)[0].split('=')));
    // The response will have 3 cookies in 'Set-Cookie' header.
    expect(responseCookies.size).toBe(3);
    const contextCookies = await context.cookies();
    // The browser context will not have any cookies from the isolated API request.
    expect(contextCookies.length).toBe(0);

    // Manually export cookie storage.
    const storageState = await request.storageState();
    // Create a new context and initialize it with the cookies from the global request.
    const browserContext2 = await browser.newContext({ storageState });
    const contextCookies2 = await browserContext2.cookies();
    // The new browser context will already contain all the cookies from the API response.
    expect(
        new Map(contextCookies2.map(({ name, value }) => [name, value]))
    ).toEqual(responseCookies);

    await route.fulfill({
      response,
      headers: { ...responseHeaders, foo: 'bar' },
    });
  });
  await page.goto('https://www.github.com/');
  await request.dispose();
});
```



================================================
FILE: docs/src/api-testing-python.md
================================================
---
id: api-testing
title: "API testing"
---

## Introduction

Playwright can be used to get access to the [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) API of
your application.

Sometimes you may want to send requests to the server directly from Python without loading a page and running js code in it.
A few examples where it may come in handy:
- Test your server API.
- Prepare server side state before visiting the web application in a test.
- Validate server side post-conditions after running some actions in the browser.

All of that could be achieved via [APIRequestContext] methods.

The following examples rely on the [`pytest-playwright`](./test-runners.md) package which add Playwright fixtures to the Pytest test-runner.

## Writing API Test

[APIRequestContext] can send all kinds of HTTP(S) requests over network.

The following example demonstrates how to use Playwright to test issues creation via [GitHub API](https://docs.github.com/en/rest). The test suite will do the following:
- Create a new repository before running tests.
- Create a few issues and validate server state.
- Delete the repository after running tests.

### Configure

GitHub API requires authorization, so we'll configure the token once for all tests. While at it, we'll also set the `baseURL` to simplify the tests.

```python
import os
from typing import Generator

import pytest
from playwright.sync_api import Playwright, APIRequestContext

GITHUB_API_TOKEN = os.getenv("GITHUB_API_TOKEN")
assert GITHUB_API_TOKEN, "GITHUB_API_TOKEN is not set"


@pytest.fixture(scope="session")
def api_request_context(
    playwright: Playwright,
) -> Generator[APIRequestContext, None, None]:
    headers = {
        # We set this header per GitHub guidelines.
        "Accept": "application/vnd.github.v3+json",
        # Add authorization token to all requests.
        # Assuming personal access token available in the environment.
        "Authorization": f"token {GITHUB_API_TOKEN}",
    }
    request_context = playwright.request.new_context(
        base_url="https://api.github.com", extra_http_headers=headers
    )
    yield request_context
    request_context.dispose()

```

### Write tests

Now that we initialized request object we can add a few tests that will create new issues in the repository.
```python
import os
from typing import Generator

import pytest
from playwright.sync_api import Playwright, APIRequestContext

GITHUB_API_TOKEN = os.getenv("GITHUB_API_TOKEN")
assert GITHUB_API_TOKEN, "GITHUB_API_TOKEN is not set"

GITHUB_USER = os.getenv("GITHUB_USER")
assert GITHUB_USER, "GITHUB_USER is not set"

GITHUB_REPO = "test"

# ...

def test_should_create_bug_report(api_request_context: APIRequestContext) -> None:
    data = {
        "title": "[Bug] report 1",
        "body": "Bug description",
    }
    new_issue = api_request_context.post(f"/repos/{GITHUB_USER}/{GITHUB_REPO}/issues", data=data)
    assert new_issue.ok

    issues = api_request_context.get(f"/repos/{GITHUB_USER}/{GITHUB_REPO}/issues")
    assert issues.ok
    issues_response = issues.json()
    issue = list(filter(lambda issue: issue["title"] == "[Bug] report 1", issues_response))[0]
    assert issue
    assert issue["body"] == "Bug description"

def test_should_create_feature_request(api_request_context: APIRequestContext) -> None:
    data = {
        "title": "[Feature] request 1",
        "body": "Feature description",
    }
    new_issue = api_request_context.post(f"/repos/{GITHUB_USER}/{GITHUB_REPO}/issues", data=data)
    assert new_issue.ok

    issues = api_request_context.get(f"/repos/{GITHUB_USER}/{GITHUB_REPO}/issues")
    assert issues.ok
    issues_response = issues.json()
    issue = list(filter(lambda issue: issue["title"] == "[Feature] request 1", issues_response))[0]
    assert issue
    assert issue["body"] == "Feature description"
```

### Setup and teardown

These tests assume that repository exists. You probably want to create a new one before running tests and delete it afterwards. Use a [session fixture](https://docs.pytest.org/en/stable/how-to/fixtures.html#fixture-scopes) for that. The part before `yield` is the before all and after is the after all.

```python
# ...
@pytest.fixture(scope="session", autouse=True)
def create_test_repository(
    api_request_context: APIRequestContext,
) -> Generator[None, None, None]:
    # Before all
    new_repo = api_request_context.post("/user/repos", data={"name": GITHUB_REPO})
    assert new_repo.ok
    yield
    # After all
    deleted_repo = api_request_context.delete(f"/repos/{GITHUB_USER}/{GITHUB_REPO}")
    assert deleted_repo.ok
```

### Complete test example

Here is the complete example of an API test:

```python
from enum import auto
import os
from typing import Generator

import pytest
from playwright.sync_api import Playwright, Page, APIRequestContext, expect

GITHUB_API_TOKEN = os.getenv("GITHUB_API_TOKEN")
assert GITHUB_API_TOKEN, "GITHUB_API_TOKEN is not set"

GITHUB_USER = os.getenv("GITHUB_USER")
assert GITHUB_USER, "GITHUB_USER is not set"

GITHUB_REPO = "test"


@pytest.fixture(scope="session")
def api_request_context(
    playwright: Playwright,
) -> Generator[APIRequestContext, None, None]:
    headers = {
        # We set this header per GitHub guidelines.
        "Accept": "application/vnd.github.v3+json",
        # Add authorization token to all requests.
        # Assuming personal access token available in the environment.
        "Authorization": f"token {GITHUB_API_TOKEN}",
    }
    request_context = playwright.request.new_context(
        base_url="https://api.github.com", extra_http_headers=headers
    )
    yield request_context
    request_context.dispose()


@pytest.fixture(scope="session", autouse=True)
def create_test_repository(
    api_request_context: APIRequestContext,
) -> Generator[None, None, None]:
    # Before all
    new_repo = api_request_context.post("/user/repos", data={"name": GITHUB_REPO})
    assert new_repo.ok
    yield
    # After all
    deleted_repo = api_request_context.delete(f"/repos/{GITHUB_USER}/{GITHUB_REPO}")
    assert deleted_repo.ok


def test_should_create_bug_report(api_request_context: APIRequestContext) -> None:
    data = {
        "title": "[Bug] report 1",
        "body": "Bug description",
    }
    new_issue = api_request_context.post(
        f"/repos/{GITHUB_USER}/{GITHUB_REPO}/issues", data=data
    )
    assert new_issue.ok

    issues = api_request_context.get(f"/repos/{GITHUB_USER}/{GITHUB_REPO}/issues")
    assert issues.ok
    issues_response = issues.json()
    issue = list(
        filter(lambda issue: issue["title"] == "[Bug] report 1", issues_response)
    )[0]
    assert issue
    assert issue["body"] == "Bug description"


def test_should_create_feature_request(api_request_context: APIRequestContext) -> None:
    data = {
        "title": "[Feature] request 1",
        "body": "Feature description",
    }
    new_issue = api_request_context.post(
        f"/repos/{GITHUB_USER}/{GITHUB_REPO}/issues", data=data
    )
    assert new_issue.ok

    issues = api_request_context.get(f"/repos/{GITHUB_USER}/{GITHUB_REPO}/issues")
    assert issues.ok
    issues_response = issues.json()
    issue = list(
        filter(lambda issue: issue["title"] == "[Feature] request 1", issues_response)
    )[0]
    assert issue
    assert issue["body"] == "Feature description"
```

## Prepare server state via API calls

The following test creates a new issue via API and then navigates to the list of all issues in the
project to check that it appears at the top of the list. The check is performed using [LocatorAssertions].

```python
def test_last_created_issue_should_be_first_in_the_list(api_request_context: APIRequestContext, page: Page) -> None:
    def create_issue(title: str) -> None:
        data = {
            "title": title,
            "body": "Feature description",
        }
        new_issue = api_request_context.post(
            f"/repos/{GITHUB_USER}/{GITHUB_REPO}/issues", data=data
        )
        assert new_issue.ok
    create_issue("[Feature] request 1")
    create_issue("[Feature] request 2")
    page.goto(f"https://github.com/{GITHUB_USER}/{GITHUB_REPO}/issues")
    first_issue = page.locator("a[data-hovercard-type='issue']").first
    expect(first_issue).to_have_text("[Feature] request 2")
```

## Check the server state after running user actions

The following test creates a new issue via user interface in the browser and then checks via API if
it was created:

```python
def test_last_created_issue_should_be_on_the_server(api_request_context: APIRequestContext, page: Page) -> None:
    page.goto(f"https://github.com/{GITHUB_USER}/{GITHUB_REPO}/issues")
    page.locator("text=New issue").click()
    page.locator("[aria-label='Title']").fill("Bug report 1")
    page.locator("[aria-label='Comment body']").fill("Bug description")
    page.locator("text=Submit new issue").click()
    issue_id = page.url.split("/")[-1]

    new_issue = api_request_context.get(f"https://github.com/{GITHUB_USER}/{GITHUB_REPO}/issues/{issue_id}")
    assert new_issue.ok
    assert new_issue.json()["title"] == "[Bug] report 1"
    assert new_issue.json()["body"] == "Bug description"
```

## Reuse authentication state

Web apps use cookie-based or token-based authentication, where authenticated
state is stored as [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).
Playwright provides [`method: APIRequestContext.storageState`] method that can be used to
retrieve storage state from an authenticated context and then create new contexts with that state.

Storage state is interchangeable between [BrowserContext] and [APIRequestContext]. You can
use it to log in via API calls and then create a new context with cookies already there.
The following code snippet retrieves state from an authenticated [APIRequestContext] and
creates a new [BrowserContext] with that state.

```python
request_context = playwright.request.new_context(http_credentials={"username": "test", "password": "test"})
request_context.get("https://api.example.com/login")
# Save storage state into a variable.
state = request_context.storage_state()

# Create a new context with the saved storage state.
context = browser.new_context(storage_state=state)
```



================================================
FILE: docs/src/aria-snapshots.md
================================================
---
id: aria-snapshots
title: "Snapshot testing"
---
import LiteYouTube from '@site/src/components/LiteYouTube';

## Overview

With Playwright's Snapshot testing you can assert the accessibility tree of a page against a predefined snapshot template.

```js
await page.goto('https://playwright.dev/');
await expect(page.getByRole('banner')).toMatchAriaSnapshot(`
  - banner:
    - heading /Playwright enables reliable end-to-end/ [level=1]
    - link "Get started"
    - link "Star microsoft/playwright on GitHub"
    - link /[\\d]+k\\+ stargazers on GitHub/
`);
```

```python sync
page.goto('https://playwright.dev/')
expect(page.query_selector('banner')).to_match_aria_snapshot("""
  - banner:
    - heading /Playwright enables reliable end-to-end/ [level=1]
    - link "Get started"
    - link "Star microsoft/playwright on GitHub"
    - link /[\\d]+k\\+ stargazers on GitHub/
""")
```

```python async
await page.goto('https://playwright.dev/')
await expect(page.query_selector('banner')).to_match_aria_snapshot("""
  - banner:
    - heading /Playwright enables reliable end-to-end/ [level=1]
    - link "Get started"
    - link "Star microsoft/playwright on GitHub"
    - link /[\\d]+k\\+ stargazers on GitHub/
""")
```

```java
page.navigate("https://playwright.dev/");
assertThat(page.locator("banner")).matchesAriaSnapshot("""
  - banner:
    - heading /Playwright enables reliable end-to-end/ [level=1]
    - link "Get started"
    - link "Star microsoft/playwright on GitHub"
    - link /[\\d]+k\\+ stargazers on GitHub/
""");
```

```csharp
await page.GotoAsync("https://playwright.dev/");
await Expect(page.Locator("banner")).ToMatchAriaSnapshotAsync(@"
  - banner:
    - heading ""Playwright enables reliable end-to-end testing for modern web apps."" [level=1]
    - link ""Get started""
    - link ""Star microsoft/playwright on GitHub""
    - link /[\\d]+k\\+ stargazers on GitHub/
");
```

<LiteYouTube
    id="P4R6hnsE0UY"
    title="Getting started with ARIA Snapshots"
/>

## Assertion testing vs Snapshot testing

Snapshot testing and assertion testing serve different purposes in test automation:

### Assertion testing
Assertion testing is a targeted approach where you assert specific values or conditions about elements or components. For instance, with Playwright, [`method: LocatorAssertions.toHaveText`]
verifies that an element contains the expected text, and [`method: LocatorAssertions.toHaveValue`]
confirms that an input field has the expected value.
Assertion tests are specific and generally check the current state of an element or property
against an expected, predefined state.
They work well for predictable, single-value checks but are limited in scope when testing the
broader structure or variations.

**Advantages**
- **Clarity**: The intent of the test is explicit and easy to understand.
- **Specificity**: Tests focus on particular aspects of functionality, making them more robust
  against unrelated changes.
- **Debugging**: Failures provide targeted feedback, pointing directly to the problematic aspect.

**Disadvantages**
- **Verbose for complex outputs**: Writing assertions for complex data structures or large outputs
  can be cumbersome and error-prone.
- **Maintenance overhead**: As code evolves, manually updating assertions can be time-consuming.

### Snapshot testing
Snapshot testing captures a “snapshot” or representation of the entire
state of an element, component, or data at a given moment, which is then saved for future
comparisons. When re-running tests, the current state is compared to the snapshot, and if there
are differences, the test fails. This approach is especially useful for complex or dynamic
structures, where manually asserting each detail would be too time-consuming. Snapshot testing
is broader and more holistic than assertion testing, allowing you to track more complex changes over time.

**Advantages**
- **Simplifies complex outputs**: For example, testing a UI component's rendered output can be tedious with traditional assertions. Snapshots capture the entire output for easy comparison.
- **Quick Feedback loop**: Developers can easily spot unintended changes in the output.
- **Encourages consistency**: Helps maintain consistent output as code evolves.

**Disadvantages**
- **Over-Reliance**: It can be tempting to accept changes to snapshots without fully understanding
  them, potentially hiding bugs.
- **Granularity**: Large snapshots may be hard to interpret when differences arise, especially
  if minor changes affect large portions of the output.
- **Suitability**: Not ideal for highly dynamic content where outputs change frequently or
  unpredictably.

### When to use

- **Snapshot testing** is ideal for:
  - UI testing of whole pages and components.
  - Broad structural checks for complex UI components.
  - Regression testing for outputs that rarely change structure.

- **Assertion testing** is ideal for:
  - Core logic validation.
  - Computed value testing.
  - Fine-grained tests requiring precise conditions.

By combining snapshot testing for broad, structural checks and assertion testing for specific functionality, you can achieve a well-rounded testing strategy.

## Aria snapshots

In Playwright, aria snapshots provide a YAML representation of the accessibility tree of a page.
These snapshots can be stored and compared later to verify if the page structure remains consistent or meets defined
expectations.

The YAML format describes the hierarchical structure of accessible elements on the page, detailing **roles**, **attributes**, **values**, and **text content**.
The structure follows a tree-like syntax, where each node represents an accessible element, and indentation indicates
nested elements.

Each accessible element in the tree is represented as a YAML node:

```yaml
- role "name" [attribute=value]
```

- **role**: Specifies the ARIA or HTML role of the element (e.g., `heading`, `list`, `listitem`, `button`).
- **"name"**: Accessible name of the element. Quoted strings indicate exact values, `/patterns/` are used for regular expression.
- **[attribute=value]**: Attributes and values, in square brackets, represent specific ARIA attributes, such
  as `checked`, `disabled`, `expanded`, `level`, `pressed`, or `selected`.

These values are derived from ARIA attributes or calculated based on HTML semantics. To inspect the accessibility tree
structure of a page, use the [Chrome DevTools Accessibility Tab](https://developer.chrome.com/docs/devtools/accessibility/reference#tab).


## Snapshot matching

The [`method: LocatorAssertions.toMatchAriaSnapshot`] assertion method in Playwright compares the accessible
structure of the locator scope with a predefined aria snapshot template, helping validate the page's state against
testing requirements.

For the following DOM:

```html
<h1>title</h1>
```

You can match it using the following snapshot template:

```js
await expect(page.locator('body')).toMatchAriaSnapshot(`
  - heading "title"
`);
```

```python sync
expect(page.locator("body")).to_match_aria_snapshot("""
  - heading "title"
""")
```

```python async
await expect(page.locator("body")).to_match_aria_snapshot("""
  - heading "title"
""")
```

```java
assertThat(page.locator("body")).matchesAriaSnapshot("""
  - heading "title"
""");
```

```csharp
await Expect(page.Locator("body")).ToMatchAriaSnapshotAsync(@"
  - heading ""title""
");
```

When matching, the snapshot template is compared to the current accessibility tree of the page:

* If the tree structure matches the template, the test passes; otherwise, it fails, indicating a mismatch between
  expected and actual accessibility states.
* The comparison is case-sensitive and collapses whitespace, so indentation and line breaks are ignored.
* The comparison is order-sensitive, meaning the order of elements in the snapshot template must match the order in the
  page's accessibility tree.


### Partial matching

You can perform partial matches on nodes by omitting attributes or accessible names, enabling verification of specific
parts of the accessibility tree without requiring exact matches. This flexibility is helpful for dynamic or irrelevant
attributes.

```html
<button>Submit</button>
```

*aria snapshot*

```yaml
- button
```

In this example, the button role is matched, but the accessible name ("Submit") is not specified, allowing the test to
pass regardless of the button's label.

<hr/>

For elements with ARIA attributes like `checked` or `disabled`, omitting these attributes allows partial matching,
focusing solely on role and hierarchy.

```html
<input type="checkbox" checked>
```

*aria snapshot for partial match*

```yaml
- checkbox
```

In this partial match, the `checked` attribute is ignored, so the test will pass regardless of the checkbox state.

<hr/>

Similarly, you can partially match children in lists or groups by omitting specific list items or nested elements.

```html
<ul>
  <li>Feature A</li>
  <li>Feature B</li>
  <li>Feature C</li>
</ul>
```

*aria snapshot for partial match*

```yaml
- list
  - listitem: Feature B
```

Partial matches let you create flexible snapshot tests that verify essential page structure without enforcing
specific content or attributes.

### Strict matching

By default, a template containing the subset of children will be matched:

```html
<ul>
  <li>Feature A</li>
  <li>Feature B</li>
  <li>Feature C</li>
</ul>
```

*aria snapshot for partial match*

```yaml
- list
  - listitem: Feature B
```


The `/children` property can be used to control how child elements are matched:
- `contain` (default): Matches if all specified children are present in order
- `equal`: Matches if the children exactly match the specified list in order
- `deep-equal`: Matches if the children exactly match the specified list in order, including nested children

```html
<ul>
  <li>Feature A</li>
  <li>Feature B</li>
  <li>Feature C</li>
</ul>
```

*aria snapshot will fail due to Feature C not being in the template*

```yaml
- list
  - /children: equal
  - listitem: Feature A
  - listitem: Feature B
```

### Matching with regular expressions

Regular expressions allow flexible matching for elements with dynamic or variable text. Accessible names and text can
support regex patterns.

```html
<h1>Issues 12</h1>
```

*aria snapshot with regular expression*

```yaml
- heading /Issues \d+/
```

## Generating snapshots

Creating aria snapshots in Playwright helps ensure and maintain your application's structure.
You can generate snapshots in various ways depending on your testing setup and workflow.

### Generating snapshots with the Playwright code generator

If you're using Playwright's [Code Generator](./codegen.md), generating aria snapshots is streamlined with its
interactive interface:

- **"Assert snapshot" Action**: In the code generator, you can use the "Assert snapshot" action to automatically create
a snapshot assertion for the selected elements. This is a quick way to capture the aria snapshot as part of your
recorded test flow.

- **"Aria snapshot" Tab**: The "Aria snapshot" tab within the code generator interface visually represents the
aria snapshot for a selected locator, letting you explore, inspect, and verify element roles, attributes, and
accessible names to aid snapshot creation and review.

### Updating snapshots with `@playwright/test` and the `--update-snapshots` flag
* langs: js

When using the Playwright test runner (`@playwright/test`), you can automatically update snapshots with the `--update-snapshots` flag, `-u` for short.

Running tests with the `--update-snapshots` flag will update snapshots that did not match. Matching snapshots will not be updated.

```bash
npx playwright test --update-snapshots
```

Updating snapshots is useful when application structure changes require new snapshots as a baseline. Note that Playwright will wait for the maximum expect timeout specified in the test runner configuration to ensure the page is settled before taking the snapshot. It might be necessary to adjust the `--timeout` if the test hits the timeout while generating snapshots.

#### Empty template for snapshot generation

Passing an empty string as the template in an assertion generates a snapshot on-the-fly:

```js
await expect(locator).toMatchAriaSnapshot('');
```

Note that Playwright will wait for the maximum expect timeout specified in the test runner configuration to ensure the
page is settled before taking the snapshot. It might be necessary to adjust the `--timeout` if the test hits the timeout
while generating snapshots.

#### Snapshot patch files

When updating snapshots, Playwright creates patch files that capture differences. These patch files can be reviewed,
applied, and committed to source control, allowing teams to track structural changes over time and ensure updates are
consistent with application requirements.

The way source code is updated can be changed using the `--update-source-method` flag. There are several options available:

- **"patch"** (default): Generates a unified diff file that can be applied to the source code using `git apply`.
- **"3way"**: Generates merge conflict markers in your source code, allowing you to choose whether to accept changes.
- **"overwrite"**: Overwrites the source code with the new snapshot values.

```bash
npx playwright test --update-snapshots --update-source-method=3way
```

#### Snapshots as separate files

To store your snapshots in a separate file, use the `toMatchAriaSnapshot` method with the `name` option, specifying a `.aria.yml` file extension.

```js
await expect(page.getByRole('main')).toMatchAriaSnapshot({ name: 'main.aria.yml' });
```

By default, snapshots from a test file `example.spec.ts` are placed in the `example.spec.ts-snapshots` directory. As snapshots should be the same across browsers, only one snapshot is saved even if testing with multiple browsers. Should you wish, you can customize the [snapshot path template](./api/class-testconfig#test-config-snapshot-path-template) using the following configuration:

```js
export default defineConfig({
  expect: {
    toMatchAriaSnapshot: {
      pathTemplate: '__snapshots__/{testFilePath}/{arg}{ext}',
    },
  },
});
```

### Using the `Locator.ariaSnapshot` method

The [`method: Locator.ariaSnapshot`] method allows you to programmatically create a YAML representation of accessible
elements within a locator's scope, especially helpful for generating snapshots dynamically during test execution.

**Example**:

```js
const snapshot = await page.locator('body').ariaSnapshot();
console.log(snapshot);
```

```python sync
snapshot = page.locator("body").aria_snapshot()
print(snapshot)
```

```python async
snapshot = await page.locator("body").aria_snapshot()
print(snapshot)
```

```java
String snapshot = page.locator("body").ariaSnapshot();
System.out.println(snapshot);
```

```csharp
var snapshot = await page.Locator("body").AriaSnapshotAsync();
Console.WriteLine(snapshot);
```

This command outputs the aria snapshot within the specified locator's scope in YAML format, which you can validate
or store as needed.

## Accessibility tree examples

### Headings with level attributes

Headings can include a `level` attribute indicating their heading level.

```html
<h1>Title</h1>
<h2>Subtitle</h2>
```

*aria snapshot*

```yaml
- heading "Title" [level=1]
- heading "Subtitle" [level=2]
```

### Text nodes

Standalone or descriptive text elements appear as text nodes.

```html
<div>Sample accessible name</div>
```

*aria snapshot*

```yaml
- text: Sample accessible name
```

### Inline multiline text

Multiline text, such as paragraphs, is normalized in the aria snapshot.

```html
<p>Line 1<br>Line 2</p>
```

*aria snapshot*

```yaml
- paragraph: Line 1 Line 2
```

### Links

Links display their text or composed content from pseudo-elements.

```html
<a href="#more-info">Read more about Accessibility</a>
```

*aria snapshot*

```yaml
- link "Read more about Accessibility"
```

### Text boxes

Input elements of type `text` show their `value` attribute content.

```html
<input type="text" value="Enter your name">
```

*aria snapshot*

```yaml
- textbox: Enter your name
```

### Lists with items

Ordered and unordered lists include their list items.

```html
<ul aria-label="Main Features">
  <li>Feature 1</li>
  <li>Feature 2</li>
</ul>
```

*aria snapshot*

```yaml
- list "Main Features":
  - listitem: Feature 1
  - listitem: Feature 2
```

### Grouped elements

Groups capture nested elements, such as `<details>` elements with summary content.

```html
<details>
  <summary>Summary</summary>
  <p>Detail content here</p>
</details>
```

*aria snapshot*

```yaml
- group: Summary
```

### Attributes and states

Commonly used ARIA attributes, like `checked`, `disabled`, `expanded`, `level`, `pressed`, and `selected`, represent
control states.

#### Checkbox with `checked` attribute

```html
<input type="checkbox" checked>
```

*aria snapshot*

```yaml
- checkbox [checked]
```

#### Button with `pressed` attribute

```html
<button aria-pressed="true">Toggle</button>
```

*aria snapshot*

```yaml
- button "Toggle" [pressed=true]
```



================================================
FILE: docs/src/auth.md
================================================
---
id: auth
title: "Authentication"
---

## Introduction

Playwright executes tests in isolated environments called [browser contexts](./browser-contexts.md). This isolation model improves reproducibility and prevents cascading test failures. Tests can load existing authenticated state. This eliminates the need to authenticate in every test and speeds up test execution.

## Core concepts

Regardless of the authentication strategy you choose, you are likely to store authenticated browser state on the file system.

We recommend to create `playwright/.auth` directory and add it to your `.gitignore`. Your authentication routine will produce authenticated browser state and save it to a file in this `playwright/.auth` directory. Later on, tests will reuse this state and start already authenticated.

:::danger
The browser state file may contain sensitive cookies and headers that could be used to impersonate you or your test account.
We strongly discourage checking them into private or public repositories.
:::

```bash tab=bash-bash
mkdir -p playwright/.auth
echo $'\nplaywright/.auth' >> .gitignore
```

```batch tab=bash-batch
md playwright\.auth
echo. >> .gitignore
echo "playwright/.auth" >> .gitignore
```

```powershell tab=bash-powershell
New-Item -ItemType Directory -Force -Path playwright\.auth
Add-Content -path .gitignore "`r`nplaywright/.auth"
```

## Basic: shared account in all tests
* langs: js

This is the **recommended** approach for tests **without server-side state**. Authenticate once in the **setup project**, save the authentication state, and then reuse it to bootstrap each test already authenticated.

**When to use**
- When you can imagine all your tests running at the same time with the same account, without affecting each other.

**When not to use**
- Your tests modify server-side state. For example, one test checks the rendering of the settings page, while the other test is changing the setting, and you run tests in parallel. In this case, tests must use different accounts.
- Your authentication is browser-specific.

**Details**

Create `tests/auth.setup.ts` that will prepare authenticated browser state for all other tests.

```js title="tests/auth.setup.ts"
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('https://github.com/login');
  await page.getByLabel('Username or email address').fill('username');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('https://github.com/');
  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await expect(page.getByRole('button', { name: 'View profile and more' })).toBeVisible();

  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
```

Create a new `setup` project in the config and declare it as a [dependency](./test-projects.md#dependencies) for all your testing projects. This project will always run and authenticate before all the tests. All testing projects should use the authenticated state as `storageState`.

```js title="playwright.config.ts"
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // Setup project
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use prepared auth state.
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Use prepared auth state.
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

Tests start already authenticated because we specified `storageState` in the config.

```js title="tests/example.spec.ts"
import { test } from '@playwright/test';

test('test', async ({ page }) => {
  // page is authenticated
});
```

Note that you need to delete the stored state when it expires. If you don't need to keep the state between test runs, write the browser state under [`property: TestProject.outputDir`], which is automatically cleaned up before every test run.

### Authenticating in UI mode
* langs: js

UI mode will not run the `setup` project by default to improve testing speed. We recommend to authenticate by manually running the `auth.setup.ts` from time to time, whenever existing authentication expires.

First [enable the `setup` project in the filters](./test-ui-mode#filtering-tests), then click the triangle button next to `auth.setup.ts` file, and then disable the `setup` project in the filters again.


## Moderate: one account per parallel worker
* langs: js

This is the **recommended** approach for tests that **modify server-side state**. In Playwright, worker processes run in parallel. In this approach, each parallel worker is authenticated once. All tests ran by worker are reusing the same authentication state. We will need multiple testing accounts, one per each parallel worker.

**When to use**
- Your tests modify shared server-side state. For example, one test checks the rendering of the settings page, while the other test is changing the setting.

**When not to use**
- Your tests do not modify any shared server-side state. In this case, all tests can use a single shared account.

**Details**

We will authenticate once per [worker process](./test-parallel.md#worker-processes), each with a unique account.

Create `playwright/fixtures.ts` file that will [override `storageState` fixture](./test-fixtures.md#overriding-fixtures) to authenticate once per worker. Use [`property: TestInfo.parallelIndex`] to differentiate between workers.

```js title="playwright/fixtures.ts"
import { test as baseTest, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export * from '@playwright/test';
export const test = baseTest.extend<{}, { workerStorageState: string }>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [async ({ browser }, use) => {
    // Use parallelIndex as a unique identifier for each worker.
    const id = test.info().parallelIndex;
    const fileName = path.resolve(test.info().project.outputDir, `.auth/${id}.json`);

    if (fs.existsSync(fileName)) {
      // Reuse existing authentication state if any.
      await use(fileName);
      return;
    }

    // Important: make sure we authenticate in a clean environment by unsetting storage state.
    const page = await browser.newPage({ storageState: undefined });

    // Acquire a unique account, for example create a new one.
    // Alternatively, you can have a list of precreated accounts for testing.
    // Make sure that accounts are unique, so that multiple team members
    // can run tests at the same time without interference.
    const account = await acquireAccount(id);

    // Perform authentication steps. Replace these actions with your own.
    await page.goto('https://github.com/login');
    await page.getByLabel('Username or email address').fill(account.username);
    await page.getByLabel('Password').fill(account.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    // Wait until the page receives the cookies.
    //
    // Sometimes login flow sets cookies in the process of several redirects.
    // Wait for the final URL to ensure that the cookies are actually set.
    await page.waitForURL('https://github.com/');
    // Alternatively, you can wait until the page reaches a state where all cookies are set.
    await expect(page.getByRole('button', { name: 'View profile and more' })).toBeVisible();

    // End of authentication steps.

    await page.context().storageState({ path: fileName });
    await page.close();
    await use(fileName);
  }, { scope: 'worker' }],
});
```

Now, each test file should import `test` from our fixtures file instead of `@playwright/test`. No changes are needed in the config.

```js title="tests/example.spec.ts"
// Important: import our fixtures.
import { test, expect } from '../playwright/fixtures';

test('test', async ({ page }) => {
  // page is authenticated
});
```


## Signing in before each test
* langs: java, python, csharp

The Playwright API can [automate interaction](./input.md) with a login form.

The following example logs into GitHub. Once these steps are executed,
the browser context will be authenticated.

```java
Page page = context.newPage();
page.navigate("https://github.com/login");
// Interact with login form
page.getByLabel("Username or email address").fill("username");
page.getByLabel("Password").fill("password");
page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in"))
    .click();
// Continue with the test
```

```python async
page = await context.new_page()
await page.goto('https://github.com/login')

# Interact with login form
await page.get_by_label("Username or email address").fill("username")
await page.get_by_label("Password").fill("password")
await page.get_by_role("button", name="Sign in").click()
# Continue with the test
```

```python sync
page = context.new_page()
page.goto('https://github.com/login')

# Interact with login form
page.get_by_label("Username or email address").fill("username")
page.get_by_label("Password").fill("password")
page.get_by_role("button", name="Sign in").click()
# Continue with the test
```

```csharp
var page = await context.NewPageAsync();
await page.GotoAsync("https://github.com/login");
// Interact with login form
await page.GetByLabel("Username or email address").FillAsync("username");
await page.GetByLabel("Password").FillAsync("password");
await page.GetByRole(AriaRole.Button, new() { Name = "Sign in" }).ClickAsync();
// Continue with the test
```

Redoing login for every test can slow down test execution. To mitigate that, reuse
existing authentication state instead.

## Reusing signed in state
* langs: java, csharp, python

Playwright provides a way to reuse the signed-in state in the tests. That way you can log
in only once and then skip the log in step for all of the tests.

Web apps use cookie-based or token-based authentication, where authenticated state is stored as [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies), in [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) or in [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API). Playwright provides [`method: BrowserContext.storageState`] method that can be used to retrieve storage state from authenticated contexts and then create new contexts with prepopulated state.

Cookies, local storage and IndexedDB state can be used across different browsers. They depend on your application's authentication model which may require some combination of cookies, local storage or IndexedDB.

The following code snippet retrieves state from an authenticated context and creates a new context with that state.

```java
// Save storage state into the file.
context.storageState(new BrowserContext.StorageStateOptions().setPath(Paths.get("state.json")));

// Create a new context with the saved storage state.
BrowserContext context = browser.newContext(
  new Browser.NewContextOptions().setStorageStatePath(Paths.get("state.json")));
```

```python async
# Save storage state into the file.
storage = await context.storage_state(path="state.json")

# Create a new context with the saved storage state.
context = await browser.new_context(storage_state="state.json")
```

```python sync
# Save storage state into the file.
storage = context.storage_state(path="state.json")

# Create a new context with the saved storage state.
context = browser.new_context(storage_state="state.json")
```

```csharp
// Save storage state into the file.
// Tests are executed in <TestProject>\bin\Debug\netX.0\ therefore relative path is used to reference playwright/.auth created in project root
await context.StorageStateAsync(new()
{
    Path = "../../../playwright/.auth/state.json"
});

// Create a new context with the saved storage state.
var context = await browser.NewContextAsync(new()
{
    StorageStatePath = "../../../playwright/.auth/state.json"
});
```


## Advanced scenarios

### Authenticate with API request
* langs: js

**When to use**
- Your web application supports authenticating via API that is easier/faster than interacting with the app UI.

**Details**

We will send the API request with [APIRequestContext] and then save authenticated state as usual.

In the [setup project](#basic-shared-account-in-all-tests):

```js title="tests/auth.setup.ts"
import { test as setup } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ request }) => {
  // Send authentication request. Replace with your own.
  await request.post('https://github.com/login', {
    form: {
      'user': 'user',
      'password': 'password'
    }
  });
  await request.storageState({ path: authFile });
});
```

Alternatively, in a [worker fixture](#moderate-one-account-per-parallel-worker):

```js title="playwright/fixtures.ts"
import { test as baseTest, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export * from '@playwright/test';
export const test = baseTest.extend<{}, { workerStorageState: string }>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [async ({}, use) => {
    // Use parallelIndex as a unique identifier for each worker.
    const id = test.info().parallelIndex;
    const fileName = path.resolve(test.info().project.outputDir, `.auth/${id}.json`);

    if (fs.existsSync(fileName)) {
      // Reuse existing authentication state if any.
      await use(fileName);
      return;
    }

    // Important: make sure we authenticate in a clean environment by unsetting storage state.
    const context = await request.newContext({ storageState: undefined });

    // Acquire a unique account, for example create a new one.
    // Alternatively, you can have a list of precreated accounts for testing.
    // Make sure that accounts are unique, so that multiple team members
    // can run tests at the same time without interference.
    const account = await acquireAccount(id);

    // Send authentication request. Replace with your own.
    await context.post('https://github.com/login', {
      form: {
        'user': 'user',
        'password': 'password'
      }
    });

    await context.storageState({ path: fileName });
    await context.dispose();
    await use(fileName);
  }, { scope: 'worker' }],
});
```

### Multiple signed in roles
* langs: js

**When to use**
- You have more than one role in your end to end tests, but you can reuse accounts across all tests.

**Details**

We will authenticate multiple times in the setup project.

```js title="tests/auth.setup.ts"
import { test as setup, expect } from '@playwright/test';

const adminFile = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('https://github.com/login');
  await page.getByLabel('Username or email address').fill('admin');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('https://github.com/');
  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await expect(page.getByRole('button', { name: 'View profile and more' })).toBeVisible();

  // End of authentication steps.

  await page.context().storageState({ path: adminFile });
});

const userFile = 'playwright/.auth/user.json';

setup('authenticate as user', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('https://github.com/login');
  await page.getByLabel('Username or email address').fill('user');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('https://github.com/');
  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await expect(page.getByRole('button', { name: 'View profile and more' })).toBeVisible();

  // End of authentication steps.

  await page.context().storageState({ path: userFile });
});
```

After that, specify `storageState` for each test file or test group, **instead of** setting it in the config.

```js title="tests/example.spec.ts"
import { test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/admin.json' });

test('admin test', async ({ page }) => {
  // page is authenticated as admin
});

test.describe(() => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('user test', async ({ page }) => {
    // page is authenticated as a user
  });
});
```

See also about [authenticating in the UI mode](#authenticating-in-ui-mode).

### Testing multiple roles together
* langs: js

**When to use**
- You need to test how multiple authenticated roles interact together, in a single test.

**Details**

Use multiple [BrowserContext]s and [Page]s with different storage states in the same test.

```js title="tests/example.spec.ts"
import { test } from '@playwright/test';

test('admin and user', async ({ browser }) => {
  // adminContext and all pages inside, including adminPage, are signed in as "admin".
  const adminContext = await browser.newContext({ storageState: 'playwright/.auth/admin.json' });
  const adminPage = await adminContext.newPage();

  // userContext and all pages inside, including userPage, are signed in as "user".
  const userContext = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
  const userPage = await userContext.newPage();

  // ... interact with both adminPage and userPage ...

  await adminContext.close();
  await userContext.close();
});
```

### Testing multiple roles with POM fixtures
* langs: js

**When to use**
- You need to test how multiple authenticated roles interact together, in a single test.

**Details**

You can introduce fixtures that will provide a page authenticated as each role.

Below is an example that [creates fixtures](./test-fixtures.md#creating-a-fixture) for two [Page Object Models](./pom.md) - admin POM and user POM. It assumes `adminStorageState.json` and `userStorageState.json` files were created in the global setup.

```js title="playwright/fixtures.ts"
import { test as base, type Page, type Locator } from '@playwright/test';

// Page Object Model for the "admin" page.
// Here you can add locators and helper methods specific to the admin page.
class AdminPage {
  // Page signed in as "admin".
  page: Page;

  // Example locator pointing to "Welcome, Admin" greeting.
  greeting: Locator;

  constructor(page: Page) {
    this.page = page;
    this.greeting = page.locator('#greeting');
  }
}

// Page Object Model for the "user" page.
// Here you can add locators and helper methods specific to the user page.
class UserPage {
  // Page signed in as "user".
  page: Page;

  // Example locator pointing to "Welcome, User" greeting.
  greeting: Locator;

  constructor(page: Page) {
    this.page = page;
    this.greeting = page.locator('#greeting');
  }
}

// Declare the types of your fixtures.
type MyFixtures = {
  adminPage: AdminPage;
  userPage: UserPage;
};

export * from '@playwright/test';
export const test = base.extend<MyFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'playwright/.auth/admin.json' });
    const adminPage = new AdminPage(await context.newPage());
    await use(adminPage);
    await context.close();
  },
  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
    const userPage = new UserPage(await context.newPage());
    await use(userPage);
    await context.close();
  },
});

```

```js title="tests/example.spec.ts"
// Import test with our new fixtures.
import { test, expect } from '../playwright/fixtures';

// Use adminPage and userPage fixtures in the test.
test('admin and user', async ({ adminPage, userPage }) => {
  // ... interact with both adminPage and userPage ...
  await expect(adminPage.greeting).toHaveText('Welcome, Admin');
  await expect(userPage.greeting).toHaveText('Welcome, User');
});
```


### Session storage

Reusing authenticated state covers [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies), [local storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) and [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) based authentication. Rarely, [session storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) is used for storing information associated with the signed-in state. Session storage is specific to a particular domain and is not persisted across page loads. Playwright does not provide API to persist session storage, but the following snippet can be used to save/load session storage.

```js
// Get session storage and store as env variable
const sessionStorage = await page.evaluate(() => JSON.stringify(sessionStorage));
fs.writeFileSync('playwright/.auth/session.json', sessionStorage, 'utf-8');

// Set session storage in a new context
const sessionStorage = JSON.parse(fs.readFileSync('playwright/.auth/session.json', 'utf-8'));
await context.addInitScript(storage => {
  if (window.location.hostname === 'example.com') {
    for (const [key, value] of Object.entries(storage))
      window.sessionStorage.setItem(key, value);
  }
}, sessionStorage);
```

```java
// Get session storage and store as env variable
String sessionStorage = (String) page.evaluate("JSON.stringify(sessionStorage)");
System.getenv().put("SESSION_STORAGE", sessionStorage);

// Set session storage in a new context
String sessionStorage = System.getenv("SESSION_STORAGE");
context.addInitScript("(storage => {\n" +
  "  if (window.location.hostname === 'example.com') {\n" +
  "    const entries = JSON.parse(storage);\n" +
  "     for (const [key, value] of Object.entries(entries)) {\n" +
  "      window.sessionStorage.setItem(key, value);\n" +
  "    };\n" +
  "  }\n" +
  "})('" + sessionStorage + "')");
```

```python async
import os
# Get session storage and store as env variable
session_storage = await page.evaluate("() => JSON.stringify(sessionStorage)")
os.environ["SESSION_STORAGE"] = session_storage

# Set session storage in a new context
session_storage = os.environ["SESSION_STORAGE"]
await context.add_init_script("""(storage => {
  if (window.location.hostname === 'example.com') {
    const entries = JSON.parse(storage)
    for (const [key, value] of Object.entries(entries)) {
      window.sessionStorage.setItem(key, value)
    }
  }
})('""" + session_storage + "')")
```

```python sync
import os
# Get session storage and store as env variable
session_storage = page.evaluate("() => JSON.stringify(sessionStorage)")
os.environ["SESSION_STORAGE"] = session_storage

# Set session storage in a new context
session_storage = os.environ["SESSION_STORAGE"]
context.add_init_script("""(storage => {
  if (window.location.hostname === 'example.com') {
    const entries = JSON.parse(storage)
    for (const [key, value] of Object.entries(entries)) {
      window.sessionStorage.setItem(key, value)
    }
  }
})('""" + session_storage + "')")
```

```csharp
// Get session storage and store as env variable
var sessionStorage = await page.EvaluateAsync<string>("() => JSON.stringify(sessionStorage)");
Environment.SetEnvironmentVariable("SESSION_STORAGE", sessionStorage);

// Set session storage in a new context
var loadedSessionStorage = Environment.GetEnvironmentVariable("SESSION_STORAGE");
await context.AddInitScriptAsync(@"(storage => {
    if (window.location.hostname === 'example.com') {
      const entries = JSON.parse(storage);
      for (const [key, value] of Object.entries(entries)) {
        window.sessionStorage.setItem(key, value);
      }
    }
  })('" + loadedSessionStorage + "')");
```

### Avoid authentication in some tests
* langs: js

You can reset storage state in a test file to avoid authentication that was set up for the whole project.

```js title="not-signed-in.spec.ts"
import { test } from '@playwright/test';

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test('not signed in test', async ({ page }) => {
  // ...
});
```



================================================
FILE: docs/src/best-practices-js.md
================================================
---
id: best-practices
title: "Best Practices"
---

## Introduction

This guide should help you to make sure you are following our best practices and writing tests that are more resilient.

## Testing philosophy

### Test user-visible behavior

Automated tests should verify that the application code works for the end users, and avoid relying on implementation details such as things which users will not typically use, see, or even know about such as the name of a function, whether something is an array, or the CSS class of some element. The end user will see or interact with what is rendered on the page, so your test should typically only see/interact with the same rendered output.

### Make tests as isolated as possible

Each test should be completely isolated from another test and should run independently with its own local storage, session storage, data, cookies etc. [Test isolation](./browser-contexts.md) improves reproducibility, makes debugging easier and prevents cascading test failures.

In order to avoid repetition for a particular part of your test you can use [before and after hooks](/api/class-test.md). Within your test file add a before hook to run a part of your test before each test such as going to a particular URL or logging in to a part of your app. This keeps your tests isolated as no test relies on another. However it is also ok to have a little duplication when tests are simple enough especially if it keeps your tests clearer and easier to read and maintain.

```js
import { test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Runs before each test and signs in each page.
  await page.goto('https://github.com/login');
  await page.getByLabel('Username or email address').fill('username');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();
});

test('first', async ({ page }) => {
  // page is signed in.
});

test('second', async ({ page }) => {
  // page is signed in.
});
```

You can also reuse the signed-in state in the tests with [setup project](./auth.md#basic-shared-account-in-all-tests). That way you can log in only once and then skip the log in step for all of the tests.

### Avoid testing third-party dependencies

Only test what you control. Don't try to test links to external sites or third party servers that you do not control. Not only is it time consuming and can slow down your tests but also you cannot control the content of the page you are linking to, or if there are cookie banners or overlay pages or anything else that might cause your test to fail.

Instead, use the [Playwright Network API](/network.md#handle-requests) and guarantee the response needed.

```js
await page.route('**/api/fetch_data_third_party_dependency', route => route.fulfill({
  status: 200,
  body: testData,
}));
await page.goto('https://example.com');
```

### Testing with a database

If working with a database then make sure you control the data. Test against a staging environment and make sure it doesn't change. For visual regression tests make sure the operating system and browser versions are the same.

## Best Practices

### Use locators

In order to write end to end tests we need to first find elements on the webpage. We can do this by using Playwright's built in [locators](./locators.md). Locators come with auto waiting and retry-ability. Auto waiting means that Playwright performs a range of actionability checks on the elements, such as ensuring the element is visible and enabled before it performs the click. To make tests resilient, we recommend prioritizing user-facing attributes and explicit contracts.

```js
// 👍
page.getByRole('button', { name: 'submit' });
```

#### Use chaining and filtering

Locators can be [chained](./locators.md#matching-inside-a-locator) to narrow down the search to a particular part of the page.

```js
const product = page.getByRole('listitem').filter({ hasText: 'Product 2' });
```

You can also [filter locators](./locators.md#filtering-locators) by text or by another locator.

```js
await page
    .getByRole('listitem')
    .filter({ hasText: 'Product 2' })
    .getByRole('button', { name: 'Add to cart' })
    .click();
```

#### Prefer user-facing attributes to XPath or CSS selectors

Your DOM can easily change so having your tests depend on your DOM structure can lead to failing tests. For example consider selecting this button by its CSS classes. Should the designer change something then the class might change, thus breaking your test.


```js
// 👎
page.locator('button.buttonIcon.episode-actions-later');
```

Use locators that are resilient to changes in the DOM.

```js
// 👍
page.getByRole('button', { name: 'submit' });
```
### Generate locators

Playwright has a [test generator](./codegen.md) that can generate tests and pick locators for you. It will look at your page and figure out the best locator, prioritizing role, text and test id locators. If the generator finds multiple elements matching the locator, it will improve the locator to make it resilient and uniquely identify the target element, so you don't have to worry about failing tests due to locators.

#### Use `codegen` to generate locators

To pick a locator run the `codegen` command followed by the URL that you would like to pick a locator from.

<Tabs
  groupId="js-package-manager"
  defaultValue="npm"
  values={[
    {label: 'npm', value: 'npm'},
    {label: 'yarn', value: 'yarn'},
    {label: 'pnpm', value: 'pnpm'}
  ]
}>
<TabItem value="npm">

```bash
npx playwright codegen playwright.dev
```

</TabItem>

<TabItem value="yarn">

```bash
yarn playwright codegen playwright.dev
```

</TabItem>

<TabItem value="pnpm">

```bash
pnpm exec playwright codegen playwright.dev
```

</TabItem>

</Tabs>

This will open a new browser window as well as the Playwright inspector. To pick a locator first click on the 'Record' button to stop the recording. By default when you run the `codegen` command it will start a new recording. Once you stop the recording the 'Pick Locator' button will be available to click.

You can then hover over any element on your page in the browser window and see the locator highlighted below your cursor. Clicking on an element will add the locator into the Playwright inspector. You can either copy the locator and paste into your test file or continue to explore the locator by editing it in the Playwright Inspector, for example by modifying the text, and seeing the results in the browser window.

<img width="1394" alt="generating locators with codegen" loading="lazy" src="https://user-images.githubusercontent.com/13063165/212103268-e7d8ee8b-d307-4cba-be13-831f3fbb1f40.png" />

#### Use the VS Code extension to generate locators

You can also use the [VS Code Extension](./getting-started-vscode.md) to generate locators as well as record a test. The VS Code extension also gives you a great developer experience when writing, running, and debugging tests.

<img width="1394" alt="generating locators in vs code with codegen" loading="lazy" src="https://user-images.githubusercontent.com/13063165/212269873-aca04043-16ce-4627-906f-7351d09740ab.png" />

### Use web first assertions

Assertions are a way to verify that the expected result and the actual result matched or not. By using [web first assertions](./test-assertions.md) Playwright will wait until the expected condition is met. For example, when testing an alert message, a test would click a button that makes a message appear and check that the alert message is there. If the alert message takes half a second to appear, assertions such as `toBeVisible()` will wait and retry if needed.

```js
// 👍
await expect(page.getByText('welcome')).toBeVisible();

// 👎
expect(await page.getByText('welcome').isVisible()).toBe(true);
```

#### Don't use manual assertions

Don't use manual assertions that are not awaiting the expect. In the code below the await is inside the expect rather than before it. When using assertions such as `isVisible()` the test won't wait a single second, it will just check the locator is there and return immediately.

```js
// 👎
expect(await page.getByText('welcome').isVisible()).toBe(true);
```

Use web first assertions such as `toBeVisible()` instead.

```js
// 👍
await expect(page.getByText('welcome')).toBeVisible();
```

### Configure debugging

#### Local debugging

For local debugging we recommend you [debug your tests live in VSCode.](/getting-started-vscode.md#live-debugging) by installing the [VS Code extension](./getting-started-vscode.md). You can run tests in debug mode by right clicking on the line next to the test you want to run which will open a browser window and pause at where the breakpoint is set.

<img width="1338" alt="debugging tests in vscode" loading="lazy" src="https://user-images.githubusercontent.com/13063165/212274675-5c6e1647-2aab-40fd-9804-8680c1ac2d16.png" />

You can live debug your test by clicking or editing the locators in your test in VS Code which will highlight this locator in the browser window as well as show you any other matching locators found on the page.

<img width="1394" alt="live debugging locators in vscode" loading="lazy" src="https://user-images.githubusercontent.com/13063165/212273189-da271dc4-0f59-4138-92a8-10e719066cbe.png" />

You can also debug your tests with the Playwright inspector by running your tests with the `--debug` flag.

<Tabs
  groupId="js-package-manager"
  defaultValue="npm"
  values={[
    {label: 'npm', value: 'npm'},
    {label: 'yarn', value: 'yarn'},
    {label: 'pnpm', value: 'pnpm'}
  ]
}>
<TabItem value="npm">

```bash
npx playwright test --debug
```

</TabItem>

<TabItem value="yarn">

```bash
yarn playwright test --debug
```

</TabItem>

<TabItem value="pnpm">

```bash
pnpm exec playwright test --debug
```

</TabItem>

</Tabs>

You can then step through your test, view actionability logs and edit the locator live and see it highlighted in the browser window. This will show you which locators match, how many of them there are.

<img width="1350" alt="debugging with the playwright inspector" loading="lazy" src="https://user-images.githubusercontent.com/13063165/212276296-4f5b18e7-2bd7-4766-9aa5-783517bd4aa2.png" />



To debug a specific test add the name of the test file and the line number of the test followed by the `--debug` flag.

<Tabs
  groupId="js-package-manager"
  defaultValue="npm"
  values={[
    {label: 'npm', value: 'npm'},
    {label: 'yarn', value: 'yarn'},
    {label: 'pnpm', value: 'pnpm'}
  ]
}>
<TabItem value="npm">

```bash
npx playwright test example.spec.ts:9 --debug
```

</TabItem>

<TabItem value="yarn">

```bash
yarn playwright test example.spec.ts:9 --debug
```

</TabItem>

<TabItem value="pnpm">

```bash
pnpm exec playwright test example.spec.ts:9 --debug
```

</TabItem>

</Tabs>
#### Debugging on CI

For CI failures, use the Playwright [trace viewer](./trace-viewer.md) instead of videos and screenshots. The trace viewer gives you a full trace of your tests as a local Progressive Web App (PWA) that can easily be shared. With the trace viewer you can view the timeline, inspect DOM snapshots for each action using dev tools, view network requests and more.

<img width="1516" alt="playwrights trace viewer" loading="lazy" src="https://user-images.githubusercontent.com/13063165/212277895-c63d94c2-bd06-4881-864e-62790a072ca3.png" />

Traces are configured in the Playwright config file and are set to run on CI on the first retry of a failed test. We don't recommend setting this to `on` so that traces are run on every test as it's very performance heavy. However you can run a trace locally when developing with the `--trace` flag.

<Tabs
  groupId="js-package-manager"
  defaultValue="npm"
  values={[
    {label: 'npm', value: 'npm'},
    {label: 'yarn', value: 'yarn'},
    {label: 'pnpm', value: 'pnpm'}
  ]
}>
<TabItem value="npm">

```bash
npx playwright test --trace on
```

</TabItem>

<TabItem value="yarn">

```bash
yarn playwright test --trace on
```

</TabItem>

<TabItem value="pnpm">

```bash
pnpm exec playwright test --trace on
```

</TabItem>

</Tabs>

Once you run this command your traces will be recorded for each test and can be viewed directly from the HTML report.

<Tabs
  groupId="js-package-manager"
  defaultValue="npm"
  values={[
    {label: 'npm', value: 'npm'},
    {label: 'yarn', value: 'yarn'},
    {label: 'pnpm', value: 'pnpm'}
  ]
}>
<TabItem value="npm">

```bash
npx playwright show-report
```

</TabItem>

<TabItem value="yarn">

```bash
yarn playwright show-report
```

</TabItem>

<TabItem value="pnpm">

```bash
pnpm exec playwright show-report
```

</TabItem>

</Tabs>

<img width="1516" alt="Playwrights HTML report" loading="lazy" src="https://user-images.githubusercontent.com/13063165/212279022-d929d4c0-2271-486a-a75f-166ac231d25f.png" />

Traces can be opened by clicking on the icon next to the test file name or by opening each of the test reports and scrolling down to the traces section.

<img width="1516" alt="Screenshot 2023-01-13 at 09 58 34" loading="lazy" src="https://user-images.githubusercontent.com/13063165/212279699-c9eb134f-4f4e-4f19-805c-37596d3272a6.png" />

### Use Playwright's Tooling

Playwright comes with a range of tooling to help you write tests.
- The [VS Code extension](./getting-started-vscode.md) gives you a great developer experience when writing, running, and debugging tests.
- The [test generator](./codegen.md) can generate tests and pick locators for you.
- The [trace viewer](./trace-viewer.md) gives you a full trace of your tests as a local PWA that can easily be shared. With the trace viewer you can view the timeline, inspect DOM snapshots for each action, view network requests and more.
- The [UI Mode](./test-ui-mode) lets you explore, run and debug tests with a time travel experience complete with watch mode. All test files are loaded into the testing sidebar where you can expand each file and describe block to individually run, view, watch and debug each test.
- [TypeScript](./test-typescript) in Playwright works out of the box and gives you better IDE integrations. Your IDE will show you everything you can do and highlight when you do something wrong. No TypeScript experience is needed and it is not necessary for your code to be in TypeScript, all you need to do is create your tests with a `.ts` extension.

### Test across all browsers

Playwright makes it easy to test your site across all [browsers](./test-projects.md#configure-projects-for-multiple-browsers) no matter what platform you are on. Testing across all browsers ensures your app works for all users. In your config file you can set up projects adding the name and which browser or device to use.

```js title="playwright.config.ts"
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

### Keep your Playwright dependency up to date

By keeping your Playwright version up to date you will be able to test your app on the latest browser versions and catch failures before the latest browser version is released to the public.

<Tabs
  groupId="js-package-manager"
  defaultValue="npm"
  values={[
    {label: 'npm', value: 'npm'},
    {label: 'yarn', value: 'yarn'},
    {label: 'pnpm', value: 'pnpm'}
  ]
}>
<TabItem value="npm">

```bash
npm install -D @playwright/test@latest
```

</TabItem>

<TabItem value="yarn">

```bash
yarn add --dev @playwright/test@latest
```

</TabItem>

<TabItem value="pnpm">

```bash
pnpm install --save-dev @playwright/test@latest
```

</TabItem>

</Tabs>

Check the [release notes](./release-notes.md) to see what the latest version is and what changes have been released.

You can see what version of Playwright you have by running the following command.

<Tabs
  groupId="js-package-manager"
  defaultValue="npm"
  values={[
    {label: 'npm', value: 'npm'},
    {label: 'yarn', value: 'yarn'},
    {label: 'pnpm', value: 'pnpm'}
  ]
}>
<TabItem value="npm">

```bash
npx playwright --version
```

</TabItem>

<TabItem value="yarn">

```bash
yarn playwright --version
```

</TabItem>

<TabItem value="pnpm">

```bash
pnpm exec playwright --version
```

</TabItem>

</Tabs>

### Run tests on CI

Setup CI/CD and run your tests frequently. The more often you run your tests the better. Ideally you should run your tests on each commit and pull request. Playwright comes with a [GitHub actions workflow](/ci-intro.md) so that tests will run on CI for you with no setup required. Playwright can also be setup on the [CI environment](/ci.md) of your choice.

Use Linux when running your tests on CI as it is cheaper. Developers can use whatever environment when running locally but use linux on CI. Consider setting up [Sharding](./test-sharding.md) to make CI faster.


#### Optimize browser downloads on CI

Only install the browsers that you actually need, especially on CI. For example, if you're only testing with Chromium, install just Chromium.

```bash title=".github/workflows/playwright.yml"
# Instead of installing all browsers
npx playwright install --with-deps

# Install only Chromium
npx playwright install chromium --with-deps
```

This saves both download time and disk space on your CI machines.

### Lint your tests

We recommend TypeScript and linting with ESLint for your tests to catch errors early. Use [`@typescript-eslint/no-floating-promises`](https://typescript-eslint.io/rules/no-floating-promises/) [ESLint](https://eslint.org) rule to make sure there are no missing awaits before the asynchronous calls to the Playwright API. On your CI you can run `tsc --noEmit` to ensure that functions are called with the right signature.

### Use parallelism and sharding

Playwright runs tests in [parallel](./test-parallel.md) by default. Tests in a single file are run in order, in the same worker process. If you have many independent tests in a single file, you might want to run them in parallel

```js
import { test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('runs in parallel 1', async ({ page }) => { /* ... */ });
test('runs in parallel 2', async ({ page }) => { /* ... */ });
```

Playwright can [shard](./test-parallel.md#shard-tests-between-multiple-machines) a test suite, so that it can be executed on multiple machines.

<Tabs
  groupId="js-package-manager"
  defaultValue="npm"
  values={[
    {label: 'npm', value: 'npm'},
    {label: 'yarn', value: 'yarn'},
    {label: 'pnpm', value: 'pnpm'}
  ]
}>
<TabItem value="npm">

```bash
npx playwright test --shard=1/3
```

</TabItem>

<TabItem value="yarn">

```bash
yarn playwright test --shard=1/3
```

</TabItem>

<TabItem value="pnpm">

```bash
pnpm exec playwright test --shard=1/3
```

</TabItem>

</Tabs>

## Productivity tips

### Use Soft assertions

If your test fails, Playwright will give you an error message showing what part of the test failed which you can see either in VS Code, the terminal, the HTML report, or the trace viewer. However, you can also use [soft assertions](/test-assertions.md#soft-assertions). These do not immediately terminate the test execution, but rather compile and display a list of failed assertions once the test ended.

```js
// Make a few checks that will not stop the test when failed...
await expect.soft(page.getByTestId('status')).toHaveText('Success');

// ... and continue the test to check more things.
await page.getByRole('link', { name: 'next page' }).click();
```



================================================
FILE: docs/src/browser-contexts.md
================================================
---
id: browser-contexts
title: "Isolation"
---

## Introduction

Tests written with Playwright execute in isolated clean-slate environments called browser contexts. This isolation model improves reproducibility and prevents cascading test failures. 

## What is Test Isolation? 

Test Isolation is when each test is completely isolated from another test. Every test runs independently from any other test. This means that each test has its own local storage, session storage, cookies etc. Playwright achieves this using [BrowserContext]s which are equivalent to incognito-like profiles. They are fast and cheap to create and are completely isolated, even when running in a single browser. Playwright creates a context for each test, and provides a default [Page] in that context.

## Why is Test Isolation Important? 

- No failure carry-over. If one test fails it doesn't affect the other test.
- Easy to debug errors or flakiness, because you can run just a single test as many times as you'd like. 
- Don't have to think about the order when running in parallel, sharding, etc.

## Two Ways of Test Isolation

There are two different strategies when it comes to Test Isolation: start from scratch or cleanup in between. The problem with cleaning up in between tests is that it can be easy to forget to clean up and some things are impossible to clean up such as "visited links". State from one test can leak into the next test which could cause your test to fail and make debugging harder as the problem comes from another test. Starting from scratch means everything is new, so if the test fails you only have to look within that test to debug.

## How Playwright Achieves Test Isolation

Playwright uses browser contexts to achieve Test Isolation. Each test has its own Browser Context. Running the test creates a new browser context each time.  When using Playwright as a Test Runner, browser contexts are created by default. Otherwise, you can create browser contexts manually.

```js tab=js-test
import { test } from '@playwright/test';

test('example test', async ({ page, context }) => {
  // "context" is an isolated BrowserContext, created for this specific test.
  // "page" belongs to this context.
});

test('another test', async ({ page, context }) => {
  // "context" and "page" in this second test are completely
  // isolated from the first test.
});
```

```js tab=js-library
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
```

```java
Browser browser = chromium.launch();
BrowserContext context = browser.newContext();
Page page = context.newPage();
```

```python async
browser = await playwright.chromium.launch()
context = await browser.new_context()
page = await context.new_page()
```

```python sync
browser = playwright.chromium.launch()
context = browser.new_context()
page = context.new_page()
```

```csharp
using var playwright = await Playwright.CreateAsync();
var browser = await playwright.Chromium.LaunchAsync();
var context = await browser.NewContextAsync();
var page = await context.NewPageAsync();
```

Browser contexts can also be used to emulate multi-page scenarios involving mobile devices, permissions, locale and color scheme. Check out our [Emulation](./emulation.md) guide for more details.

## Multiple Contexts in a Single Test

Playwright can create multiple browser contexts within a single scenario. This is useful when you want to test for multi-user functionality, like a chat.

```js tab=js-test
import { test } from '@playwright/test';

test('admin and user', async ({ browser }) => {
  // Create two isolated browser contexts
  const adminContext = await browser.newContext();
  const userContext = await browser.newContext();

  // Create pages and interact with contexts independently
  const adminPage = await adminContext.newPage();
  const userPage = await userContext.newPage();
});
```

```js tab=js-library
const { chromium } = require('playwright');

// Create a Chromium browser instance
const browser = await chromium.launch();

// Create two isolated browser contexts
const userContext = await browser.newContext();
const adminContext = await browser.newContext();

// Create pages and interact with contexts independently
const adminPage = await adminContext.newPage();
const userPage = await userContext.newPage();
```

```java
import com.microsoft.playwright.*;

public class Example {
  public static void main(String[] args) {
    try (Playwright playwright = Playwright.create()) {
      BrowserType chromium = playwright.chromium();
      // Create a Chromium browser instance
      Browser browser = chromium.launch();
      // Create two isolated browser contexts
      BrowserContext userContext = browser.newContext();
      BrowserContext adminContext = browser.newContext();
      // Create pages and interact with contexts independently
    }
  }
}
```

```python async
import asyncio
from playwright.async_api import async_playwright, Playwright

async def run(playwright: Playwright):
    # create a chromium browser instance
    chromium = playwright.chromium
    browser = await chromium.launch()

    # create two isolated browser contexts
    user_context = await browser.new_context()
    admin_context = await browser.new_context()

    # create pages and interact with contexts independently

async def main():
    async with async_playwright() as playwright:
        await run(playwright)
asyncio.run(main())
```

```python sync
from playwright.sync_api import sync_playwright, Playwright

def run(playwright: Playwright):
    # create a chromium browser instance
    chromium = playwright.chromium
    browser = chromium.launch()

    # create two isolated browser contexts
    user_context = browser.new_context()
    admin_context = browser.new_context()

    # create pages and interact with contexts independently

with sync_playwright() as playwright:
    run(playwright)
```

```csharp
using Microsoft.Playwright;
using System.Threading.Tasks;

class Program
{
    public static async Task Main()
    {
        using var playwright = await Playwright.CreateAsync();
        // Create a Chromium browser instance
        await using var browser = await playwright.Chromium.LaunchAsync();
        await using var userContext = await browser.NewContextAsync();
        await using var adminContext = await browser.NewContextAsync();
        // Create pages and interact with contexts independently.
    }
}
```



================================================
FILE: docs/src/browsers.md
================================================
---
id: browsers
title: "Browsers"
---

## Introduction

Each version of Playwright needs specific versions of browser binaries to operate. You will need to use the Playwright CLI to install these browsers.

With every release, Playwright updates the versions of the browsers it supports, so that the latest Playwright would support the latest browsers at any moment. It means that every time you update Playwright, you might need to re-run the `install` CLI command.

## Install browsers

Playwright can install supported browsers. Running the command without arguments will install the default browsers.

```bash js
npx playwright install
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```bash python
playwright install
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 install
```

You can also install specific browsers by providing an argument:

```bash js
npx playwright install webkit
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install webkit"
```

```bash python
playwright install webkit
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 install webkit
```

See all supported browsers:

```bash js
npx playwright install --help
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install --help"
```

```bash python
playwright install --help
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 install --help
```

### Install browsers via API
* langs: csharp

It's possible to run Command line tools commands via the .NET API:

```csharp
var exitCode = Microsoft.Playwright.Program.Main(new[] {"install"});
if (exitCode != 0)
{
    throw new Exception($"Playwright exited with code {exitCode}");
}
```

## Install system dependencies

System dependencies can get installed automatically. This is useful for CI environments.

```bash js
npx playwright install-deps
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install-deps"
```

```bash python
playwright install-deps
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 install-deps
```

You can also install the dependencies for a single browser by passing it as an argument:

```bash js
npx playwright install-deps chromium
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install-deps chromium"
```

```bash python
playwright install-deps chromium
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 install-deps chromium
```

It's also possible to combine `install-deps` with `install` so that the browsers and OS dependencies are installed with a single command.

```bash js
npx playwright install --with-deps chromium
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install --with-deps chromium"
```

```bash python
playwright install --with-deps chromium
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 install --with-deps chromium
```

See [system requirements](./intro.md#system-requirements) for officially supported operating systems.

## Update Playwright regularly
* langs: js

By keeping your Playwright version up to date you will be able to use new features and test your app on the latest browser versions and catch failures before the latest browser version is released to the public.

```bash
# Update playwright
npm install -D @playwright/test@latest

# Install new browsers
npx playwright install
```
Check the [release notes](./release-notes.md) to see what the latest version is and what changes have been released.

```bash
# See what version of Playwright you have by running the following command
npx playwright --version
```

## Configure Browsers

Playwright can run tests on Chromium, WebKit and Firefox browsers as well as branded browsers such as Google Chrome and Microsoft Edge. It can also run on emulated tablet and mobile devices. See the [registry of device parameters](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json) for a complete list of selected desktop, tablet and mobile devices.

### Run tests on different browsers
* langs: js

Playwright can run your tests in multiple browsers and configurations by setting up **projects** in the config. You can also add [different options](./test-configuration) for each project.

```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    /* Test against desktop browsers */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    /* Test against branded browsers. */
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' }, // or 'chrome-beta'
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' }, // or 'msedge-dev'
    },
  ],
});
```

Playwright will run all projects by default.

```bash
npx playwright test

Running 7 tests using 5 workers

  ✓ [chromium] › example.spec.ts:3:1 › basic test (2s)
  ✓ [firefox] › example.spec.ts:3:1 › basic test (2s)
  ✓ [webkit] › example.spec.ts:3:1 › basic test (2s)
  ✓ [Mobile Chrome] › example.spec.ts:3:1 › basic test (2s)
  ✓ [Mobile Safari] › example.spec.ts:3:1 › basic test (2s)
  ✓ [Google Chrome] › example.spec.ts:3:1 › basic test (2s)
  ✓ [Microsoft Edge] › example.spec.ts:3:1 › basic test (2s)
```

Use the `--project` command line option to run a single project.

```bash
npx playwright test --project=firefox

Running 1 test using 1 worker

  ✓ [firefox] › example.spec.ts:3:1 › basic test (2s)
```

With the VS Code extension you can run your tests on different browsers by checking the checkbox next to the browser name in the Playwright sidebar. These names are defined in your Playwright config file under the projects section. The default config when installing Playwright gives you 3 projects, Chromium, Firefox and WebKit. The first project is selected by default.

![Projects section in VS Code extension](https://github.com/microsoft/playwright/assets/13063165/58fedea6-a2b9-4942-b2c7-2f3d482210cf)

To run tests on multiple projects(browsers), select each project by checking the checkboxes next to the project name.

![Selecting projects to run tests on](https://github.com/microsoft/playwright/assets/13063165/6dc86ef4-6097-481c-9cab-b6e053ec7ea6)

### Run tests on different browsers
* langs: python

Run tests on a specific browser:

```bash
pytest test_login.py --browser webkit
```

Run tests on multiple browsers:

```bash
pytest test_login.py --browser webkit --browser firefox
```

Test against mobile viewports:

```bash
pytest test_login.py --device="iPhone 13"
```
Test against branded browsers:

```bash
pytest test_login.py --browser-channel msedge
```

### Run tests on different browsers
* langs: java

Run tests on a specific browser:

```java
import com.microsoft.playwright.*;

public class Example {
  public static void main(String[] args) {
    try (Playwright playwright = Playwright.create()) {
      // Launch chromium, firefox or webkit.
      Browser browser = playwright.chromium().launch();
      Page page = browser.newPage();
      // ...
    }
  }
}
```

Run tests on multiple browsers and make it based on the environment variable `BROWSER`:

```java
import com.microsoft.playwright.*;

public class Example {
  public static void main(String[] args) {
    try (Playwright playwright = Playwright.create()) {
      Browser browser = null;
      String browserName = System.getenv("BROWSER");
      if (browserName.equals("chromium")) {
        browser = playwright.chromium().launch();
      } else if (browserName.equals("firefox")) {
        browser = playwright.firefox().launch();
      } else if (browserName.equals("webkit")) {
        browser = playwright.webkit().launch();
      }
      Page page = browser.newPage();
      // ...
    }
  }
}
```

### Run tests on different browsers
* langs: csharp

Run tests on a specific browser:

```bash
dotnet test -- Playwright.BrowserName=webkit
```

To run your test on multiple browsers or configurations you need to invoke the `dotnet test` command multiple times. You can either specify the `BROWSER` environment variable or set the `Playwright.BrowserName` via the runsettings file:

```bash
dotnet test --settings:chromium.runsettings
dotnet test --settings:firefox.runsettings
dotnet test --settings:webkit.runsettings
```

```xml
<?xml version="1.0" encoding="utf-8"?>
  <RunSettings>
    <Playwright>
      <BrowserName>chromium</BrowserName>
    </Playwright>
  </RunSettings>
```

### Chromium

For Google Chrome, Microsoft Edge and other Chromium-based browsers, by default, Playwright uses open source Chromium builds. Since the Chromium project is ahead of the branded browsers, when the world is on Google Chrome N, Playwright already supports Chromium N+1 that will be released in Google Chrome and Microsoft Edge a few weeks later.

### Chromium: headless shell

Playwright ships a regular Chromium build for headed operations and a separate [chromium headless shell](https://developer.chrome.com/blog/chrome-headless-shell) for headless mode.

If you are only running tests in headless shell (i.e. the `channel` option is **not** specified), for example on CI, you can avoid downloading the full Chromium browser by passing `--only-shell` during installation.

```bash js
# only running tests headlessly
npx playwright install --with-deps --only-shell
```

```bash java
# only running tests headlessly
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install --with-deps --only-shell"
```

```bash python
# only running tests headlessly
playwright install --with-deps --only-shell
```

```bash csharp
# only running tests headlessly
pwsh bin/Debug/netX/playwright.ps1 install --with-deps --only-shell
```

### Chromium: new headless mode

You can opt into the new headless mode by using `'chromium'` channel. As [official Chrome documentation puts it](https://developer.chrome.com/blog/chrome-headless-shell):

> New Headless on the other hand is the real Chrome browser, and is thus more authentic, reliable, and offers more features. This makes it more suitable for high-accuracy end-to-end web app testing or browser extension testing.

See [issue #33566](https://github.com/microsoft/playwright/issues/33566) for details.

```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
});
```

```java
import com.microsoft.playwright.*;

public class Example {
  public static void main(String[] args) {
    try (Playwright playwright = Playwright.create()) {
      Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setChannel("chromium"));
      Page page = browser.newPage();
      // ...
    }
  }
}
```

```bash python
pytest test_login.py --browser-channel chromium
```

```xml csharp
<?xml version="1.0" encoding="utf-8"?>
<RunSettings>
  <Playwright>
    <BrowserName>chromium</BrowserName>
    <LaunchOptions>
      <Channel>chromium</Channel>
    </LaunchOptions>
  </Playwright>
</RunSettings>
```

```bash csharp
dotnet test -- Playwright.BrowserName=chromium Playwright.LaunchOptions.Channel=chromium
```

With the new headless mode, you can skip downloading the headless shell during browser installation by using the `--no-shell` option:

```bash js
# only running tests headlessly
npx playwright install --with-deps --no-shell
```

```bash java
# only running tests headlessly
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install --with-deps --no-shell"
```

```bash python
# only running tests headlessly
playwright install --with-deps --no-shell
```

```bash csharp
# only running tests headlessly
pwsh bin/Debug/netX/playwright.ps1 install --with-deps --no-shell
```

### Google Chrome & Microsoft Edge

While Playwright can download and use the recent Chromium build, it can operate against the branded Google Chrome and Microsoft Edge browsers available on the machine (note that Playwright doesn't install them by default). In particular, the current Playwright version will support Stable and Beta channels of these browsers.

Available channels are `chrome`, `msedge`, `chrome-beta`, `msedge-beta`, `chrome-dev`, `msedge-dev`, `chrome-canary`, `msedge-canary`.

:::warning
Certain Enterprise Browser Policies may impact Playwright's ability to launch and control Google Chrome and Microsoft Edge. Running in an environment with browser policies is outside of the Playwright project's scope.
:::

:::warning
Google Chrome and Microsoft Edge have switched to a [new headless mode](https://developer.chrome.com/docs/chromium/headless) implementation that is closer to a regular headed mode. This differs from [chromium headless shell](https://developer.chrome.com/blog/chrome-headless-shell) that is used in Playwright by default when running headless, so expect different behavior in some cases. See [issue #33566](https://github.com/microsoft/playwright/issues/33566) for details.
:::

```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    /* Test against branded browsers. */
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' }, // or 'chrome-beta'
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' }, // or "msedge-beta" or 'msedge-dev'
    },
  ],
});
```

```java
import com.microsoft.playwright.*;

public class Example {
  public static void main(String[] args) {
    try (Playwright playwright = Playwright.create()) {
      // Channel can be "chrome", "msedge", "chrome-beta", "msedge-beta" or "msedge-dev".
      Browser browser = playwright.chromium().launch(new BrowserType.LaunchOptions().setChannel("msedge"));
      Page page = browser.newPage();
      // ...
    }
  }
}
```

```bash python
pytest test_login.py --browser-channel msedge
```

```xml csharp
<?xml version="1.0" encoding="utf-8"?>
<RunSettings>
  <Playwright>
    <BrowserName>chromium</BrowserName>
    <LaunchOptions>
      <Channel>msedge</Channel>
    </LaunchOptions>
  </Playwright>
</RunSettings>
```

```bash csharp
dotnet test -- Playwright.BrowserName=chromium Playwright.LaunchOptions.Channel=msedge
```

######
* langs: python

Alternatively when using the library directly, you can specify the browser [`option: BrowserType.launch.channel`] when launching the browser:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    # Channel can be "chrome", "msedge", "chrome-beta", "msedge-beta" or "msedge-dev".
    browser = p.chromium.launch(channel="msedge")
    page = browser.new_page()
    page.goto("https://playwright.dev")
    print(page.title())
    browser.close()
```

#### Installing Google Chrome & Microsoft Edge

If Google Chrome or Microsoft Edge is not available on your machine, you can install
them using the Playwright command line tool:

```bash lang=js
npx playwright install msedge
```

```bash lang=python
playwright install msedge
```

```bash lang=csharp
pwsh bin/Debug/netX/playwright.ps1 install msedge
```

```batch lang=java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install msedge"
```

:::warning
Google Chrome or Microsoft Edge installations will be installed at the
default global location of your operating system overriding your current browser installation.
:::

Run with the `--help` option to see a full a list of browsers that can be installed.

#### When to use Google Chrome & Microsoft Edge and when not to?

##### Defaults

Using the default Playwright configuration with the latest Chromium is a good idea most of the time.
Since Playwright is ahead of Stable channels for the browsers, it gives peace of mind that the
upcoming Google Chrome or Microsoft Edge releases won't break your site. You catch breakage
early and have a lot of time to fix it before the official Chrome update.

##### Regression testing

Having said that, testing policies often require regression testing to be performed against
the current publicly available browsers. In this case, you can opt into one of the stable channels,
`"chrome"` or `"msedge"`.

##### Media codecs

Another reason for testing using official binaries is to test functionality related to media codecs.
Chromium does not have all the codecs that Google Chrome or Microsoft Edge are bundling due to
various licensing considerations and agreements. If your site relies on this kind of codecs (which is
rarely the case), you will also want to use the official channel.

##### Enterprise policy

Google Chrome and Microsoft Edge respect enterprise policies, which include limitations to the capabilities, network proxy, mandatory extensions that stand in the way of testing. So if you are part of the organization that uses such policies, it is easiest to use bundled Chromium for your local testing, you can still opt into stable channels on the bots that are typically free of such restrictions.

### Firefox

Playwright's Firefox version matches the recent [Firefox Stable](https://www.mozilla.org/en-US/firefox/new/) build. Playwright doesn't work with the branded version of Firefox since it relies on patches.

Note that availability of certain features, which depend heavily on the underlying platform, may vary between operating systems. For example, available media codecs vary substantially between Linux, macOS and Windows.

### WebKit

Playwright's WebKit is derived from the latest WebKit main branch sources, often before these updates are incorporated into Apple Safari and other WebKit-based browsers. This gives a lot of lead time to react on the potential browser update issues. Playwright doesn't work with the branded version of Safari since it relies on patches. Instead, you can test using the most recent WebKit build.

Note that availability of certain features, which depend heavily on the underlying platform, may vary between operating systems. For example, available media codecs vary substantially between Linux, macOS and Windows. While running WebKit on Linux CI is usually the most affordable option, for the closest-to-Safari experience you should run WebKit on mac, for example if you do video playback.

## Install behind a firewall or a proxy

By default, Playwright downloads browsers from Microsoft's CDN.

Sometimes companies maintain an internal proxy that blocks direct access to the public
resources. In this case, Playwright can be configured to download browsers via a proxy server.

```bash tab=bash-bash lang=js
HTTPS_PROXY=https://192.0.2.1 npx playwright install
```

```batch tab=bash-batch lang=js
set HTTPS_PROXY=https://192.0.2.1
npx playwright install
```

```powershell tab=bash-powershell lang=js
$Env:HTTPS_PROXY="https://192.0.2.1"
npx playwright install
```

```bash tab=bash-bash lang=python
pip install playwright
HTTPS_PROXY=https://192.0.2.1 playwright install
```

```batch tab=bash-batch lang=python
set HTTPS_PROXY=https://192.0.2.1
pip install playwright
playwright install
```

```powershell tab=bash-powershell lang=python
$Env:HTTPS_PROXY="https://192.0.2.1"
pip install playwright
playwright install
```

```bash tab=bash-bash lang=java
HTTPS_PROXY=https://192.0.2.1 mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```batch tab=bash-batch lang=java
set HTTPS_PROXY=https://192.0.2.1
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```powershell tab=bash-powershell lang=java
$Env:HTTPS_PROXY="https://192.0.2.1"
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```bash tab=bash-bash lang=csharp
HTTPS_PROXY=https://192.0.2.1 pwsh bin/Debug/netX/playwright.ps1 install
```

```batch tab=bash-batch lang=csharp
set HTTPS_PROXY=https://192.0.2.1
pwsh bin/Debug/netX/playwright.ps1 install
```

```powershell tab=bash-powershell lang=csharp
$Env:HTTPS_PROXY="https://192.0.2.1"
pwsh bin/Debug/netX/playwright.ps1 install
```

If the requests of the proxy get intercepted with a custom untrusted certificate authority (CA) and it yields to `Error: self signed certificate in certificate chain` while downloading the browsers, you must set your custom root certificates via the [`NODE_EXTRA_CA_CERTS`](https://nodejs.org/api/cli.html#node_extra_ca_certsfile) environment variable before installing the browsers:

```bash tab=bash-bash
export NODE_EXTRA_CA_CERTS="/path/to/cert.pem"
```

```batch tab=bash-batch
set NODE_EXTRA_CA_CERTS="C:\certs\root.crt"
```

```powershell tab=bash-powershell
$Env:NODE_EXTRA_CA_CERTS="C:\certs\root.crt"
```

If your network is slow to connect to Playwright browser archive, you can increase the connection timeout in milliseconds with `PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT` environment variable:

```bash tab=bash-bash lang=js
PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000 npx playwright install
```

```batch tab=bash-batch lang=js
set PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000
npx playwright install
```

```powershell tab=bash-powershell lang=js
$Env:PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT="120000"
npx playwright install
```

```bash tab=bash-bash lang=python
pip install playwright
PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000 playwright install
```

```batch tab=bash-batch lang=python
set PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000
pip install playwright
playwright install
```

```powershell tab=bash-powershell lang=python
$Env:PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT="120000"
pip install playwright
playwright install
```

```bash tab=bash-bash lang=java
PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000 mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```batch tab=bash-batch lang=java
set PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```powershell tab=bash-powershell lang=java
$Env:PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT="120000"
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```bash tab=bash-bash lang=csharp
PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000 pwsh bin/Debug/netX/playwright.ps1 install
```

```batch tab=bash-batch lang=csharp
set PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000
pwsh bin/Debug/netX/playwright.ps1 install
```

```powershell tab=bash-powershell lang=csharp
$Env:PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT="120000"
pwsh bin/Debug/netX/playwright.ps1 install
```

If you are [installing dependencies](#install-system-dependencies) and need to use a proxy on Linux, make sure to run the command as a root user. Otherwise, Playwright will attempt to become a root and will not pass environment variables like `HTTPS_PROXY` to the linux package manager.

```bash js
sudo HTTPS_PROXY=https://192.0.2.1 npx playwright install-deps
```

```bash java
sudo HTTPS_PROXY=https://192.0.2.1 mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install-deps"
```

```bash python
sudo HTTPS_PROXY=https://192.0.2.1 playwright install-deps
```

```bash csharp
sudo HTTPS_PROXY=https://192.0.2.1 pwsh bin/Debug/netX/playwright.ps1 install-deps
```

## Download from artifact repository

By default, Playwright downloads browsers from Microsoft's CDN.

Sometimes companies maintain an internal artifact repository to host browser
binaries. In this case, Playwright can be configured to download from a custom
location using the `PLAYWRIGHT_DOWNLOAD_HOST` env variable.

```bash tab=bash-bash lang=js
PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1 npx playwright install
```

```batch tab=bash-batch lang=js
set PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1
npx playwright install
```

```powershell tab=bash-powershell lang=js
$Env:PLAYWRIGHT_DOWNLOAD_HOST="http://192.0.2.1"
npx playwright install
```

```bash tab=bash-bash lang=python
pip install playwright
PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1 playwright install
```

```batch tab=bash-batch lang=python
set PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1
pip install playwright
playwright install
```

```powershell tab=bash-powershell lang=python
$Env:PLAYWRIGHT_DOWNLOAD_HOST="http://192.0.2.1"
pip install playwright
playwright install
```

```bash tab=bash-bash lang=java
PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1 mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```batch tab=bash-batch lang=java
set PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```powershell tab=bash-powershell lang=java
$Env:PLAYWRIGHT_DOWNLOAD_HOST="http://192.0.2.1"
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```bash tab=bash-bash lang=csharp
PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1 pwsh bin/Debug/netX/playwright.ps1 install
```

```batch tab=bash-batch lang=csharp
set PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1
pwsh bin/Debug/netX/playwright.ps1 install
```

```powershell tab=bash-powershell lang=csharp
$Env:PLAYWRIGHT_DOWNLOAD_HOST="http://192.0.2.1"
pwsh bin/Debug/netX/playwright.ps1 install
```

It is also possible to use a per-browser download hosts using `PLAYWRIGHT_CHROMIUM_DOWNLOAD_HOST`, `PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST` and `PLAYWRIGHT_WEBKIT_DOWNLOAD_HOST` env variables that
take precedence over `PLAYWRIGHT_DOWNLOAD_HOST`.

```bash tab=bash-bash lang=js
PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST=http://203.0.113.3 PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1 npx playwright install
```

```batch tab=bash-batch lang=js
set PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST=http://203.0.113.3
set PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1
npx playwright install
```

```powershell tab=bash-powershell lang=js
$Env:PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST="http://203.0.113.3"
$Env:PLAYWRIGHT_DOWNLOAD_HOST="http://192.0.2.1"
npx playwright install
```

```bash tab=bash-bash lang=python
pip install playwright
PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST=http://203.0.113.3 PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1 playwright install
```

```batch tab=bash-batch lang=python
set PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST=http://203.0.113.3
set PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1
pip install playwright
playwright install
```

```powershell tab=bash-powershell lang=python
$Env:PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST="http://203.0.113.3"
$Env:PLAYWRIGHT_DOWNLOAD_HOST="http://192.0.2.1"
pip install playwright
playwright install
```

```bash tab=bash-bash lang=java
PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST=http://203.0.113.3 PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1 mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```batch tab=bash-batch lang=java
set PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST=http://203.0.113.3
set PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```powershell tab=bash-powershell lang=java
$Env:PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST="http://203.0.113.3"
$Env:PLAYWRIGHT_DOWNLOAD_HOST="http://192.0.2.1"
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```bash tab=bash-bash lang=csharp
PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST=http://203.0.113.3 PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1 pwsh bin/Debug/netX/playwright.ps1 install
```

```batch tab=bash-batch lang=csharp
set PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST=http://203.0.113.3
set PLAYWRIGHT_DOWNLOAD_HOST=http://192.0.2.1
pwsh bin/Debug/netX/playwright.ps1 install
```

```powershell tab=bash-powershell lang=csharp
$Env:PLAYWRIGHT_DOWNLOAD_HOST="http://192.0.2.1"
$Env:PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST="http://203.0.113.3"
pwsh bin/Debug/netX/playwright.ps1 install
```
## Managing browser binaries

Playwright downloads Chromium, WebKit and Firefox browsers into the OS-specific cache folders:

- `%USERPROFILE%\AppData\Local\ms-playwright` on Windows
- `~/Library/Caches/ms-playwright` on macOS
- `~/.cache/ms-playwright` on Linux

These browsers will take a few hundred megabytes of disk space when installed:

```bash
du -hs ~/Library/Caches/ms-playwright/*
281M  chromium-XXXXXX
187M  firefox-XXXX
180M  webkit-XXXX
```

You can override default behavior using environment variables. When installing Playwright, ask it to download browsers into a specific location:

```bash tab=bash-bash lang=js
PLAYWRIGHT_BROWSERS_PATH=$HOME/pw-browsers npx playwright install
```

```batch tab=bash-batch lang=js
set PLAYWRIGHT_BROWSERS_PATH=%USERPROFILE%\pw-browsers
npx playwright install
```

```powershell tab=bash-powershell lang=js
$Env:PLAYWRIGHT_BROWSERS_PATH="$Env:USERPROFILE\pw-browsers"
npx playwright install
```

```bash tab=bash-bash lang=python
pip install playwright
PLAYWRIGHT_BROWSERS_PATH=$HOME/pw-browsers python -m playwright install
```

```batch tab=bash-batch lang=python
set PLAYWRIGHT_BROWSERS_PATH=%USERPROFILE%\pw-browsers
pip install playwright
playwright install
```

```powershell tab=bash-powershell lang=python
$Env:PLAYWRIGHT_BROWSERS_PATH="$Env:USERPROFILE\pw-browsers"
pip install playwright
playwright install
```

```bash tab=bash-bash lang=java
PLAYWRIGHT_BROWSERS_PATH=$HOME/pw-browsers mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```batch tab=bash-batch lang=java
set PLAYWRIGHT_BROWSERS_PATH=%USERPROFILE%\pw-browsers
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```powershell tab=bash-powershell lang=java
$Env:PLAYWRIGHT_BROWSERS_PATH="$Env:USERPROFILE\pw-browsers"
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"
```

```bash tab=bash-bash lang=csharp
PLAYWRIGHT_BROWSERS_PATH=$HOME/pw-browsers pwsh bin/Debug/netX/playwright.ps1 install
```

```batch tab=bash-batch lang=csharp
set PLAYWRIGHT_BROWSERS_PATH=%USERPROFILE%\pw-browsers
pwsh bin/Debug/netX/playwright.ps1 install
```

```powershell tab=bash-powershell lang=csharp
$Env:PLAYWRIGHT_BROWSERS_PATH="$Env:USERPROFILE\pw-browsers"
pwsh bin/Debug/netX/playwright.ps1 install
```

When running Playwright scripts, ask it to search for browsers in a shared location.

```bash tab=bash-bash lang=js
PLAYWRIGHT_BROWSERS_PATH=$HOME/pw-browsers npx playwright test
```

```batch tab=bash-batch lang=js
set PLAYWRIGHT_BROWSERS_PATH=%USERPROFILE%\pw-browsers
npx playwright test
```

```powershell tab=bash-powershell lang=js
$Env:PLAYWRIGHT_BROWSERS_PATH="$Env:USERPROFILE\pw-browsers"
npx playwright test
```

```bash tab=bash-bash lang=python
PLAYWRIGHT_BROWSERS_PATH=$HOME/pw-browsers python playwright_script.py
```

```batch tab=bash-batch lang=python
set PLAYWRIGHT_BROWSERS_PATH=%USERPROFILE%\pw-browsers
python playwright_script.py
```

```powershell tab=bash-powershell lang=python

$Env:PLAYWRIGHT_BROWSERS_PATH="$Env:USERPROFILE\pw-browsers"
python playwright_script.py
```

```bash tab=bash-bash lang=java
PLAYWRIGHT_BROWSERS_PATH=$HOME/pw-browsers mvn test
```

```batch tab=bash-batch lang=java
set PLAYWRIGHT_BROWSERS_PATH=%USERPROFILE%\pw-browsers
mvn test
```

```powershell tab=bash-powershell lang=java
$Env:PLAYWRIGHT_BROWSERS_PATH="$Env:USERPROFILE\pw-browsers"
mvn test
```

```bash tab=bash-bash lang=csharp
PLAYWRIGHT_BROWSERS_PATH=$HOME/pw-browsers dotnet test
```

```batch tab=bash-batch lang=csharp
set PLAYWRIGHT_BROWSERS_PATH=%USERPROFILE%\pw-browsers
dotnet test
```

```powershell tab=bash-powershell lang=csharp
$Env:PLAYWRIGHT_BROWSERS_PATH="$Env:USERPROFILE\pw-browsers"
dotnet test
```

Playwright keeps track of packages that need those browsers and will garbage collect them as you update Playwright to the newer versions.

:::note
Developers can opt-in in this mode via exporting `PLAYWRIGHT_BROWSERS_PATH=$HOME/pw-browsers` in their `.bashrc`.
:::

### Hermetic install
* langs: js

You can opt into the hermetic install and place binaries in the local folder:


```bash tab=bash-bash
# Places binaries to node_modules/playwright-core/.local-browsers
PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install
```

```batch tab=bash-batch
# Places binaries to node_modules\playwright-core\.local-browsers
set PLAYWRIGHT_BROWSERS_PATH=0
npx playwright install
```

```powershell tab=bash-powershell
# Places binaries to node_modules\playwright-core\.local-browsers
$Env:PLAYWRIGHT_BROWSERS_PATH=0
npx playwright install
```

:::note
`PLAYWRIGHT_BROWSERS_PATH` does not change installation path for Google Chrome and Microsoft Edge.
:::

### Skip browser downloads
* langs: java

In certain cases, it is desired to avoid browser downloads altogether because
browser binaries are managed separately.

This can be done by setting `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` variable before installation.

```bash tab=bash-bash lang=java
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 mvn test
```

```batch tab=bash-batch lang=java
set PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
mvn test
```

```powershell tab=bash-powershell lang=java
$Env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
mvn test
```

### Stale browser removal

Playwright keeps track of the clients that use its browsers. When there are no more clients that require a particular version of the browser, that version is deleted from the system. That way you can safely use Playwright instances of different versions and at the same time, you don't waste disk space for the browsers that are no longer in use.

To opt-out from the unused browser removal, you can set the `PLAYWRIGHT_SKIP_BROWSER_GC=1` environment variable.

### List all installed browsers:

Prints list of browsers from all playwright installations on the machine.

```bash js
npx playwright install --list
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install --list"
```

```bash python
playwright install --list
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 install --list
```

### Uninstall browsers

This will remove the browsers (chromium, firefox, webkit) of the current Playwright installation:

```bash js
npx playwright uninstall
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="uninstall"
```

```bash python
playwright uninstall
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 uninstall
```

To remove browsers of other Playwright installations as well, pass `--all` flag:

```bash js
npx playwright uninstall --all
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="uninstall --all"
```

```bash python
playwright uninstall --all
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 uninstall --all
```



================================================
FILE: docs/src/canary-releases-js.md
================================================
---
id: canary-releases
title: "Canary releases"
---

## Introduction

Playwright for Node.js has a canary releases system.

It permits you to **test new unreleased features** instead of waiting for a full release. They get released daily on the `next` NPM tag of Playwright.

It is a good way to **give feedback to maintainers**, ensuring the newly implemented feature works as intended.

:::note

Using a canary release in production might seem risky, but in practice, it's not.

A canary release passes all automated tests and is used to test e.g. the HTML report, Trace Viewer, or Playwright Inspector with end-to-end tests.

:::

## Next npm Dist Tag

For any code-related commit on `main`, the continuous integration will publish a daily canary release under the `@next` npm dist tag.

You can see on [npm](https://www.npmjs.com/package/@playwright/test?activeTab=versions) the current dist tags:

- `latest`: stable releases
- `next`: next releases, published daily
- `beta`: after a release-branch was cut, usually a week before a stable release each commit gets published under this tag

## Using a Canary Release

```bash
npm install -D @playwright/test@next
```

## Documentation

The stable and the `next` documentation is published on [playwright.dev](https://playwright.dev). To see the `next` documentation, press <kbd>Shift</kbd> on the keyboard `5` times.



================================================
FILE: docs/src/chrome-extensions-js-python.md
================================================
---
id: chrome-extensions
title: "Chrome extensions"
---

## Introduction

:::note
Extensions only work in Chrome / Chromium launched with a persistent context. Use custom browser args at your own risk, as some of them may break Playwright functionality.
:::

The snippet below retrieves the [service worker](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers) of a [Manifest v3](https://developer.chrome.com/docs/extensions/develop/migrate) extension whose source is located in `./my-extension`.

Note the use of the `chromium` channel that allows to run extensions in headless mode. Alternatively, you can launch the browser in headed mode.

```js
const { chromium } = require('playwright');

(async () => {
  const pathToExtension = require('path').join(__dirname, 'my-extension');
  const userDataDir = '/tmp/test-user-data-dir';
  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`
    ]
  });
  let [serviceWorker] = browserContext.serviceWorkers();
  if (!serviceWorker)
    serviceWorker = await browserContext.waitForEvent('serviceworker');

  // Test the service worker as you would any other worker.
  await browserContext.close();
})();
```

```python async
import asyncio
from playwright.async_api import async_playwright, Playwright

path_to_extension = "./my-extension"
user_data_dir = "/tmp/test-user-data-dir"


async def run(playwright: Playwright):
    context = await playwright.chromium.launch_persistent_context(
        user_data_dir,
        channel="chromium",
        args=[
            f"--disable-extensions-except={path_to_extension}",
            f"--load-extension={path_to_extension}",
        ],
    )

    if len(context.service_workers) == 0:
        service_worker = await context.wait_for_event('serviceworker')
    else:
        service_worker = context.service_workers[0]

    # Test the service worker as you would any other worker.
    await context.close()


async def main():
    async with async_playwright() as playwright:
        await run(playwright)


asyncio.run(main())
```

```python sync
from playwright.sync_api import sync_playwright, Playwright

path_to_extension = "./my-extension"
user_data_dir = "/tmp/test-user-data-dir"


def run(playwright: Playwright):
    context = playwright.chromium.launch_persistent_context(
        user_data_dir,
        channel="chromium",
        args=[
            f"--disable-extensions-except={path_to_extension}",
            f"--load-extension={path_to_extension}",
        ],
    )
    if len(context.service_workers) == 0:
        service_worker = context.wait_for_event('serviceworker')
    else:
        service_worker = context.service_workers[0]

    # Test the service worker as you would any other worker.
    context.close()


with sync_playwright() as playwright:
    run(playwright)
```

## Testing

To have the extension loaded when running tests you can use a test fixture to set the context. You can also dynamically retrieve the extension id and use it to load and test the popup page for example.

Note the use of the `chromium` channel that allows to run extensions in headless mode. Alternatively, you can launch the browser in headed mode.

First, add fixtures that will load the extension:

```js title="fixtures.ts"
import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({ }, use) => {
    const pathToExtension = path.join(__dirname, 'my-extension');
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // for manifest v3:
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker)
      serviceWorker = await context.waitForEvent('serviceworker');

    const extensionId = serviceWorker.url().split('/')[2];
    await use(extensionId);
  },
});
export const expect = test.expect;
```

```python title="conftest.py"
from typing import Generator
from pathlib import Path
from playwright.sync_api import Playwright, BrowserContext
import pytest


@pytest.fixture()
def context(playwright: Playwright) -> Generator[BrowserContext, None, None]:
    path_to_extension = Path(__file__).parent.joinpath("my-extension")
    context = playwright.chromium.launch_persistent_context(
        "",
        channel="chromium",
        args=[
            f"--disable-extensions-except={path_to_extension}",
            f"--load-extension={path_to_extension}",
        ],
    )
    yield context
    context.close()


@pytest.fixture()
def extension_id(context) -> Generator[str, None, None]:
    # for manifest v3:
    service_worker = context.service_workers[0]
    if not service_worker:
        service_worker = context.wait_for_event("serviceworker")

    extension_id = service_worker.url.split("/")[2]
    yield extension_id

```

Then use these fixtures in a test:

```js
import { test, expect } from './fixtures';

test('example test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page.locator('body')).toHaveText('Changed by my-extension');
});

test('popup page', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(page.locator('body')).toHaveText('my-extension popup');
});
```

```python title="test_foo.py"
from playwright.sync_api import expect, Page


def test_example_test(page: Page) -> None:
    page.goto("https://example.com")
    expect(page.locator("body")).to_contain_text("Changed by my-extension")


def test_popup_page(page: Page, extension_id: str) -> None:
    page.goto(f"chrome-extension://{extension_id}/popup.html")
    expect(page.locator("body")).to_have_text("my-extension popup")
```



================================================
FILE: docs/src/ci-intro.md
================================================
---
id: ci-intro
title: "Setting up CI"
---

## Introduction
* langs: js

Playwright tests can be run on any CI provider. This guide covers one way of running tests on GitHub using GitHub actions. If you would like to learn more, or how to configure other CI providers, check out our detailed [doc on Continuous Integration](./ci.md).

#### You will learn
* langs: js

- [How to set up GitHub Actions](/ci-intro.md#setting-up-github-actions)
- [How to view test logs](/ci-intro.md#viewing-test-logs)
- [How to view the HTML report](/ci-intro.md#viewing-the-html-report)
- [How to view the trace](/ci-intro.md#viewing-the-trace)
- [How to publish report on the web](/ci-intro.md#publishing-report-on-the-web)


## Introduction
* langs: python, java, csharp

Playwright tests can be run on any CI provider. In this section we will cover running tests on GitHub using GitHub actions. If you would like to see how to configure other CI providers check out our detailed doc on Continuous Integration.

#### You will learn
* langs: python, java, csharp

- [How to set up GitHub Actions](/ci-intro.md#setting-up-github-actions)
- [How to view test logs](/ci-intro.md#viewing-test-logs)
- [How to view the trace](/ci-intro.md#viewing-the-trace)


## Setting up GitHub Actions
* langs: js

When [installing Playwright](./intro.md) using the [VS Code extension](./getting-started-vscode.md) or with `npm init playwright@latest` you are given the option to add a [GitHub Actions](https://docs.github.com/en/actions) workflow. This creates a `playwright.yml` file inside a `.github/workflows` folder containing everything you need so that your tests run on each push and pull request into the main/master branch. Here's how that file looks:

```yml js title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

The workflow performs these steps:

1. Clone your repository
1. Install Node.js
1. Install NPM Dependencies
1. Install Playwright Browsers
1. Run Playwright tests
1. Upload HTML report to the GitHub UI

To learn more about this, see ["Understanding GitHub Actions"](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions).

## Setting up GitHub Actions
* langs: python, java, csharp

To add a [GitHub Actions](https://docs.github.com/en/actions) file first create `.github/workflows` folder and inside it add a `playwright.yml` file containing the example code below so that your tests will run on each push and pull request for the main/master branch.

```yml python title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    - name: Ensure browsers are installed
      run: python -m playwright install --with-deps
    - name: Run your tests
      run: pytest --tracing=retain-on-failure
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-traces
        path: test-results/
```

```yml java title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '17'
    - name: Build & Install
      run: mvn -B install -D skipTests --no-transfer-progress
    - name: Ensure browsers are installed
      run: mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install --with-deps"
    - name: Run tests
      run: mvn test
```

```yml csharp title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup dotnet
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: 8.0.x
    - name: Build & Install
      run: dotnet build
    - name: Ensure browsers are installed
      run: pwsh bin/Debug/net8.0/playwright.ps1 install --with-deps
    - name: Run your tests
      run: dotnet test
```

To learn more about this, see ["Understanding GitHub Actions"](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions).

Looking at the list of steps in `jobs.test.steps`, you can see that the workflow performs these steps:

1. Clone your repository
1. Install language dependencies
1. Install project dependencies and build
1. Install Playwright Browsers
1. Run tests

## Create a Repo and Push to GitHub

Once you have your [GitHub actions workflow](#setting-up-github-actions) setup then all you need to do is [Create a repo on GitHub](https://docs.github.com/en/get-started/quickstart/create-a-repo) or push your code to an existing repository. Follow the instructions on GitHub and don't forget to [initialize a git repository](https://github.com/git-guides/git-init) using the `git init` command so you can [add](https://github.com/git-guides/git-add), [commit](https://github.com/git-guides/git-commit) and [push](https://github.com/git-guides/git-push) your code.

######
* langs: js, java, python

<img width="861" alt="Create a Repo and Push to GitHub" src="https://user-images.githubusercontent.com/13063165/183423254-d2735278-a2ab-4d63-bb99-48d8e5e447bc.png"/>


######
* langs: csharp

![dotnet repo on github](https://github.com/microsoft/playwright/assets/13063165/4f1b4cc3-b850-4d60-a99e-24057eaf91ad)

## Opening the Workflows

Click on the **Actions** tab to see the workflows. Here you will see if your tests have passed or failed.

######
* langs: js, python, java

![opening the workflow](https://user-images.githubusercontent.com/13063165/183423783-58bf2008-514e-4f96-9c12-c9a55703960c.png)

######
* langs: csharp

![opening the workflow](https://github.com/microsoft/playwright/assets/13063165/71793c09-0815-4faa-866b-85684a1f87e5)

On Pull Requests you can also click on the **Details** link in the [PR status check](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks).

<img width="645" alt="pr status checked" src="https://user-images.githubusercontent.com/13063165/183722462-17a985db-0e10-4205-b16c-8aaac36117b9.png" />


## Viewing Test Logs

Clicking on the workflow run will show you the all the actions that GitHub performed and clicking on **Run Playwright tests** will show the error messages, what was expected and what was received as well as the call log.

######
* langs: js, python, java

![Viewing Test Logs](https://user-images.githubusercontent.com/13063165/183423783-58bf2008-514e-4f96-9c12-c9a55703960c.png)

######
* langs: csharp

![viewing the test logs](https://github.com/microsoft/playwright/assets/13063165/ba2d8d7b-ffce-42de-95e0-bcb35c421975)


## HTML Report
* langs: js

The HTML Report shows you a full report of your tests. You can filter the report by browsers, passed tests, failed tests, skipped tests and flaky tests.

### Downloading the HTML Report
* langs: js

In the Artifacts section click on the **playwright-report** to download your report in the format of a zip file.

<img width="972" alt="Downloading the HTML Report" src="https://user-images.githubusercontent.com/13063165/183437023-524f1803-84e4-4862-9ce3-1d55af0e023e.png" />

### Viewing the HTML Report
* langs: js

Locally opening the report will not work as expected as you need a web server in order for everything to work correctly. First, extract the zip, preferably in a folder that already has Playwright installed. Using the command line change into the directory where the report is and use `npx playwright show-report` followed by the name of the extracted folder. This will serve up the report and enable you to view it in your browser.


```bash
npx playwright show-report name-of-my-extracted-playwright-report
```

![viewing the HTML report](https://github.com/microsoft/playwright/assets/13063165/c5f60e56-fb75-4a2d-a4b6-054b8c5d69c1)

To learn more about reports check out our detailed guide on [HTML Reporter](/test-reporters.md#html-reporter)

## Viewing the Trace
* langs: js

Once you have served the report using `npx playwright show-report`, click on the trace icon next to the test's file name as seen in the image above. You can then view the trace of your tests and inspect each action to try to find out why the tests are failing.

![playwright trace viewer](https://github.com/microsoft/playwright/assets/13063165/10fe3585-8401-4051-b1c2-b2e92ac4c274)

## Viewing the Trace
* langs: python, java

[trace.playwright.dev](https://trace.playwright.dev) is a statically hosted variant of the Trace Viewer. You can upload trace files using drag and drop.

![playwright trace viewer](https://github.com/microsoft/playwright/assets/13063165/6d5885dc-d511-4c20-b728-040a7ef6cea4)

## Viewing the Trace
* langs: csharp

You can upload Traces which get created on your CI like GitHub Actions as artifacts. This requires [starting and stopping the trace](./trace-viewer-intro#recording-a-trace). We recommend only recording traces for failing tests. Once your traces have been uploaded to CI, they can then be downloaded and opened using [trace.playwright.dev](https://trace.playwright.dev), which is a statically hosted variant of the Trace Viewer. You can upload trace files using drag and drop.

######
* langs: csharp

![playwright trace viewer](https://github.com/microsoft/playwright/assets/13063165/84150084-5019-470a-8449-b61d206bfbb0)

## Publishing report on the web
* langs: js

Downloading the HTML report as a zip file is not very convenient. However, we can utilize Azure Storage's static websites hosting capabilities to easily and efficiently serve HTML reports on the Internet, requiring minimal configuration.

1. Create an [Azure Storage account](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-create).
1. Enable [Static website hosting](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website-how-to#enable-static-website-hosting) for the storage account.
1. Create a Service Principal in Azure and grant it access to Azure Blob storage. Upon successful execution, the command will display the credentials which will be used in the next step.

    ```bash
    az ad sp create-for-rbac --name "github-actions" --role "Storage Blob Data Contributor" --scopes /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/<RESOURCE_GROUP_NAME>/providers/Microsoft.Storage/storageAccounts/<STORAGE_ACCOUNT_NAME>
    ```
1. Use the credentials from the previous step to set up encrypted secrets in your GitHub repository. Go to your repository's settings, under [GitHub Actions secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository), and add the following secrets:

    - `AZCOPY_SPA_APPLICATION_ID`
    - `AZCOPY_SPA_CLIENT_SECRET`
    - `AZCOPY_TENANT_ID`

   For a detailed guide on how to authorize a service principal using a client secret, refer to [this Microsoft documentation](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azcopy-authorize-azure-active-directory#authorize-a-service-principal-by-using-a-client-secret).
1. Add a step that uploads the HTML report to Azure Storage.

    ```yaml title=".github/workflows/playwright.yml"
    ...
        - name: Upload HTML report to Azure
          shell: bash
          run: |
            REPORT_DIR='run-${{ github.run_id }}-${{ github.run_attempt }}'
            azcopy cp --recursive "./playwright-report/*" "https://<STORAGE_ACCOUNT_NAME>.blob.core.windows.net/\$web/$REPORT_DIR"
            echo "::notice title=HTML report url::https://<STORAGE_ACCOUNT_NAME>.z1.web.core.windows.net/$REPORT_DIR/index.html"
          env:
            AZCOPY_AUTO_LOGIN_TYPE: SPN
            AZCOPY_SPA_APPLICATION_ID: '${{ secrets.AZCOPY_SPA_APPLICATION_ID }}'
            AZCOPY_SPA_CLIENT_SECRET: '${{ secrets.AZCOPY_SPA_CLIENT_SECRET }}'
            AZCOPY_TENANT_ID: '${{ secrets.AZCOPY_TENANT_ID }}'
    ```

The contents of the `$web` storage container can be accessed from a browser by using the [public URL](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website-how-to?tabs=azure-portal#portal-find-url) of the website.

:::note
This step will not work for pull requests created from a forked repository because such workflow [doesn't have access to the secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions#using-secrets-in-a-workflow).
:::

## Properly handling Secrets
* langs: js

Artifacts like trace files, HTML reports or even the console logs contain information about your test execution.
They can contain sensitive data like user credentials for a test user, access tokens to a staging backend, testing source code or sometimes even your application source code. Treat these files just as careful as you treat that sensitive data.
If you upload reports and traces as part of your CI workflow, make sure that you only upload them to trusted artifact stores, or that you encrypt the files before upload. The same is true for sharing artifacts with team members: Use a trusted file share or encrypt the files before sharing.

## Properly handling Secrets
* langs: python, java, csharp

Artifacts like trace files or console logs contain information about your test execution.
They can contain sensitive data like user credentials for a test user, access tokens to a staging backend, testing source code or sometimes even your application source code. Treat these files just as careful as you treat that sensitive data.
If you upload reports and traces as part of your CI workflow, make sure that you only upload them to trusted artifact stores, or that you encrypt the files before upload. The same is true for sharing artifacts with team members: Use a trusted file share or encrypt the files before sharing.

## What's Next

- [Learn how to use Locators](./locators.md)
- [Learn how to perform Actions](./input.md)
- [Learn how to write Assertions](./test-assertions.md)
- [Learn more about the Trace Viewer](/trace-viewer.md)
- [Learn more ways of running tests on GitHub Actions](/ci.md#github-actions)
- [Learn more about running tests on other CI providers](/ci.md)



================================================
FILE: docs/src/ci.md
================================================
---
id: ci
title: "Continuous Integration"
---
## Introduction

Playwright tests can be executed in CI environments. We have created sample
configurations for common CI providers.

3 steps to get your tests running on CI:

1. **Ensure CI agent can run browsers**: Use [our Docker image](./docker.md)
   in Linux agents or install your dependencies using the [CLI](./browsers#install-system-dependencies).
1. **Install Playwright**:
   ```bash js
   # Install NPM packages
   npm ci

   # Install Playwright browsers and dependencies
   npx playwright install --with-deps
   ```
   ```bash python
   pip install playwright
   playwright install --with-deps
   ```
   ```bash java
   mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install --with-deps"
   ```
   ```bash csharp
   dotnet build
   pwsh bin/Debug/netX/playwright.ps1 install --with-deps
   ```

1. **Run your tests**:
   ```bash js
   npx playwright test
   ```
   ```bash python
   pytest
   ```
   ```bash java
   mvn test
   ```
   ```bash csharp
   dotnet test
   ```

## Workers
* langs: js

We recommend setting [workers](./api/class-testconfig.md#test-config-workers) to "1" in CI environments to prioritize stability and reproducibility. Running tests sequentially ensures each test gets the full system resources, avoiding potential conflicts. However, if you have a powerful self-hosted CI system, you may enable [parallel](./test-parallel.md) tests. For wider parallelization, consider [sharding](./test-parallel.md#shard-tests-between-multiple-machines) - distributing tests across multiple CI jobs.

```js title="playwright.config.ts"
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,
});
```

## CI configurations

The [Command line tools](./browsers#install-system-dependencies) can be used to install all operating system dependencies in CI.

### GitHub Actions

#### On push/pull_request
* langs: js

Tests will run on push or pull request on branches main/master. The [workflow](https://docs.github.com/en/actions/using-workflows/about-workflows) will install all dependencies, install Playwright and then run the tests. It will also create the HTML report.

```yml js title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

#### On push/pull_request
* langs: python, java, csharp

Tests will run on push or pull request on branches main/master. The [workflow](https://docs.github.com/en/actions/using-workflows/about-workflows) will install all dependencies, install Playwright and then run the tests.

```yml python title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    - name: Ensure browsers are installed
      run: python -m playwright install --with-deps
    - name: Run your tests
      run: pytest --tracing=retain-on-failure
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-traces
        path: test-results/
```

```yml java title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '17'
    - name: Build & Install
      run: mvn -B install -D skipTests --no-transfer-progress
    - name: Ensure browsers are installed
      run: mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install --with-deps"
    - name: Run tests
      run: mvn test
```

```yml csharp title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup dotnet
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: 8.0.x
    - name: Build & Install
      run: dotnet build
    - name: Ensure browsers are installed
      run: pwsh bin/Debug/net8.0/playwright.ps1 install --with-deps
    - name: Run your tests
      run: dotnet test
```

#### On push/pull_request (sharded)
* langs: js

GitHub Actions supports [sharding tests between multiple jobs](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs). Check out our [sharding doc](./test-sharding) to learn more about sharding and to see a [GitHub actions example](./test-sharding.md#github-actions-example) of how to configure a job to run your tests on multiple machines as well as how to merge the HTML reports.

#### Via Containers

GitHub Actions support [running jobs in a container](https://docs.github.com/en/actions/using-jobs/running-jobs-in-a-container) by using the [`jobs.<job_id>.container`](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idcontainer) option. This is useful to not pollute the host environment with dependencies and to have a consistent environment for e.g. screenshots/visual regression testing across different operating systems.

```yml js title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  playwright:
    name: 'Playwright Tests'
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v%%VERSION%%-noble
      options: --user 1001
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - name: Install dependencies
        run: npm ci
      - name: Run your tests
        run: npx playwright test
```

```yml python title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  playwright:
    name: 'Playwright Tests'
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright/python:v%%VERSION%%-noble
      options: --user 1001
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r local-requirements.txt
          pip install -e .
      - name: Run your tests
        run: pytest
```

```yml java title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  playwright:
    name: 'Playwright Tests'
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright/java:v%%VERSION%%-noble
      options: --user 1001
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Build & Install
        run: mvn -B install -D skipTests --no-transfer-progress
      - name: Run tests
        run: mvn test
```

```yml csharp title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  playwright:
    name: 'Playwright Tests'
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright/dotnet:v%%VERSION%%-noble
      options: --user 1001
    steps:
      - uses: actions/checkout@v4
      - name: Setup dotnet
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 8.0.x
      - run: dotnet build
      - name: Run your tests
        run: dotnet test
```

#### On deployment

This will start the tests after a [GitHub Deployment](https://developer.github.com/v3/repos/deployments/) went into the `success` state.
Services like Vercel use this pattern so you can run your end-to-end tests on their deployed environment.

```yml js title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  deployment_status:
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    if: github.event.deployment_status.state == 'success'
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
      env:
        PLAYWRIGHT_TEST_BASE_URL: ${{ github.event.deployment_status.target_url }}
```

```yml python title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  deployment_status:
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    if: github.event.deployment_status.state == 'success'
    steps:
    - uses: actions/checkout@v4
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    - name: Ensure browsers are installed
      run: python -m playwright install --with-deps
    - name: Run tests
      run: pytest
      env:
        # This might depend on your test-runner
        PLAYWRIGHT_TEST_BASE_URL: ${{ github.event.deployment_status.target_url }}
```

```yml java title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  deployment_status:
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    if: github.event.deployment_status.state == 'success'
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '17'
    - name: Build & Install
      run: mvn -B install -D skipTests --no-transfer-progress
    - name: Install Playwright
      run: mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install --with-deps"
    - name: Run tests
      run: mvn test
      env:
        # This might depend on your test-runner
        PLAYWRIGHT_TEST_BASE_URL: ${{ github.event.deployment_status.target_url }}
```

```yml csharp title=".github/workflows/playwright.yml"
name: Playwright Tests
on:
  deployment_status:
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    if: github.event.deployment_status.state == 'success'
    steps:
    - uses: actions/checkout@v4
    - name: Setup dotnet
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: 8.0.x
    - run: dotnet build
    - name: Ensure browsers are installed
      run: pwsh bin/Debug/net8.0/playwright.ps1 install --with-deps
    - name: Run tests
      run: dotnet test
      env:
        # This might depend on your test-runner
        PLAYWRIGHT_TEST_BASE_URL: ${{ github.event.deployment_status.target_url }}
```

#### Fail-Fast
* langs: js

Large test suites can take very long to execute. By executing a preliminary test run with the `--only-changed` flag, you can run test files that are likely to fail first.
This will give you a faster feedback loop and slightly lower CI consumption while working on Pull Requests.
To detect test files affected by your changeset, `--only-changed` analyses your suites' dependency graph. This is a heuristic and might miss tests, so it's important that you always run the full test suite after the preliminary test run.

```yml js title=".github/workflows/playwright.yml" {24-26}
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        # Force a non-shallow checkout, so that we can reference $GITHUB_BASE_REF.
        # See https://github.com/actions/checkout for more details.
        fetch-depth: 0
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run changed Playwright tests
      run: npx playwright test --only-changed=$GITHUB_BASE_REF
      if: github.event_name == 'pull_request'
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

### Docker

We have a [pre-built Docker image](./docker.md) which can either be used directly or as a reference to update your existing Docker definitions. Make sure to follow the [Recommended Docker Configuration](./docker.md#recommended-docker-configuration) to ensure the best performance.

### Azure Pipelines

For Windows or macOS agents, no additional configuration is required, just install Playwright and run your tests.

For Linux agents, you can use [our Docker container](./docker.md) with Azure
Pipelines support [running containerized
jobs](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/container-phases?view=azure-devops).
Alternatively, you can use [Command line tools](./browsers#install-system-dependencies) to install all necessary dependencies.

For running the Playwright tests use this pipeline task:

```yml js
trigger:
- main

pool:
  vmImage: ubuntu-latest

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18'
  displayName: 'Install Node.js'
- script: npm ci
  displayName: 'npm ci'
- script: npx playwright install --with-deps
  displayName: 'Install Playwright browsers'
- script: npx playwright test
  displayName: 'Run Playwright tests'
  env:
    CI: 'true'
```

```yml python
trigger:
- main

pool:
  vmImage: ubuntu-latest

steps:
- task: UsePythonVersion@0
  inputs:
    versionSpec: '3.11'
  displayName: 'Use Python'
- script: |
    python -m pip install --upgrade pip
    pip install -r requirements.txt
  displayName: 'Install dependencies'
- script: playwright install --with-deps
  displayName: 'Install Playwright browsers'
- script: pytest
  displayName: 'Run Playwright tests'
```

```yml java
trigger:
- main

pool:
  vmImage: ubuntu-latest

steps:
- task: JavaToolInstaller@0
  inputs:
    versionSpec: '17'
    jdkArchitectureOption: 'x64'
    jdkSourceOption: AzureStorage
- script: mvn -B install -D skipTests --no-transfer-progress
  displayName: 'Build and install'
- script: mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install --with-deps"
  displayName: 'Install Playwright browsers'
- script: mvn test
  displayName: 'Run tests'
```

```yml csharp
trigger:
- main

pool:
  vmImage: ubuntu-latest

steps:
- task: UseDotNet@2
  inputs:
    packageType: sdk
    version: '8.0.x'
  displayName: 'Use .NET SDK'
- script: dotnet build --configuration Release
  displayName: 'Build'
- script: pwsh bin/Release/net8.0/playwright.ps1 install --with-deps
  displayName: 'Install Playwright browsers'
- script: dotnet test --configuration Release
  displayName: 'Run tests'
```

#### Uploading playwright-report folder with Azure Pipelines
* langs: js

This will make the pipeline run fail if any of the playwright tests fails.
If you also want to integrate the test results with Azure DevOps, use the task `PublishTestResults` task like so:

```yml
trigger:
- main

pool:
  vmImage: ubuntu-latest

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18'
  displayName: 'Install Node.js'

- script: npm ci
  displayName: 'npm ci'
- script: npx playwright install --with-deps
  displayName: 'Install Playwright browsers'
- script: npx playwright test
  displayName: 'Run Playwright tests'
  env:
    CI: 'true'
- task: PublishTestResults@2
  displayName: 'Publish test results'
  inputs:
    searchFolder: 'test-results'
    testResultsFormat: 'JUnit'
    testResultsFiles: 'e2e-junit-results.xml'
    mergeTestResults: true
    failTaskOnFailedTests: true
    testRunTitle: 'My End-To-End Tests'
  condition: succeededOrFailed()
- task: PublishPipelineArtifact@1
  inputs:
    targetPath: playwright-report
    artifact: playwright-report
    publishLocation: 'pipeline'
  condition: succeededOrFailed()

```
Note: The JUnit reporter needs to be configured accordingly via
```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['junit', { outputFile: 'test-results/e2e-junit-results.xml' }]],
});
```
in `playwright.config.ts`.

#### Azure Pipelines (sharded)
* langs: js

```yaml
trigger:
- main

pool:
  vmImage: ubuntu-latest

strategy:
  matrix:
    chromium-1:
      project: chromium
      shard: 1/3
    chromium-2:
      project: chromium
      shard: 2/3
    chromium-3:
      project: chromium
      shard: 3/3
    firefox-1:
      project: firefox
      shard: 1/3
    firefox-2:
      project: firefox
      shard: 2/3
    firefox-3:
      project: firefox
      shard: 3/3
    webkit-1:
      project: webkit
      shard: 1/3
    webkit-2:
      project: webkit
      shard: 2/3
    webkit-3:
      project: webkit
      shard: 3/3
steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18'
  displayName: 'Install Node.js'

- script: npm ci
  displayName: 'npm ci'
- script: npx playwright install --with-deps
  displayName: 'Install Playwright browsers'
- script: npx playwright test --project=$(project) --shard=$(shard)
  displayName: 'Run Playwright tests'
  env:
    CI: 'true'
```


#### Azure Pipelines (containerized)

```yml js
trigger:
- main

pool:
  vmImage: ubuntu-latest
container: mcr.microsoft.com/playwright:v%%VERSION%%-noble

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18'
  displayName: 'Install Node.js'

- script: npm ci
  displayName: 'npm ci'
- script: npx playwright test
  displayName: 'Run Playwright tests'
  env:
    CI: 'true'
```

```yml python
trigger:
- main

pool:
  vmImage: ubuntu-latest
container: mcr.microsoft.com/playwright/python:v%%VERSION%%-noble

steps:
- task: UsePythonVersion@0
  inputs:
    versionSpec: '3.11'
  displayName: 'Use Python'

- script: |
    python -m pip install --upgrade pip
    pip install -r requirements.txt
  displayName: 'Install dependencies'
- script: pytest
  displayName: 'Run tests'
```

```yml java
trigger:
- main

pool:
  vmImage: ubuntu-latest
container: mcr.microsoft.com/playwright/java:v%%VERSION%%-noble

steps:
- task: JavaToolInstaller@0
  inputs:
    versionSpec: '17'
    jdkArchitectureOption: 'x64'
    jdkSourceOption: AzureStorage

- script: mvn -B install -D skipTests --no-transfer-progress
  displayName: 'Build and install'
- script: mvn test
  displayName: 'Run tests'
```

```yml csharp
trigger:
- main

pool:
  vmImage: ubuntu-latest
container: mcr.microsoft.com/playwright/dotnet:v%%VERSION%%-noble

steps:
- task: UseDotNet@2
  inputs:
    packageType: sdk
    version: '8.0.x'
  displayName: 'Use .NET SDK'

- script: dotnet build --configuration Release
  displayName: 'Build'
- script: dotnet test --configuration Release
  displayName: 'Run tests'
```

### CircleCI

Running Playwright on CircleCI is very similar to running on GitHub Actions. In order to specify the pre-built Playwright [Docker image](./docker.md), simply modify the agent definition with `docker:` in your config like so:

```yml js
executors:
  pw-noble-development:
    docker:
      - image: mcr.microsoft.com/playwright:v%%VERSION%%-noble
```

```yml python
executors:
  pw-noble-development:
    docker:
      - image: mcr.microsoft.com/playwright/python:v%%VERSION%%-noble
```

```yml java
executors:
  pw-noble-development:
    docker:
      - image: mcr.microsoft.com/playwright/java:v%%VERSION%%-noble
```

```yml csharp
executors:
  pw-noble-development:
    docker:
      - image: mcr.microsoft.com/playwright/dotnet:v%%VERSION%%-noble
```

Note: When using the docker agent definition, you are specifying the resource class of where playwright runs to the 'medium' tier [here](https://circleci.com/docs/configuration-reference?#docker-execution-environment). The default behavior of Playwright is to set the number of workers to the detected core count (2 in the case of the medium tier). Overriding the number of workers to greater than this number will cause unnecessary timeouts and failures.

#### Sharding in CircleCI
* langs: js

Sharding in CircleCI is indexed with 0 which means that you will need to override the default parallelism ENV VARS. The following example demonstrates how to run Playwright with a CircleCI Parallelism of 4 by adding 1 to the `CIRCLE_NODE_INDEX` to pass into the `--shard` cli arg.

  ```yml
    playwright-job-name:
      executor: pw-noble-development
      parallelism: 4
      steps:
        - run: SHARD="$((${CIRCLE_NODE_INDEX}+1))"; npx playwright test --shard=${SHARD}/${CIRCLE_NODE_TOTAL}
  ```

### Jenkins

Jenkins supports Docker agents for pipelines. Use the [Playwright Docker image](./docker.md)
to run tests on Jenkins.

```groovy js
pipeline {
   agent { docker { image 'mcr.microsoft.com/playwright:v%%VERSION%%-noble' } }
   stages {
      stage('e2e-tests') {
         steps {
            sh 'npm ci'
            sh 'npx playwright test'
         }
      }
   }
}
```

```groovy python
pipeline {
   agent { docker { image 'mcr.microsoft.com/playwright/python:v%%VERSION%%-noble' } }
   stages {
      stage('e2e-tests') {
         steps {
            sh 'pip install -r requirements.txt'
            sh 'pytest'
         }
      }
   }
}
```

```groovy java
pipeline {
   agent { docker { image 'mcr.microsoft.com/playwright/java:v%%VERSION%%-noble' } }
   stages {
      stage('e2e-tests') {
         steps {
            sh 'mvn -B install -D skipTests --no-transfer-progress'
            sh 'mvn test'
         }
      }
   }
}
```

```groovy csharp
pipeline {
   agent { docker { image 'mcr.microsoft.com/playwright/dotnet:v%%VERSION%%-noble' } }
   stages {
      stage('e2e-tests') {
         steps {
            sh 'dotnet build'
            sh 'dotnet test'
         }
      }
   }
}
```

### Bitbucket Pipelines

Bitbucket Pipelines can use public [Docker images as build environments](https://confluence.atlassian.com/bitbucket/use-docker-images-as-build-environments-792298897.html). To run Playwright tests on Bitbucket, use our public Docker image ([see Dockerfile](./docker.md)).

```yml js
image: mcr.microsoft.com/playwright:v%%VERSION%%-noble
```

```yml python
image: mcr.microsoft.com/playwright/python:v%%VERSION%%-noble
```

```yml java
image: mcr.microsoft.com/playwright/java:v%%VERSION%%-noble
```

```yml csharp
image: mcr.microsoft.com/playwright/dotnet:v%%VERSION%%-noble
```

### GitLab CI

To run Playwright tests on GitLab, use our public Docker image ([see Dockerfile](./docker.md)).

```yml js
stages:
  - test

tests:
  stage: test
  image: mcr.microsoft.com/playwright:v%%VERSION%%-noble
  script:
  ...
```

```yml python
stages:
  - test

tests:
  stage: test
  image: mcr.microsoft.com/playwright/python:v%%VERSION%%-noble
  script:
  ...
```

```yml java
stages:
  - test

tests:
  stage: test
  image: mcr.microsoft.com/playwright/java:v%%VERSION%%-noble
  script:
  ...
```

```yml dotnet
stages:
  - test

tests:
  stage: test
  image: mcr.microsoft.com/playwright/dotnet:v%%VERSION%%-noble
  script:
  ...
```

#### Sharding
* langs: js

GitLab CI supports [sharding tests between multiple jobs](https://docs.gitlab.com/ee/ci/jobs/job_control.html#parallelize-large-jobs) using the [parallel](https://docs.gitlab.com/ee/ci/yaml/index.html#parallel) keyword. The test job will be split into multiple smaller jobs that run in parallel. Parallel jobs are named sequentially from `job_name 1/N` to `job_name N/N`.

```yml
stages:
  - test

tests:
  stage: test
  image: mcr.microsoft.com/playwright:v%%VERSION%%-noble
  parallel: 7
  script:
    - npm ci
    - npx playwright test --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
```

GitLab CI also supports sharding tests between multiple jobs using the [parallel:matrix](https://docs.gitlab.com/ee/ci/yaml/index.html#parallelmatrix) option. The test job will run multiple times in parallel in a single pipeline, but with different variable values for each instance of the job. In the example below, we have 2 `PROJECT` values and 10 `SHARD` values, resulting in a total of 20 jobs to be run.

```yml
stages:
  - test

tests:
  stage: test
  image: mcr.microsoft.com/playwright:v%%VERSION%%-noble
  parallel:
    matrix:
      - PROJECT: ['chromium', 'webkit']
        SHARD: ['1/10', '2/10', '3/10', '4/10', '5/10', '6/10', '7/10', '8/10', '9/10', '10/10']
  script:
    - npm ci
    - npx playwright test --project=$PROJECT --shard=$SHARD
```
### Google Cloud Build
* langs: js

To run Playwright tests on Google Cloud Build, use our public Docker image ([see Dockerfile](./docker.md)).

```yml
steps:
- name: mcr.microsoft.com/playwright:v%%VERSION%%-noble
  script: 
  ...
  env:
  - 'CI=true'
```

### Drone
* langs: js

To run Playwright tests on Drone, use our public Docker image ([see Dockerfile](./docker.md)).

```yml
kind: pipeline
name: default
type: docker

steps:
  - name: test
    image: mcr.microsoft.com/playwright:v%%VERSION%%-noble
    commands:
      - npx playwright test
```

## Caching browsers

Caching browser binaries is not recommended, since the amount of time it takes to restore the cache is comparable to the time it takes to download the binaries. Especially under Linux, [operating system dependencies](./browsers.md#install-system-dependencies) need to be installed, which are not cacheable.

If you still want to cache the browser binaries between CI runs, cache [these directories](./browsers.md#managing-browser-binaries) in your CI configuration, against a hash of the Playwright version.

## Debugging browser launches

Playwright supports the `DEBUG` environment variable to output debug logs during execution. Setting it to `pw:browser` is helpful while debugging `Error: Failed to launch browser` errors.

```bash js
DEBUG=pw:browser npx playwright test
```
```bash python
DEBUG=pw:browser pytest
```

```bash java
DEBUG=pw:browser mvn test
```

```bash csharp
DEBUG=pw:browser dotnet test
```

## Running headed

By default, Playwright launches browsers in headless mode. See in our [Running tests](./running-tests.md#run-tests-in-headed-mode) guide how to run tests in headed mode.

On Linux agents, headed execution requires [Xvfb](https://en.wikipedia.org/wiki/Xvfb) to be installed. Our [Docker image](./docker.md) and GitHub Action have Xvfb pre-installed. To run browsers in headed mode with Xvfb, add `xvfb-run` before the actual command.

```bash js
xvfb-run npx playwright test
```
```bash python
xvfb-run pytest
```
```bash java
xvfb-run mvn test
```
```bash csharp
xvfb-run dotnet test
```



================================================
FILE: docs/src/clock.md
================================================
---
id: clock
title: "Clock"
---
import LiteYouTube from '@site/src/components/LiteYouTube';

## Introduction

Accurately simulating time-dependent behavior is essential for verifying the correctness of applications. Utilizing [Clock] functionality allows developers to manipulate and control time within tests, enabling the precise validation of features such as rendering time, timeouts, scheduled tasks without the delays and variability of real-time execution.

The [Clock] API provides the following methods to control time:
- `setFixedTime`: Sets the fixed time for `Date.now()` and `new Date()`.
- `install`: initializes the clock and allows you to:
  - `pauseAt`: Pauses the time at a specific time.
  - `fastForward`: Fast forwards the time.
  - `runFor`: Runs the time for a specific duration.
  - `resume`: Resumes the time.
- `setSystemTime`: Sets the current system time.

The recommended approach is to use `setFixedTime` to set the time to a specific value. If that doesn't work for your use case, you can use `install` which allows you to pause time later on, fast forward it, tick it, etc. `setSystemTime` is only recommended for advanced use cases.

:::note
[`property: Page.clock`] overrides native global classes and functions related to time allowing them to be manually controlled:
  - `Date`
  - `setTimeout`
  - `clearTimeout`
  - `setInterval`
  - `clearInterval`
  - `requestAnimationFrame`
  - `cancelAnimationFrame`
  - `requestIdleCallback`
  - `cancelIdleCallback`
  - `performance`
  - `Event.timeStamp`
:::

:::warning
If you call `install` at any point in your test, the call _MUST_ occur before any other clock related calls (see note above for list). Calling these methods out of order will result in undefined behavior. For example, you cannot call `setInterval`, followed by `install`, then `clearInterval`, as `install` overrides the native definition of the clock functions.
:::

## Test with predefined time

Often you only need to fake `Date.now` while keeping the timers going.
That way the time flows naturally, but `Date.now` always returns a fixed value.

```html
<div id="current-time" data-testid="current-time"></div>
<script>
  const renderTime = () => {
    document.getElementById('current-time').textContent =
        new Date().toLocaleString();
  };
  setInterval(renderTime, 1000);
</script>
```

```js
await page.clock.setFixedTime(new Date('2024-02-02T10:00:00'));
await page.goto('http://localhost:3333');
await expect(page.getByTestId('current-time')).toHaveText('2/2/2024, 10:00:00 AM');

await page.clock.setFixedTime(new Date('2024-02-02T10:30:00'));
// We know that the page has a timer that updates the time every second.
await expect(page.getByTestId('current-time')).toHaveText('2/2/2024, 10:30:00 AM');
```

```python async
await page.clock.set_fixed_time(datetime.datetime(2024, 2, 2, 10, 0, 0))
await page.goto("http://localhost:3333")
await expect(page.get_by_test_id("current-time")).to_have_text("2/2/2024, 10:00:00 AM")

await page.clock.set_fixed_time(datetime.datetime(2024, 2, 2, 10, 30, 0))
# We know that the page has a timer that updates the time every second.
await expect(page.get_by_test_id("current-time")).to_have_text("2/2/2024, 10:30:00 AM")
```

```python sync
page.clock.set_fixed_time(datetime.datetime(2024, 2, 2, 10, 0, 0))
page.goto("http://localhost:3333")
expect(page.get_by_test_id("current-time")).to_have_text("2/2/2024, 10:00:00 AM")
page.clock.set_fixed_time(datetime.datetime(2024, 2, 2, 10, 30, 0))
# We know that the page has a timer that updates the time every second.
expect(page.get_by_test_id("current-time")).to_have_text("2/2/2024, 10:30:00 AM")
```

```java
SimpleDateFormat format = new SimpleDateFormat("yyy-MM-dd'T'HH:mm:ss");
page.clock().setFixedTime(format.parse("2024-02-02T10:00:00"));
page.navigate("http://localhost:3333");
Locator locator = page.getByTestId("current-time");
assertThat(locator).hasText("2/2/2024, 10:00:00 AM");
page.clock().setFixedTime(format.parse("2024-02-02T10:30:00"));
// We know that the page has a timer that updates the time every second.
assertThat(locator).hasText("2/2/2024, 10:30:00 AM");
```

```csharp
// Set the fixed time for the clock.
await Page.Clock.SetFixedTimeAsync(new DateTime(2024, 2, 2, 10, 0, 0));
await Page.GotoAsync("http://localhost:3333");
await Expect(Page.GetByTestId("current-time")).ToHaveTextAsync("2/2/2024, 10:00:00 AM");
// Set the fixed time for the clock.
await Page.Clock.SetFixedTimeAsync(new DateTime(2024, 2, 2, 10, 30, 0));
// We know that the page has a timer that updates the time every second.
await Expect(Page.GetByTestId("current-time")).ToHaveTextAsync("2/2/2024, 10:30:00 AM");
```

## Consistent time and timers

Sometimes your timers depend on `Date.now` and are confused when the `Date.now` value does not change over time.
In this case, you can install the clock and fast forward to the time of interest when testing.

```html
<div id="current-time" data-testid="current-time"></div>
<script>
  const renderTime = () => {
    document.getElementById('current-time').textContent =
        new Date().toLocaleString();
  };
  setInterval(renderTime, 1000);
</script>
```

```js
// Initialize clock with some time before the test time and let the page load
// naturally. `Date.now` will progress as the timers fire.
await page.clock.install({ time: new Date('2024-02-02T08:00:00') });
await page.goto('http://localhost:3333');

// Pretend that the user closed the laptop lid and opened it again at 10am,
// Pause the time once reached that point.
await page.clock.pauseAt(new Date('2024-02-02T10:00:00'));

// Assert the page state.
await expect(page.getByTestId('current-time')).toHaveText('2/2/2024, 10:00:00 AM');

// Close the laptop lid again and open it at 10:30am.
await page.clock.fastForward('30:00');
await expect(page.getByTestId('current-time')).toHaveText('2/2/2024, 10:30:00 AM');
```

```python async
# Initialize clock with some time before the test time and let the page load
# naturally. `Date.now` will progress as the timers fire.
await page.clock.install(time=datetime.datetime(2024, 2, 2, 8, 0, 0))
await page.goto("http://localhost:3333")

# Pretend that the user closed the laptop lid and opened it again at 10am.
# Pause the time once reached that point.
await page.clock.pause_at(datetime.datetime(2024, 2, 2, 10, 0, 0))

# Assert the page state.
await expect(page.get_by_test_id("current-time")).to_have_text("2/2/2024, 10:00:00 AM")

# Close the laptop lid again and open it at 10:30am.
await page.clock.fast_forward("30:00")
await expect(page.get_by_test_id("current-time")).to_have_text("2/2/2024, 10:30:00 AM")
```

```python sync
# Initialize clock with some time before the test time and let the page load
# naturally. `Date.now` will progress as the timers fire.
page.clock.install(time=datetime.datetime(2024, 2, 2, 8, 0, 0))
page.goto("http://localhost:3333")

# Pretend that the user closed the laptop lid and opened it again at 10am.
# Pause the time once reached that point.
page.clock.pause_at(datetime.datetime(2024, 2, 2, 10, 0, 0))

# Assert the page state.
expect(page.get_by_test_id("current-time")).to_have_text("2/2/2024, 10:00:00 AM")

# Close the laptop lid again and open it at 10:30am.
page.clock.fast_forward("30:00")
expect(page.get_by_test_id("current-time")).to_have_text("2/2/2024, 10:30:00 AM")
```

```java
// Initialize clock with some time before the test time and let the page load
// naturally. `Date.now` will progress as the timers fire.
SimpleDateFormat format = new SimpleDateFormat("yyy-MM-dd'T'HH:mm:ss");
page.clock().install(new Clock.InstallOptions().setTime(format.parse("2024-02-02T08:00:00")));
page.navigate("http://localhost:3333");
Locator locator = page.getByTestId("current-time");

// Pretend that the user closed the laptop lid and opened it again at 10am.
// Pause the time once reached that point.
page.clock().pauseAt(format.parse("2024-02-02T10:00:00"));

// Assert the page state.
assertThat(locator).hasText("2/2/2024, 10:00:00 AM");

// Close the laptop lid again and open it at 10:30am.
page.clock().fastForward("30:00");
assertThat(locator).hasText("2/2/2024, 10:30:00 AM");
```

```csharp
// Initialize clock with some time before the test time and let the page load naturally.
// `Date.now` will progress as the timers fire.
await Page.Clock.InstallAsync(new()
{
  TimeDate = new DateTime(2024, 2, 2, 8, 0, 0)
});
await Page.GotoAsync("http://localhost:3333");

// Pretend that the user closed the laptop lid and opened it again at 10am.
// Pause the time once reached that point.
await Page.Clock.PauseAtAsync(new DateTime(2024, 2, 2, 10, 0, 0));

// Assert the page state.
await Expect(Page.GetByTestId("current-time")).ToHaveTextAsync("2/2/2024, 10:00:00 AM");

// Close the laptop lid again and open it at 10:30am.
await Page.Clock.FastForwardAsync("30:00");
await Expect(Page.GetByTestId("current-time")).ToHaveTextAsync("2/2/2024, 10:30:00 AM");
```

## Test inactivity monitoring

Inactivity monitoring is a common feature in web applications that logs out users after a period of inactivity.
Testing this feature can be tricky because you need to wait for a long time to see the effect.
With the help of the clock, you can speed up time and test this feature quickly.

```html
<div id="remaining-time" data-testid="remaining-time"></div>
<script>
  const endTime = Date.now() + 5 * 60_000;
  const renderTime = () => {
    const diffInSeconds = Math.round((endTime - Date.now()) / 1000);
    if (diffInSeconds <= 0) {
      document.getElementById('remaining-time').textContent =
        'You have been logged out due to inactivity.';
    } else {
      document.getElementById('remaining-time').textContent =
        `You will be logged out in ${diffInSeconds} seconds.`;
    }
    setTimeout(renderTime, 1000);
  };
  renderTime();
</script>
<button type="button">Interaction</button>
```

```js
// Initial time does not matter for the test, so we can pick current time.
await page.clock.install();
await page.goto('http://localhost:3333');
// Interact with the page
await page.getByRole('button').click();

// Fast forward time 5 minutes as if the user did not do anything.
// Fast forward is like closing the laptop lid and opening it after 5 minutes.
// All the timers due will fire once immediately, as in the real browser.
await page.clock.fastForward('05:00');

// Check that the user was logged out automatically.
await expect(page.getByText('You have been logged out due to inactivity.')).toBeVisible();
```

```python async
# Initial time does not matter for the test, so we can pick current time.
await page.clock.install()
await page.goto("http://localhost:3333")
# Interact with the page
await page.get_by_role("button").click()

# Fast forward time 5 minutes as if the user did not do anything.
# Fast forward is like closing the laptop lid and opening it after 5 minutes.
# All the timers due will fire once immediately, as in the real browser.
await page.clock.fast_forward("05:00")

# Check that the user was logged out automatically.
await expect(page.getByText("You have been logged out due to inactivity.")).toBeVisible()
```

```python sync
# Initial time does not matter for the test, so we can pick current time.
page.clock.install()
page.goto("http://localhost:3333")
# Interact with the page
page.get_by_role("button").click()

# Fast forward time 5 minutes as if the user did not do anything.
# Fast forward is like closing the laptop lid and opening it after 5 minutes.
# All the timers due will fire once immediately, as in the real browser.
page.clock.fast_forward("05:00")

# Check that the user was logged out automatically.
expect(page.get_by_text("You have been logged out due to inactivity.")).to_be_visible()
```

```java
// Initial time does not matter for the test, so we can pick current time.
page.clock().install();
page.navigate("http://localhost:3333");
Locator locator = page.getByRole("button");

// Interact with the page
locator.click();

// Fast forward time 5 minutes as if the user did not do anything.
// Fast forward is like closing the laptop lid and opening it after 5 minutes.
// All the timers due will fire once immediately, as in the real browser.
page.clock().fastForward("05:00");

// Check that the user was logged out automatically.
assertThat(page.getByText("You have been logged out due to inactivity.")).isVisible();
```

```csharp
// Initial time does not matter for the test, so we can pick current time.
await Page.Clock.InstallAsync();
await page.GotoAsync("http://localhost:3333");

// Interact with the page
await page.GetByRole("button").ClickAsync();

// Fast forward time 5 minutes as if the user did not do anything.
// Fast forward is like closing the laptop lid and opening it after 5 minutes.
// All the timers due will fire once immediately, as in the real browser.
await Page.Clock.FastForwardAsync("05:00");

// Check that the user was logged out automatically.
await Expect(Page.GetByText("You have been logged out due to inactivity.")).ToBeVisibleAsync();
```

## Tick through time manually, firing all the timers consistently

In rare cases, you may want to tick through time manually, firing all timers and
animation frames in the process to achieve a fine-grained control over the passage of time.

```html
<div id="current-time" data-testid="current-time"></div>
<script>
  const renderTime = () => {
    document.getElementById('current-time').textContent =
        new Date().toLocaleString();
  };
  setInterval(renderTime, 1000);
</script>
```

```js
// Initialize clock with a specific time, let the page load naturally.
await page.clock.install({ time: new Date('2024-02-02T08:00:00') });
await page.goto('http://localhost:3333');

// Pause the time flow, stop the timers, you now have manual control
// over the page time.
await page.clock.pauseAt(new Date('2024-02-02T10:00:00'));
await expect(page.getByTestId('current-time')).toHaveText('2/2/2024, 10:00:00 AM');

// Tick through time manually, firing all timers in the process.
// In this case, time will be updated in the screen 2 times.
await page.clock.runFor(2000);
await expect(page.getByTestId('current-time')).toHaveText('2/2/2024, 10:00:02 AM');
```

```python async
# Initialize clock with a specific time, let the page load naturally.
await page.clock.install(time=
    datetime.datetime(2024, 2, 2, 8, 0, 0, tzinfo=datetime.timezone.pst),
)
await page.goto("http://localhost:3333")
locator = page.get_by_test_id("current-time")

# Pause the time flow, stop the timers, you now have manual control
# over the page time.
await page.clock.pause_at(datetime.datetime(2024, 2, 2, 10, 0, 0))
await expect(locator).to_have_text("2/2/2024, 10:00:00 AM")

# Tick through time manually, firing all timers in the process.
# In this case, time will be updated in the screen 2 times.
await page.clock.run_for(2000)
await expect(locator).to_have_text("2/2/2024, 10:00:02 AM")
```

```python sync
# Initialize clock with a specific time, let the page load naturally.
page.clock.install(
    time=datetime.datetime(2024, 2, 2, 8, 0, 0, tzinfo=datetime.timezone.pst),
)
page.goto("http://localhost:3333")
locator = page.get_by_test_id("current-time")

# Pause the time flow, stop the timers, you now have manual control
# over the page time.
page.clock.pause_at(datetime.datetime(2024, 2, 2, 10, 0, 0))
expect(locator).to_have_text("2/2/2024, 10:00:00 AM")

# Tick through time manually, firing all timers in the process.
# In this case, time will be updated in the screen 2 times.
page.clock.run_for(2000)
expect(locator).to_have_text("2/2/2024, 10:00:02 AM")
```

```java
SimpleDateFormat format = new SimpleDateFormat("yyy-MM-dd'T'HH:mm:ss");
// Initialize clock with a specific time, let the page load naturally.
page.clock().install(new Clock.InstallOptions()
    .setTime(format.parse("2024-02-02T08:00:00")));
page.navigate("http://localhost:3333");
Locator locator = page.getByTestId("current-time");

// Pause the time flow, stop the timers, you now have manual control
// over the page time.
page.clock().pauseAt(format.parse("2024-02-02T10:00:00"));
assertThat(locator).hasText("2/2/2024, 10:00:00 AM");

// Tick through time manually, firing all timers in the process.
// In this case, time will be updated in the screen 2 times.
page.clock().runFor(2000);
assertThat(locator).hasText("2/2/2024, 10:00:02 AM");
```

```csharp
// Initialize clock with a specific time, let the page load naturally.
await Page.Clock.InstallAsync(new()
{
  TimeDate = new DateTime(2024, 2, 2, 8, 0, 0, DateTimeKind.Pst)
});
await page.GotoAsync("http://localhost:3333");
var locator = page.GetByTestId("current-time");

// Pause the time flow, stop the timers, you now have manual control
// over the page time.
await Page.Clock.PauseAtAsync(new DateTime(2024, 2, 2, 10, 0, 0));
await Expect(locator).ToHaveTextAsync("2/2/2024, 10:00:00 AM");

// Tick through time manually, firing all timers in the process.
// In this case, time will be updated in the screen 2 times.
await Page.Clock.RunForAsync(2000);
await Expect(locator).ToHaveTextAsync("2/2/2024, 10:00:02 AM");
```

## Related Videos

<LiteYouTube
  id="54_aC-rVKHg"
  title="Playwright 1.45"
/>



================================================
FILE: docs/src/codegen-intro.md
================================================
---
id: codegen-intro
title: "Generating tests"
---

## Introduction

Playwright comes with the ability to generate tests out of the box and is a great way to quickly get started with testing. It will open two windows, a browser window where you interact with the website you wish to test and the Playwright Inspector window where you can record your tests, copy the tests, clear your tests as well as change the language of your tests.

**You will learn**

- [How to record a test](/codegen.md#recording-a-test)
- [How to generate locators](/codegen.md#generating-locators)

## Running Codegen

Use the `codegen` command to run the test generator followed by the URL of the website you want to generate tests for. The URL is optional and you can always run the command without it and then add the URL directly into the browser window instead.

```bash js
npx playwright codegen demo.playwright.dev/todomvc
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="codegen demo.playwright.dev/todomvc"
```

```bash python
playwright codegen demo.playwright.dev/todomvc
```

```bash csharp
pwsh bin/Debug/net8.0/playwright.ps1 codegen demo.playwright.dev/todomvc
```

### Recording a test

Run `codegen` and perform actions in the browser. Playwright will generate the code for the user interactions. `Codegen` will look at the rendered page and figure out the recommended locator, prioritizing role, text and test id locators. If the generator identifies multiple elements matching the locator, it will improve the locator to make it resilient and uniquely identify the target element, therefore eliminating and reducing test(s) failing and flaking due to locators.

With the test generator you can record:
* Actions like click or fill by simply interacting with the page
* Assertions by clicking on one of the icons in the toolbar and then clicking on an element on the page to assert against. You can choose:
  * `'assert visibility'` to assert that an element is visible
  * `'assert text'` to assert that an element contains specific text
  * `'assert value'` to assert that an element has a specific value

######
* langs: js

![Recording a test](https://github.com/microsoft/playwright/assets/13063165/34a79ea1-639e-4cb3-8115-bfdc78e3d34d)

######
* langs: java

![recording a test](https://github.com/microsoft/playwright/assets/13063165/ec9c4071-4af8-4ae7-8b36-aebcc29bdbbb)

######
* langs: python

![recording a test](https://github.com/microsoft/playwright/assets/13063165/9751b609-6e4c-486b-a961-f86f177b1d58)

######
* langs: csharp

![recording a test](https://github.com/microsoft/playwright/assets/13063165/53bdfb6f-d462-4ce0-ab95-0619faaebf1e)

######
* langs: js, java, python, csharp

When you have finished interacting with the page, press the `'record'` button to stop the recording and use the `'copy'` button to copy the generated code to your editor.

Use the `'clear'` button to clear the code to start recording again. Once finished close the Playwright inspector window or stop the terminal command.

To learn more about generating tests check out or detailed guide on [Codegen](./codegen.md).

### Generating locators

You can generate [locators](/locators.md) with the test generator.

* Press the `'Record'` button to stop the recording and the `'Pick Locator'` button will appear.
* Click on the `'Pick Locator'` button and then hover over elements in the browser window to see the locator highlighted underneath each element.
* To choose a locator click on the element you would like to locate and the code for that locator will appear in the locator playground next to the Pick Locator button.
* You can then edit the locator in the locator playground to fine tune it and see the matching element highlighted in the browser window. 
* Use the copy button to copy the locator and paste it into your code.

######
* langs: js

![picking a locator](https://github.com/microsoft/playwright/assets/13063165/2c8a12e2-4e98-4fdd-af92-1d73ae696d86)

######
* langs: java

![picking a locator](https://github.com/microsoft/playwright/assets/13063165/733b48fd-5edf-4150-93f0-018adc52b6ff)

######
* langs: python

![picking a locator](https://github.com/microsoft/playwright/assets/13063165/95d11f48-96a4-46b9-9c2a-63c3aa4fdce7)

######
* langs: csharp

![picking a locator](https://github.com/microsoft/playwright/assets/13063165/1478f56f-422f-4276-9696-0674041f11dc)

### Emulation

You can also generate tests using emulation so as to generate a test for a specific viewport, device, color scheme, as well as emulate the geolocation, language or timezone. The test generator can also generate a test while preserving authenticated state. Check out the [Test Generator](./codegen.md#emulation) guide to learn more.

## What's Next

- [See a trace of your tests](./trace-viewer-intro.md)



================================================
FILE: docs/src/codegen.md
================================================
---
id: codegen
title: "Test generator"
---

import LiteYouTube from '@site/src/components/LiteYouTube';

## Introduction

Playwright comes with the ability to generate tests for you as you perform actions in the browser and is a great way to quickly get started with testing. Playwright will look at your page and figure out the best locator, prioritizing [role, text and test id locators](./locators.md). If the generator finds multiple elements matching the locator, it will improve the locator to make it resilient that uniquely identify the target element.

## Generate tests in VS Code
* langs: js

Install the VS Code extension and generate tests directly from VS Code. The extension is available on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright). Check out our guide on [getting started with VS Code](./getting-started-vscode.md).

<LiteYouTube
    id="LM4yqrOzmFE"
    title="Generating Playwright tests in VS Code"
/>

### Record a New Test

To record a test click on the **Record new** button from the Testing sidebar. This will create a `test-1.spec.ts` file as well as open up a browser window.

<img width="1385" alt="record new in vs code" src="https://user-images.githubusercontent.com/13063165/220961665-615d0ab8-3f0b-439c-ad0b-0424d9aa154b.png" />

In the browser go to the URL you wish to test and start clicking around to record your user actions.

![generating user actions](https://github.com/microsoft/playwright/assets/13063165/1d4c8f37-8325-4816-a665-d0e95e63f509)

Playwright will record your actions and generate the test code directly in VS Code. You can also generate assertions by choosing one of the icons in the toolbar and then clicking on an element on the page to assert against. The following assertions can be generated:
  * `'assert visibility'` to assert that an element is visible
  * `'assert text'` to assert that an element contains specific text
  * `'assert value'` to assert that an element has a specific value

![generating assertions](https://github.com/microsoft/playwright/assets/13063165/d131eb35-b2ca-4bf4-a8ac-88b6e40dcf07)

Once you are done recording click the **cancel** button or close the browser window. You can then inspect your `test-1.spec.ts` file and manually improve it if needed.

![code from a generated test](https://github.com/microsoft/playwright/assets/13063165/2ba4c212-4713-460a-b054-6dc6b67a9a7c)

### Record at Cursor

To record from a specific point in your test move your cursor to where you want to record more actions and then click the **Record at cursor** button from the Testing sidebar. If your browser window is not already open then first run the test with 'Show browser' checked and then click the **Record at cursor** button.


![record at cursor in vs code](https://github.com/microsoft/playwright/assets/13063165/77948ab8-92a2-435f-9833-0944da5ae664)

In the browser window start performing the actions you want to record.

<img width="1394" alt="add feed the dog to todo app" src="https://user-images.githubusercontent.com/13063165/220960770-6435cec7-1723-42a8-8c1f-8244e2d800c7.png" />


In the test file in VS Code you will see your new generated actions added to your test at the cursor position.

![code from a generated test](https://github.com/microsoft/playwright/assets/13063165/4f4bb34e-9cda-41fe-bf65-8d8016d84c7f)

### Generating locators

You can generate locators with the test generator.
- Click on the **Pick locator** button form the testing sidebar and then hover over elements in the browser window to see the [locator](./locators.md) highlighted underneath each element.
- Click the element you require and it will now show up in the **Pick locator** box in VS Code.
- Press <kbd>Enter</kbd> on your keyboard to copy the locator into the clipboard and then paste anywhere in your code. Or press 'escape' if you want to cancel.

<img width="1641" alt="Pick locators in VS code" src="https://user-images.githubusercontent.com/13063165/220958368-95b03620-3c9b-40a8-be74-01c96ba03cad.png" />

## Generate tests with the Playwright Inspector

When running the `codegen` command two windows will be opened, a browser window where you interact with the website you wish to test and the Playwright Inspector window where you can record your tests and then copy them into your editor.

### Running Codegen

Use the `codegen` command to run the test generator followed by the URL of the website you want to generate tests for. The URL is optional and you can always run the command without it and then add the URL directly into the browser window instead.

```bash js
npx playwright codegen demo.playwright.dev/todomvc
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="codegen demo.playwright.dev/todomvc"
```

```bash python
playwright codegen demo.playwright.dev/todomvc
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 codegen demo.playwright.dev/todomvc
```

### Recording a test

Run the `codegen` command and perform actions in the browser window. Playwright will generate the code for the user interactions which you can see in the Playwright Inspector window. Once you have finished recording your test stop the recording and press the **copy** button to copy your generated test into your editor.

With the test generator you can record:
* Actions like click or fill by simply interacting with the page
* Assertions by clicking on one of the icons in the toolbar and then clicking on an element on the page to assert against. You can choose:
  * `'assert visibility'` to assert that an element is visible
  * `'assert text'` to assert that an element contains specific text
  * `'assert value'` to assert that an element has a specific value

######
* langs: js

![Recording a test](https://github.com/microsoft/playwright/assets/13063165/34a79ea1-639e-4cb3-8115-bfdc78e3d34d)

######
* langs: java

![recording a test](https://github.com/microsoft/playwright/assets/13063165/ec9c4071-4af8-4ae7-8b36-aebcc29bdbbb)

######
* langs: python

![recording a test](https://github.com/microsoft/playwright/assets/13063165/9751b609-6e4c-486b-a961-f86f177b1d58)

######
* langs: csharp

![recording a test](https://github.com/microsoft/playwright/assets/13063165/53bdfb6f-d462-4ce0-ab95-0619faaebf1e)

######
* langs: js, java, python, csharp

When you have finished interacting with the page, press the **record** button to stop the recording and use the **copy** button to copy the generated code to your editor.

Use the **clear** button to clear the code to start recording again. Once finished, close the Playwright inspector window or stop the terminal command.

### Generating locators
You can generate [locators](/locators.md) with the test generator.

* Press the `'Record'` button to stop the recording and the `'Pick Locator'` button will appear.
* Click on the `'Pick Locator'` button and then hover over elements in the browser window to see the locator highlighted underneath each element.
* To choose a locator, click on the element you would like to locate and the code for that locator will appear in the field next to the Pick Locator button.
* You can then edit the locator in this field to fine tune it or use the copy button to copy it and paste it into your code.

######
* langs: js

![picking a locator](https://github.com/microsoft/playwright/assets/13063165/2c8a12e2-4e98-4fdd-af92-1d73ae696d86)

######
* langs: java

![picking a locator](https://github.com/microsoft/playwright/assets/13063165/733b48fd-5edf-4150-93f0-018adc52b6ff)

######
* langs: python

![picking a locator](https://github.com/microsoft/playwright/assets/13063165/95d11f48-96a4-46b9-9c2a-63c3aa4fdce7)

######
* langs: csharp

![picking a locator](https://github.com/microsoft/playwright/assets/13063165/1478f56f-422f-4276-9696-0674041f11dc)

## Emulation

You can use the test generator to generate tests using emulation so as to generate a test for a specific viewport, device, color scheme, as well as emulate the geolocation, language or timezone. The test generator can also generate a test while preserving authenticated state.

### Emulate viewport size

Playwright opens a browser window with its viewport set to a specific width and height and is not responsive as tests need to be run under the same conditions. Use the `--viewport` option to generate tests with a different viewport size.

```bash js
npx playwright codegen --viewport-size="800,600" playwright.dev
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="codegen --viewport-size='800,600' playwright.dev"
```

```bash python
playwright codegen --viewport-size="800,600" playwright.dev
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 codegen --viewport-size="800,600" playwright.dev
```
######
* langs: js

<img width="870" alt="Codegen generating code for tests for playwright.dev website with a specific viewport js" src="https://user-images.githubusercontent.com/13063165/220402029-f90d1c9f-d740-4c0f-acc8-95235ee83f85.png" />

######
* langs: java

<img width="870" alt="Codegen generating code for tests for playwright.dev website with a specific viewport java" src="https://user-images.githubusercontent.com/13063165/220402748-12a856c2-b3ff-4155-b82d-64dad9c46886.png" />

######
* langs: python

<img width="870" alt="Codegen generating code for tests for playwright.dev website with a specific viewport python" src="https://user-images.githubusercontent.com/13063165/220403118-7704b708-dea3-44b3-97a4-04c2b9d1d0fa.png" />

######
* langs: csharp

<img width="870" alt="Codegen generating code for tests for playwright.dev website with a specific viewport dotnet" src="https://user-images.githubusercontent.com/13063165/220403496-4a46a9a1-4bc4-43e7-8f22-9cc760ceadaf.png" />


### Emulate devices

Record scripts and tests while emulating a mobile device using the `--device` option which sets the viewport size and user agent among others.

```bash js
npx playwright codegen --device="iPhone 13" playwright.dev
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args='codegen --device="iPhone 13" playwright.dev'
```

```bash python
playwright codegen --device="iPhone 13" playwright.dev
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 codegen --device="iPhone 13" playwright.dev
```
######
* langs: js

<img width="1300" alt="Codegen generating code for tests for playwright.dev website emulated for iPhone 13 js" src="https://user-images.githubusercontent.com/13063165/220921482-dc4f5532-9dce-40bd-8a28-e0d87d26a601.png" />

######
* langs: java

<img width="1300" alt="Codegen generating code for tests for playwright.dev website emulated for iPhone 13 java" src="https://user-images.githubusercontent.com/13063165/220922591-241e6a59-a920-4cb1-97a2-d46c33ea17c5.png" />

######
* langs: python

<img width="1300" alt="Codegen generating code for tests for playwright.dev website emulated for iPhone 13 python" src="https://user-images.githubusercontent.com/13063165/220922790-5c5a4d1a-e27d-4c9b-90ac-13cf9c925706.png" />

######
* langs: csharp

<img width="1300" alt="Codegen generating code for tests for playwright.dev website emulated for iPhone 13 csharp" src="https://user-images.githubusercontent.com/13063165/220923048-f13583b1-ab08-4702-ab74-58691d50acfe.png" />


### Emulate color scheme

Record scripts and tests while emulating the color scheme with the `--color-scheme` option.

```bash js
npx playwright codegen --color-scheme=dark playwright.dev
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="codegen --color-scheme=dark playwright.dev"
```

```bash python
playwright codegen --color-scheme=dark playwright.dev
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 codegen --color-scheme=dark playwright.dev
```

######
* langs: js

<img width="1394" alt="Codegen generating code for tests for playwright.dev website in dark mode js" src="https://user-images.githubusercontent.com/13063165/220930273-f3a25bae-64dd-4bbb-99ed-1e97c0cb1ebf.png" />

######
* langs: java

<img width="1394" alt="Codegen generating code for tests for playwright.dev website in dark mode java" src="https://user-images.githubusercontent.com/13063165/220930514-3b105fab-c87e-4f58-affa-d11d570122a8.png" />

######
* langs: python

<img width="1394" alt="Codegen generating code for tests for playwright.dev website in dark mode python" src="https://user-images.githubusercontent.com/13063165/220930714-737647fd-ae99-4dd3-b7a4-4f3eb4fe712d.png" />

######
* langs: csharp

<img width="1394" alt="Codegen generating code for tests for playwright.dev website in dark mode csharp" src="https://user-images.githubusercontent.com/13063165/220930893-c1d0df65-c662-4b33-91eb-ea10552d7cc5.png" />

### Emulate geolocation, language and timezone

Record scripts and tests while emulating timezone, language & location using the `--timezone`, `--geolocation` and `--lang` options. Once the page opens:

1. Accept the cookies
1. On the top right, click on the locate me button to see geolocation in action.

```bash js
npx playwright codegen --timezone="Europe/Rome" --geolocation="41.890221,12.492348" --lang="it-IT" bing.com/maps
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args='codegen --timezone="Europe/Rome" --geolocation="41.890221,12.492348" --lang="it-IT" bing.com/maps'
```

```bash python
playwright codegen --timezone="Europe/Rome" --geolocation="41.890221,12.492348" --lang="it-IT" bing.com/maps
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 codegen --timezone="Europe/Rome" --geolocation="41.890221,12.492348" --lang="it-IT" bing.com/maps
```

######
* langs: js

<img width="1394" alt="Codegen generating code for tests for bing maps showing timezone, geolocation as Rome, Italy and in Italian language" src="https://user-images.githubusercontent.com/13063165/220931996-d3144421-8d3b-4f9f-896c-769c01566c01.png" />

######
* langs: java

<img width="1394" alt="Codegen generating code for tests for bing maps showing timezone, geolocation as Rome, Italy and in Italian language java" src="https://user-images.githubusercontent.com/13063165/220932268-9012163f-7673-4072-aa91-13b3c8f57799.png" />

######
* langs: python

<img width="1394" alt="Codegen generating code for tests for bing maps showing timezone, geolocation as Rome, Italy and in Italian language python" src="https://user-images.githubusercontent.com/13063165/220932413-f2943956-dd38-4560-94b9-51968076210d.png" />


######
* langs: csharp

<img width="1394" alt="Codegen generating code for tests for bing maps showing timezone, geolocation as Rome, Italy and in Italian language csharp" src="https://user-images.githubusercontent.com/13063165/220932688-a47df2a8-332b-47a4-9580-7d351def9f50.png" />

### Preserve authenticated state

Run `codegen` with `--save-storage` to save [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies), [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) and [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) data at the end of the session. This is useful to separately record an authentication step and reuse it later when recording more tests.

```bash js
npx playwright codegen github.com/microsoft/playwright --save-storage=auth.json
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="codegen github.com/microsoft/playwright  --save-storage=auth.json"
```

```bash python
playwright codegen github.com/microsoft/playwright --save-storage=auth.json
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 codegen github.com/microsoft/playwright --save-storage=auth.json
```

######
* langs: js

<img width="1394" alt="github page before logging in js" src="https://user-images.githubusercontent.com/13063165/220929062-88dfe567-0c6d-4e49-b9f9-74ae241fb8c7.png" />


######
* langs: java

<img width="1394" alt="github page before logging in java" src="https://user-images.githubusercontent.com/13063165/220929236-08129e16-82a9-46a3-9f1c-3e59619c6289.png" />


######
* langs: python

<img width="1394" alt="github page before logging in python" src="https://user-images.githubusercontent.com/13063165/220929429-8756ec49-fbf2-46e0-8f41-d25f5f5a6623.png" />

######
* langs: csharp

<img width="1394" alt="github page before logging in csharp" src="https://user-images.githubusercontent.com/13063165/220929619-28d4ed0c-d172-4cf1-b30b-bf5bed0e07bf.png" />

#### Login

After performing authentication and closing the browser, `auth.json` will contain the storage state which you can then reuse in your tests.

<img width="1394" alt="login to GitHub screen" src="https://user-images.githubusercontent.com/13063165/220561688-04b2b984-4ba6-4446-8b0a-8058876e2a02.png" />

Make sure you only use the `auth.json` locally as it contains sensitive information. Add it to your `.gitignore` or delete it once you have finished generating your tests.

#### Load authenticated state

Run with `--load-storage` to consume the previously loaded storage from the `auth.json`. This way, all [cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies), [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) and [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) data will be restored, bringing most web apps to the authenticated state without the need to login again. This means you can continue generating tests from the logged in state.

```bash js
npx playwright codegen --load-storage=auth.json github.com/microsoft/playwright
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="codegen --load-storage=auth.json github.com/microsoft/playwright"
```

```bash python
playwright codegen --load-storage=auth.json github.com/microsoft/playwright
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 codegen --load-storage=auth.json github.com/microsoft/playwright
```

######
* langs: js

<img width="1394" alt="github signed in showing use of load storage js" src="https://user-images.githubusercontent.com/13063165/220927873-9e55fdda-2def-45c1-9a1b-bcc851885f96.png" />


######
* langs: java

<img width="1394" alt="github signed in showing use of load storage java" src="https://user-images.githubusercontent.com/13063165/220928075-1e38347b-9d0d-4d9e-9a67-506c717893df.png" />

######
* langs: python

<img width="1394" alt="github signed in showing use of load storage python" src="https://user-images.githubusercontent.com/13063165/220928211-ca1d4dc9-9966-414e-ab23-a3ef1d2d5ed9.png" />

######
* langs: csharp

<img width="1394" alt="github signed in showing use of load storage scharp" src="https://user-images.githubusercontent.com/13063165/220928354-caa0e958-fe09-4125-9b54-67483064da51.png" />

#### Use existing userDataDir

Run `codegen` with `--user-data-dir` to set a fixed [user data directory](https://playwright.dev/docs/api/class-browsertype#browser-type-launch-persistent-context-option-user-data-dir) for the browser session. If you create a custom browser user data directory, codegen will use this existing browser profile and have access to any authentication state present in that profile.

:::warning
[As of Chrome 136, the default user data directory cannot be accessed via automated tooling](https://developer.chrome.com/blog/remote-debugging-port), such as Playwright. You must create a separate user data directory for use in testing.
:::

```bash js
npx playwright codegen --user-data-dir=/path/to/your/browser/data/ github.com/microsoft/playwright
```

```bash java
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="codegen --user-data-dir=/path/to/your/browser/data/ github.com/microsoft/playwright"
```

```bash python
playwright codegen --user-data-dir=/path/to/your/browser/data/ github.com/microsoft/playwright
```

```bash csharp
pwsh bin/Debug/netX/playwright.ps1 codegen --user-data-dir=/path/to/your/browser/data/ github.com/microsoft/playwright
```

## Record using custom setup

If you would like to use codegen in some non-standard setup (for example, use [`method: BrowserContext.route`]), it is possible to call [`method: Page.pause`] that will open a separate window with codegen controls.

```js
const { chromium } = require('@playwright/test');

(async () => {
  // Make sure to run headed.
  const browser = await chromium.launch({ headless: false });

  // Setup context however you like.
  const context = await browser.newContext({ /* pass any options */ });
  await context.route('**/*', route => route.continue());

  // Pause the page, and start recording manually.
  const page = await context.newPage();
  await page.pause();
})();
```

```java
import com.microsoft.playwright.*;

public class Example {
  public static void main(String[] args) {
    try (Playwright playwright = Playwright.create()) {
      BrowserType chromium = playwright.chromium();
      // Make sure to run headed.
      Browser browser = chromium.launch(new BrowserType.LaunchOptions().setHeadless(false));
      // Setup context however you like.
      BrowserContext context = browser.newContext(/* pass any options */);
      context.route("**/*", route -> route.resume());
      // Pause the page, and start recording manually.
      Page page = context.newPage();
      page.pause();
    }
  }
}
```

```python async
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        # Make sure to run headed.
        browser = await p.chromium.launch(headless=False)

        # Setup context however you like.
        context = await browser.new_context() # Pass any options
        await context.route('**/*', lambda route: route.continue_())

        # Pause the page, and start recording manually.
        page = await context.new_page()
        await page.pause()

asyncio.run(main())
```

```python sync
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    # Make sure to run headed.
    browser = p.chromium.launch(headless=False)

    # Setup context however you like.
    context = browser.new_context() # Pass any options
    context.route('**/*', lambda route: route.continue_())

    # Pause the page, and start recording manually.
    page = context.new_page()
    page.pause()
```

```csharp
using Microsoft.Playwright;

using var playwright = await Playwright.CreateAsync();
var chromium = playwright.Chromium;
// Make sure to run headed.
var browser = await chromium.LaunchAsync(new() { Headless = false });

// Setup context however you like.
var context = await browser.NewContextAsync(); // Pass any options
await context.RouteAsync("**/*", route => route.ContinueAsync());

// Pause the page, and start recording manually.
var page = await context.NewPageAsync();
await page.PauseAsync();
```



================================================
FILE: docs/src/debug.md
================================================
---
id: debug
title: "Debugging Tests"
---

## VS Code debugger
* langs: js

We recommend using the [VS Code Extension](./getting-started-vscode.md) for debugging for a better developer experience. With the VS Code extension you can debug your tests right in VS Code, see error messages, set breakpoints and step through your tests.

<img width="1269" alt="running test in debug mode" src="https://user-images.githubusercontent.com/13063165/212740233-3f278825-13e7-4a88-a118-dd4478d43a16.png" />

### Error Messages

If your test fails VS Code will show you error messages right in the editor showing what was expected, what was received as well as a complete call log.

<img width="1269" alt="error messaging in vs code" src="https://user-images.githubusercontent.com/13063165/212738654-b573b7c9-05be-476f-ab4c-201bf4265bc0.png" />

### Live Debugging

You can debug your test live in VS Code. After running a test with the `Show Browser` option checked, click on any of the locators in VS Code and it will be highlighted in the Browser window. Playwright will also show you if there are multiple matches.

<img width="1394" alt="live debugging in VS Code" src="https://user-images.githubusercontent.com/13063165/212884329-0755b007-0d69-4987-b084-38fd5bfb577d.png" />

You can also edit the locators in VS Code and Playwright will show you the changes live in the browser window.

<img width="1394" alt="live debugging in VS Code" src="https://user-images.githubusercontent.com/13063165/212884772-5022d4b1-6fab-456f-88e3-506f2354e238.png" />

### Picking a Locator

Pick a [locator](./locators.md) and copy it into your test file by clicking the **Pick locator** button form the testing sidebar. Then in the browser click the element you require and it will now show up in the **Pick locator** box in VS Code. Press 'enter' on your keyboard to copy the locator into the clipboard and then paste anywhere in your code. Or press 'escape' if you want to cancel.

<img width="1394" alt="Pick locators" src="https://user-images.githubusercontent.com/13063165/212741666-6479a702-2517-44a3-9eca-e719e13b379c.png" />

Playwright will look at your page and figure out the best locator, prioritizing [role, text and test id locators](./locators.md). If Playwright finds multiple elements matching the locator, it will improve the locator to make it resilient and uniquely identify the target element, so you don't have to worry about failing tests due to locators.

### Run in Debug Mode

To set a breakpoint click next to the line number where you want the breakpoint to be until a red dot appears. Run the tests in debug mode by right clicking on the line next to the test you want to run.

<img width="1269" alt="setting debug test mode" src="https://user-images.githubusercontent.com/13063165/212739847-ecb7dcfe-8929-45f3-b24e-f9c4b592f430.png" />

A browser window will open and the test will run and pause at where the breakpoint is set. You can step through the tests, pause the test and rerun the tests from the menu in VS Code.

<img width="1269" alt="running test in debug mode" src="https://user-images.githubusercontent.com/13063165/212740233-3f278825-13e7-4a88-a118-dd4478d43a16.png" />

### Debug Tests Using Chrome DevTools

Instead of using `Debug Test`, choose `Run Test` in VS Code. With `Show Browser` enabled, the browser session is reused, letting you open Chrome DevTools for continuous debugging of your tests and the web application.

### Debug in different Browsers

By default, debugging is done using the Chromium profile. You can debug your tests on different browsers by right clicking on the debug icon in the testing sidebar and clicking on the 'Select Default Profile' option from the dropdown.

<img width="1312" alt="debugging on specific profile" src="https://user-images.githubusercontent.com/13063165/212879469-436f8130-c62a-49e1-9d67-c1903b478d5f.png" />

Then choose the test profile you would like to use for debugging your tests. Each time you run your test in debug mode it will use the profile you selected. You can run tests in debug mode by right clicking the line number where your test is and selecting 'Debug Test' from the menu.

<img width="1312" alt="choosing a profile for debugging" src="https://user-images.githubusercontent.com/13063165/212880198-eac22c3e-68ce-47da-9163-d6b376ae7575.png" />

To learn more about debugging, see [Debugging in Visual Studio Code](https://code.visualstudio.com/docs/editor/debugging).


## Playwright Inspector

The Playwright Inspector is a GUI tool to help you debug your Playwright tests. It allows you to step through your tests, live edit locators, pick locators and see actionability logs.

<img width="864" alt="Playwright Inspector" src="https://user-images.githubusercontent.com/13063165/212924587-4b84e5f6-b147-40e9-8c75-d7b9ab6b7ca1.png" />

### Run in debug mode
* langs: js

Run your tests with the `--debug` flag to open the inspector. This configures Playwright for debugging and opens the inspector. Additional useful defaults are configured when `--debug` is used:

- Browsers launch in headed mode
- Default timeout is set to 0 (= no timeout)

#### Debug all tests on all browsers

To debug all tests run the test command with the `--debug` flag. This will run tests one by one, and open the inspector and a browser window for each test.

```bash
npx playwright test --debug
```
#### Debug one test on all browsers

To debug one test on a specific line, run the test command followed by the name of the test file and the line number of the test you want to debug, followed by the `--debug` flag. This will run a single test in each browser configured in your [`playwright.config`](./test-projects.md#configure-projects-for-multiple-browsers) and open the inspector.

```bash
npx playwright test example.spec.ts:10 --debug
```
#### Debug on a specific browser

In Playwright you can configure projects in your [`playwright.config`](./test-projects.md#configure-projects-for-multiple-browsers). Once configured you can then debug your tests on a specific browser or mobile viewport using the `--project` flag followed by the name of the project configured in your `playwright.config`.

```bash
npx playwright test --project=chromium --debug
npx playwright test --project="Mobile Safari" --debug
npx playwright test --project="Microsoft Edge" --debug
```

#### Debug one test on a specific browser

To run one test on a specific browser add the name of the test file and the line number of the test you want to debug as well as the `--project` flag followed by the name of the project.

```bash
npx playwright test example.spec.ts:10 --project=webkit --debug
```
### Run in debug mode
* langs: csharp, java, python

Set the `PWDEBUG` environment variable to run your Playwright tests in debug mode. This
configures Playwright for debugging and opens the inspector. Additional useful defaults are configured when `PWDEBUG=1` is set:

- Browsers launch in headed mode
- Default timeout is set to 0 (= no timeout)

```bash tab=bash-bash lang=python
PWDEBUG=1 pytest -s
```

```batch tab=bash-batch lang=python
set PWDEBUG=1
pytest -s
```

```powershell tab=bash-powershell lang=python
$env:PWDEBUG=1
pytest -s
```

```bash tab=bash-bash lang=csharp
PWDEBUG=1 dotnet test
```

```batch tab=bash-batch lang=csharp
set PWDEBUG=1
dotnet test
```

```powershell tab=bash-powershell lang=csharp
$env:PWDEBUG=1
dotnet test
```

#### Configure source location
* langs: java

To tell Playwright where to look for the source code that you are debugging, pass
a list of the source directories via `PLAYWRIGHT_JAVA_SRC` environment variable. Paths in
the list should be separated by : on macOS and Linux, and by ; on Windows.

```bash tab=bash-bash lang=java
# Source directories in the list are separated by : on macos and linux and by ; on win.
PWDEBUG=1 PLAYWRIGHT_JAVA_SRC=<java source dirs> mvn test
```

```batch tab=bash-batch lang=java
# Source directories in the list are separated by : on macos and linux and by ; on win.
set PLAYWRIGHT_JAVA_SRC=<java source dirs>
set PWDEBUG=1
mvn test
```

```powershell tab=bash-powershell lang=java
# Source directories in the list are separated by : on macos and linux and by ; on win.
$env:PLAYWRIGHT_JAVA_SRC="<java source dirs>"
$env:PWDEBUG=1
mvn test
```

### Stepping through your tests

You can play, pause or step through each action of your test using the toolbar at the top of the Inspector. You can see the current action highlighted in the test code, and matching elements highlighted in the browser window.

<img width="1340" alt="Playwright Inspector and browser" src="https://user-images.githubusercontent.com/13063165/212936618-84b87acc-bc2e-46ed-994b-32b2ef742e60.png" />

### Run a test from a specific breakpoint

To speed up the debugging process you can add a [`method: Page.pause`] method to your test. This way you won't have to step through each action of your test to get to the point where you want to debug.

```js
await page.pause();
```

```java
page.pause();
```

```python async
await page.pause()
```

```python sync
page.pause()
```

```csharp
await page.PauseAsync();
```

Once you add a `page.pause()` call, run your tests in debug mode. Clicking the "Resume" button in the Inspector will run the test and only stop on the `page.pause()`.

<img width="1350" alt="test with page.pause" src="https://user-images.githubusercontent.com/13063165/219473050-122be4c2-31d0-4cbd-aa8b-8588e8b781a6.png" />

### Live editing locators

While running in debug mode you can live edit the locators. Next to the 'Pick Locator' button there is a field showing the [locator](./locators.md) that the test is paused on. You can edit this locator directly in the **Pick Locator** field, and matching elements will be highlighted in the browser window.

<img width="1348" alt="live editing locators" src="https://user-images.githubusercontent.com/13063165/212980815-1cf6ef7b-e69a-496c-898a-ec603a3bc562.png" />

### Picking locators

While debugging, you might need to choose a more resilient locator. You can do this by clicking on the **Pick Locator** button and hovering over any element in the browser window. While hovering over an element you will see the code needed to locate this element highlighted below. Clicking an element in the browser will add the locator into the field where you can then either tweak it or copy it into your code.

<img width="1392" alt="Picking locators" src="https://user-images.githubusercontent.com/13063165/212968640-ce82a027-9277-4bdf-b0a9-6282fb2becb7.png" />

Playwright will look at your page and figure out the best locator, prioritizing [role, text and test id locators](./locators.md). If Playwright finds multiple elements matching the locator, it will improve the locator to make it resilient and uniquely identify the target element, so you don't have to worry about failing tests due to locators.

### Actionability logs

By the time Playwright has paused on a click action, it has already performed [actionability checks](./actionability.md) that can be found in the log. This can help you understand what happened during your test and what Playwright did or tried to do. The log tells you if the element was visible, enabled and stable, if the locator resolved to an element, scrolled into view, and so much more. If actionability can't be reached, it will show the action as pending.

<img width="883" alt="Actionability Logs" src="https://user-images.githubusercontent.com/13063165/212968907-5dede739-e0e3-482a-91cd-726a0f5b0b6d.png" />

## Trace Viewer

Playwright [Trace Viewer](/trace-viewer.md) is a GUI tool that lets you explore recorded Playwright traces of your tests. You can go back and forward through each action on the left side, and visually see what was happening during the action. In the middle of the screen, you can see a DOM snapshot for t
