/**
 * Crop Collections - discovery + milestone tracking.
 */

import { CROP_DATA } from './cropData';

export const CROP_COLLECTION_MILESTONES = [
  { id: 'first', label: 'First Harvest', target: 1 },
  { id: 'steadfast', label: '50 Harvests', target: 50 },
  { id: 'legend', label: '200 Harvests', target: 200 },
];

const DEFAULT_LORE_BY_CATEGORY = {
  vegetable: 'A cozy staple of the town market.',
  grain: 'A pantry favorite that keeps the town fed.',
  fruit: 'Sweet and bright, perfect for shared baskets.',
  specialty: 'A charming crop that brings seasonal cheer.',
};

const LORE_OVERRIDES = {
  carrot: 'A classic starter crop that locals adore.',
  potato: 'Hearty and humble, always in demand.',
  pumpkin: 'The town’s favorite fall centerpiece.',
  strawberry: 'A springtime delight for sunny mornings.',
  watermelon: 'A summer picnic hero with juicy rewards.',
};

export const getCropLore = (crop) => {
  if (!crop) return 'A treasured discovery.';
  return LORE_OVERRIDES[crop.id] || DEFAULT_LORE_BY_CATEGORY[crop.category] || 'A treasured discovery.';
};

export const createDefaultCropCollections = () => {
  const crops = {};
  Object.values(CROP_DATA).forEach((crop) => {
    crops[crop.id] = {
      discovered: false,
      harvested: 0,
      milestones: {
        first: false,
        steadfast: false,
        legend: false,
      },
    };
  });

  return {
    crops,
    totals: {
      harvested: 0,
    },
  };
};

export const normalizeCollectionsState = (collections) => {
  const defaults = createDefaultCropCollections();
  if (!collections || typeof collections !== 'object') {
    return defaults;
  }

  const normalized = {
    crops: { ...defaults.crops },
    totals: {
      harvested: Number.isFinite(collections.totals?.harvested) ? collections.totals.harvested : 0,
    },
  };

  if (collections.crops && typeof collections.crops === 'object') {
    Object.entries(collections.crops).forEach(([cropId, entry]) => {
      if (!normalized.crops[cropId]) return;
      normalized.crops[cropId] = {
        discovered: Boolean(entry?.discovered),
        harvested: Number.isFinite(entry?.harvested) ? entry.harvested : 0,
        milestones: {
          first: Boolean(entry?.milestones?.first),
          steadfast: Boolean(entry?.milestones?.steadfast),
          legend: Boolean(entry?.milestones?.legend),
        },
      };
    });
  }

  return normalized;
};

export const updateCropCollectionProgress = (collections, cropId, amount = 1) => {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  if (!collections || !collections.crops || !collections.crops[cropId] || safeAmount <= 0) {
    return { collections, newlyUnlocked: [] };
  }

  const currentEntry = collections.crops[cropId];
  const nextHarvested = currentEntry.harvested + safeAmount;
  const newlyUnlocked = [];

  const nextMilestones = { ...currentEntry.milestones };
  CROP_COLLECTION_MILESTONES.forEach((milestone) => {
    if (!nextMilestones[milestone.id] && nextHarvested >= milestone.target) {
      nextMilestones[milestone.id] = true;
      newlyUnlocked.push({ cropId, milestone: milestone.id, target: milestone.target });
    }
  });

  const nextEntry = {
    ...currentEntry,
    discovered: currentEntry.discovered || nextHarvested > 0,
    harvested: nextHarvested,
    milestones: nextMilestones,
  };

  const nextCollections = {
    ...collections,
    crops: {
      ...collections.crops,
      [cropId]: nextEntry,
    },
    totals: {
      harvested: (collections.totals?.harvested || 0) + safeAmount,
    },
  };

  return { collections: nextCollections, newlyUnlocked };
};
