/**
 * Weather Hook
 * Manages weather system, seasons, and environmental effects
 */
import { useState, useCallback, useEffect } from 'react';
import { SEASONS, SEASON_DATA, WEATHER_TYPES, GAME_SETTINGS } from '../data/constants';
import { nowSec } from '../utils/time.mjs';

const WEATHER_PROBABILITIES = {
  spring: { sunny: 0.35, cloudy: 0.25, rainy: 0.30, stormy: 0.05, windy: 0.05 },
  summer: { sunny: 0.50, cloudy: 0.15, rainy: 0.15, stormy: 0.10, drought: 0.10 },
  fall: { sunny: 0.30, cloudy: 0.30, rainy: 0.25, stormy: 0.10, windy: 0.05 },
  winter: { sunny: 0.20, cloudy: 0.35, rainy: 0.15, frost: 0.20, windy: 0.10 },
};

export function useWeather(addNotification) {
  const [currentSeason, setCurrentSeason] = useState('spring');
  const [currentWeather, setCurrentWeather] = useState('sunny');
  const [seasonEndsAt, setSeasonEndsAt] = useState(() => nowSec() + GAME_SETTINGS.SEASON_DURATION);
  const [weatherChangesAt, setWeatherChangesAt] = useState(() => nowSec() + GAME_SETTINGS.WEATHER_CHANGE_INTERVAL);
  const [forecast, setForecast] = useState([]);
  const [weatherHistory, setWeatherHistory] = useState([]);

  // Get season data
  const seasonData = SEASON_DATA[currentSeason] || SEASON_DATA.spring;
  const weatherData = WEATHER_TYPES[currentWeather] || WEATHER_TYPES.sunny;

  // Generate random weather based on season
  const generateWeather = useCallback((season = currentSeason) => {
    const probs = WEATHER_PROBABILITIES[season] || WEATHER_PROBABILITIES.spring;
    const roll = Math.random();
    let cumulative = 0;

    for (const [weather, prob] of Object.entries(probs)) {
      cumulative += prob;
      if (roll <= cumulative) {
        return weather;
      }
    }
    return 'sunny';
  }, [currentSeason]);

  // Generate forecast
  const generateForecast = useCallback(() => {
    const newForecast = [];
    for (let i = 0; i < 5; i++) {
      newForecast.push({
        weather: generateWeather(),
        day: i + 1,
      });
    }
    setForecast(newForecast);
    return newForecast;
  }, [generateWeather]);

  // Change weather
  const changeWeather = useCallback((forceWeather = null) => {
    const newWeather = forceWeather || generateWeather();
    const oldWeather = currentWeather;

    setCurrentWeather(newWeather);
    setWeatherChangesAt(nowSec() + GAME_SETTINGS.WEATHER_CHANGE_INTERVAL);

    // Record history
    setWeatherHistory(prev => [...prev.slice(-10), { weather: oldWeather, timestamp: nowSec() }]);

    // Notify on significant weather changes
    const weatherInfo = WEATHER_TYPES[newWeather];
    if (newWeather !== oldWeather && weatherInfo) {
      const isHarmful = ['stormy', 'drought', 'frost'].includes(newWeather);
      addNotification?.(
        `${weatherInfo.emoji} Weather: ${weatherInfo.name}`,
        isHarmful ? 'warning' : 'info'
      );
    }

    return newWeather;
  }, [generateWeather, currentWeather, addNotification]);

  // Change season
  const changeSeason = useCallback((forceSeason = null) => {
    const currentIndex = SEASONS.indexOf(currentSeason);
    const newSeason = forceSeason || SEASONS[(currentIndex + 1) % SEASONS.length];

    setCurrentSeason(newSeason);
    setSeasonEndsAt(nowSec() + GAME_SETTINGS.SEASON_DURATION);

    const newSeasonData = SEASON_DATA[newSeason];
    addNotification?.(
      `${newSeasonData.emoji} ${newSeasonData.name} has begun!`,
      'info'
    );

    // Generate new forecast for the season
    generateForecast();

    // Change weather to match new season
    changeWeather();

    return newSeason;
  }, [currentSeason, addNotification, generateForecast, changeWeather]);

  // Calculate growth modifier based on weather and season
  const getGrowthModifier = useCallback(() => {
    let modifier = seasonData.growthBonus;

    switch (currentWeather) {
      case 'sunny':
        modifier *= 1.0;
        break;
      case 'cloudy':
        modifier *= 0.95;
        break;
      case 'rainy':
        modifier *= 1.2; // Rain helps growth
        break;
      case 'stormy':
        modifier *= 0.8;
        break;
      case 'drought':
        modifier *= 0.6;
        break;
      case 'frost':
        modifier *= 0.3;
        break;
      case 'windy':
        modifier *= 0.9;
        break;
    }

    return modifier;
  }, [seasonData, currentWeather]);

  // Check if weather auto-waters crops
  const doesWeatherWater = useCallback(() => {
    return currentWeather === 'rainy' || currentWeather === 'stormy';
  }, [currentWeather]);

  // Get damage risk for current weather
  const getDamageRisk = useCallback(() => {
    switch (currentWeather) {
      case 'stormy':
        return { risk: 0.1, type: 'storm', message: 'Storm damage!' };
      case 'frost':
        return { risk: 0.15, type: 'frost', message: 'Frost damage!' };
      case 'drought':
        return { risk: 0.05, type: 'drought', message: 'Drought damage!' };
      default:
        return { risk: 0, type: null, message: null };
    }
  }, [currentWeather]);

  // Weather prediction mini-game
  const [predictionGame, setPredictionGame] = useState({
    active: false,
    targetWeather: null,
    reward: 0,
  });

  const startPredictionGame = useCallback(() => {
    const options = Object.keys(WEATHER_TYPES);
    const target = options[Math.floor(Math.random() * options.length)];
    setPredictionGame({
      active: true,
      targetWeather: target,
      reward: 50,
    });
    return target;
  }, []);

  const submitPrediction = useCallback((prediction) => {
    if (!predictionGame.active) return null;

    const correct = prediction === currentWeather;
    const reward = correct ? predictionGame.reward : 0;

    setPredictionGame({ active: false, targetWeather: null, reward: 0 });

    return { correct, reward };
  }, [predictionGame, currentWeather]);

  // Time remaining displays
  const getSeasonTimeRemaining = useCallback(() => {
    return Math.max(0, seasonEndsAt - nowSec());
  }, [seasonEndsAt]);

  const getWeatherTimeRemaining = useCallback(() => {
    return Math.max(0, weatherChangesAt - nowSec());
  }, [weatherChangesAt]);

  // Save data
  const getSaveData = useCallback(() => ({
    currentSeason,
    currentWeather,
    seasonEndsAt,
    weatherChangesAt,
    weatherHistory,
  }), [currentSeason, currentWeather, seasonEndsAt, weatherChangesAt, weatherHistory]);

  // Load save data
  const loadSaveData = useCallback((data) => {
    if (!data) return;
    if (data.currentSeason) setCurrentSeason(data.currentSeason);
    if (data.currentWeather) setCurrentWeather(data.currentWeather);
    if (data.seasonEndsAt) setSeasonEndsAt(data.seasonEndsAt);
    if (data.weatherChangesAt) setWeatherChangesAt(data.weatherChangesAt);
    if (data.weatherHistory) setWeatherHistory(data.weatherHistory);
  }, []);

  return {
    // State
    currentSeason,
    currentWeather,
    seasonData,
    weatherData,
    forecast,
    seasonEndsAt,
    weatherChangesAt,
    predictionGame,

    // Actions
    changeWeather,
    changeSeason,
    generateForecast,
    startPredictionGame,
    submitPrediction,

    // Helpers
    getGrowthModifier,
    doesWeatherWater,
    getDamageRisk,
    getSeasonTimeRemaining,
    getWeatherTimeRemaining,

    // Save/Load
    getSaveData,
    loadSaveData,
  };
}
