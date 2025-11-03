# Symbiont E2E Tests

This directory contains end-to-end tests for the Symbiont application using Playwright.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

### All Tests
```bash
npm test
```

### Smoke Tests Only
```bash
npm run test:smoke
```

### With UI Mode
```bash
npm run test:ui
```

### Headed Mode (see browser)
```bash
npm run test:headed
```

### Specific Test File
```bash
npx playwright test smoke.spec.ts
```

## Test Structure

### Test Progression (Simple to Complex)

1. **Smoke Tests** (`smoke.spec.ts`) - @smoke
   - Basic health checks for frontend and backend
   - Page load verification
   - Console error detection
   - Basic authentication flow

2. **Authentication Tests** (`auth.spec.ts`)
   - Sign-in page navigation
   - Form validation
   - Protected route redirection

3. **API Tests** (`api.spec.ts`)
   - Backend API health checks
   - OpenAPI specification validation
   - CORS configuration
   - Error response handling

4. **Study Workflow Tests** (`study-workflow.spec.ts`)
   - Study creation flow
   - Resource upload functionality
   - Chat interface testing
   - LLM settings configuration

## Configuration

The tests are configured to:
- Start both backend (port 8000) and frontend (port 4000) automatically
- Use http://localhost:4000 as the base URL
- Run in multiple browsers (Chromium, Firefox, WebKit)
- Generate HTML reports
- Capture traces on retry

## Environment Requirements

- Backend: Python FastAPI server
- Frontend: Next.js application
- Node.js for running tests

## Backend Requirements

Make sure your backend has the following:
1. Environment file (`.env.development`) with required variables
2. Database services running (MongoDB, Qdrant, SuperTokens)
3. Start containers: `cd backend && ./start_containers.sh`

## Frontend Requirements

1. Dependencies installed: `cd frontend && bun install`
2. Environment variables configured

## Writing New Tests

### Test Patterns

1. **Defensive Testing**: Tests are written to handle different auth states and UI variations
2. **Flexible Selectors**: Use multiple selector strategies to find elements
3. **Graceful Degradation**: Tests continue even if specific features aren't available
4. **Error Handling**: Comprehensive error catching and reporting

### Helper Functions

Use the `AuthHelper` class for authentication-related operations:

```typescript
import { AuthHelper } from './helpers/auth';

test('authenticated flow', async ({ page }) => {
  const auth = new AuthHelper(page);
  await auth.signIn();
  
  if (await auth.isAuthenticated()) {
    // Proceed with authenticated test
  }
});
```

### Tags

Use tags to categorize tests:
- `@smoke` - Basic health checks
- `@auth` - Authentication related
- `@api` - Backend API tests
- `@workflow` - Complex user workflows

## Troubleshooting

### Common Issues

1. **Services not starting**: Ensure backend containers are running
2. **Port conflicts**: Check that ports 4000 and 8000 are available
3. **Authentication failures**: Verify SuperTokens configuration
4. **Timeouts**: Increase timeout values for slower environments

### Debug Mode

Run tests in debug mode:
```bash
npx playwright test --debug
```

### View Reports

```bash
npm run report
```

## CI/CD Integration

The tests are configured for CI with:
- Retry logic (2 retries on CI)
- Single worker on CI
- Fail-fast on `test.only`
- HTML and list reporters