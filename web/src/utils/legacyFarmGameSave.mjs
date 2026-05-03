import { nowSec } from './time.mjs';
import { BLESSINGS } from '../data/identity';

/**
 * Assembles the legacy FarmGame localStorage blob (see {@link ./save.mjs}).
 * @param {object} p
 * @returns {object}
 */
export function buildLegacyFarmGameSavePayload({
  getGameSaveData,
  getFarmSaveData,
  getWeatherSaveData,
  buildings,
  achievementSystem,
  discoveredHybrids,
  dayNight,
  ownedAnimals,
  claimedMilestones,
  philosophy,
  moodPoints,
  memoryFlags,
  farmDay,
  lastWishDay,
  activeBlessing,
}) {
  return {
    gameState: getGameSaveData(),
    farm: getFarmSaveData(),
    weather: getWeatherSaveData(),
    buildings,
    achievements: achievementSystem.getSaveData(),
    discoveredHybrids,
    dayNight: dayNight.getSaveData(),
    ownedAnimals,
    claimedMilestones,
    identity: {
      philosophy,
      moodPoints,
      memoryFlags,
      farmDay,
      lastWishDay,
      activeBlessing,
    },
    savedAt: nowSec(),
  };
}

/**
 * Apply parsed legacy save object to FarmGame state (mount only).
 * @param {object|null} savedData
 * @param {object} ctx
 */
export function applyLegacyFarmGameLoad(savedData, ctx) {
  if (!savedData) return;

  const {
    loadGameSaveData,
    loadFarmSaveData,
    loadWeatherSaveData,
    setBuildings,
    achievementSystem,
    setDiscoveredHybrids,
    dayNight,
    setOwnedAnimals,
    setClaimedMilestones,
    setPhilosophy,
    setMoodPoints,
    setMemoryFlags,
    setFarmDay,
    setLastWishDay,
    setActiveBlessing,
  } = ctx;

  loadGameSaveData(savedData.gameState);
  loadFarmSaveData(savedData.farm);
  loadWeatherSaveData(savedData.weather);
  if (savedData.buildings) setBuildings(savedData.buildings);
  if (savedData.achievements) achievementSystem.loadSaveData(savedData.achievements);
  if (savedData.discoveredHybrids) setDiscoveredHybrids(savedData.discoveredHybrids);
  if (savedData.dayNight) dayNight.loadSaveData(savedData.dayNight);
  if (savedData.ownedAnimals) setOwnedAnimals(savedData.ownedAnimals);
  if (savedData.claimedMilestones) setClaimedMilestones(savedData.claimedMilestones);
  if (savedData.identity) {
    const identity = savedData.identity;
    if (identity.philosophy) setPhilosophy(identity.philosophy);
    if (Number.isFinite(identity.moodPoints)) setMoodPoints(identity.moodPoints);
    if (identity.memoryFlags) setMemoryFlags(identity.memoryFlags);
    if (Number.isFinite(identity.farmDay)) setFarmDay(Math.max(1, identity.farmDay));
    if (Number.isFinite(identity.lastWishDay)) setLastWishDay(identity.lastWishDay);
    if (identity.activeBlessing) {
      const blessing = BLESSINGS.find((b) => b.id === identity.activeBlessing.id);
      setActiveBlessing(
        blessing ? { ...blessing, ...identity.activeBlessing } : identity.activeBlessing
      );
    }
  }
}
