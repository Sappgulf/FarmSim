/**
 * Building bonus multipliers for the classic {@link ../components/FarmGame.jsx} grid loop.
 * @param {string[]} buildings
 * @returns {Record<string, number>}
 */
export function computeBuildingBonuses(buildings) {
  const bonuses = {};
  if (!Array.isArray(buildings)) return bonuses;
  if (buildings.includes('barn')) bonuses.barnBonus = 0.2;
  if (buildings.includes('greenhouse')) bonuses.greenhouseBonus = 0.5;
  if (buildings.includes('beehive')) bonuses.beehiveBonus = 0.25;
  if (buildings.includes('windmill')) bonuses.windmillIncome = 5;
  return bonuses;
}
