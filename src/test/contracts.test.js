import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateWeeklyContracts, shouldResetWeekly } from '../components/farm-sim/systems/QuestSystem';

describe('Weekly Contracts', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('generates weekly contracts with progress tracking', () => {
    const contracts = generateWeeklyContracts(5, 12345);
    expect(contracts.length).toBeGreaterThan(0);
    const sample = contracts[0];
    expect(sample).toHaveProperty('id');
    expect(sample).toHaveProperty('progress', 0);
    expect(sample).toHaveProperty('completed', false);
  });

  it('resets on a new week boundary', () => {
    vi.useFakeTimers();
    // Set to Wednesday Feb 11 to avoid Monday edge cases
    vi.setSystemTime(new Date('2026-02-11T12:00:00Z'));

    // A time from last week (Feb 2-8) - should reset
    const lastWeek = new Date('2026-02-04T12:00:00Z');
    // A time from earlier this week (Feb 9-15) - should NOT reset
    const thisWeek = new Date('2026-02-10T12:00:00Z');

    expect(shouldResetWeekly(lastWeek.getTime())).toBe(true);
    expect(shouldResetWeekly(thisWeek.getTime())).toBe(false);
  });
});
