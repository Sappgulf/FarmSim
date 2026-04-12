import { describe, it, expect } from 'vitest';
import { getWeatherMeta, normalizeWeatherType, WEATHER_META } from '../src/components/farm-sim/constants/weatherData.js';

describe('weatherData', () => {
  it('normalizes weather aliases to canonical keys', () => {
    expect(normalizeWeatherType('snowy')).toBe('snow');
    expect(normalizeWeatherType('FROST')).toBe('snow');
    expect(normalizeWeatherType('rainy')).toBe('rainy');
    expect(normalizeWeatherType('hailstorm')).toBe('hail');
    expect(normalizeWeatherType('tornado')).toBe('tornado');
    expect(normalizeWeatherType('twister')).toBe('tornado');
    expect(normalizeWeatherType('hazy')).toBe('foggy');
  });

  it('returns weather metadata with sunny fallback', () => {
    expect(getWeatherMeta('snowy').emoji).toBe('❄️');
    expect(getWeatherMeta('snow').label).toBe('Snow');
    expect(getWeatherMeta('unknown_weather').key).toBe('sunny');
  });

  it('includes all new weather types', () => {
    expect(WEATHER_META.foggy).toBeDefined();
    expect(WEATHER_META.foggy.emoji).toBe('🌫️');
    expect(WEATHER_META.hail).toBeDefined();
    expect(WEATHER_META.hail.emoji).toBe('🧊');
    expect(WEATHER_META.tornado).toBeDefined();
    expect(WEATHER_META.tornado.emoji).toBe('🌪️');
  });

  it('has proper header styles for all weather types', () => {
    expect(WEATHER_META.foggy.headerClassName).toContain('gray');
    expect(WEATHER_META.hail.headerClassName).toContain('sky');
    expect(WEATHER_META.tornado.headerClassName).toContain('red');
  });
});
