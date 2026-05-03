import { beforeEach, describe, expect, it } from 'vitest';
import {
  BACKUP_SAVE_KEY,
  QA_BACKUP_SAVE_KEY,
  QA_SAVE_KEY,
  SAVE_KEY,
  SAVE_VERSION,
  clearFarmCache,
  createSavePayload,
  importSaveDataToStorage,
} from '../components/farm-sim/context/GamePersistence';

describe('clearFarmCache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates an export payload with the current save version and timestamp', () => {
    const payload = createSavePayload(
      {
        coins: 250,
        gameLoop: { paused: false },
        notifications: [{ id: 'n1', message: 'hello' }],
      },
      12345
    );

    expect(payload.saveVersion).toBe(SAVE_VERSION);
    expect(payload.notifications).toEqual([]);
    expect(payload.gameLoop.lastSaveTime).toBe(12345);
    expect(payload.coins).toBe(250);
  });

  it('imports migrated save data and preserves the previous save as a backup', () => {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        saveVersion: 16,
        coins: 42,
        farmName: 'Old Oak Farm',
        gameLoop: { lastSaveTime: 1000 },
        notifications: [],
      })
    );

    const result = importSaveDataToStorage({
      saveVersion: 5,
      coins: 777,
      xp: 1500,
      level: 3,
      gridSize: 3,
      plots: [],
      gameLoop: {},
    });

    expect(result.success).toBe(true);

    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    const backup = JSON.parse(localStorage.getItem(BACKUP_SAVE_KEY));

    expect(saved.saveVersion).toBeGreaterThanOrEqual(16);
    expect(saved.coins).toBe(777);
    expect(saved.notifications).toEqual([]);
    expect(saved.gameLoop.lastSaveTime).toBeGreaterThan(0);
    expect(backup.coins).toBe(42);
    expect(backup.farmName).toBe('Old Oak Farm');
  });

  it('rejects invalid imported save data', () => {
    const result = importSaveDataToStorage(null);

    expect(result.success).toBe(false);
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
  });

  it('clears FarmSim cache keys without touching unrelated storage', () => {
    localStorage.setItem(SAVE_KEY, '{"coins":123}');
    localStorage.setItem(BACKUP_SAVE_KEY, '{"coins":120}');
    localStorage.setItem(QA_SAVE_KEY, '{"coins":999}');
    localStorage.setItem(QA_BACKUP_SAVE_KEY, '{"coins":998}');
    localStorage.setItem('farmSim_welcomed', 'true');
    localStorage.setItem('farmSim_feature_flag', 'enabled');
    localStorage.setItem('external_app_pref', 'keep');

    const result = clearFarmCache({ preserveKeys: [SAVE_KEY] });

    expect(result.success).toBe(true);
    expect(localStorage.getItem(SAVE_KEY)).toBe('{"coins":123}');
    expect(localStorage.getItem(BACKUP_SAVE_KEY)).toBeNull();
    expect(localStorage.getItem(QA_SAVE_KEY)).toBeNull();
    expect(localStorage.getItem(QA_BACKUP_SAVE_KEY)).toBeNull();
    expect(localStorage.getItem('farmSim_welcomed')).toBeNull();
    expect(localStorage.getItem('farmSim_feature_flag')).toBeNull();
    expect(localStorage.getItem('external_app_pref')).toBe('keep');
    expect(result.removedKeys).toEqual(
      expect.arrayContaining([
        BACKUP_SAVE_KEY,
        QA_SAVE_KEY,
        QA_BACKUP_SAVE_KEY,
        'farmSim_welcomed',
        'farmSim_feature_flag',
      ])
    );
  });

  it('supports full cleanup when no keys are preserved', () => {
    localStorage.setItem(SAVE_KEY, '{"coins":123}');
    localStorage.setItem('farmLifeSave', '{"coins":80}');

    const result = clearFarmCache({ preserveKeys: [] });

    expect(result.success).toBe(true);
    expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    expect(localStorage.getItem('farmLifeSave')).toBeNull();
  });
});
