import { describe, it, expect } from 'vitest';
import { getWeatherMeta, normalizeWeatherType } from '../src/components/farm-sim/constants/weatherData.js';

describe('weatherData', () => {
  it('normalizes weather aliases to canonical keys', () => {
    expect(normalizeWeatherType('snowy')).toBe('snow');
    expect(normalizeWeatherType('FROST')).toBe('snow');
    expect(normalizeWeatherType('rainy')).toBe('rainy');
  });

  it('returns weather metadata with sunny fallback', () => {
    expect(getWeatherMeta('snowy').emoji).toBe('❄️');
    expect(getWeatherMeta('snow').label).toBe('Snow');
    expect(getWeatherMeta('unknown_weather').key).toBe('sunny');
  });
});
