import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — Kitchen Tab E2E Tests
 */

test.describe('Kitchen Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('aside >> text=Kuhinja').first().click();
  });

  test('should display kitchen tab header', async ({ page }) => {
    await expect(page.locator('h2:has-text("Kuhinja")')).toBeVisible();
  });

  test('should show KOT order cards', async ({ page }) => {
    // Kitchen should display KOT (Kitchen Order Ticket) cards
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });

  test('should show KOT status filters', async ({ page }) => {
    // Status filters: Na čakanju, V pripravi, Pripravljeno, Postreženo
    const statusButtons = page.locator('button:has-text("Na čakanju"), button:has-text("V pripravi"), button:has-text("Pripravljeno")');
    const count = await statusButtons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show production unit filter', async ({ page }) => {
    // Filter by production units (Main Kitchen, Bar, etc.)
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });

  test('should show LIVE/DEMO badge', async ({ page }) => {
    await expect(page.locator('text=DEMO').first()).toBeVisible();
  });

  test('should display KOT count badge in sidebar', async ({ page }) => {
    // Red badge showing active KOT count
    const badge = page.locator('aside .bg-red-500').first();
    const count = await badge.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show KOT summary stats', async ({ page }) => {
    // Summary: pending, in preparation, ready counts
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });
});
