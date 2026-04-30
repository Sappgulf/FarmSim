// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Dismiss first-run dialogs that stack after "Start farming" (What's New / tutorial).
 * Order varies; retries keep the flow resilient.
 */
async function dismissBootstrapOverlays(page) {
  for (let i = 0; i < 5; i += 1) {
    await page.getByRole('button', { name: 'Got it' }).click({ timeout: 2000 }).catch(() => {});
    await page.getByRole('button', { name: 'Skip tutorial' }).click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(200);
  }
}

test.describe('Smoke E2E', () => {
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* restricted storage */
      }
    });
  });

  test('start screen → gameplay → programmatic tab hops', async ({ page }) => {
    await page.goto('./');

    await expect(page.getByTestId('start-screen')).toBeVisible();
    await page.getByRole('button', { name: /start farming/i }).click();

    await dismissBootstrapOverlays(page);

    await expect(page.locator('#main-content')).toBeVisible();

    await page.waitForFunction(() => typeof window.switchToTab === 'function');

    await page.evaluate(() => window.switchToTab('shop'));
    await expect(page.locator('#panel-shop')).toBeAttached();

    await page.evaluate(() => window.switchToTab('settings'));
    await expect(page.locator('#panel-settings')).toBeAttached();

    await page.evaluate(() => window.switchToTab('farming'));
    await expect(page.locator('#panel-farming')).toBeAttached();
  });
});
