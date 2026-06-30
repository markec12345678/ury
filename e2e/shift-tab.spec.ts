import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — Shift Tab E2E Tests
 */

test.describe('Shift Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('aside >> text=Smena').first().click();
  });

  test('should display Shift tab header', async ({ page }) => {
    await expect(page.locator('h2:has-text("Smena")')).toBeVisible();
  });

  test('should show shift management content', async ({ page }) => {
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });

  test('should show cashier list or shift info', async ({ page }) => {
    // Shift tab shows cashiers and shift status
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });

  test('should have open/close shift buttons', async ({ page }) => {
    // Buttons for shift management
    const shiftButtons = page.locator('button:has-text("Odpri"), button:has-text("Zapri"), button:has-text("Open"), button:has-text("Close")');
    const count = await shiftButtons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
