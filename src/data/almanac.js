/**
 * Almanac data - sections and page definitions.
 * Almanac pages are knowledge entries unlocked through events.
 */

export const ALMANAC_SEASONS = ['spring', 'summer', 'fall', 'winter'];
export const ALMANAC_WEATHER_TYPES = ['sunny', 'cloudy', 'rainy', 'stormy', 'drought', 'snow', 'windy'];

export const ALMANAC_SECTIONS = [
  {
    id: 'seasons',
    title: 'Seasons',
    description: 'What each season has meant for this farm.',
    icon: '🍂',
  },
  {
    id: 'weather',
    title: 'Weather',
    description: 'Sky notes and field observations.',
    icon: '🌤️',
  },
  {
    id: 'crops',
    title: 'Crops',
    description: 'Patterns in the harvests.',
    icon: '🌾',
  },
  {
    id: 'festivals',
    title: 'Festivals',
    description: 'Moments shared with the town.',
    icon: '🎉',
  },
  {
    id: 'farm_notes',
    title: 'Farm Notes',
    description: 'Gentle guidance shaped by your philosophy.',
    icon: '📝',
  },
];

export const ALMANAC_PAGES = [
  {
    id: 'spring_turning',
    section: 'seasons',
    title: 'Spring Turning',
    icon: '🌸',
    hint: 'Welcome spring as the season begins.',
    unlock: { type: 'season_start', season: 'spring' },
    text: {
      default: 'New shoots always feel like a promise. The soil wakes up softly.',
      nature: 'The earth listens first in spring. Let the fields lead the pace.',
      market: 'Spring is for smart starts. Early crops set the tone for sales.',
      slow: 'Spring breathes in. Take it slow and savor the first sprouts.',
    },
  },
  {
    id: 'summer_glow',
    section: 'seasons',
    title: 'Summer Glow',
    icon: '☀️',
    hint: 'Let summer arrive in full.',
    unlock: { type: 'season_start', season: 'summer' },
    text: {
      default: 'Long light stretches across the rows. Growth feels eager.',
      nature: 'Summer hums with energy. Follow the sun and the wind.',
      market: 'Heat brings demand. Keep a steady harvest rhythm.',
      slow: 'The days are long, but the farm can still move gently.',
    },
  },
  {
    id: 'autumn_gold',
    section: 'seasons',
    title: 'Autumn Gold',
    icon: '🍁',
    hint: 'See the first fall transition.',
    unlock: { type: 'season_start', season: 'fall' },
    text: {
      default: 'Fields glow with quiet abundance. The air smells like harvest.',
      nature: 'Autumn is a soft thank you. Leave room for the land to rest.',
      market: 'Peak season means peak prices. Plan your baskets well.',
      slow: 'Let the harvest be unhurried. Warm light makes the work sweet.',
    },
  },
  {
    id: 'winter_quiet',
    section: 'seasons',
    title: 'Winter Quiet',
    icon: '❄️',
    hint: 'Let winter settle on the farm.',
    unlock: { type: 'season_start', season: 'winter' },
    text: {
      default: 'Silence gathers along the fences. Even the barn breathes softly.',
      nature: 'Winter teaches patience. Let the fields sleep in peace.',
      market: 'Scarcity sharpens value. Keep a careful eye on stocks.',
      slow: 'Winter is for warm tea and small tasks done with care.',
    },
  },
  {
    id: 'full_circle',
    section: 'seasons',
    title: 'Full Circle',
    icon: '🌀',
    hint: 'Experience every season at least once.',
    unlock: { type: 'seasons_complete' },
    text: {
      default: 'The farm has turned through every season. The rhythm feels familiar now.',
      nature: 'Seasons are the farm’s heartbeat. You’ve learned its steady pulse.',
      market: 'A full cycle reveals the trends. You know when to push and when to pause.',
      slow: 'A year’s worth of moments now lives here. Cozy and complete.',
    },
  },
  {
    id: 'rainsoft_fields',
    section: 'weather',
    title: 'Rainsoft Fields',
    icon: '🌧️',
    hint: 'Harvest while rain is falling.',
    unlock: { type: 'rainy_harvest' },
    text: {
      default: 'Rain leaves the soil tender. Harvests feel gentler in the hush.',
      nature: 'The rain sings for the roots. You listened and gathered softly.',
      market: 'Rain days can still pay. A calm harvest keeps the ledger warm.',
      slow: 'Rain makes everything slower and sweeter. Let the drops keep time.',
    },
  },
  {
    id: 'stormwatch',
    section: 'weather',
    title: 'Stormwatch',
    icon: '⛈️',
    hint: 'Witness a stormy sky.',
    unlock: { type: 'weather_observed', weather: 'stormy' },
    text: {
      default: 'You stood with the farm through wild weather. The fields remember.',
      nature: 'Storms are a reminder of the sky’s power. You stayed grounded.',
      market: 'Storms test planning. You kept the farm steady anyway.',
      slow: 'Even storms pass. You waited it out with a steady heart.',
    },
  },
  {
    id: 'reading_the_sky',
    section: 'weather',
    title: 'Reading the Sky',
    icon: '🌈',
    hint: 'Experience every weather type.',
    unlock: { type: 'all_weather_seen' },
    text: {
      default: 'Every kind of sky has visited your farm. You can read its moods now.',
      nature: 'The weather has told you its stories. You learned each one.',
      market: 'Knowing the sky means knowing the market. You plan with confidence.',
      slow: 'You’ve watched the sky change and found peace in each shift.',
    },
  },
  {
    id: 'cold_roots',
    section: 'crops',
    title: 'Cold Roots',
    icon: '🥕',
    hint: 'Harvest a crop during winter.',
    unlock: { type: 'winter_harvest' },
    text: {
      default: 'Something still grew in the cold. Your farm is patient and brave.',
      nature: 'Winter harvests are rare gifts. You treated them with care.',
      market: 'Off-season crops fetch attention. You found value in the cold.',
      slow: 'A winter harvest is a quiet joy. Warm hands, warm heart.',
    },
  },
  {
    id: 'reliable_favorite',
    section: 'crops',
    title: 'A Reliable Favorite',
    icon: '🌱',
    hint: 'Harvest the same crop across three seasons.',
    unlock: { type: 'crop_three_seasons' },
    text: {
      default: 'One crop keeps returning to your fields. A faithful favorite.',
      nature: 'Some plants just belong here. You found one that stays.',
      market: 'Reliable crops keep the ledger calm. Consistency looks good.',
      slow: 'There’s comfort in the familiar. A favorite, season after season.',
    },
  },
  {
    id: 'gathering_light',
    section: 'festivals',
    title: 'Gathering Light',
    icon: '🏮',
    hint: 'Attend your first festival.',
    unlock: { type: 'festival_attended', count: 1 },
    text: {
      default: 'The town gathered, and so did you. The farm feels less alone.',
      nature: 'Festivals remind the land it’s shared. You felt the warmth.',
      market: 'Festivals bring opportunities and stories. You showed up.',
      slow: 'A night of lanterns, a heart full of quiet joy.',
    },
  },
  {
    id: 'festival_regular',
    section: 'festivals',
    title: 'Festival Regular',
    icon: '🎪',
    hint: 'Attend three seasonal festivals.',
    unlock: { type: 'festival_attended', count: 3 },
    text: {
      default: 'The town knows your footsteps now. You’re part of the rhythm.',
      nature: 'Seasonal gatherings ground the year. You came each time.',
      market: 'Showing up builds trust. Your stall is becoming familiar.',
      slow: 'The festivals feel like home now. A cozy tradition.',
    },
  },
  {
    id: 'philosophy_compass',
    section: 'farm_notes',
    title: 'Philosophy Compass',
    icon: '🧭',
    hint: 'Choose a farm philosophy.',
    unlock: { type: 'philosophy_selected' },
    text: {
      default: 'You chose a gentle direction. Let it guide the small decisions.',
      nature: 'Follow the land’s quiet cues. They’ll guide you well.',
      market: 'Keep your eyes on the trends. Small margins add up.',
      slow: 'Let the farm be a place of calm. Move at the speed of comfort.',
    },
  },
  {
    id: 'morning_notes',
    section: 'farm_notes',
    title: 'Morning Notes',
    icon: '🫖',
    hint: 'Let a new day begin on the farm.',
    unlock: { type: 'day_rollover', count: 1 },
    text: {
      default: 'Each morning adds a new line to the farm’s story.',
      nature: 'A new day means new signals from the land.',
      market: 'A fresh day is a fresh plan. Check the ledger and the sky.',
      slow: 'Morning light feels like a soft promise. Start gently.',
    },
  },
  {
    id: 'steadied_habits',
    section: 'farm_notes',
    title: 'Steadied Habits',
    icon: '📌',
    hint: 'See three day rollovers.',
    unlock: { type: 'day_rollover', count: 3 },
    text: {
      default: 'Small rituals are taking root. The farm feels steady.',
      nature: 'With each day, the land learns your rhythm.',
      market: 'Consistency keeps the farm strong. The routine is paying off.',
      slow: 'A calm routine is a quiet treasure. You’re finding it.',
    },
  },
];

export const ALMANAC_PAGE_INDEX = ALMANAC_PAGES.reduce((acc, page) => {
  acc[page.id] = page;
  return acc;
}, {});

export const ALMANAC_MEMORY_LINKS = {
  first_rainy_harvest: 'rainsoft_fields',
  festival_first: 'gathering_light',
  festival_regular: 'festival_regular',
};
