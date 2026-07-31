import { describe, expect, it } from 'vitest';
import { ONBOARDING_STEPS, ONBOARDING_STEP_COUNT } from '../constants/onboardingWalkthrough';

describe('onboarding walkthrough gates', () => {
  it('keeps the player path aligned with the gameplay verbs', () => {
    expect(ONBOARDING_STEP_COUNT).toBe(5);
    expect(ONBOARDING_STEPS.map((step) => step.id)).toEqual([
      'plant',
      'water',
      'weather-plan',
      'harvest',
      'board',
    ]);
    expect(ONBOARDING_STEPS.every((step) => step.target && step.description)).toBe(true);
  });
});
