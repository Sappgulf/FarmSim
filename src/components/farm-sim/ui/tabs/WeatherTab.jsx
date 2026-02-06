import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { getWeatherMeta, normalizeWeatherType } from '../../constants/weatherData';

// Weather prediction patterns from original system
const WEATHER_PATTERNS = [
  {
    pattern: ["sunny", "sunny", "cloudy"],
    nextWeather: "rainy",
    confidence: 0.8,
    hint: "Three day pattern suggests incoming rain"
  },
  {
    pattern: ["rainy", "cloudy"],
    nextWeather: "sunny",
    confidence: 0.7,
    hint: "Rain clearing leads to sunshine"
  },
  {
    pattern: ["windy", "windy"],
    nextWeather: "stormy",
    confidence: 0.9,
    hint: "Strong winds often bring storms"
  },
  {
    pattern: ["sunny", "sunny", "windy"],
    nextWeather: "drought",
    confidence: 0.6,
    hint: "Extended dry winds may trigger drought"
  }
];

const WEATHER_PREDICTION_REWARDS = {
  perfect: { coins: 100, xp: 50, accuracy: 1.0 },
  good: { coins: 60, xp: 30, accuracy: 0.8 },
  okay: { coins: 30, xp: 15, accuracy: 0.6 },
  poor: { coins: 10, xp: 5, accuracy: 0.4 }
};

const PREDICTION_OPTIONS = Array.from(
  new Set(['sunny', 'rainy', 'stormy', 'cloudy', ...WEATHER_PATTERNS.map((pattern) => pattern.nextWeather)])
);

