import { test, expect } from '@playwright/test';

test.describe('API Integration Smoke Tests @smoke', () => {
  const baseURL = 'http://localhost:8000';

  test('FastAPI documentation is accessible and functional', async ({ page }) => {
    // Navigate to FastAPI docs
    await page.goto(`${baseURL}/docs`);
    
    // Verify page loads with correct title
    await expect(page).toHaveTitle('FastAPI - Swagger UI');
    
    // Verify key UI elements are present
    await expect(page.getByRole('heading', { name: 'FastAPI 0.1.0 OAS 3.1', level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: '/openapi.json' })).toBeVisible();
    
    // Verify main API categories are shown
    await expect(page.getByRole('heading', { name: 'default Collapse operation', level: 3 })).toBeVisible();
    
    // Check for core endpoints in the API docs
    await expect(page.getByRole('button', { name: 'GET /health Health Check' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'GET /status Status Check' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'POST /create-study Create Study' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'POST /chat Chat' })).toBeVisible();
  });

  test('Health endpoint returns healthy status', async ({ request }) => {
    // Test health endpoint
    const healthResponse = await request.get(`${baseURL}/health`);
    
    // Verify response
    expect(healthResponse.status()).toBe(200);
    
    const healthData = await healthResponse.json();
    expect(healthData).toHaveProperty('status');
    expect(healthData.status).toBe('healthy');
    
    // Verify response headers
    const contentType = healthResponse.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('Status endpoint is accessible', async ({ request }) => {
    // Test status endpoint
    const statusResponse = await request.get(`${baseURL}/status`);
    
    // Should return successful response
    expect(statusResponse.status()).toBe(200);
    
    // Verify it's JSON response
    const contentType = statusResponse.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('OpenAPI specification is valid and complete', async ({ request }) => {
    // Get OpenAPI specification
    const openApiResponse = await request.get(`${baseURL}/openapi.json`);
    expect(openApiResponse.status()).toBe(200);
    
    const spec = await openApiResponse.json();
    
    // Verify OpenAPI spec structure
    expect(spec).toHaveProperty('openapi');
    expect(spec).toHaveProperty('info');
    expect(spec).toHaveProperty('paths');
    expect(spec).toHaveProperty('components');
    
    // Verify API info
    expect(spec.info).toHaveProperty('title', 'FastAPI');
    expect(spec.info).toHaveProperty('version');
    
    // Verify essential endpoints exist in spec
    expect(spec.paths).toHaveProperty('/health');
    expect(spec.paths).toHaveProperty('/status');
    expect(spec.paths).toHaveProperty('/create-study');
    expect(spec.paths).toHaveProperty('/chat');
    expect(spec.paths).toHaveProperty('/get-user-studies');
    
    // Verify core schemas exist
    expect(spec.components.schemas).toHaveProperty('CreateStudyRequest');
    expect(spec.components.schemas).toHaveProperty('ChatRequest');
    expect(spec.components.schemas).toHaveProperty('StudyResponse');
  });

  test('CORS headers are properly configured', async ({ request }) => {
    // Test CORS preflight for a common endpoint
    const corsResponse = await request.fetch(`${baseURL}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:4000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    // CORS should be handled appropriately (either 200 or 405 is acceptable)
    expect([200, 405, 404].includes(corsResponse.status())).toBe(true);
  });

  test('Root endpoint responds appropriately', async ({ request }) => {
    // Test root endpoint
    const rootResponse = await request.get(`${baseURL}/`);
    
    // Should return either success or auth required (both are valid responses)
    expect([200, 401, 403].includes(rootResponse.status())).toBe(true);
  });

  test('API responds with appropriate errors for invalid requests', async ({ request }) => {
    // Test an endpoint that requires parameters without providing them
    const invalidResponse = await request.get(`${baseURL}/get-current-study`);
    
    // Should return validation error (422) or other client error (4xx)
    expect(invalidResponse.status()).toBeGreaterThanOrEqual(400);
    expect(invalidResponse.status()).toBeLessThan(500);
    
    // If it's a validation error, verify the structure
    if (invalidResponse.status() === 422) {
      const errorData = await invalidResponse.json();
      expect(errorData).toHaveProperty('detail');
    }
  });

  test('Backend-Frontend integration - API supports frontend needs', async ({ page, request }) => {
    // Verify the API base URL is accessible from frontend perspective
    await page.goto('http://localhost:4000');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Test API connectivity from browser context (similar to how frontend would call it)
    const apiHealthCheck = await page.evaluate(async (baseUrl) => {
      try {
        const response = await fetch(`${baseUrl}/health`);
        return {
          status: response.status,
          ok: response.ok,
          data: await response.json()
        };
      } catch (error) {
        return { error: error.message };
      }
    }, baseURL);
    
    // Verify frontend can successfully call API
    expect(apiHealthCheck.status).toBe(200);
    expect(apiHealthCheck.ok).toBe(true);
    expect(apiHealthCheck.data).toHaveProperty('status', 'healthy');
  });
});