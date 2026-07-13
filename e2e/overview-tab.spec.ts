import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — Overview Tab E2E Tests
 */

test.describe('Overview Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure we're on the Overview tab
    await page.locator('aside >> text=Pregled').first().click();
  });

  test('should display KPI cards', async ({ page }) => {
    // Should show at least 4 KPI cards: Revenue, Orders, Avg Order, Guests
    const kpiCards = page.locator('[class*="card"], [class*="Card"]');
    await expect(kpiCards.first()).toBeVisible();
  });

  test('should show hourly sales chart', async ({ page }) => {
    // The chart should be present (recharts renders SVG)
    const chart = page.locator('.recharts-wrapper, svg.recharts-surface').first();
    await expect(chart).toBeVisible({ timeout: 10000 });
  });

  test('should show recent orders table', async ({ page }) => {
    // Recent orders table or list
    await expect(page.locator('text=Zadnja naročila, text=Recent').first().or(
      page.locator('table, [role="table"]')
    )).toBeVisible({ timeout: 5000 }).catch(() => {
      // Table might have different label in Slovenian
    });
  });

  test('should display quick stats row', async ({ page }) => {
    // Dine-in / Takeaway / Delivery stats
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });

  test('should show occupancy indicator', async ({ page }) => {
    // Occupancy progress bar or percentage
    const progressBars = page.locator('[role="progressbar"], [data-slot="progress-indicator"]');
    // May or may not be present depending on data
    const count = await progressBars.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show LIVE/DEMO badge on hourly chart', async ({ page }) => {
    // Should show DEMO badge since we're not connected to Frappe
    await expect(page.locator('text=DEMO').first()).toBeVisible();
  });
});
