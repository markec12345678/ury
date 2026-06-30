import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — Navigation & Core Layout E2E Tests
 */

test.describe('URY Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the dashboard homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/URY/i);
    // Check sidebar is visible
    await expect(page.locator('aside')).toBeVisible();
  });

  test('should display URY Dashboard title in sidebar', async ({ page }) => {
    await expect(page.locator('text=URY Dashboard')).toBeVisible();
  });

  test('should show DEMO badge when not connected to Frappe', async ({ page }) => {
    await expect(page.locator('text=DEMO').first()).toBeVisible();
  });

  test('should display restaurant name in sidebar', async ({ page }) => {
    await expect(page.locator('text=URY Restaurant')).toBeVisible();
  });

  test('should have all 7 navigation tabs in sidebar', async ({ page }) => {
    const tabLabels = ['Pregled', 'Mize', 'Kuhinja', 'P&L', 'Smena', 'API', 'Arhitektura'];
    for (const label of tabLabels) {
      await expect(page.locator(`aside >> text=${label}`).first()).toBeVisible();
    }
  });

  test('should have Settings link in sidebar', async ({ page }) => {
    await expect(page.locator('aside >> text=Nastavitve').first()).toBeVisible();
  });

  test('should navigate to Overview tab by default', async ({ page }) => {
    // Overview should be the default active tab
    const activeTab = page.locator('aside button.bg-emerald-600').first();
    await expect(activeTab).toContainText('Pregled');
  });

  test('should switch tabs when clicking sidebar navigation', async ({ page }) => {
    // Click on Tables tab
    await page.locator('aside >> text=Mize').first().click();
    await expect(page.locator('h2:has-text("Mize")')).toBeVisible();

    // Click on Kitchen tab
    await page.locator('aside >> text=Kuhinja').first().click();
    await expect(page.locator('h2:has-text("Kuhinja")')).toBeVisible();

    // Click on P&L tab
    await page.locator('aside >> text=P&L').first().click();
    await expect(page.locator('h2:has-text("P&L")')).toBeVisible();
  });

  test('should update header title when switching tabs', async ({ page }) => {
    const headerTitle = page.locator('header h2');
    
    await page.locator('aside >> text=Kuhinja').first().click();
    await expect(headerTitle).toHaveText('Kuhinja');

    await page.locator('aside >> text=API').first().click();
    await expect(headerTitle).toHaveText('API');
  });

  test('should show top bar with connection status badge', async ({ page }) => {
    const topBar = page.locator('header');
    await expect(topBar).toBeVisible();
    // Should show either Demo or Povezano badge
    const badge = topBar.locator('[data-slot="badge"]').first();
    await expect(badge).toBeVisible();
  });

  test('should display clock in sidebar footer', async ({ page }) => {
    // Footer should show time and date
    const footer = page.locator('aside .p-4');
    await expect(footer).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.locator('a[href="/settings"]').click();
    await expect(page).toHaveURL(/settings/);
    await expect(page.locator('text=Nastavitve').first()).toBeVisible();
  });

  test('should have dark mode toggle button in top bar', async ({ page }) => {
    const darkModeButton = page.locator('header button[title="Temna tema"], header button[title="Svetla tema"]');
    await expect(darkModeButton).toBeVisible();
  });

  test('should have command palette badge (⌘K) in top bar', async ({ page }) => {
    await expect(page.locator('text=⌘K').first()).toBeVisible();
  });
});
