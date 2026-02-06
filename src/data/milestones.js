export const MILESTONE_DEFINITIONS = [
  { id: 'days_3', name: 'Three Sunrises', description: 'Play 3 farm days.', type: 'daysPlayed', target: 3, reward: { titleId: 'home_grower' } },
  { id: 'days_7', name: 'Weekender', description: 'Play 7 farm days.', type: 'daysPlayed', target: 7, reward: { almanacId: 'steadied_habits' } },
  { id: 'harvest_10', name: 'Bundle Keeper', description: 'Harvest 10 crops.', type: 'totalHarvests', target: 10, reward: { memoryId: 'first_harvest' } },
  { id: 'harvest_50', name: 'Bushel Whisperer', description: 'Harvest 50 crops.', type: 'totalHarvests', target: 50, reward: { titleId: 'community_caretaker' } },
  { id: 'crops_4', name: 'Variety Patch', description: 'Grow 4 unique crops.', type: 'uniqueCropsGrown', target: 4, reward: { almanacId: 'first_steps' } },
  { id: 'decor_2', name: 'Cozy Pairing', description: 'Complete 2 decor sets.', type: 'decorSetsCompleted', target: 2, reward: { memoryId: 'cozy_cornerstone' } },
  { id: 'moments_2', name: 'Quiet Wonders', description: 'See 2 rare moments.', type: 'rareMomentsSeen', target: 2, reward: { titleId: 'misty_riser' } },
  { id: 'mini_3', name: 'Festival Hands', description: 'Play 3 mini-games.', type: 'minigamesPlayed', target: 3, reward: { almanacId: 'morning_notes' } },
];
