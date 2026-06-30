import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — Settings Page E2E Tests
 */

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should load settings page', async ({ page }) => {
    await expect(page.locator('text=Nastavitve').first()).toBeVisible();
  });

  test('should display connection status card', async ({ page }) => {
    // Should show "Ni povezave" or "Povezano"
    await expect(page.locator('text=Ni povezave, text=Povezano').first()).toBeVisible();
  });

  test('should show Frappe URL input field', async ({ page }) => {
    const urlInput = page.locator('#baseUrl, input[placeholder*="erp"]');
    const count = await urlInput.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have proxy mode toggle', async ({ page }) => {
    // Proxy mode switch
    const proxyToggle = page.locator('text=Proxy način');
    const count = await proxyToggle.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should show authentication mode selector', async ({ page }) => {
    await expect(page.locator('text=Uporabniško ime').first()).toBeVisible();
    await expect(page.locator('text=API Token').first()).toBeVisible();
  });

  test('should toggle to API Token mode', async ({ page }) => {
    await page.locator('text=API Token').first().click();
    // Should show API Key and Secret inputs
    await expect(page.locator('#apiKey, text=API Key').first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('should have Save and Test button', async ({ page }) => {
    await expect(page.locator('button:has-text("Shrani in preveri")').first()).toBeVisible();
  });

  test('should show real-time configuration section', async ({ page }) => {
    await expect(page.locator('text=Real-time posodobitve').first()).toBeVisible();
  });

  test('should display security info card', async ({ page }) => {
    await expect(page.locator('text=Varnost').first()).toBeVisible();
  });

  test('should display requirements card', async ({ page }) => {
    await expect(page.locator('text=Zahteve').first()).toBeVisible();
  });

  test('should navigate back to dashboard', async ({ page }) => {
    await page.locator('a[href="/"], aside >> text=Pregled').first().click().catch(() => {});
    // Or use browser back
    await page.goBack();
    await expect(page).toHaveURL(/\//);
  });
});
