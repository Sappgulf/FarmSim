const WEATHER_ALIASES = Object.freeze({
  snowy: 'snow',
  frost: 'snow',
  hazy: 'foggy',
});

export const WEATHER_META = Object.freeze({
  sunny: Object.freeze({
    key: 'sunny',
    label: 'Sunny',
    emoji: '☀️',
    headerClassName: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60',
  }),
  cloudy: Object.freeze({
    key: 'cloudy',
    label: 'Cloudy',
    emoji: '☁️',
    headerClassName: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/70',
  }),
  rainy: Object.freeze({
    key: 'rainy',
    label: 'Rainy',
    emoji: '🌧️',
    headerClassName: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/70',
  }),
  stormy: Object.freeze({
    key: 'stormy',
    label: 'Stormy',
    emoji: '⛈️',
    headerClassName: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200/70',
  }),
  drought: Object.freeze({
    key: 'drought',
    label: 'Drought',
    emoji: '🏜️',
    headerClassName: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/70',
  }),
  snow: Object.freeze({
    key: 'snow',
    label: 'Snow',
    emoji: '❄️',
    headerClassName: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200/70',
  }),
  windy: Object.freeze({
    key: 'windy',
    label: 'Windy',
    emoji: '💨',
    headerClassName: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/70',
  }),
  foggy: Object.freeze({
    key: 'foggy',
    label: 'Foggy',
    emoji: '🌫️',
    headerClassName: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300/70',
  }),
});

export const normalizeWeatherType = (weatherType) => {
  if (typeof weatherType !== 'string') return 'sunny';
  const normalized = weatherType.trim().toLowerCase();
  return WEATHER_ALIASES[normalized] || normalized;
};

export const getWeatherMeta = (weatherType) => {
  const normalized = normalizeWeatherType(weatherType);
  return WEATHER_META[normalized] || WEATHER_META.sunny;
};
