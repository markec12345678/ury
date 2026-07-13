import { test, expect } from '@playwright/test';

test.describe('Menu Management Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?tab=menu-mgmt');
    await page.waitForTimeout(1500);
  });

  test('should load menu management tab', async ({ page }) => {
    await expect(page.getByText('Skupaj artiklov').first()).toBeVisible();
    await expect(page.getByText('Vegetarijansko').first()).toBeVisible();
  });

  test('should display menu items in table view', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should open create item dialog', async ({ page }) => {
    await page.getByRole('button', { name: /nov artikel/i }).click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /nov artikel/i })).toBeVisible();
  });

  test('should create a new menu item', async ({ page }) => {
    await page.getByRole('button', { name: /nov artikel/i }).click();
    
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/ime artikla/i).fill('Test Pizza Margherita');
    await dialog.getByLabel(/cena/i).fill('580');
    
    // Submit
    await dialog.getByRole('button', { name: /dodaj artikel/i }).click();
    
    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    
    // New item should appear in the table
    await expect(page.getByText('Test Pizza Margherita', { exact: true })).toBeVisible();
  });

  test('should search menu items', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/išči artikle/i);
    await searchInput.fill('Butter');
    await page.waitForTimeout(500);
    
    await expect(page.getByText('Butter Chicken')).toBeVisible();
  });

  test('should open course dialog', async ({ page }) => {
    await page.getByRole('button', { name: /nova kategorija/i }).click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /nova kategorija/i })).toBeVisible();
  });

  test('should display course management section', async ({ page }) => {
    await expect(page.getByText('Kategorije jedilnika')).toBeVisible();
  });

  test('should show delete confirmation on item delete', async ({ page }) => {
    const trashButtons = page.locator('button').filter({ has: page.locator('.lucide-trash-2') });
    
    if (await trashButtons.count() > 0) {
      await trashButtons.first().click();
      await expect(page.getByText('Potrditev brisanja')).toBeVisible();
    }
  });
});
