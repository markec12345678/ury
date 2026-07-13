import { test, expect } from '@playwright/test';

test.describe('Report Generator Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?tab=reports');
    await page.waitForTimeout(1000);
  });

  test('should load report generator tab', async ({ page }) => {
    await expect(page.getByText('Skupni prihodki')).toBeVisible();
    await expect(page.getByText('Skupna naročila')).toBeVisible();
    await expect(page.getByText('Neto prihodki')).toBeVisible();
  });

  test('should display period selector buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Dnevno' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tedensko' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mesečno' })).toBeVisible();
  });

  test('should switch between report periods', async ({ page }) => {
    await page.getByRole('button', { name: 'Tedensko' }).click();
    await page.waitForTimeout(500);
    
    // Period label should update
    await expect(page.getByText(/23.*29.*junij/i)).toBeVisible();
  });

  test('should display additional metrics', async ({ page }) => {
    await expect(page.getByText('Popusti')).toBeVisible();
    await expect(page.getByText('Preklici')).toBeVisible();
    await expect(page.getByText('Neto marža')).toBeVisible();
  });

  test('should display revenue trend chart', async ({ page }) => {
    await expect(page.getByText('Trend prihodkov')).toBeVisible();
  });

  test('should display top selling items table', async ({ page }) => {
    await expect(page.getByText('Najbolj prodajani artikli')).toBeVisible();
  });

  test('should display order type split', async ({ page }) => {
    await expect(page.getByText('Razdelitev po tipu naročila')).toBeVisible();
  });

  test('should display payment method split', async ({ page }) => {
    await expect(page.getByText('Načini plačila')).toBeVisible();
  });

  test('should display course revenue', async ({ page }) => {
    await expect(page.getByText('Prihodki po kategorijah')).toBeVisible();
  });

  test('should have CSV export button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /csv/i })).toBeVisible();
  });

  test('should have PDF export button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /pdf poročilo/i })).toBeVisible();
  });

  test('should have print button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /natisni/i })).toBeVisible();
  });

  test('should show period label and date range', async ({ page }) => {
    await expect(page.getByText(/od:/i)).toBeVisible();
    await expect(page.getByText(/do:/i)).toBeVisible();
  });

  test('should switch to monthly and show different data', async ({ page }) => {
    await page.getByRole('button', { name: 'Mesečno' }).click();
    await page.waitForTimeout(500);
    
    // Verify monthly period is selected
    const monthlyBtn = page.getByRole('button', { name: 'Mesečno' });
    await expect(monthlyBtn).toHaveClass(/bg-emerald/);
  });
});
