import { describe, it, expect, vi } from 'vitest';
import { WeatherSystem } from '../src/components/farm-sim/systems/WeatherSystem.js';

describe('WeatherSystem forecast weighting', () => {
  it('uses season weather weights when generating forecast', () => {
    const updateWeatherForecast = vi.fn();
    const state = {
      weather: 'sunny',
      season: {
        config: {
          weatherWeights: {
            snow: 1,
          },
        },
      },
    };

    const system = new WeatherSystem(state, { updateWeatherForecast });
    system.updateForecast();

    expect(updateWeatherForecast).toHaveBeenCalledTimes(1);
    const forecast = updateWeatherForecast.mock.calls[0][0];
    expect(forecast).toHaveLength(3);
    expect(forecast.every((entry) => entry.type === 'snow')).toBe(true);
  });

  it('consumes the visible forecast beat before appending a new one', () => {
    const setWeather = vi.fn();
    const updateWeatherForecast = vi.fn();
    const state = {
      weather: 'sunny',
      weatherForecast: [
        { type: 'drought', duration: 20, effects: {} },
        { type: 'rainy', duration: 20, effects: {} },
      ],
      season: { config: { weatherWeights: { sunny: 1 } } },
      plots: [],
    };

    const system = new WeatherSystem(state, { setWeather, updateWeatherForecast });
    system.changeWeather();

    expect(setWeather).toHaveBeenCalledWith('drought');
    const nextForecast = updateWeatherForecast.mock.calls[0][0];
    expect(nextForecast[0].type).toBe('rainy');
    expect(nextForecast).toHaveLength(3);
  });
});