const WeatherTab = memo(() => {
  const { state, actions } = useGame();
  const [predictionGame, setPredictionGame] = useState({
    active: false,
    currentPattern: [],
    selectedPrediction: null,
    hint: '',
    correctWeather: null,
    result: null
  });

  const startPredictionGame = () => {
    // Need at least 3 weather history entries
    if (!state.weatherForecast || state.weatherForecast.length < 3) {
      actions.addNotification({
        message: 'Need more weather history to predict!',
        type: 'warning'
      });
      return;
    }

    // Select a random pattern
    const randomPattern = WEATHER_PATTERNS[Math.floor(Math.random() * WEATHER_PATTERNS.length)];

    setPredictionGame({
      active: true,
      currentPattern: randomPattern.pattern,
      selectedPrediction: null,
      hint: randomPattern.hint,
      correctWeather: randomPattern.nextWeather,
      result: null
    });
  };

  const makePrediction = (predictedWeather) => {
    if (!predictionGame.active) return;

    const isCorrect = predictedWeather === predictionGame.correctWeather;
    let reward = WEATHER_PREDICTION_REWARDS.poor;

    if (isCorrect) {
      // Determine reward based on confidence
      const pattern = WEATHER_PATTERNS.find(p =>
        p.pattern.join(',') === predictionGame.currentPattern.join(',')
      );
      const confidence = pattern?.confidence || 0.5;

      if (confidence >= 0.8) reward = WEATHER_PREDICTION_REWARDS.perfect;
      else if (confidence >= 0.7) reward = WEATHER_PREDICTION_REWARDS.good;
      else reward = WEATHER_PREDICTION_REWARDS.okay;
    }

    // Grant rewards
    actions.setCoins(state.coins + reward.coins);
    actions.setXp(state.xp + reward.xp);

    setPredictionGame(prev => ({
      ...prev,
      selectedPrediction: predictedWeather,
      result: {
        correct: isCorrect,
        reward: reward,
        actualWeather: predictionGame.correctWeather
      }
    }));

    // Auto-close after 3 seconds
    setTimeout(() => {
      setPredictionGame(prev => ({ ...prev, active: false }));
    }, 3000);
  };

  const getWeatherEmoji = (weather) => {
    return getWeatherMeta(weather).emoji;
  };

  const getCurrentWeatherEffects = () => {
    const effects = {
      sunny: { growth: '+20%', water: '-10%', disease: 'Low' },
      rainy: { growth: '+10%', water: '+50%', disease: 'Medium' },
      cloudy: { growth: 'Normal', water: 'Normal', disease: 'Low' },
      stormy: { growth: '-20%', water: '+20%', disease: 'High' },
      windy: { growth: '-10%', water: '-5%', disease: 'Medium' },
      drought: { growth: '-30%', water: '-20%', disease: 'High' },
      snow: { growth: '-70%', water: '+10%', disease: 'Low' },
    };
    return effects[normalizeWeatherType(state.weather)] || effects.cloudy;
  };

  const weatherEffects = getCurrentWeatherEffects();
  const currentWeatherMeta = getWeatherMeta(state.weather);

  return (
    <div className="space-y-4">
      {/* Current Weather Status */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">🌤️ Current Weather</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl">{getWeatherEmoji(state.weather)}</span>
              <span className="text-lg font-medium">{currentWeatherMeta.label}</span>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            {weatherEffects.growth} Growth
          </Badge>
        </div>
      </Card>

      {/* Weather Effects */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📊 Weather Effects</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-medium text-green-800">Growth Rate</div>
            <div className="text-green-600">{weatherEffects.growth}</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-medium text-blue-800">Water Usage</div>
            <div className="text-blue-600">{weatherEffects.water}</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="font-medium text-red-800">Disease Risk</div>
            <div className="text-red-600">{weatherEffects.disease}</div>
          </div>
        </div>
      </Card>

      {/* Weather Forecast */}
      {state.weatherForecast && state.weatherForecast.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">🔮 3-Day Forecast</h4>
          <div className="flex gap-2">
            {state.weatherForecast.slice(0, 3).map((forecast, index) => (
              <div key={index} className="flex-1 text-center p-2 bg-gray-50 rounded">
                <div className="text-lg">{getWeatherEmoji(forecast.type)}</div>
                <div className="text-xs text-gray-600 capitalize">{forecast.type}</div>
                <div className="text-xs text-gray-500">{forecast.duration}s</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Weather Prediction Game */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <h4 className="font-semibold mb-3 text-purple-800">🎮 Weather Prediction Challenge</h4>

        {predictionGame.active ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-purple-700 mb-2">🔮 Predict Next Weather</div>

              {/* Pattern Display */}
              <div className="flex justify-center gap-2 mb-4">
                {predictionGame.currentPattern.map((weather, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <span className="text-2xl">{getWeatherEmoji(weather)}</span>
                    <span className="text-xs text-gray-600 capitalize">{weather}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center">
                  <span className="text-2xl">→</span>
                  <span className="text-xs text-gray-600">?</span>
                </div>
              </div>

              {/* Hint */}
              <div className="text-xs text-gray-600 mb-4 italic">
                💡 {predictionGame.hint}
              </div>

              {/* Prediction Buttons */}
              {!predictionGame.result && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PREDICTION_OPTIONS.map(weather => (
                    <Button
                      key={weather}
                      onClick={() => makePrediction(weather)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {getWeatherEmoji(weather)} {weather}
                    </Button>
                  ))}
                </div>
              )}

              {/* Result */}
              {predictionGame.result && (
                <div className={`p-3 rounded ${predictionGame.result.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="text-lg mb-1">
                    {predictionGame.result.correct ? '✅' : '❌'} {predictionGame.result.correct ? 'Correct!' : 'Wrong!'}
                  </div>
                  <div className="text-sm">
                    Actual: {getWeatherEmoji(predictionGame.result.actualWeather)} {predictionGame.result.actualWeather}
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    +{predictionGame.result.reward.coins}🪙 +{predictionGame.result.reward.xp} XP
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Button
              onClick={startPredictionGame}
              className="mb-3"
              disabled={!state.weatherForecast || state.weatherForecast.length < 3}
            >
              🎮 Start Prediction Game
            </Button>
            {(!state.weatherForecast || state.weatherForecast.length < 3) && (
              <div className="text-xs text-gray-500">
                Need 3+ weather history entries to play
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Weather Statistics */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📊 Weather Statistics</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-800">
              {state.weatherForecast?.length || 0}
            </div>
            <div className="text-gray-600">Forecasts Seen</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-semibold text-gray-800">
              {state.weatherForecast
                ? state.weatherForecast.filter((f) => normalizeWeatherType(f.type) === normalizeWeatherType(state.weather)).length
                : 0}
            </div>
            <div className="text-gray-600">Current Streak</div>
          </div>
        </div>
      </Card>
    </div>
  );
});

WeatherTab.displayName = 'WeatherTab';
export default WeatherTab;
