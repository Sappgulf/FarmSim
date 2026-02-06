export const createMilestoneManager = (definitions = []) => {
  const milestones = definitions;

  const evaluateUnlocks = (progress = {}, unlocked = {}) => milestones
    .filter((m) => !unlocked[m.id] && Number(progress[m.type] || 0) >= Number(m.target || 0));

  return {
    registerMilestones: () => milestones,
    onEvent: (eventType, payload = {}, progress = {}) => {
      const next = { ...progress };
      if (eventType === 'day_advance') next.daysPlayed = (next.daysPlayed || 0) + 1;
      if (eventType === 'harvest') next.totalHarvests = (next.totalHarvests || 0) + (payload.count || 1);
      if (eventType === 'unique_crop') next.uniqueCropsGrown = Math.max(next.uniqueCropsGrown || 0, payload.size || 0);
      if (eventType === 'decor_set') next.decorSetsCompleted = payload.count || next.decorSetsCompleted || 0;
      if (eventType === 'rare_moment') next.rareMomentsSeen = (next.rareMomentsSeen || 0) + 1;
      if (eventType === 'minigame') next.minigamesPlayed = (next.minigamesPlayed || 0) + 1;
      if (eventType === 'pet_day') next.petsInteractedDays = (next.petsInteractedDays || 0) + 1;
      return next;
    },
    evaluateUnlocks,
  };
};
