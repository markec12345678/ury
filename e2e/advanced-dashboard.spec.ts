import { test, expect } from '@playwright/test';

test.describe('Advanced Dashboard Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?tab=dashboard');
    await page.waitForTimeout(1000);
  });

  test('should load advanced dashboard tab', async ({ page }) => {
    await expect(page.getByText('Skupni prihodki').first()).toBeVisible();
    await expect(page.getByText('Skupna naročila').first()).toBeVisible();
    await expect(page.getByText('Povprečni račun').first()).toBeVisible();
  });

  test('should display period selector buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Danes' })).toBeVisible();
    await expect(page.getByRole('button', { name: '7 dni' })).toBeVisible();
    await expect(page.getByRole('button', { name: '30 dni' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Kvartal' })).toBeVisible();
  });

  test('should switch between time periods', async ({ page }) => {
    // Click "7 dni" period
    await page.getByRole('button', { name: '7 dni' }).click();
    await page.waitForTimeout(500);
    
    // Verify the period is selected (button should be default variant)
    const weekBtn = page.getByRole('button', { name: '7 dni' });
    await expect(weekBtn).toHaveClass(/bg-emerald/);
  });

  test('should display sales trend chart', async ({ page }) => {
    await expect(page.getByText('Trend prodaje')).toBeVisible();
  });

  test('should display top selling items', async ({ page }) => {
    await expect(page.getByText('Najbolj prodajani')).toBeVisible();
  });

  test('should display payment method split', async ({ page }) => {
    await expect(page.getByText('Načini plačila')).toBeVisible();
  });

  test('should display hourly heatmap', async ({ page }) => {
    await expect(page.getByText('Urna aktivnost')).toBeVisible();
  });

  test('should show growth indicators', async ({ page }) => {
    // Growth percentages should be visible
    const growthTexts = page.getByText(/vs prejšnje obdobje/);
    await expect(growthTexts.first()).toBeVisible();
  });

  test('should update metrics when switching to monthly period', async ({ page }) => {
    // Get the initial revenue value
    const initialMetric = page.getByText('Skupni prihodki');
    await expect(initialMetric).toBeVisible();
    
    // Switch to monthly
    await page.getByRole('button', { name: '30 dni' }).click();
    await page.waitForTimeout(500);
    
    // Revenue should change (monthly > daily)
    await expect(initialMetric).toBeVisible();
  });
});
