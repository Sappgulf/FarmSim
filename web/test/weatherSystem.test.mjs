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
});
