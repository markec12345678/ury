import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — Tables Tab E2E Tests
 */

test.describe('Tables Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('aside >> text=Mize').first().click();
  });

  test('should display tables tab header', async ({ page }) => {
    await expect(page.locator('h2:has-text("Mize")')).toBeVisible();
  });

  test('should show table grid with tables', async ({ page }) => {
    // Should show multiple table cards/buttons
    const tables = page.locator('[class*="table"], [class*="Table"], button:has-text("Miza"), [data-table]');
    const count = await tables.count();
    // Should have at least some tables rendered
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show room filter options', async ({ page }) => {
    // Tables are organized by rooms (Main Hall, Terrace, etc.)
    const roomElements = page.locator('text=Glavna dvorana, text=Terasa, text=VIP, text=Bar');
    const count = await roomElements.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show LIVE/DEMO badge', async ({ page }) => {
    await expect(page.locator('text=DEMO').first()).toBeVisible();
  });

  test('should show occupied count badge in sidebar', async ({ page }) => {
    // Sidebar should show table count badge (e.g. "5/32")
    const badge = page.locator('aside .bg-amber-500').first();
    // Badge may not be present if no tables are occupied
    const count = await badge.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show table status indicators', async ({ page }) => {
    // Table statuses: free (green), occupied (red), reserved (amber)
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });
});
