export const MILESTONE_DEFINITIONS = [
  { id: 'days_3', name: 'Three Sunrises', description: 'Play 5 farm days.', type: 'daysPlayed', target: 5, reward: { titleId: 'home_grower' } },
  { id: 'days_7', name: 'Weekender', description: 'Play 12 farm days.', type: 'daysPlayed', target: 12, reward: { almanacId: 'steadied_habits' } },
  { id: 'harvest_10', name: 'Bundle Keeper', description: 'Harvest 20 crops.', type: 'totalHarvests', target: 20, reward: { memoryId: 'first_harvest' } },
  { id: 'harvest_50', name: 'Bushel Whisperer', description: 'Harvest 80 crops.', type: 'totalHarvests', target: 80, reward: { titleId: 'community_caretaker' } },
  { id: 'crops_4', name: 'Variety Patch', description: 'Grow 6 unique crops.', type: 'uniqueCropsGrown', target: 6, reward: { almanacId: 'first_steps' } },
  { id: 'decor_2', name: 'Cozy Pairing', description: 'Complete 3 decor sets.', type: 'decorSetsCompleted', target: 3, reward: { memoryId: 'cozy_cornerstone' } },
  { id: 'moments_2', name: 'Quiet Wonders', description: 'See 4 rare moments.', type: 'rareMomentsSeen', target: 4, reward: { titleId: 'misty_riser' } },
  { id: 'mini_3', name: 'Festival Hands', description: 'Play 6 mini-games.', type: 'minigamesPlayed', target: 6, reward: { almanacId: 'morning_notes' } },
];
