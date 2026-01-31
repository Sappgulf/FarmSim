import React, { memo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';

const COZY_WEATHER_MAP = {
  sunny: 'clear',
  rainy: 'rain',
  cloudy: 'cloudy',
  stormy: 'rain',
  snow: 'cloudy',
  windy: 'cloudy',
  drought: 'heatwave',
  heatwave: 'heatwave',
  hot: 'heatwave',
};

const COZY_WEATHER_LABELS = {
  clear: 'Clear',
  rain: 'Rain',
  cloudy: 'Cloudy',
  heatwave: 'Heatwave',
};

const COZY_WEATHER_EMOJI = {
  clear: '☀️',
  rain: '🌧️',
  cloudy: '☁️',
  heatwave: '🌤️',
};

const COZY_WEATHER_EFFECTS = {
  clear: { growth: '+15%', water: 'Light drain', disease: 'Low' },
  rain: { growth: '+10%', water: 'Auto-water', disease: 'Low' },
  cloudy: { growth: '+5%', water: 'Gentle', disease: 'Very low' },
  heatwave: { growth: 'Normal', water: 'Extra thirst', disease: 'Low' },
};

const getCozyWeather = (weather) => COZY_WEATHER_MAP[weather] || 'cloudy';

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
    pattern: ["sunny", "heatwave"],
    nextWeather: "heatwave",
    confidence: 0.6,
    hint: "Extended heat suggests a heatwave"
  }
];

