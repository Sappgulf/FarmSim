import { test, expect } from '@playwright/test';

test('FarmSim shell loads from dev server', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#root')).toBeAttached();
  await expect(page.getByText(/Farm|Farming|🌾/).first()).toBeVisible({ timeout: 30000 });
});
