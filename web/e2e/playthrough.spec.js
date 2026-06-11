import { test, expect } from '@playwright/test';

const getRenderState = async (page) => {
  const raw = await page.evaluate(() => {
    if (typeof window.render_game_to_text !== 'function') return null;
    return window.render_game_to_text();
  });
  return raw ? JSON.parse(raw) : null;
};

test('FarmSim can plant and harvest from a fresh state', async ({ page }) => {
  await page.addInitScript(() => {
    const saveKeys = Object.keys(localStorage).filter(
      (key) => key.startsWith('farm_sim_') || key.startsWith('farmSim_') || key.startsWith('farmLife')
    );
    for (const key of saveKeys) {
      localStorage.removeItem(key);
    }
    localStorage.removeItem('farm_sim_active_tab_v1');
  });

  await page.goto('/');
  await expect(page.locator('[data-onboard="farm-grid"]').first()).toBeVisible({ timeout: 20000 });

  const skipTutorial = page.getByRole('button', { name: /skip/i });
  if (await skipTutorial.isVisible({ timeout: 200 }).catch(() => false)) {
    await skipTutorial.click();
  }

  const startState = await getRenderState(page);
  const startCoins = startState?.coins ?? 0;

  const cropButton = page.locator('[data-crop-button]').first();
  await expect(cropButton).toBeVisible({ timeout: 12000 });
  await cropButton.click();

  const firstPlot = page.locator('[data-plot-button="true"]').first();
  await expect(firstPlot).toBeVisible();
  await firstPlot.click();

  await expect(async () => {
    const next = await getRenderState(page);
    expect(next?.selectedCrop).toBeTruthy();
    const firstPlotState = next?.plots?.[0]?.state;
    expect(['planted', 'growing', 'ready', 'withered', 'empty']).toContain(firstPlotState);
  }).toPass({ timeout: 15000, intervals: [250, 500, 1000] });

  await page.evaluate(() => {
    return typeof window.__farmTestHooks?.forceAllGrowingPlotsReady === 'function'
      ? window.__farmTestHooks.forceAllGrowingPlotsReady()
      : false;
  });

  await expect(async () => {
    const state = await getRenderState(page);
    const plotState = state?.plots?.[0]?.state;
    expect(plotState).toBe('ready');
  }).toPass({ timeout: 8000, intervals: [250, 500, 1000] });

  await firstPlot.click();
  await expect(async () => {
    const finalState = await getRenderState(page);
    expect((finalState?.coins ?? startCoins) > startCoins).toBeTruthy();
  }).toPass({ timeout: 10000, intervals: [500, 1000] });

  await page.screenshot({ path: 'test-results/farmplaythrough-end.png' });
});
