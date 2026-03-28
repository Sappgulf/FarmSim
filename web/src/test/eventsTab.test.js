import { describe, expect, it, vi, afterEach } from 'vitest';
import { deriveActiveSeason } from '../components/farm-sim/ui/tabs/EventsTab';

describe('deriveActiveSeason', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the in-game season instead of the real-world calendar', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-15T12:00:00Z'));

    expect(deriveActiveSeason({
      season: { current: 'summer' },
      retention: { lastSeenSeason: 'winter' },
    })).toBe('summer');
  });

  it('falls back to retained season and then spring when state is incomplete', () => {
    expect(deriveActiveSeason({
      retention: { lastSeenSeason: 'autumn' },
    })).toBe('autumn');

    expect(deriveActiveSeason({})).toBe('spring');
  });
});
