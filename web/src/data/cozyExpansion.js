export const CROP_TRAITS = {
  sun_kissed: {
    id: 'sun_kissed',
    name: 'Sun-Kissed',
    icon: '☀️',
    style: 'warm hue',
    flavor: 'Looks gently warmed by sunrise light.',
  },
  dew_glow: {
    id: 'dew_glow',
    name: 'Dew Glow',
    icon: '💧',
    style: 'soft glow',
    flavor: 'Petals shimmer with morning dew.',
  },
  starlace: {
    id: 'starlace',
    name: 'Starlace',
    icon: '✨',
    style: 'speckled pattern',
    flavor: 'Tiny star-like flecks across the leaves.',
  },
  moonblush: {
    id: 'moonblush',
    name: 'Moonblush',
    icon: '🌙',
    style: 'cool tint',
    flavor: 'A silver-lilac tint appears at the edges.',
  },
};

export const CROP_TRAIT_IDS = Object.keys(CROP_TRAITS);

export const RARE_MOMENTS = {
  golden_crop: {
    id: 'golden_crop',
    name: 'Golden Crop',
    icon: '🌟',
    chance: 0.008,
    trigger: 'harvest',
    memoryId: 'golden_crop',
    almanacPageId: 'golden_crop_note',
    titleId: 'golden_tender',
  },
  shooting_star_night: {
    id: 'shooting_star_night',
    name: 'Shooting Star Night',
    icon: '🌠',
    chance: 0.007,
    trigger: 'nightfall',
    memoryId: 'shooting_star_night',
    almanacPageId: 'shooting_star_night',
    titleId: 'stargazer_farm',
  },
  perfect_harvest_morning: {
    id: 'perfect_harvest_morning',
    name: 'Perfect Harvest Morning',
    icon: '🌅',
    chance: 0.009,
    trigger: 'day_rollover',
    memoryId: 'perfect_harvest_morning',
    almanacPageId: 'perfect_harvest_morning',
    titleId: 'dawn_harvester',
  },
};

export const DECOR_SETS = [
  {
    id: 'lantern_walk',
    name: 'Lantern Walk',
    itemIds: ['stone_path', 'winter_star_lantern', 'spring_blossoms'],
    memoryId: 'lantern_walk_complete',
    almanacPageId: 'decor_set_lantern_walk',
    titleId: 'pathlight_keeper',
  },
  {
    id: 'hearth_garden',
    name: 'Hearth Garden',
    itemIds: ['flower_box', 'cozy_bench', 'birdbath'],
    memoryId: 'hearth_garden_complete',
    almanacPageId: 'decor_set_hearth_garden',
    titleId: 'cozy_curator',
  },
  {
    id: 'harvest_border',
    name: 'Harvest Border',
    itemIds: ['picket_fence', 'summer_streamers', 'autumn_wreath'],
    memoryId: 'harvest_border_complete',
    almanacPageId: 'decor_set_harvest_border',
    titleId: 'harvest_host',
  },
  {
    id: 'twilight_grove',
    name: 'Twilight Grove',
    itemIds: ['fairy_lights', 'mushroom_log', 'candle_jar'],
    memoryId: 'twilight_grove_complete',
    almanacPageId: 'decor_set_twilight_grove',
    titleId: 'twilight_tender',
  },
  {
    id: 'cottage_corner',
    name: 'Cottage Corner',
    itemIds: ['rocking_chair', 'wind_chime', 'herb_planter'],
    memoryId: 'cottage_corner_complete',
    almanacPageId: 'decor_set_cottage_corner',
    titleId: 'cottage_keeper',
  },
  {
    id: 'wildflower_walk',
    name: 'Wildflower Walk',
    itemIds: ['butterfly_bush', 'sunflower_row', 'mossy_stepping_stones'],
    memoryId: 'wildflower_walk_complete',
    almanacPageId: 'decor_set_wildflower_walk',
    titleId: 'wildflower_warden',
  },
  {
    id: 'grand_entrance',
    name: 'Grand Entrance',
    itemIds: ['iron_gate', 'hedge_row', 'brick_path'],
    memoryId: 'grand_entrance_complete',
    almanacPageId: 'decor_set_grand_entrance',
    titleId: 'estate_keeper',
  },
  {
    id: 'trinket_nook',
    name: 'Trinket Nook',
    itemIds: ['wind_spinner', 'tiny_pond_frog', 'sun_chime'],
    memoryId: 'trinket_nook_complete',
    almanacPageId: 'decor_set_trinket_nook',
    titleId: 'trinket_tender',
  },
  {
    id: 'four_seasons',
    name: 'Four Seasons',
    itemIds: ['cherry_blossom_tree', 'beach_umbrella', 'scarecrow', 'snowman'],
    memoryId: 'four_seasons_complete',
    almanacPageId: 'decor_set_four_seasons',
    titleId: 'season_collector',
  },
];

