/**
 * Semantic art manifest for the farm board.
 *
 * Gameplay code should refer to stable keys such as `crop.carrot`, not to a
 * filename or an emoji. The current renderer supplies vector art for these
 * keys; the manifest is intentionally shaped so generated PNG/SVG assets can
 * replace individual entries later without changing game state.
 */

const CROP_ART = {
  carrot: { shape: 'root', leaf: '#4d9f63', accent: '#f28b39', shadow: '#d66d27' },
  parsnip: { shape: 'root', leaf: '#6f9c64', accent: '#e9d2a6', shadow: '#c4a678' },
  potato: { shape: 'root', leaf: '#648e58', accent: '#c69a68', shadow: '#9a7047' },
  turnip: { shape: 'root', leaf: '#6eaa6d', accent: '#eee3d2', shadow: '#c7a7a1' },
  lettuce: { shape: 'leaf', leaf: '#4d9e65', accent: '#8bcf79', shadow: '#39804f' },
  cabbage: { shape: 'leaf', leaf: '#3f8758', accent: '#72b968', shadow: '#2e6a47' },
  kale: { shape: 'leaf', leaf: '#3e8051', accent: '#78b96d', shadow: '#2c6541' },
  tomato: { shape: 'vine', leaf: '#4d9b5a', accent: '#e7654e', shadow: '#c8493a' },
  strawberry: { shape: 'vine', leaf: '#5a9e5c', accent: '#ef6a68', shadow: '#c6484c' },
  blueberry: { shape: 'vine', leaf: '#588d67', accent: '#6e83d1', shadow: '#4b5fb0' },
  cranberry: { shape: 'vine', leaf: '#5d9362', accent: '#d35f65', shadow: '#a9444e' },
  watermelon: { shape: 'vine', leaf: '#4b955b', accent: '#6bbd72', shadow: '#39814b' },
  pumpkin: { shape: 'vine', leaf: '#5d9b58', accent: '#e79a42', shadow: '#c7772c' },
  eggplant: { shape: 'vine', leaf: '#5f9c62', accent: '#8d6bb8', shadow: '#664994' },
  chili: { shape: 'vine', leaf: '#4e8e52', accent: '#df5b50', shadow: '#b83c3c' },
  corn: { shape: 'grain', leaf: '#86a653', accent: '#f1c84a', shadow: '#c69f32' },
  wheat: { shape: 'grain', leaf: '#9baa5d', accent: '#e2bd61', shadow: '#ba8d44' },
  rice: { shape: 'grain', leaf: '#7fa467', accent: '#f1d987', shadow: '#c3a957' },
  garlic: { shape: 'root', leaf: '#6a9c66', accent: '#e7dfcc', shadow: '#b8a995' },
  ginger_root: { shape: 'root', leaf: '#6b9c5d', accent: '#d9a45f', shadow: '#b77b40' },
  snowdrop: { shape: 'flower', leaf: '#69a16b', accent: '#f4f1dd', shadow: '#c7c4b0' },
  seedling: { shape: 'seedling', leaf: '#5ca56a', accent: '#97cf77', shadow: '#3c8050' },
};

const UI_ART = {
  'terrain.field': { type: 'terrain', shape: 'soil' },
  'terrain.path': { type: 'terrain', shape: 'path' },
  'terrain.water': { type: 'terrain', shape: 'water' },
  'terrain.atmosphere': {
    type: 'terrain',
    shape: 'atmosphere',
    src: '/assets/farm/meadowlight-atmosphere.webp',
    alt: 'Meadowlight farm meadow with hills, creek, wildflowers, and fence paths',
  },
  'decor.flowerbed': { type: 'decor', shape: 'flowerbed' },
};

/**
 * Optional generated-art slots. A generated state asset can be enabled by
 * adding its imported URL to `stateSources` and flipping `available` to true;
 * gameplay and component APIs stay unchanged.
 */
const GENERATED_ART_SLOTS = Object.freeze(
  Object.fromEntries(
    Object.keys(CROP_ART).map((cropId) => [
      `crop.${cropId}`,
      {
        available: false,
        stateSources: Object.freeze({}),
        sourceNote: 'Reserved for generated crop-state art.',
      },
    ])
  )
);

export const FARM_ASSET_REGISTRY = Object.freeze({
  ...Object.fromEntries(
    Object.entries(CROP_ART).map(([id, art]) => [
      `crop.${id}`,
      { id: `crop.${id}`, type: 'crop', ...art, generated: GENERATED_ART_SLOTS[`crop.${id}`] },
    ])
  ),
  ...Object.fromEntries(Object.entries(UI_ART).map(([id, art]) => [id, { id, ...art }])),
});

export const getFarmAsset = (assetId = 'crop.seedling') => {
  const rawKey = String(assetId);
  const key = FARM_ASSET_REGISTRY[rawKey]
    ? rawKey
    : rawKey.startsWith('crop.')
      ? rawKey
      : `crop.${rawKey}`;
  return FARM_ASSET_REGISTRY[key] || FARM_ASSET_REGISTRY['crop.seedling'];
};

export const getFarmAssetKey = (cropId = 'seedling') => `crop.${cropId}`;

export const getGeneratedFarmAssetSource = (assetId, state = 'growing') => {
  const asset = getFarmAsset(assetId);
  if (!asset.generated?.available) return null;
  return asset.generated.stateSources?.[state] || asset.generated.stateSources?.growing || null;
};

export default FARM_ASSET_REGISTRY;
