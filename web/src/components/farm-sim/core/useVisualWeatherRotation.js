import { useEffect } from 'react';
import { VISUAL_WEATHER_ROTATION } from '../../../data/cozyExpansion';

export function useVisualWeatherRotation({ actions, dayCount, hasCozyVisualWeather }) {
  useEffect(() => {
    if (hasCozyVisualWeather) return;
    const weather = VISUAL_WEATHER_ROTATION[dayCount % VISUAL_WEATHER_ROTATION.length];
    actions.recordCozyExpansionEvent?.('weather_changed', { weather });
  }, [actions, dayCount, hasCozyVisualWeather]);
}
