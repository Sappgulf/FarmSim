import React, { memo, useMemo } from 'react';

/**
 * Weather Effects Overlay Component
 * Provides visual weather effects like rain, snow, sun rays with smooth transitions
 */
const WeatherEffects = memo(({ weather, intensity = 1 }) => {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const prevWeatherRef = React.useRef(weather);
  
  // Detect weather change and trigger transition
  React.useEffect(() => {
    if (prevWeatherRef.current !== weather) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        prevWeatherRef.current = weather;
      }, 500); // 500ms transition
      return () => clearTimeout(timer);
    }
  }, [weather]);
  
  // Generate particle elements based on weather type
  const particles = useMemo(() => {
    if (!weather || weather === 'sunny') return [];

    const particleCount = weather === 'stormy' ? 100 : weather === 'rainy' ? 60 : weather === 'snowy' ? 50 : 30;
    
    return Array.from({ length: Math.floor(particleCount * intensity) }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 1 + Math.random() * 2,
      size: weather === 'snowy' ? 3 + Math.random() * 3 : 1 + Math.random() * 2,
    }));
  }, [weather, intensity]);

  // Don't render anything for clear weather
  if (!weather || weather === 'sunny' || weather === 'cloudy') {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-10 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {weather === 'rainy' && (
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

      {weather === 'stormy' && (
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

      {weather === 'snowy' && (
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

