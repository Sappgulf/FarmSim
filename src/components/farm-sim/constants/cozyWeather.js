export const COZY_WEATHER_MAP = {
  sunny: 'clear',
  rainy: 'rain',
  cloudy: 'cloudy',
  stormy: 'rain',
  snow: 'cloudy',
  snowy: 'cloudy',
  windy: 'cloudy',
  drought: 'heatwave',
  heatwave: 'heatwave',
  hot: 'heatwave',
};

export const COZY_WEATHER_LABELS = {
  clear: 'Clear',
  rain: 'Rain',
  cloudy: 'Cloudy',
  heatwave: 'Heatwave',
};

export const COZY_WEATHER_EMOJI = {
  clear: '☀️',
  rain: '🌧️',
  cloudy: '☁️',
  heatwave: '🌤️',
};

export const COZY_WEATHER_EFFECTS = {
  clear: { growth: '+15%', water: 'Light drain', disease: 'Low' },
  rain: { growth: '+10%', water: 'Auto-water', disease: 'Low' },
  cloudy: { growth: '+5%', water: 'Gentle', disease: 'Very low' },
  heatwave: { growth: 'Normal', water: 'Extra thirst', disease: 'Low' },
};

export const getCozyWeatherType = (weather) => COZY_WEATHER_MAP[weather] || 'cloudy';
