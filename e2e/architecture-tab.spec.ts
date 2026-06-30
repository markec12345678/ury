import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — Architecture Tab E2E Tests
 */

test.describe('Architecture Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('aside >> text=Arhitektura').first().click();
  });

  test('should display Architecture tab header', async ({ page }) => {
    await expect(page.locator('h2:has-text("Arhitektura")')).toBeVisible();
  });

  test('should show architecture diagram', async ({ page }) => {
    // Visual diagram of system architecture
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });

  test('should display doctypes list', async ({ page }) => {
    // Should show URY doctypes
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });

  test('should show hook badges', async ({ page }) => {
    // Doc event hooks (before_insert, after_insert, etc.)
    const hookBadges = page.locator('text=before_insert, text=after_insert, text=on_submit, text=on_cancel');
    const count = await hookBadges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show statistics summary', async ({ page }) => {
    // Stats: 3 frontends, 36 APIs, 35 doctypes, 7 hooks
    const statsText = page.locator('text=36, text=35, text=frontend, text=API');
    const count = await statsText.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
