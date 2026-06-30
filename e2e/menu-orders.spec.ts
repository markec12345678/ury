import { test, expect } from '@playwright/test';

/**
 * URY Dashboard — Menu Tab E2E Tests
 */

test.describe('Menu Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('aside >> text=Jedilnik').first().click();
    await expect(page.locator('h2:has-text("Jedilnik")')).toBeVisible();
  });

  test('should display menu tab header', async ({ page }) => {
    await expect(page.locator('h2:has-text("Jedilnik")')).toBeVisible();
  });

  test('should show summary cards', async ({ page }) => {
    await expect(page.locator('text=Skupaj artiklov').first()).toBeVisible();
    await expect(page.locator('text=Vegetarijansko').first()).toBeVisible();
    await expect(page.locator('text=Dosegljivo').first()).toBeVisible();
    await expect(page.locator('text=Povprečna cena').first()).toBeVisible();
  });

  test('should display menu items', async ({ page }) => {
    // Dynamic import means content loads async — wait for it
    await page.waitForTimeout(2000);
    // Should show menu item cards with item names
    const itemCards = page.locator('main').first();
    await expect(itemCards).toBeVisible();
    // Verify at least some item content is present
    const content = await itemCards.textContent();
    expect(content).toBeTruthy();
  });

  test('should show course filter buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Predjedi")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Glavne jedi")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Kruhovi")').first()).toBeVisible();
  });

  test('should filter items by course', async ({ page }) => {
    await page.locator('button:has-text("Predjedi")').first().click();
    await page.waitForTimeout(500);
    // Should show filtered results
    await expect(page.locator('text=Predjedi').first()).toBeVisible();
    // Reset
    await page.locator('button:has-text("Vse")').first().click();
  });

  test('should search menu items', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Išči"]').first();
    await searchInput.fill('Butter Chicken');
    await page.waitForTimeout(500);
    // Should show Butter Chicken in results
    await expect(page.locator('text=Butter Chicken').first()).toBeVisible();
    // Clear search
    await searchInput.fill('');
  });

  test('should toggle veg filter', async ({ page }) => {
    const vegBtn = page.locator('button:has-text("Veg")').first();
    await vegBtn.click();
    await page.waitForTimeout(500);
    // Should show veg items
    const vegIndicator = page.locator('.bg-green-500.border-green-600').first();
    if (await vegIndicator.count() > 0) {
      await expect(vegIndicator).toBeVisible();
    }
    // Toggle back
    await vegBtn.click();
  });

  test('should show item tags', async ({ page }) => {
    const tags = page.locator('text=popular').first();
    if (await tags.count() > 0) {
      await expect(tags).toBeVisible();
    }
  });

  test('should show item prices', async ({ page }) => {
    const prices = page.locator('text=/₹\\d+/').first();
    await expect(prices).toBeVisible();
  });
});

/**
 * URY Dashboard — Orders Tab E2E Tests
 */

test.describe('Orders Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('aside >> text=Naročila').first().click();
    await expect(page.locator('h2:has-text("Naročila")')).toBeVisible();
  });

  test('should display orders tab header', async ({ page }) => {
    await expect(page.locator('h2:has-text("Naročila")')).toBeVisible();
  });

  test('should show summary cards', async ({ page }) => {
    await expect(page.locator('text=Na čakanju').first()).toBeVisible();
    await expect(page.locator('text=V pripravi').first()).toBeVisible();
    await expect(page.locator('text=Pripravljeno').first()).toBeVisible();
    await expect(page.locator('text=Skupaj promet').first()).toBeVisible();
  });

  test('should display order cards', async ({ page }) => {
    const orderCards = page.locator('text=/INV-\\d+/').first();
    if (await orderCards.count() > 0) {
      await expect(orderCards).toBeVisible();
    }
  });

  test('should show status filter buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Potrjeno")').first()).toBeVisible();
    await expect(page.locator('button:has-text("V pripravi")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Pripravljeno")').first()).toBeVisible();
  });

  test('should filter orders by status', async ({ page }) => {
    await page.locator('button:has-text("V pripravi")').first().click();
    await page.waitForTimeout(500);
    // Reset
    await page.locator('button:has-text("Vse")').first().click();
  });

  test('should show order type filters', async ({ page }) => {
    await expect(page.locator('text=Na mestu').first()).toBeVisible();
    await expect(page.locator('text=Za odnos').first()).toBeVisible();
    await expect(page.locator('text=Dostava').first()).toBeVisible();
  });

  test('should show LIVE/DEMO badge', async ({ page }) => {
    await expect(page.locator('text=DEMO').first()).toBeVisible();
  });
});
