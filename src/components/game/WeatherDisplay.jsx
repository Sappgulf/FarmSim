/**
 * WeatherDisplay Component
 * Shows current weather and forecast with visual effects
 */
import React, { memo, useMemo } from 'react';
import { WEATHER_TYPES } from '../../data/constants';

// Animated weather particles
function WeatherParticles({ weather }) {
  const particles = useMemo(() => {
    switch (weather) {
      case 'rainy':
        return [...Array(8)].map((_, i) => (
          <span
            key={i}
            className="absolute text-blue-300/60 animate-rain-particle"
            style={{
              left: `${10 + i * 12}%`,
              animationDelay: `${i * 0.15}s`,
              fontSize: '10px',
            }}
          >
            💧
          </span>
        ));
      case 'snowy':
        return [...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute text-white animate-snow-particle"
            style={{
              left: `${8 + i * 15}%`,
              animationDelay: `${i * 0.3}s`,
              fontSize: '12px',
            }}
          >
            ❄️
          </span>
        ));
      case 'sunny':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-300/20 rounded-full animate-pulse-slow" />
          </div>
        );
      case 'windy':
        return [...Array(3)].map((_, i) => (
          <span
            key={i}
            className="absolute text-gray-400/50 animate-wind-particle"
            style={{
              top: `${20 + i * 25}%`,
              animationDelay: `${i * 0.4}s`,
              fontSize: '14px',
            }}
          >
            🍃
          </span>
        ));
      case 'stormy':
        return (
          <>
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="absolute text-blue-400/60 animate-rain-particle-fast"
                style={{
                  left: `${5 + i * 15}%`,
                  animationDelay: `${i * 0.1}s`,
                  fontSize: '8px',
                }}
              >
                💧
              </span>
            ))}
            <div className="absolute inset-0 animate-lightning pointer-events-none bg-white/0" />
          </>
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
        relative rounded-xl border p-3 sm:p-4 overflow-hidden
        ${seasonData?.bgColor || 'bg-gray-50'}
        ${seasonData?.borderColor || 'border-gray-200'}
      `}
    >
      {/* Animated weather particles */}
      <WeatherParticles weather={currentWeather} />

      {/* Current Weather */}
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`
            text-4xl p-2 rounded-xl bg-white/80 shadow-sm
            ${weatherData?.bgColor || 'bg-gray-100'}
            ${currentWeather === 'sunny' ? 'animate-pulse-slow' : ''}
            ${currentWeather === 'windy' ? 'animate-wobble' : ''}
          `}>
            {weatherData?.emoji || '☀️'}
          </div>
          <div>
            <div className={`font-semibold ${weatherData?.color || 'text-gray-700'}`}>
              {weatherData?.name || 'Sunny'}
            </div>
            <div className="text-xs text-gray-500">
              {weatherData?.effect || 'Normal conditions'}
            </div>
          </div>
        </div>

        {/* Season badge */}
        <div className={`
          px-3 py-1.5 rounded-lg border
          ${seasonData?.bgColor || 'bg-gray-100'}
          ${seasonData?.borderColor || 'border-gray-200'}
        `}>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">{seasonData?.emoji}</span>
            <span className={`text-sm font-medium ${seasonData?.color}`}>
              {seasonData?.name}
            </span>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      {forecast && forecast.length > 0 && (
        <div className="relative border-t border-gray-200/50 pt-3 mt-3">
          <div className="text-xs text-gray-500 mb-2 font-medium">5-Day Forecast</div>
          <div className="flex justify-between gap-1">
            {forecast.slice(0, 5).map((day, index) => {
              const dayWeather = WEATHER_TYPES[day.weather] || WEATHER_TYPES.sunny;
              return (
                <div
                  key={index}
                  className={`
                    flex-1 flex flex-col items-center py-2 rounded-lg
                    ${dayWeather.bgColor || 'bg-gray-100'}
                    hover:scale-105 transition-all cursor-default
                  `}
                  title={dayWeather.name}
                >
                  <span className="text-lg">{dayWeather.emoji}</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">+{index + 1}d</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weather Prediction Mini-game Button */}
      {onPredictionGame && (
        <button
          onClick={onPredictionGame}
          className="relative w-full mt-3 text-xs text-center py-2 bg-white/60 hover:bg-white/80 rounded-lg border border-gray-200 transition-colors"
        >
          🎯 Predict Tomorrow's Weather (+50🪙)
        </button>
      )}
    </div>
  );
}

export const WeatherDisplay = memo(WeatherDisplayComponent);
