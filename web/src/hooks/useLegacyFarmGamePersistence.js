import { useEffect } from 'react';
import { loadGameSave, saveGameState, saveGameStateImmediate } from '../utils/save.mjs';
import { GAME_SETTINGS } from '../data/constants';
import {
  applyLegacyFarmGameLoad,
  buildLegacyFarmGameSavePayload,
} from '../utils/legacyFarmGameSave.mjs';

/**
 * Mount load + interval autosave for classic FarmGame (`farmSim_save_v3`).
 *
 * @param {object} opts
 */
export function useLegacyFarmGamePersistence(opts) {
  const {
    achievementSystem,
    activeBlessing,
    buildings,
    claimedMilestones,
    dayNight,
    discoveredHybrids,
    farmDay,
    generateForecast,
    getFarmSaveData,
    getGameSaveData,
    getWeatherSaveData,
    lastWishDay,
    loadFarmSaveData,
    loadGameSaveData,
    loadWeatherSaveData,
    memoryFlags,
    moodPoints,
    ownedAnimals,
    philosophy,
    setActiveBlessing,
    setBuildings,
    setClaimedMilestones,
    setDiscoveredHybrids,
    setFarmDay,
    setLastWishDay,
    setMemoryFlags,
    setMoodPoints,
    setOwnedAnimals,
    setPhilosophy,
  } = opts;

  useEffect(() => {
    const savedData = loadGameSave();
    if (savedData) {
      applyLegacyFarmGameLoad(savedData, {
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
        generateForecast,
      });
    } else {
      generateForecast();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only load
  }, []);

  useEffect(() => {
    const createSaveData = () =>
      buildLegacyFarmGameSavePayload({
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
      });

    const saveInterval = setInterval(() => {
      saveGameState(createSaveData());
    }, GAME_SETTINGS.AUTO_SAVE_INTERVAL);

    const handleBeforeUnload = () => {
      saveGameStateImmediate(createSaveData());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [
    getGameSaveData,
    getFarmSaveData,
    getWeatherSaveData,
    buildings,
    discoveredHybrids,
    ownedAnimals,
    claimedMilestones,
    achievementSystem,
    dayNight,
    philosophy,
    moodPoints,
    memoryFlags,
    farmDay,
    lastWishDay,
    activeBlessing,
  ]);
}
