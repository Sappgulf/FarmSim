import { describe, it, expect } from 'vitest';
import { decodeSeed, encodeSeed } from '../utils/seedCode';
import {
  exportFarmSnapshot,
  validateSnapshotPayload,
  hydrateSnapshotPlots,
} from '../utils/farmSnapshot';
import { createMilestoneManager } from '../systems/milestones';
import { MILESTONE_DEFINITIONS } from '../data/milestones';

describe('Social Lite systems', () => {
  it('seed code roundtrip works', () => {
    const code = encodeSeed({
      version: 1,
      seed: 77,
      season: 'fall',
      packs: ['core'],
      theme: 'meadow',
    });
    const decoded = decodeSeed(code);
    expect(decoded.error).toBeFalsy();
    expect(decoded.payload.season).toBe('fall');
  });

  it('seed code supports utf-8 payloads and stable pack normalization', () => {
    const code = encodeSeed({
      version: 1,
      seed: 19,
      season: 'winter',
      packs: ['season-pack', 'core', 'season-pack'],
      theme: 'cafe-🌾',
    });
    const decoded = decodeSeed(code);
    expect(decoded.error).toBeFalsy();
    expect(decoded.payload.theme).toBe('cafe-🌾');
    expect(decoded.payload.packs).toEqual(['core', 'season-pack']);
  });

  it('invalid seed codes are handled', () => {
    expect(decodeSeed('bad').error).toBeTruthy();
  });

  it('snapshot import validates and hydrates', () => {
    const payload = exportFarmSnapshot({
      farmName: 'A',
      farmTheme: 'meadow',
      season: { current: 'spring' },
      almanac: { counters: { dayCount: 1 } },
      plots: [{ state: 'ready', crop: { id: 'parsnip' }, growthStage: 3 }],
    });
    expect(validateSnapshotPayload(payload).ok).toBe(true);
    const plots = hydrateSnapshotPlots(payload.plots);
    expect(plots[0].state).toBe('ready');
  });

  it('milestones unlock idempotently', () => {
    const manager = createMilestoneManager(MILESTONE_DEFINITIONS);
    const progress = manager.onEvent('harvest', { count: 500 }, {});
    const unlocked = manager.evaluateUnlocks(progress, {});
    expect(unlocked.length).toBeGreaterThan(0);
    const unlockedAgain = manager.evaluateUnlocks(progress, { [unlocked[0].id]: true });
    expect(unlockedAgain.some((entry) => entry.id === unlocked[0].id)).toBe(false);
  });
});
