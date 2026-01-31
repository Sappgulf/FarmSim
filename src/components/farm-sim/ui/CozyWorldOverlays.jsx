import React, { memo, useEffect, useMemo, useState } from 'react';
import WeatherEffects from './WeatherEffects';
import { getCozyWeatherType } from '../constants/cozyWeather';

const buildAmbientItems = (count, label) => (
  Array.from({ length: count }, (_, index) => ({
    id: `${label}-${index}`,
    left: Math.random() * 100,
    top: Math.random() * 60,
    delay: Math.random() * 4,
    duration: 10 + Math.random() * 8,
    size: 14 + Math.random() * 10,
  }))
);

const CozyWorldOverlays = memo(({ season, weather, timeOfDay, reducedEffects }) => {
  const cozyWeather = getCozyWeatherType(weather);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof document === 'undefined') return true;
    return !document.hidden;
  });

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const ambientItems = useMemo(() => {
    if (reducedEffects) return [];
    if (season === 'spring' || season === 'summer') {
      return buildAmbientItems(4, 'butterfly');
    }
    if (season === 'fall') {
      return buildAmbientItems(5, 'leaf');
    }
    if (season === 'winter') {
      return buildAmbientItems(6, 'snow');
    }
    return [];
  }, [season, reducedEffects]);

  return (
    <div className="cozy-world-layer" aria-hidden="true">
      <div className={`cozy-season-overlay season-${season}`} />
      <div className={`cozy-weather-overlay weather-${cozyWeather} ${reducedEffects ? 'reduced-effects' : ''}`} />
      <div
        className={`cozy-lighting cozy-lighting-${timeOfDay} ${reducedEffects ? 'cozy-lighting-static' : ''}`}
      />

      {!reducedEffects && ambientItems.length > 0 && (
        <div className={`cozy-ambient-life ${isVisible ? '' : 'is-paused'} season-${season}`}>
          {ambientItems.map((item) => (
            <div
              key={item.id}
              className={`ambient-item ambient-${season}`}
              style={{
                left: `${item.left}%`,
                top: `${item.top}%`,
                fontSize: `${item.size}px`,
                animationDelay: `${item.delay}s`,
                animationDuration: `${item.duration}s`,
              }}
            >
              {season === 'fall' && '🍂'}
              {season === 'winter' && '❄️'}
              {(season === 'spring' || season === 'summer') && '🦋'}
            </div>
          ))}
        </div>
      )}

      <WeatherEffects weather={weather} intensity={reducedEffects ? 0.35 : 0.8} />
    </div>
  );
});

CozyWorldOverlays.displayName = 'CozyWorldOverlays';

export default CozyWorldOverlays;
