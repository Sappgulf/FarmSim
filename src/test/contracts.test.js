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
    vi.setSystemTime(new Date('2026-02-09T08:00:00Z'));

    const lastMonday = new Date('2026-02-02T08:00:00Z');
    const sameWeekMonday = new Date('2026-02-09T01:00:00Z');

    expect(shouldResetWeekly(lastMonday.getTime())).toBe(true);
    expect(shouldResetWeekly(sameWeekMonday.getTime())).toBe(false);
  });
});
