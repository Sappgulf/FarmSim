/**
 * WeatherDisplay Component
 * Shows current weather and forecast
 */
import React, { memo } from 'react';
import { WEATHER_TYPES } from '../../data/constants';

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
        rounded-xl border p-3 sm:p-4
        ${seasonData?.bgColor || 'bg-gray-50'}
        ${seasonData?.borderColor || 'border-gray-200'}
      `}
    >
      {/* Current Weather */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`
            text-4xl p-2 rounded-xl bg-white/80 shadow-sm
            ${weatherData?.bgColor || 'bg-gray-100'}
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
        <div className="border-t border-gray-200/50 pt-3 mt-3">
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
                    transition-colors
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
          className="w-full mt-3 text-xs text-center py-2 bg-white/60 hover:bg-white/80 rounded-lg border border-gray-200 transition-colors"
        >
          🎯 Predict Tomorrow's Weather (+50🪙)
        </button>
      )}
    </div>
  );
}

export const WeatherDisplay = memo(WeatherDisplayComponent);