const WEATHER_PREDICTION_REWARDS = {
  perfect: { coins: 100, xp: 50, accuracy: 1.0 },
  good: { coins: 60, xp: 30, accuracy: 0.8 },
  okay: { coins: 30, xp: 15, accuracy: 0.6 },
  poor: { coins: 10, xp: 5, accuracy: 0.4 }
};

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
    actions.grantXP(reward.xp, 'weather_minigame', { correct: isCorrect });

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
    switch (weather) {
      case 'sunny': return '☀️';
      case 'rainy': return '🌧️';
      case 'cloudy': return '☁️';
      case 'stormy': return '⛈️';
      case 'snow': return '❄️';
      case 'windy': return '💨';
      case 'drought': return '🏜️';
      case 'heatwave': return '🌤️';
      case 'hot': return '🔥';
      default: return '❓';
    }
  };

  const cozyWeather = getCozyWeather(state.weather);
  const weatherEffects = COZY_WEATHER_EFFECTS[cozyWeather] || COZY_WEATHER_EFFECTS.cloudy;

  return (
    <div className="space-y-4">
      {/* Current Weather Status */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">🌤️ Current Weather</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl">{COZY_WEATHER_EMOJI[cozyWeather]}</span>
              <span className="text-lg font-medium capitalize">{COZY_WEATHER_LABELS[cozyWeather]}</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Cozy forecast based on {state.weather} conditions.
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            {weatherEffects.growth} Growth
          </Badge>
        </div>
      </Card>

      {/* Weather Effects */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📊 Cozy Weather Effects</h4>
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
        <Card className="p-4 border-2 border-blue-50">
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-gray-700">
            <span>📅</span> 3-Day Forecast
          </h4>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {state.weatherForecast.slice(0, 3).map((forecast, index) => (
              <div key={index} className="flex-1 min-w-[100px] text-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {index === 0 ? 'Tomorrow' : `Day ${index + 1}`}
                </span>
                <div className="text-4xl mb-2 filter drop-shadow-sm transform hover:scale-110 transition-transform cursor-default">
                  {getWeatherEmoji(forecast.type)}
                </div>
                <Badge variant="secondary" className="mb-1 capitalize bg-gray-50">
                  {COZY_WEATHER_LABELS[getCozyWeather(forecast.type)]}
                </Badge>
                <div className="text-[10px] text-gray-500 font-mono">
                  Day +{forecast.dayOffset || index + 1} outlook
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Weather Prediction Game */}
      <Card className="p-1 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm border-indigo-100">
        <div className="p-4">
          <h4 className="font-bold mb-4 text-indigo-900 flex items-center gap-2">
            <span className="text-xl">🔮</span> Oracle's Challenge
          </h4>

          {!predictionGame.active ? (
            <div className="text-center py-6 bg-white/50 rounded-xl border border-indigo-100/50">
              <div className="text-6xl mb-4 animate-pulse grayscale opacity-50">⚡</div>
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">Predict the Future</h3>
              <p className="text-sm text-indigo-600/80 mb-6 max-w-xs mx-auto">
                Analyze weather patterns and predict the next shift to earn XP and Coins.
              </p>

              <Button
                onClick={startPredictionGame}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 shadow-md hover:shadow-lg transition-all"
                disabled={!state.weatherForecast || state.weatherForecast.length < 3}
              >
                Start Prediction
              </Button>

              {(!state.weatherForecast || state.weatherForecast.length < 3) && (
                <div className="mt-3 text-xs text-red-400 bg-red-50 inline-block px-3 py-1 rounded-full border border-red-100">
                  Researching atmosphere... (Need 3+ history)
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 relative overflow-hidden">
                {/* Pattern Visualization */}
                <div className="flex justify-center items-center gap-4 mb-8 relative z-10">
                  {predictionGame.currentPattern.map((weather, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl shadow-inner border border-gray-100">
                        {getWeatherEmoji(weather)}
                      </div>
                      <div className="w-0.5 h-4 bg-gray-300 my-1"></div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Day {index - 2}</span>
                    </div>
                  ))}

                  <div className="text-gray-300 text-2xl animate-pulse">➜</div>

                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-4xl shadow-md border-2 border-indigo-200 animate-bounce-slow">
                      ?
                    </div>
                    <div className="w-0.5 h-4 bg-indigo-300 my-1"></div>
                    <span className="text-xs font-bold text-indigo-600 uppercase">Next?</span>
                  </div>
                </div>

                {/* Hint */}
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-start gap-3 mb-6">
                  <span className="text-xl">💡</span>
                  <div>
                    <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Observation</h5>
                    <p className="text-sm text-amber-900 italic">"{predictionGame.hint}"</p>
                  </div>
                </div>

                {/* Choices */}
                {!predictionGame.result ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {["sunny", "rainy", "cloudy", "stormy", "heatwave"].map(weather => (
                      <Button
                        key={weather}
                        onClick={() => makePrediction(weather)}
                        variant="outline"
                        className="h-auto py-3 border-2 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{getWeatherEmoji(weather)}</span>
                          <span className="text-xs font-semibold capitalize">{weather}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className={`
                                p-4 rounded-xl text-center animate-in fade-in zoom-in duration-300 border-2
                                ${predictionGame.result.correct
                      ? 'bg-green-50 border-green-200 text-green-900'
                      : 'bg-red-50 border-red-200 text-red-900'}
                             `}>
                    <div className="text-4xl mb-2">{predictionGame.result.correct ? '🎉' : '🌩️'}</div>
                    <h3 className="text-xl font-bold mb-1">
                      {predictionGame.result.correct ? 'Correct Prediction!' : 'Prediction Failed'}
                    </h3>
                    <p className="text-sm mb-3 opacity-90">
                      The actual weather was <span className="font-bold uppercase">{predictionGame.result.actualWeather}</span>
                    </p>

                    {predictionGame.result.correct && (
                      <div className="inline-flex gap-2 text-sm font-bold bg-white/50 px-3 py-1 rounded-full">
                        <span className="text-yellow-600">+{predictionGame.result.reward.coins}🪙</span>
                        <span className="text-blue-600">+{predictionGame.result.reward.xp} XP</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Weather Statistics */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 text-gray-700">📊 Meteorological Data</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Accuracy</div>
            <div className="font-bold text-2xl text-indigo-600">
              {Math.floor(Math.random() * 30 + 70)}%
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Total Forecasts</div>
            <div className="font-bold text-2xl text-gray-800">
              {Math.floor(Math.random() * 50) + 10}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

WeatherTab.displayName = 'WeatherTab';
export default WeatherTab;
