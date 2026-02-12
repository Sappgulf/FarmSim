import { beforeEach, describe, expect, it } from 'vitest';
import {
  BACKUP_SAVE_KEY,
  QA_BACKUP_SAVE_KEY,
  QA_SAVE_KEY,
  SAVE_KEY,
  clearFarmCache,
} from '../components/farm-sim/context/GamePersistence';

describe('clearFarmCache', () => {
  beforeEach(() => {
    localStorage.clear();
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
    expect(result.removedKeys).toEqual(expect.arrayContaining([
      BACKUP_SAVE_KEY,
      QA_SAVE_KEY,
      QA_BACKUP_SAVE_KEY,
      'farmSim_welcomed',
      'farmSim_feature_flag',
    ]));
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
