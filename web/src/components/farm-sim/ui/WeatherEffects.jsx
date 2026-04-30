import React, { memo, useMemo } from 'react';
import { normalizeWeatherType } from '../constants/weatherData';
import perfConfig from '../../../performance.js';

/**
 * Weather Effects Overlay Component
 * Provides visual weather effects like rain, snow, sun rays with smooth transitions
 */
const WeatherEffects = memo(({ weather, intensity = 1, timePeriod = 'day', reducedEffects = false }) => {
  const normalizedWeather = normalizeWeatherType(weather);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const prevWeatherRef = React.useRef(normalizedWeather);
  const [perfTuneRev, bumpPerfTuneRev] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const bump = () => bumpPerfTuneRev((n) => n + 1);
    window.addEventListener('perfConfigChanged', bump);
    return () => window.removeEventListener('perfConfigChanged', bump);
  }, []);

  // Detect weather change and trigger transition
  React.useEffect(() => {
    if (prevWeatherRef.current !== normalizedWeather) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        prevWeatherRef.current = normalizedWeather;
      }, 500); // 500ms transition
      return () => clearTimeout(timer);
    }
  }, [normalizedWeather]);
  
  // Generate particle elements based on weather type
  const particles = useMemo(() => {
    if (!normalizedWeather || normalizedWeather === 'sunny' || normalizedWeather === 'cloudy') return [];
    if (!perfConfig?.particles?.enabled || reducedEffects) return [];

    const maxConfigured = perfConfig?.particles?.maxCount ?? 150;
    const budget = Math.max(8, Math.floor(maxConfigured * 0.75));

    let particleCountRaw = 30;
    if (normalizedWeather === 'stormy') particleCountRaw = 100;
    else if (normalizedWeather === 'rainy') particleCountRaw = 60;
    else if (normalizedWeather === 'snow') particleCountRaw = 50;
    else if (normalizedWeather === 'hail') particleCountRaw = 45;

    const particleCount = Math.max(0, Math.min(Math.floor(particleCountRaw * intensity), budget));

    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 1 + Math.random() * 2,
      size: normalizedWeather === 'snow' ? 3 + Math.random() * 3 : 1 + Math.random() * 2,
    }));
  }, [normalizedWeather, intensity, reducedEffects, perfTuneRev]);

  const sceneToneClassName = `weather-scene weather-scene--${normalizedWeather || 'sunny'} weather-scene--${timePeriod}`;

  if (!normalizedWeather) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-10 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <div className={sceneToneClassName} aria-hidden="true" />

      {normalizedWeather === 'sunny' && !reducedEffects && (
        <>
          <div className="weather-sunbeam weather-sunbeam--left" />
          <div className="weather-sunbeam weather-sunbeam--right" />
        </>
      )}

      {normalizedWeather === 'cloudy' && (
        <>
          <div className="weather-cloud-shadow weather-cloud-shadow--one" />
          <div className="weather-cloud-shadow weather-cloud-shadow--two" />
        </>
      )}

      {normalizedWeather === 'rainy' && (
        <>
          <div className="weather-mist weather-mist--cool" />
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-0.5 bg-blue-400 opacity-60 rain-drop"
              style={{
                left: `${particle.left}%`,
                height: `${particle.size * 10}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </>
      )}

      {normalizedWeather === 'stormy' && (
        <>
          <div className="weather-storm-vignette" />
          <div className="weather-mist weather-mist--storm" />
          {/* Rain */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-0.5 bg-blue-600 opacity-70 rain-drop-heavy"
              style={{
                left: `${particle.left}%`,
                height: `${particle.size * 15}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration * 0.7}s`,
              }}
            />
          ))}
          {!reducedEffects && <div className="lightning-flash" />}
        </>
      )}

      {normalizedWeather === 'snow' && (
        <>
          <div className="weather-mist weather-mist--frost" />
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-white opacity-80 snowflake"
              style={{
                left: `${particle.left}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration * 2}s`,
              }}
            />
          ))}
        </>
      )}

      {normalizedWeather === 'windy' && (
        <>
          <div className="weather-gust weather-gust--one" />
          <div className="weather-gust weather-gust--two" />
          <div className="weather-gust weather-gust--three" />
        </>
      )}

      {normalizedWeather === 'drought' && (
        <>
          <div className="weather-heat-haze weather-heat-haze--one" />
          <div className="weather-heat-haze weather-heat-haze--two" />
        </>
      )}

      {normalizedWeather === 'foggy' && (
        <>
          <div className="weather-fog-layer weather-fog-layer--back" />
          <div className="weather-fog-layer weather-fog-layer--front" />
        </>
      )}

      {normalizedWeather === 'hail' && (
        <>
          <div className="weather-hail-vignette" />
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-sm bg-sky-200 weather-hail"
              style={{
                left: `${particle.left}%`,
                width: `${particle.size * 2}px`,
                height: `${particle.size * 2}px`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration * 0.5}s`,
              }}
            />
          ))}
        </>
      )}

      {normalizedWeather === 'tornado' && (
        <>
          <div className="weather-tornado-container">
            <div className="weather-tornado-spiral weather-tornado-spiral--one" />
            <div className="weather-tornado-spiral weather-tornado-spiral--two" />
            <div className="weather-tornado-spiral weather-tornado-spiral--three" />
          </div>
          <div className="weather-tornado-warning" />
        </>
      )}

    </div>
  );
});

WeatherEffects.displayName = 'WeatherEffects';

export default WeatherEffects;
