import { describe, expect, it } from 'vitest';
import { MIN_ONBOARDING_STEP_FOR_WHATS_NEW, shouldShowWhatsNew } from '../components/farm-sim/ui/WhatsNewModal';

describe('WhatsNewModal gating', () => {
  it('waits for onboarding to finish before showing release notes', () => {
    expect(shouldShowWhatsNew({
      hasNotes: true,
      lastSeenVersion: '5.5.3',
      onboardingStep: 0,
      onboardingSkipped: false,
      hasLaunchedBefore: true,
    })).toBe(false);

    expect(shouldShowWhatsNew({
      hasNotes: true,
      lastSeenVersion: '5.5.3',
      onboardingStep: MIN_ONBOARDING_STEP_FOR_WHATS_NEW,
      onboardingSkipped: false,
      hasLaunchedBefore: true,
    })).toBe(true);

    expect(shouldShowWhatsNew({
      hasNotes: true,
      lastSeenVersion: '5.5.3',
      onboardingStep: 1,
      onboardingSkipped: true,
      hasLaunchedBefore: true,
    })).toBe(true);
  });

  it('stays hidden when there are no notes or the version was already seen', () => {
    expect(shouldShowWhatsNew({
      hasNotes: false,
      lastSeenVersion: '5.5.3',
      onboardingStep: MIN_ONBOARDING_STEP_FOR_WHATS_NEW,
      onboardingSkipped: false,
      hasLaunchedBefore: true,
    })).toBe(false);

    expect(shouldShowWhatsNew({
      hasNotes: true,
      lastSeenVersion: '5.5.4',
      onboardingStep: MIN_ONBOARDING_STEP_FOR_WHATS_NEW,
      onboardingSkipped: false,
      hasLaunchedBefore: true,
    })).toBe(false);
  });

  it('requires a returning player signal before showing release notes', () => {
    expect(shouldShowWhatsNew({
      hasNotes: true,
      lastSeenVersion: '5.5.3',
      onboardingStep: MIN_ONBOARDING_STEP_FOR_WHATS_NEW,
      hasLaunchedBefore: false,
    })).toBe(false);
  });
});
