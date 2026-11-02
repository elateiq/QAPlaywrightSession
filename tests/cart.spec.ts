import { test, expect } from '@playwright/test';

// TODO: three tests for ONE acceptance criterion of the discount code:
//   "The minimum cart value is Rs 500. A cart of exactly Rs 500 qualifies."
// Write a positive test (Rs 1000), a negative test (Rs 499) and a boundary test (Rs 500).
// The first one is written for you. Ask an AI chat to draft the other two from the criterion,
// then read every line before you run them.

async function applyCode(page, cart: number, code: string) {
  await page.goto('/cart');
  await page.getByLabel('Cart value (Rs)').fill(String(cart));
  await page.getByLabel('Discount code').fill(code);
  await page.getByRole('button', { name: 'Apply code' }).click();
}

test.describe('Discount code: minimum cart value', () => {
  test('positive: Rs 1000 with SAVE10 gets Rs 100 off', async ({ page }) => {
    await applyCode(page, 1000, 'SAVE10');
    await expect(page.getByRole('status')).toHaveText('Code applied: Rs 100 off.');
    await expect(page.locator('#total')).toHaveText('Rs 900');
  });

  // TODO: negative test, Rs 499 is rejected with "Add items worth Rs 500 or more to use this code."

  // TODO: boundary test, Rs 500 gets Rs 50 off and a total of Rs 450
});
