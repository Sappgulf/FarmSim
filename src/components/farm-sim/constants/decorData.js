/**
 * Decoration Data - Cosmetic farm decor items
 * Data-only entries used by shop + placement tools.
 */

export const DECORATION_DATA = {
  spring_blossoms: {
    id: 'spring_blossoms',
    name: 'Spring Blossom Planter',
    emoji: '🌸',
    cost: 40,
    description: 'Fresh blossoms to brighten the rows.',
    category: 'seasonal',
    season: 'spring',
    tags: ['seasonal', 'spring'],
    rarity: 'common',
  },
  summer_streamers: {
    id: 'summer_streamers',
    name: 'Summer Streamers',
    emoji: '🎏',
    cost: 55,
    description: 'Breezy banners for warm afternoons.',
    category: 'seasonal',
    season: 'summer',
    tags: ['seasonal', 'summer'],
    rarity: 'uncommon',
  },
  autumn_wreath: {
    id: 'autumn_wreath',
    name: 'Autumn Harvest Wreath',
    emoji: '🍁',
    cost: 65,
    description: 'Amber leaves to celebrate the fall.',
    category: 'seasonal',
    season: 'autumn',
    tags: ['seasonal', 'autumn'],
    rarity: 'uncommon',
  },
  winter_star_lantern: {
    id: 'winter_star_lantern',
    name: 'Star Lantern',
    emoji: '🏮',
    cost: 75,
    description: 'A soft glow for snowy nights.',
    category: 'lighting',
    season: 'winter',
    tags: ['lighting', 'seasonal', 'winter'],
    rarity: 'rare',
  },
  cozy_bench: {
    id: 'cozy_bench',
    name: 'Cozy Bench',
    emoji: '🪑',
    cost: 60,
    description: 'A quiet spot to watch the fields.',
    category: 'cozy',
    tags: ['cozy'],
    rarity: 'common',
  },
  birdbath: {
    id: 'birdbath',
    name: 'Birdbath',
    emoji: '⛲',
    cost: 70,
    description: 'Invites feathered friends to visit.',
    category: 'cozy',
    tags: ['cozy'],
    rarity: 'uncommon',
  },
  stone_path: {
    id: 'stone_path',
    name: 'Stone Path',
    emoji: '🪨',
    cost: 30,
    description: 'Neat paths between garden beds.',
    category: 'path',
    tags: ['path'],
    rarity: 'common',
  },
  picket_fence: {
    id: 'picket_fence',
    name: 'Picket Fence',
    emoji: '🪵',
    cost: 35,
    description: 'A charming fence for tidy borders.',
    category: 'fence',
    tags: ['fence'],
    rarity: 'common',
  },
};

export const DECORATION_LIST = Object.values(DECORATION_DATA);

export const getDecorationById = (decorId) => DECORATION_DATA[decorId];

export const getDecorationsByCategory = (category) =>
  DECORATION_LIST.filter((decor) => decor.category === category);

export const isLightingDecoration = (decor) => decor?.tags?.includes('lighting');

export const isSeasonalDecoration = (decor) => decor?.tags?.includes('seasonal');

export const isPathOrFenceDecoration = (decor) =>
  decor?.tags?.includes('path') || decor?.tags?.includes('fence');

export default DECORATION_DATA;
