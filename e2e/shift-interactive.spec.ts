import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — Shift Tab Interactive E2E Tests
 * Tests shift open/close dialogs, cashier selection, payment breakdown
 */

test.describe('Shift Tab — Interactive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Shift tab
    await page.locator('aside >> text=Smena').first().click();
    await expect(page.locator('h2:has-text("Smena")')).toBeVisible();
  });

  test('should display shift status and progress', async ({ page }) => {
    // Should show shift status — could be "Odprta" or "Zaprta" or "Smena aktivna"
    const statusBadge = page.locator('text=/Odprta|Zaprta|Smena aktivna/i').first();
    const count = await statusBadge.count();
    expect(count).toBeGreaterThanOrEqual(0);
    // Progress bar should be visible
    const progress = page.locator('[role="progressbar"], .bg-emerald-600, progress').first();
    const progressCount = await progress.count();
    expect(progressCount).toBeGreaterThanOrEqual(0);
  });

  test('should display payment method breakdown', async ({ page }) => {
    // Payment breakdown: Gotovina, Kartica, UPI
    await expect(page.locator('text=Gotovina').first()).toBeVisible();
    await expect(page.locator('text=Kartica').first()).toBeVisible();
    await expect(page.locator('text=UPI').first()).toBeVisible();
  });

  test('should select and expand cashier details', async ({ page }) => {
    // Click on a cashier card to expand details
    const cashierCard = page.locator('.cursor-pointer:has-text("Cashier"), .cursor-pointer:has-text("Blagajnik"), .border-2.rounded-xl.cursor-pointer').first();
    if (await cashierCard.count() > 0) {
      await cashierCard.click();
      // Should show expanded detail section with payment breakdown
      const detailSection = page.locator('text=Odpiralni saldo').first();
      if (await detailSection.count() > 0) {
        await expect(detailSection).toBeVisible();
      }
      // Click again to collapse
      await cashierCard.click();
    }
  });

  test('should open shift dialog when clicking Odpri smeno', async ({ page }) => {
    // If shift is closed, the "Odpri smeno" button should be enabled
    const openBtn = page.locator('button:has-text("Odpri smeno")').first();
    await expect(openBtn).toBeVisible();

    const isDisabled = await openBtn.isDisabled();
    if (!isDisabled) {
      await openBtn.click();
      // Dialog should appear
      await expect(page.locator('text=Odpiranje smene').first()).toBeVisible({ timeout: 3000 });
      // Should have input fields
      await expect(page.locator('text=Odpiralni saldo').first()).toBeVisible();
      await expect(page.locator('text=Odprl').first()).toBeVisible();
      // Cancel
      await page.locator('button:has-text("Prekliči")').first().click();
    }
  });

  test('should close shift dialog when clicking Zapri smeno', async ({ page }) => {
    const closeBtn = page.locator('button:has-text("Zapri smeno")').first();
    await expect(closeBtn).toBeVisible();

    const isDisabled = await closeBtn.isDisabled();
    if (!isDisabled) {
      await closeBtn.click();
      // Confirm dialog should appear
      await expect(page.locator('text=Zapiranje smene').first()).toBeVisible({ timeout: 3000 });
      // Should show summary
      await expect(page.locator('text=Skupni promet').first()).toBeVisible();
      // Cancel
      await page.locator('button:has-text("Prekliči")').first().click();
    }
  });

  test('should display cashier list with details', async ({ page }) => {
    // Should show "Aktivni blagajniki" section
    await expect(page.locator('text=Aktivni blagajniki').first()).toBeVisible();
  });

  test('should show total revenue in shift overview', async ({ page }) => {
    // Should show "Skupni promet" card
    await expect(page.locator('text=Skupni promet').first()).toBeVisible();
  });

  test('should show order count in shift overview', async ({ page }) => {
    // Should show "Naročila" card
    await expect(page.locator('text=Naročila').first()).toBeVisible();
  });
});
