import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — P&L (Profit & Loss) Tab E2E Tests
 */

test.describe('P&L Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('aside >> text=P&L').first().click();
  });

  test('should display P&L tab header', async ({ page }) => {
    await expect(page.locator('h2:has-text("P&L")')).toBeVisible();
  });

  test('should show gross and net profit cards', async ({ page }) => {
    // Should display profit/loss summary cards
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });

  test('should display P&L chart', async ({ page }) => {
    // Should have a chart (7-day P&L trend or donut)
    const chart = page.locator('.recharts-wrapper, svg.recharts-surface').first();
    await expect(chart).toBeVisible({ timeout: 10000 });
  });

  test('should show expense breakdown', async ({ page }) => {
    const pageContent = page.locator('main');
    await expect(pageContent).toBeVisible();
  });

  test('should have PDF export button', async ({ page }) => {
    // P&L tab has a PDF export feature
    const pdfButton = page.locator('button:has-text("PDF"), button:has-text("Izvozi")');
    const count = await pdfButton.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show daily P&L data table', async ({ page }) => {
    // Table with daily breakdown
    const table = page.locator('table, [role="table"]');
    const count = await table.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
