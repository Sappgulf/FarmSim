import React, { memo, useMemo } from 'react';
import { normalizeWeatherType } from '../constants/weatherData';

/**
 * Weather Effects Overlay Component
 * Provides visual weather effects like rain, snow, sun rays with smooth transitions
 */
const WeatherEffects = memo(({ weather, intensity = 1 }) => {
  const normalizedWeather = normalizeWeatherType(weather);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const prevWeatherRef = React.useRef(normalizedWeather);
  
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
    if (!normalizedWeather || normalizedWeather === 'sunny') return [];

    const particleCount = normalizedWeather === 'stormy' ? 100 : normalizedWeather === 'rainy' ? 60 : normalizedWeather === 'snow' ? 50 : 30;
    
    return Array.from({ length: Math.floor(particleCount * intensity) }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 1 + Math.random() * 2,
      size: normalizedWeather === 'snow' ? 3 + Math.random() * 3 : 1 + Math.random() * 2,
    }));
  }, [normalizedWeather, intensity]);

  // Don't render anything for clear weather
  if (!normalizedWeather || normalizedWeather === 'sunny' || normalizedWeather === 'cloudy') {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-10 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {normalizedWeather === 'rainy' && (
        <>
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
          {/* Lightning flash overlay */}
          <div className="lightning-flash" />
        </>
      )}

      {normalizedWeather === 'snow' && (
        <>
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

    </div>
  );
});

WeatherEffects.displayName = 'WeatherEffects';

export default WeatherEffects;
