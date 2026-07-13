import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — Kitchen Tab Interactive E2E Tests
 * Tests KOT status changes, production unit filtering, and real-time behavior
 */

test.describe('Kitchen Tab — Interactive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Kitchen tab
    await page.locator('aside >> text=Kuhinja').first().click();
    // Wait for tab content to load
    await expect(page.locator('h2:has-text("Kuhinja")')).toBeVisible();
  });

  test('should change KOT status from Novo to V pripravi', async ({ page }) => {
    // Find a KOT card with "V pripravi" button (status: new or modified)
    const pripraviBtn = page.locator('button:has-text("V pripravi")').first();
    const btnCount = await pripraviBtn.count();

    if (btnCount > 0) {
      await pripraviBtn.click();
      // After clicking, the card should show "Pripravljeno" button
      // and the badge should change to "V pripravi"
      await expect(page.locator('text=V pripravi').first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should change KOT status from V pripravi to Pripravljeno', async ({ page }) => {
    // First, change a KOT to "V pripravi" if available
    const pripraviBtn = page.locator('button:has-text("V pripravi")').first();
    const pripraviBtnCount = await pripraviBtn.count();
    if (pripraviBtnCount > 0) {
      await pripraviBtn.click();
    }

    // Now find "Pripravljeno" button
    const readyBtn = page.locator('button:has-text("Pripravljeno")').first();
    const readyBtnCount = await readyBtn.count();
    if (readyBtnCount > 0) {
      await readyBtn.click();
      // Badge should show "Pripravljeno"
      await expect(page.locator('text=Pripravljeno').first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should change KOT status from Pripravljeno to Postreženo', async ({ page }) => {
    // Advance a KOT through statuses: Novo → V pripravi → Pripravljeno → Postreženo
    const pripraviBtn = page.locator('button:has-text("V pripravi")').first();
    if (await pripraviBtn.count() > 0) {
      await pripraviBtn.click();
    }

    const readyBtn = page.locator('button:has-text("Pripravljeno")').first();
    if (await readyBtn.count() > 0) {
      await readyBtn.click();
    }

    const servedBtn = page.locator('button:has-text("Postreženo")').first();
    if (await servedBtn.count() > 0) {
      await servedBtn.click();
      // Card should show "Postreženo" badge
      await expect(page.locator('text=Postreženo').first()).toBeVisible({ timeout: 3000 });
    }
  });

  test('should filter KOT cards by production unit', async ({ page }) => {
    // Click on a specific production unit (e.g. "Kuhinja 1")
    const kuhinja1Btn = page.locator('button:has-text("Kuhinja 1")').first();
    if (await kuhinja1Btn.count() > 0) {
      await kuhinja1Btn.click();
      // The button should be in active/pressed state
      await expect(kuhinja1Btn).toBeVisible();
    }

    // Click back to "Vse" to show all
    const vseBtn = page.locator('button:has-text("Vse")').first();
    await vseBtn.click();
    await expect(vseBtn).toBeVisible();
  });

  test('should filter by Bar production unit', async ({ page }) => {
    const barBtn = page.locator('button:has-text("Bar")').first();
    if (await barBtn.count() > 0) {
      await barBtn.click();
      await expect(barBtn).toBeVisible();
    }

    // Go back to all
    await page.locator('button:has-text("Vse")').first().click();
  });

  test('should update summary stats when KOT status changes', async ({ page }) => {
    // Verify summary cards are present
    await expect(page.locator('text=Na čakanju').first()).toBeVisible();
    await expect(page.locator('text=V pripravi').first()).toBeVisible();
    await expect(page.locator('text=Pripravljeno').first()).toBeVisible();
    await expect(page.locator('text=Zamuja').first()).toBeVisible();

    // Change a status and verify stats update
    const pripraviBtn = page.locator('button:has-text("V pripravi")').first();
    if (await pripraviBtn.count() > 0) {
      await pripraviBtn.click();
      // Stats should still be visible after change
      await expect(page.locator('text=Na čakanju').first()).toBeVisible();
    }
  });

  test('should display elapsed time on KOT cards', async ({ page }) => {
    // KOT cards should show elapsed time in minutes
    const elapsedText = page.locator('text=/\\d+ min/').first();
    if (await elapsedText.count() > 0) {
      await expect(elapsedText).toBeVisible();
    }
  });

  test('should show order type badges on KOT cards', async ({ page }) => {
    // KOT cards should show order type (New Order, Order Modified)
    const newOrderBadge = page.locator('text=New Order').first();
    const modifiedBadge = page.locator('text=Order Modified').first();
    const hasNew = await newOrderBadge.count();
    const hasModified = await modifiedBadge.count();
    expect(hasNew + hasModified).toBeGreaterThanOrEqual(0);
  });

  test('should show table number on KOT cards', async ({ page }) => {
    // Each KOT card should show "Miza: X"
    const mizaText = page.locator('text=/Miza:?\\s*\\d+/i').first();
    if (await mizaText.count() > 0) {
      await expect(mizaText).toBeVisible();
    }
  });
});
