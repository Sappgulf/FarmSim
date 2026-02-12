import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, getAchievement } from '../components/farm-sim/constants/achievementData';

describe('Achievement economy balance', () => {
  it('keeps low-tier onboarding coin rewards intentionally modest', () => {
    const ids = ['first_plant', 'first_harvest', 'first_coin', 'novice_farmer', 'small_fortune'];
    const totalCoins = ids.reduce((sum, id) => sum + (getAchievement(id)?.reward?.coins || 0), 0);

    expect(totalCoins).toBeLessThanOrEqual(63);
  });

  it('still preserves meaningful total rewards across all achievements', () => {
    const totalCoins = ACHIEVEMENTS.reduce((sum, achievement) => sum + achievement.reward.coins, 0);
    expect(totalCoins).toBeGreaterThan(8000);
  });
});
