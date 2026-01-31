export const DECORATION_ITEMS = [
  {
    id: 'fence-post',
    label: 'Fence Post',
    emoji: '🪵',
    description: 'A cozy wooden fence post.',
    category: 'fence'
  },
  {
    id: 'fence-rail',
    label: 'Fence Rail',
    emoji: '🧱',
    description: 'A low fence rail for borders.',
    category: 'fence'
  },
  {
    id: 'path-stone',
    label: 'Stone Path',
    emoji: '🪨',
    description: 'A simple stone path tile.',
    category: 'path'
  },
  {
    id: 'path-dirt',
    label: 'Dirt Path',
    emoji: '🟤',
    description: 'A warm dirt walkway.',
    category: 'path'
  },
  {
    id: 'flower-bed',
    label: 'Flower Bed',
    emoji: '🌸',
    description: 'A small patch of flowers.',
    category: 'flora'
  },
  {
    id: 'wildflowers',
    label: 'Wildflowers',
    emoji: '🌼',
    description: 'Cozy wildflowers for color.',
    category: 'flora'
  },
  {
    id: 'lantern',
    label: 'Lantern',
    emoji: '🏮',
    description: 'A warm lantern glow.',
    category: 'light'
  },
  {
    id: 'rock',
    label: 'Rock',
    emoji: '🪨',
    description: 'A sturdy rock prop.',
    category: 'prop'
  },
  {
    id: 'hay-bale',
    label: 'Hay Bale',
    emoji: '🧺',
    description: 'A rustic hay bale.',
    category: 'prop'
  },
  {
    id: 'water-trough',
    label: 'Water Trough',
    emoji: '🪣',
    description: 'A trough for farm animals.',
    category: 'prop'
  }
];

export const DECORATION_LOOKUP = DECORATION_ITEMS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export const DEFAULT_DECORATE_TOOL = 'place';
