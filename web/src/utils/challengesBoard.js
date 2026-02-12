import { getDayKey } from '../systems/almanac';
import { CROP_DATA } from '../components/farm-sim/constants/cropData';

const OPERATIONS = [
  {
    id: 'crop_stockpile',
    name: 'Crop Stockpile',
    emoji: '🌾',
    difficulty: 'easy',
    target: (level) => 12 + level * 2,
    reward: (level) => ({ coins: 45 + level * 5, xp: 25 + level * 4 }),
    description: (target) => `Store ${target} crops in inventory`,
    progress: (state) => Object.entries(state?.inventory || {}).reduce((sum, [itemId, qty]) => {
      if (!CROP_DATA[itemId]) return sum;
      return sum + (Math.max(0, Math.floor(Number(qty) || 0)));
    }, 0),
  },
  {
    id: 'active_plots',
    name: 'Field Coverage',
    emoji: '🧑‍🌾',
    difficulty: 'easy',
    target: (level) => Math.min(20, 4 + level),
    reward: (level) => ({ coins: 40 + level * 5, xp: 20 + level * 4 }),
    description: (target) => `Keep ${target} plots actively growing`,
    progress: (state) => (state?.plots || []).filter((plot) => (
      plot?.state === 'planted' || plot?.state === 'growing' || plot?.state === 'ready'
    )).length,
  },
  {
    id: 'ready_harvest',
    name: 'Harvest Window',
    emoji: '⏱️',
    difficulty: 'medium',
    target: (level) => Math.min(12, 3 + Math.floor(level / 2)),
    reward: (level) => ({ coins: 70 + level * 8, xp: 40 + level * 6 }),
    description: (target) => `Line up ${target} ready crops at once`,
    progress: (state) => (state?.plots || []).filter((plot) => plot?.state === 'ready').length,
  },
  {
    id: 'builder_count',
    name: 'Town Builder',
    emoji: '🏗️',
    difficulty: 'medium',
    target: (level) => Math.min(8, 1 + Math.floor(level / 2)),
    reward: (level) => ({ coins: 80 + level * 10, xp: 45 + level * 7 }),
    description: (target) => `Own ${target} built structures`,
    progress: (state) => Object.values(state?.buildings || {}).filter((entry) => entry?.built).length,
  },
  {
    id: 'animal_caretaker',
    name: 'Animal Caretaker',
    emoji: '🐾',
    difficulty: 'medium',
    target: (level) => Math.min(10, 2 + Math.floor(level / 2)),
    reward: (level) => ({ coins: 75 + level * 9, xp: 42 + level * 6 }),
    description: (target) => `Maintain ${target} animals`,
    progress: (state) => state?.livestock?.animals?.length || 0,
  },
  {
    id: 'coin_reserve',
    name: 'Rainy Day Fund',
    emoji: '💰',
    difficulty: 'hard',
    target: (level) => 200 + level * 70,
    reward: (level) => ({ coins: 120 + level * 14, xp: 70 + level * 9 }),
    description: (target) => `Build a reserve of ${target} coins`,
    progress: (state) => Math.max(0, Math.floor(Number(state?.coins || 0))),
  },
];

const buildSeed = (value) => (
  String(value).split('').reduce((seed, char) => seed + char.charCodeAt(0), 0)
);

const clampLevel = (level) => Math.max(1, Math.floor(Number(level) || 1));

export const buildDailyOperations = (level = 1, dayKey = getDayKey()) => {
  const safeLevel = clampLevel(level);
  const seed = buildSeed(dayKey);
  const byDifficulty = {
    easy: OPERATIONS.filter((entry) => entry.difficulty === 'easy'),
    medium: OPERATIONS.filter((entry) => entry.difficulty === 'medium'),
    hard: OPERATIONS.filter((entry) => entry.difficulty === 'hard'),
  };

  const pickFromBucket = (bucket, offset = 0) => {
    if (!Array.isArray(bucket) || bucket.length === 0) return null;
    return bucket[(seed + offset) % bucket.length];
  };

  const picked = [
    pickFromBucket(byDifficulty.easy, 1),
    pickFromBucket(byDifficulty.medium, 5),
    pickFromBucket(byDifficulty.hard, 11),
  ].filter(Boolean);

  return picked.map((operation) => {
    const target = operation.target(safeLevel);
    const reward = operation.reward(safeLevel);
    return {
      id: `ops-${dayKey}-${operation.id}`,
      dayKey,
      type: operation.id,
      name: operation.name,
      emoji: operation.emoji,
      difficulty: operation.difficulty,
      target,
      reward,
      description: operation.description(target),
      claimed: false,
      completed: false,
    };
  });
};

export const getDailyOperationProgress = (state, challenge) => {
  if (!challenge || typeof challenge.type !== 'string') return 0;
  const operation = OPERATIONS.find((entry) => entry.id === challenge.type);
  if (!operation) return 0;
  return Math.max(0, Math.floor(Number(operation.progress(state)) || 0));
};

export const markDailyOperationCompletion = (state, challenges = []) => (
  challenges.map((challenge) => {
    const progress = getDailyOperationProgress(state, challenge);
    return {
      ...challenge,
      completed: challenge.claimed || progress >= (challenge.target || 0),
    };
  })
);

export const getResetCountdownLabel = (lastResetTime) => {
  const now = Date.now();
  const base = Number.isFinite(Number(lastResetTime)) ? Number(lastResetTime) : now;
  const nextReset = base + 24 * 60 * 60 * 1000;
  const remaining = Math.max(0, nextReset - now);
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m`;
};

export default {
  buildDailyOperations,
  getDailyOperationProgress,
  markDailyOperationCompletion,
  getResetCountdownLabel,
};
