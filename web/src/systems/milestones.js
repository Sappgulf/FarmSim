export const createMilestoneManager = (definitions = []) => {
  const milestones = definitions;

  const evaluateUnlocks = (progress = {}, unlocked = {}) => milestones
    .filter((m) => !unlocked[m.id] && Number(progress[m.type] || 0) >= Number(m.target || 0));

  return {
    registerMilestones: () => milestones,
    onEvent: (eventType, payload = {}, progress = {}) => {
      const current = progress || {};

      if (eventType === 'day_advance') {
        return { ...current, daysPlayed: (current.daysPlayed || 0) + 1 };
      }

      if (eventType === 'harvest') {
        return { ...current, totalHarvests: (current.totalHarvests || 0) + (payload.count || 1) };
      }

      if (eventType === 'unique_crop') {
        const nextSize = Math.max(current.uniqueCropsGrown || 0, payload.size || 0);
        if (nextSize === (current.uniqueCropsGrown || 0)) return current;
        return { ...current, uniqueCropsGrown: nextSize };
      }

      if (eventType === 'decor_set') {
        const nextCount = payload.count || current.decorSetsCompleted || 0;
        if (nextCount === (current.decorSetsCompleted || 0)) return current;
        return { ...current, decorSetsCompleted: nextCount };
      }

      if (eventType === 'rare_moment') {
        return { ...current, rareMomentsSeen: (current.rareMomentsSeen || 0) + 1 };
      }

      if (eventType === 'minigame') {
        return { ...current, minigamesPlayed: (current.minigamesPlayed || 0) + 1 };
      }

      if (eventType === 'pet_day') {
        return { ...current, petsInteractedDays: (current.petsInteractedDays || 0) + 1 };
      }

      return current;
    },
    evaluateUnlocks,
  };
};
