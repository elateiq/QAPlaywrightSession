import { test, expect } from '@playwright/test';

// Example tests for the order-tracking page. Read them before you write your own.
test.describe('Track an order', () => {
  test('a shipped order shows its status and courier', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Order number').fill('ORD-1002');
    await page.getByRole('button', { name: 'Track' }).click();
    await expect(page.getByRole('heading', { name: 'Order ORD-1002' })).toBeVisible();
    await expect(page.locator('#status')).toHaveText('Shipped');
    await expect(page.locator('#courier')).toContainText('Delhivery');
  });

  test('an unknown order number shows the agreed message', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Order number').fill('ORD-9999');
    await page.getByRole('button', { name: 'Track' }).click();
    await expect(page.getByRole('status')).toHaveText('We could not find that order. Check the number and try again.');
  });
});