export const FARM_TITLES = {
  home_grower: {
    id: 'home_grower',
    name: 'Home Grower',
    hint: 'Default title.',
  },
  golden_tender: { id: 'golden_tender', name: 'Golden Tender', hint: 'Witness Golden Crop.' },
  stargazer_farm: {
    id: 'stargazer_farm',
    name: 'Stargazer Farm',
    hint: 'Witness Shooting Star Night.',
  },
  dawn_harvester: {
    id: 'dawn_harvester',
    name: 'Dawn Harvester',
    hint: 'Witness Perfect Harvest Morning.',
  },
  pathlight_keeper: {
    id: 'pathlight_keeper',
    name: 'Pathlight Keeper',
    hint: 'Complete Lantern Walk set.',
  },
  cozy_curator: { id: 'cozy_curator', name: 'Cozy Curator', hint: 'Complete Hearth Garden set.' },
  harvest_host: { id: 'harvest_host', name: 'Harvest Host', hint: 'Complete Harvest Border set.' },
  twilight_tender: {
    id: 'twilight_tender',
    name: 'Twilight Tender',
    hint: 'Complete Twilight Grove set.',
  },
  cottage_keeper: {
    id: 'cottage_keeper',
    name: 'Cottage Keeper',
    hint: 'Complete Cottage Corner set.',
  },
  wildflower_warden: {
    id: 'wildflower_warden',
    name: 'Wildflower Warden',
    hint: 'Complete Wildflower Walk set.',
  },
  estate_keeper: {
    id: 'estate_keeper',
    name: 'Estate Keeper',
    hint: 'Complete Grand Entrance set.',
  },
  season_collector: {
    id: 'season_collector',
    name: 'Season Collector',
    hint: 'Complete Four Seasons set.',
  },
  trinket_tender: {
    id: 'trinket_tender',
    name: 'Trinket Tender',
    hint: 'Complete Trinket Nook set.',
  },
  almanac_whisperer: {
    id: 'almanac_whisperer',
    name: 'Almanac Whisperer',
    hint: 'Unlock many Almanac pages.',
  },
};

export const WEEKLY_SPECIAL_DAY = {
  dayIndex: 5,
  id: 'market_glow_day',
  name: 'Market Glow Day',
  boardCopy:
    'Town Board: Market Glow Day! Pets are playful and decor spotlights feel extra cozy today.',
};

export const TIME_OF_DAY_VISUALS = {
  morning: { tint: 'rgba(255, 210, 160, 0.12)', filter: 'saturate(1.04) brightness(1.02)' },
  dusk: { tint: 'rgba(214, 144, 255, 0.14)', filter: 'saturate(0.98) brightness(0.98)' },
  night: { tint: 'rgba(122, 168, 255, 0.14)', filter: 'saturate(0.92) brightness(0.92)' },
  day: { tint: 'transparent', filter: 'none' },
};

export const VISUAL_WEATHER_ROTATION = ['sunny', 'cloudy', 'rainy', 'windy', 'foggy'];
