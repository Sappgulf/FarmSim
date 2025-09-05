import { useState, useEffect, useCallback } from 'react';
import { WEATHER_TYPES } from '../utils/gameConstants';

/**
 * Weather Management Hook
 * Handles weather changes, effects, and forecasting
 */
export function useWeather(gameState) {
  const { currentTime, addNotification, addLog, nowSec } = gameState;
  
  const [weather, setWeather] = useState({
    type: "sunny",
    endsAt: nowSec() + 60,
    intensity: 1.0
  });
  
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [weatherEvents, setWeatherEvents] = useState(0);

  // Generate random weather
  const generateWeather = useCallback(() => {
    const weatherTypes = Object.keys(WEATHER_TYPES);
    const probabilities = weatherTypes.map(type => WEATHER_TYPES[type].probability);
    
    let random = Math.random();
    let selectedWeather = 'sunny';
    
    for (let i = 0; i < weatherTypes.length; i++) {
      random -= probabilities[i];
      if (random <= 0) {
        selectedWeather = weatherTypes[i];
        break;
      }
    }
    
    return selectedWeather;
  }, []);

  // Generate weather forecast
  const generateForecast = useCallback(() => {
    const forecast = [];
    for (let i = 1; i <= 5; i++) {
      forecast.push({
        day: i,
        weather: generateWeather(),
        temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
        precipitation: Math.floor(Math.random() * 100) // 0-100%
      });
    }
    setWeatherForecast(forecast);
  }, [generateWeather]);

  // Apply weather effects to growth
  const applyWeatherEffects = useCallback((baseGrowth) => {
    const weatherData = WEATHER_TYPES[weather.type];
    if (!weatherData) return baseGrowth;
    
    return baseGrowth * weatherData.growthMultiplier * weather.intensity;
  }, [weather]);

  // Check if weather should change
  useEffect(() => {
    if (currentTime >= weather.endsAt) {
      const newWeatherType = generateWeather();
      const weatherData = WEATHER_TYPES[newWeatherType];
      
      setWeather({
        type: newWeatherType,
        endsAt: currentTime + 30 + Math.random() * 60, // 30-90 seconds
        intensity: 0.8 + Math.random() * 0.4 // 0.8-1.2 intensity
      });
      
      setWeatherEvents(prev => prev + 1);
      
      addNotification(
        `Weather changed to ${weatherData.name} ${weatherData.emoji}`,
        "info"
      );
      
      addLog(`🌤️ Weather: ${weatherData.description}`);
    }
  }, [currentTime, weather.endsAt, generateWeather, addNotification, addLog]);

  // Generate forecast every 30 seconds
  useEffect(() => {
    generateForecast();
    const interval = setInterval(generateForecast, 30000);
    return () => clearInterval(interval);
  }, [generateForecast]);

  return {
    weather,
    weatherForecast,
    weatherEvents,
    applyWeatherEffects,
    getCurrentWeatherData: () => WEATHER_TYPES[weather.type],
    forceWeatherChange: () => {
      setWeather(prev => ({ ...prev, endsAt: currentTime }));
    }
  };
}
