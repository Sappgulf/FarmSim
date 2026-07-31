import { test, expect } from '@playwright/test';

const getRenderState = async (page) => {
  const raw = await page.evaluate(() => {
    if (typeof window.render_game_to_text !== 'function') return null;
    return window.render_game_to_text();
  });
  return raw ? JSON.parse(raw) : null;
};

const startFreshGame = async (page) => {
  await page.addInitScript(() => {
    const saveKeys = Object.keys(localStorage).filter(
      (key) =>
        key.startsWith('farm_sim_') || key.startsWith('farmSim_') || key.startsWith('farmLife')
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
};

const forceAllPlotsReady = async (page) => {
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const forceReady = window.__farmTestHooks?.forceAllGrowingPlotsReady;
          const forced = typeof forceReady === 'function' ? forceReady() : false;
          if (forced) return true;

          const raw = window.render_game_to_text?.();
          const state = raw ? JSON.parse(raw) : null;
          return Boolean(state?.plots?.some((plot) => plot?.state === 'ready'));
        }),
      { timeout: 8000, intervals: [100, 250, 500] }
    )
    .toBe(true);
};

const waitForPlotState = async (page, index, states) => {
  await expect(async () => {
    const state = await getRenderState(page);
    expect(states.includes(state?.plots?.[index]?.state)).toBeTruthy();
  }).toPass({ timeout: 12000, intervals: [250, 500, 1000] });
};

test('FarmSim can plant and harvest from a fresh state', async ({ page }) => {
  await startFreshGame(page);

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

  await forceAllPlotsReady(page);

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

test('Player can switch crops and harvest multiple plots', async ({ page }) => {
  await startFreshGame(page);

  const cropButtons = page.locator('[data-crop-button]');
  await expect.poll(async () => cropButtons.count()).toBeGreaterThan(1);

  const firstCropButton = cropButtons.nth(0);
  const secondCropButton = cropButtons.nth(1);
  const firstCropId = (await firstCropButton.getAttribute('data-crop-button')) || '';
  const secondCropId = (await secondCropButton.getAttribute('data-crop-button')) || '';
  const firstCropName = (await firstCropButton.getAttribute('data-crop-name')) || '';
  const secondCropName = (await secondCropButton.getAttribute('data-crop-name')) || '';
  expect(firstCropId).not.toEqual(secondCropId);

  const firstPlot = page.locator('[data-plot-button="true"]').nth(0);

  await firstCropButton.click();
  await firstPlot.click();
  await waitForPlotState(page, 0, ['planted', 'growing', 'ready', 'withered']);

  await expect
    .poll(async () => {
      const label = await firstPlot.getAttribute('aria-label');
      return typeof label === 'string' ? label : '';
    })
    .toContain(firstCropName);

  await forceAllPlotsReady(page);
  await waitForPlotState(page, 0, ['ready']);
  await firstPlot.click();
  await waitForPlotState(page, 0, ['empty']);

  await secondCropButton.click();
  await firstPlot.click();

  await expect
    .poll(async () => {
      const label = await firstPlot.getAttribute('aria-label');
      return typeof label === 'string' ? label : '';
    })
    .toContain(secondCropName);

  await forceAllPlotsReady(page);
  await waitForPlotState(page, 0, ['ready']);

  const startState = await getRenderState(page);
  const startCoins = startState?.coins ?? 0;
  await firstPlot.click();

  await expect(async () => {
    const finalState = await getRenderState(page);
    expect((finalState?.coins ?? startCoins) > startCoins).toBeTruthy();
  }).toPass({ timeout: 10000, intervals: [250, 500, 1000] });

  await expect(page.locator('[data-plot-state="empty"]').first()).toBeVisible();
});

test('Fresh Run button resets farm state from settings', async ({ page }) => {
  await startFreshGame(page);

  await page.locator('[data-crop-button]').first().click();
  const firstPlot = page.locator('[data-plot-button="true"]').first();
  await firstPlot.click();
  await waitForPlotState(page, 0, ['planted', 'growing', 'ready', 'withered']);

  await forceAllPlotsReady(page);
  await waitForPlotState(page, 0, ['ready']);
  await firstPlot.click();

  const stateBeforeFreshRun = await getRenderState(page);
  const previousCoins = stateBeforeFreshRun?.coins ?? 0;

  page.once('dialog', (dialog) => {
    if (dialog.type() === 'confirm') {
      dialog.accept();
    }
  });

  await page.evaluate(() => {
    if (typeof window.switchToTab === 'function') {
      window.switchToTab('settings');
    }
  });

  await expect(page.getByRole('button', { name: /fresh run/i })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: /Fresh Run/i }).click();

  await expect(async () => {
    const postFreshState = await getRenderState(page);
    expect(postFreshState?.plots?.[0]?.state).toBe('empty');
    expect(postFreshState?.coins).toBeLessThanOrEqual(previousCoins);
  }).toPass({ timeout: 12000, intervals: [250, 500, 1000] });
});
