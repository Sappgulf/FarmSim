/**
 * WeatherDisplay Component
 * Shows current weather and forecast with visual effects
 */
import React, { memo, useMemo } from 'react';
import { WEATHER_TYPES } from '../../data/constants';

// Enhanced animated weather particles
function WeatherParticles({ weather }) {
  const particles = useMemo(() => {
    switch (weather) {
      case 'rainy':
        // More rain drops with varied sizes and speeds
        return (
          <>
            {[...Array(15)].map((_, i) => (
              <span
                key={i}
                className="absolute animate-rain-particle opacity-60"
                style={{
                  left: `${5 + i * 6.5}%`,
                  animationDelay: `${Math.random() * 1.5}s`,
                  animationDuration: `${1.2 + Math.random() * 0.6}s`,
                  fontSize: `${8 + Math.random() * 4}px`,
                  filter: 'drop-shadow(0 1px 2px rgba(59, 130, 246, 0.3))',
                }}
              >
                💧
              </span>
            ))}
            {/* Ripple effect at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-blue-200/30 to-transparent" />
          </>
        );
      case 'snowy':
        // More snowflakes with varied sizes and drift
        return (
          <>
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="absolute animate-snow-particle"
                style={{
                  left: `${3 + i * 8}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2.5 + Math.random() * 2}s`,
                  fontSize: `${10 + Math.random() * 6}px`,
                  opacity: 0.7 + Math.random() * 0.3,
                  filter: 'drop-shadow(0 1px 3px rgba(255, 255, 255, 0.5))',
                }}
              >
                {i % 3 === 0 ? '❄️' : i % 3 === 1 ? '❅' : '✧'}
              </span>
            ))}
            {/* Frost effect at edges */}
            <div className="absolute inset-0 border-4 border-white/10 rounded-xl pointer-events-none" />
          </>
        );
      case 'sunny':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Main sun glow */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-radial from-yellow-300/40 via-amber-200/20 to-transparent rounded-full animate-pulse-slow" />
            {/* Sun rays */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 right-0 w-1 h-12 bg-gradient-to-b from-yellow-300/30 to-transparent origin-bottom-right"
                style={{
                  transform: `rotate(${i * 45}deg) translateX(30px)`,
                  animation: 'pulse 2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
            {/* Sparkles */}
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="absolute text-yellow-400/60 animate-pulse"
                style={{
                  top: `${20 + Math.random() * 40}%`,
                  left: `${50 + Math.random() * 40}%`,
                  fontSize: '8px',
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                ✦
              </span>
            ))}
          </div>
        );
      case 'windy':
        // More leaves with varied paths
        return (
          <>
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="absolute animate-wind-particle"
                style={{
                  top: `${15 + i * 12}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${1.5 + Math.random() * 1}s`,
                  fontSize: `${12 + Math.random() * 4}px`,
                  opacity: 0.4 + Math.random() * 0.3,
                }}
              >
                {i % 3 === 0 ? '🍃' : i % 3 === 1 ? '🍂' : '💨'}
              </span>
            ))}
            {/* Wind streaks */}
            {[...Array(3)].map((_, i) => (
              <div
                key={`streak-${i}`}
                className="absolute h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent animate-wind-particle"
                style={{
                  width: `${30 + Math.random() * 30}%`,
                  top: `${25 + i * 25}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </>
        );
      case 'stormy':
        return (
          <>
            {/* Heavy rain */}
            {[...Array(20)].map((_, i) => (
              <span
                key={i}
                className="absolute animate-rain-particle-fast opacity-70"
                style={{
                  left: `${2 + i * 5}%`,
                  animationDelay: `${Math.random() * 0.8}s`,
                  animationDuration: `${0.6 + Math.random() * 0.3}s`,
                  fontSize: `${6 + Math.random() * 3}px`,
                  filter: 'drop-shadow(0 1px 2px rgba(59, 130, 246, 0.4))',
                }}
              >
                💧
              </span>
            ))}
            {/* Lightning flash overlay */}
            <div className="absolute inset-0 animate-lightning pointer-events-none rounded-xl" />
            {/* Dark storm clouds effect */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-600/20 to-transparent" />
            {/* Thunder rumble effect - subtle border pulse */}
            <div
              className="absolute inset-0 border-2 border-purple-400/0 rounded-xl animate-pulse"
              style={{ animationDuration: '4s' }}
            />
          </>
        );
      case 'cloudy':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Drifting clouds */}
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                className="absolute text-2xl opacity-30 animate-wind-particle"
                style={{
                  top: `${10 + i * 20}%`,
                  animationDuration: `${8 + i * 2}s`,
                  animationDelay: `${i * 2}s`,
                }}
              >
                ☁️
              </span>
            ))}
          </div>
        );
      case 'drought':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Heat shimmer effect */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-orange-200/20 to-transparent" />
            {/* Heat waves */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-orange-300/30 animate-pulse"
                style={{
                  bottom: `${10 + i * 10}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s',
                }}
              />
            ))}
            {/* Dust particles */}
            {[...Array(5)].map((_, i) => (
              <span
                key={`dust-${i}`}
                className="absolute text-amber-600/40 animate-wind-particle"
                style={{
                  top: `${40 + Math.random() * 40}%`,
                  fontSize: '6px',
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                •
              </span>
            ))}
          </div>
        );
      case 'frost':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Frost overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/20 via-transparent to-blue-200/20" />
            {/* Ice crystals */}
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className="absolute text-cyan-300/50"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  fontSize: `${8 + Math.random() * 6}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              >
                ❋
              </span>
            ))}
            {/* Frost border effect */}
            <div className="absolute inset-0 border-2 border-cyan-200/30 rounded-xl" />
          </div>
        );
      default:
        return null;
    }
  }, [weather]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
      {particles}
    </div>
  );
}

function WeatherDisplayComponent({
  currentWeather,
  weatherData,
  currentSeason,
  seasonData,
  forecast,
  onPredictionGame,
}) {
  return (
    <div
      id="weather-display"
      className={`
        relative rounded-2xl border-2 p-4 sm:p-5 overflow-hidden
        bg-gradient-to-br backdrop-blur-sm shadow-lg
        ${seasonData?.bgColor || 'from-gray-50 to-gray-100'}
        ${seasonData?.borderColor || 'border-gray-200'}
        transition-all duration-500
      `}
    >
      {/* Animated weather particles */}
      <WeatherParticles weather={currentWeather} />

      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none rounded-2xl" />

      {/* Current Weather */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div
            className={`
            text-5xl p-3 rounded-2xl bg-white/90 shadow-lg
            ${weatherData?.bgColor || 'bg-gray-100'}
            ${currentWeather === 'sunny' ? 'animate-pulse-slow' : ''}
            ${currentWeather === 'windy' ? 'animate-wobble' : ''}
            ${currentWeather === 'rainy' ? 'shadow-blue-200/50' : ''}
            ${currentWeather === 'stormy' ? 'shadow-purple-200/50' : ''}
            transition-all duration-300
          `}
          >
            <span className="drop-shadow-md">{weatherData?.emoji || '☀️'}</span>
          </div>
          <div>
            <div className={`text-lg font-bold ${weatherData?.color || 'text-gray-700'}`}>
              {weatherData?.name || 'Sunny'}
            </div>
            <div className="text-sm text-gray-600 mt-0.5">
              {weatherData?.effect || 'Normal conditions'}
            </div>
          </div>
        </div>

        {/* Season badge - Enhanced */}
        <div
          className={`
          px-4 py-2 rounded-xl border-2 shadow-md
          bg-white/80 backdrop-blur-sm
          ${seasonData?.borderColor || 'border-gray-200'}
          transition-all duration-300 hover:scale-105
        `}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl drop-shadow-sm">{seasonData?.emoji}</span>
            <span className={`text-sm font-bold ${seasonData?.color}`}>{seasonData?.name}</span>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast - Enhanced */}
      {forecast && forecast.length > 0 && (
        <div className="relative border-t-2 border-gray-200/30 pt-4 mt-4">
          <div className="text-xs text-gray-600 mb-3 font-bold uppercase tracking-wider flex items-center gap-2">
            <span>📅</span> 5-Day Forecast
          </div>
          <div className="flex justify-between gap-2">
            {forecast.slice(0, 5).map((day, index) => {
              const dayWeather = WEATHER_TYPES[day.weather] || WEATHER_TYPES.sunny;
              return (
                <div
                  key={index}
                  className={`
                    flex-1 flex flex-col items-center py-3 rounded-xl
                    bg-white/60 backdrop-blur-sm border border-white/50
                    shadow-sm
                    hover:scale-110 hover:shadow-md hover:bg-white/80
                    transition-all duration-200 cursor-default
                    card-shine
                  `}
                  title={dayWeather.name}
                >
                  <span className="text-xl drop-shadow-sm">{dayWeather.emoji}</span>
                  <span className="text-[10px] font-semibold text-gray-500 mt-1">
                    +{index + 1}d
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weather Prediction Mini-game Button - Enhanced */}
      {onPredictionGame && (
        <button
          onClick={onPredictionGame}
          className="relative w-full mt-4 text-sm text-center py-3 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 rounded-xl border-2 border-amber-200 transition-all duration-200 font-semibold text-amber-700 shadow-sm hover:shadow-md btn-juicy"
        >
          🎯 Predict Tomorrow's Weather
          <span className="ml-2 bg-amber-200 px-2 py-0.5 rounded-full text-xs">+50🪙</span>
        </button>
      )}
    </div>
  );
}

export const WeatherDisplay = memo(WeatherDisplayComponent);
