/**
 * Farm spotlight / walkthrough (GameContext + Tutorial must stay aligned).
 * Step index matches `recordOnboardingEvent` mapping in GameContext.
 */
export const ONBOARDING_STEPS = [
  {
    id: 'plant',
    title: 'Plant something',
    description: 'Pick a crop and tap an empty plot to get growing.',
    emoji: '🌱',
    target: '[data-onboard="farm-grid"]',
    placement: 'right',
  },
  {
    id: 'water',
    title: 'Water the beds',
    description: 'Give the growing beds a drink so the crop can keep moving.',
    emoji: '💧',
    target: '[data-onboard="field-care"]',
    placement: 'top',
  },
  {
    id: 'weather-plan',
    title: 'Read the next beat',
    description: 'Queue the field plan that matches the next forecast weather.',
    emoji: '🌦️',
    target: '[data-onboard="weather-plan"]',
    placement: 'bottom',
  },
  {
    id: 'harvest',
    title: 'Harvest it',
    description: 'Tap a glowing crop to harvest and turn a good plan into coins.',
    emoji: '🧺',
    target: '[data-onboard="farm-grid"]',
    placement: 'right',
  },
  {
    id: 'board',
    title: 'Visit the Town Board',
    description: 'Tap Town, then choose Town Board to see today’s plan.',
    emoji: '📌',
    target: '[data-onboard="town-board"], [aria-label^="Town."]',
    placement: 'top',
  },
];

export const ONBOARDING_STEP_COUNT = ONBOARDING_STEPS.length;
