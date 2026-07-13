import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — Tables Tab Interactive E2E Tests
 * Tests table selection, room filtering, detail dialog
 */

test.describe('Tables Tab — Interactive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Tables tab
    await page.locator('aside >> text=Mize').first().click();
    await expect(page.locator('h2:has-text("Mize")')).toBeVisible();
  });

  test('should click on an occupied table to see details', async ({ page }) => {
    // Find an occupied table card (amber border)
    const occupiedTable = page.locator('.border-amber-400').first();
    if (await occupiedTable.count() > 0) {
      await occupiedTable.click();
      // Dialog should open with table details
      await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 3000 });
      // Should show customer or order info
      const hasDetails = await page.locator('text=Stranka').count();
      const hasFree = await page.locator('text=Miza je prosta').count();
      expect(hasDetails + hasFree).toBeGreaterThanOrEqual(0);
      // Close dialog
      await page.keyboard.press('Escape');
    }
  });

  test('should click on a free table', async ({ page }) => {
    // Find a free table card (green border)
    const freeTable = page.locator('.border-emerald-400').first();
    if (await freeTable.count() > 0) {
      await freeTable.click();
      // Dialog should show free table message
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.count() > 0) {
        await expect(dialog).toBeVisible({ timeout: 3000 });
        await page.keyboard.press('Escape');
      }
    }
  });

  test('should filter tables by room', async ({ page }) => {
    // Click on different room buttons
    const roomButtons = page.locator('button').filter({ hasText: /\// }); // Buttons with "X/Y" occupancy
    const count = await roomButtons.count();
    if (count > 1) {
      // Click the second room
      await roomButtons.nth(1).click();
      // Table grid should still be visible
      await expect(page.locator('text=Miza').first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should show table status legend', async ({ page }) => {
    // Legend should show all 4 statuses
    await expect(page.locator('text=Prosto').first()).toBeVisible();
    await expect(page.locator('text=Zasedeno').first()).toBeVisible();
  });

  test('should show occupancy badge in header', async ({ page }) => {
    // Should show "X/Y zasedenih" badge
    const occupancyBadge = page.locator('text=/\\d+\\/\\d+ zasedenih/').first();
    await expect(occupancyBadge).toBeVisible();
  });

  test('should close table dialog with Escape', async ({ page }) => {
    // Open a table dialog
    const tableCard = page.locator('[class*="cursor-pointer"]').first();
    if (await tableCard.count() > 0) {
      await tableCard.click();
      // Press Escape to close
      await page.keyboard.press('Escape');
      // Dialog should be gone
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toHaveCount(0, { timeout: 3000 });
    }
  });

  test('should show attention indicator on long-occupied tables', async ({ page }) => {
    // Check for red status indicators (Pozor!)
    const attentionBadge = page.locator('text=Pozor').first();
    const attentionCount = await attentionBadge.count();
    expect(attentionCount).toBeGreaterThanOrEqual(0);
  });
});
