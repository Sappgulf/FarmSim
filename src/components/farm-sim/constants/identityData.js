import { CROP_DATA } from './cropData';

export const MOOD_TIERS = [
  {
    id: 'calm',
    label: 'Calm',
    minScore: 0,
    maxScore: 39,
    accent: '#93c5fd',
    glow: 'rgba(147, 197, 253, 0.25)',
    description: 'Soft and steady, with gentle farm rhythms.',
  },
  {
    id: 'cozy',
    label: 'Cozy',
    minScore: 40,
    maxScore: 69,
    accent: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.25)',
    description: 'Warm and inviting, full of small comforts.',
  },
  {
    id: 'thriving',
    label: 'Thriving',
    minScore: 70,
    maxScore: 100,
    accent: '#34d399',
    glow: 'rgba(52, 211, 153, 0.25)',
    description: 'Bright, lively, and full of cozy momentum.',
  },
];

export const getMoodTier = (score = 0) => {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  return MOOD_TIERS.find((tier) => safeScore >= tier.minScore && safeScore <= tier.maxScore)
    || MOOD_TIERS[0];
};

export const getMoodIntensity = (score = 0) => {
  const safeScore = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
  return 0.6 + (safeScore / 100) * 0.4;
};

export const PHILOSOPHIES = [
  {
    id: 'nature_first',
    name: 'Nature First',
    emoji: '🌿',
    description: 'Let the seasons and weather guide each gentle decision.',
    tone: 'nature',
  },
  {
    id: 'market_maven',
    name: 'Market Maven',
    emoji: '🛍️',
    description: 'Follow the market pulse and spotlight today’s best sellers.',
    tone: 'market',
  },
  {
    id: 'slow_living',
    name: 'Slow Living',
    emoji: '🫖',
    description: 'Savor small rituals, décor touches, and scrapbook moments.',
    tone: 'slow',
  },
];

export const DEFAULT_PHILOSOPHY = 'nature_first';

export const MEMORY_CAP = 100;

export const MEMORY_TYPES = {
  SEASON: 'season',
  FESTIVAL: 'festival',
  DECOR: 'decor',
  REPUTATION: 'reputation',
  COLLECTION: 'collection',
  MILESTONE: 'milestone',
};

export const SEASONAL_CROP_TOTALS = Object.values(CROP_DATA).reduce((acc, crop) => {
  const season = crop.season || 'spring';
  acc[season] = (acc[season] || 0) + 1;
  return acc;
}, { spring: 0, summer: 0, fall: 0, winter: 0 });

export const getPhilosophyById = (id) => (
  PHILOSOPHIES.find((philosophy) => philosophy.id === id) || PHILOSOPHIES[0]
);
