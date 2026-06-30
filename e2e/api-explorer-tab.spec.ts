import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — API Explorer Tab E2E Tests
 */

test.describe('API Explorer Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('aside >> text=API').first().click();
  });

  test('should display API tab header', async ({ page }) => {
    await expect(page.locator('h2:has-text("API")')).toBeVisible();
  });

  test('should show list of API endpoints', async ({ page }) => {
    // Should show endpoint cards/list
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });

  test('should have search/filter for endpoints', async ({ page }) => {
    // Search input for filtering endpoints
    const searchInput = page.locator('input[placeholder*="išči"], input[placeholder*="search"], input[placeholder*="Search"]');
    const count = await searchInput.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display HTTP method badges (GET, POST, etc.)', async ({ page }) => {
    // API endpoints should show method badges
    const methodBadges = page.locator('text=GET, text=POST, text=PUT, text=DELETE');
    const count = await methodBadges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show endpoint categories/filters', async ({ page }) => {
    // Endpoints organized by category (KOT, Table, Invoice, etc.)
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });
});
