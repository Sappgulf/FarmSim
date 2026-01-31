import React, { memo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import {
  COZY_WEATHER_EFFECTS,
  COZY_WEATHER_EMOJI,
  COZY_WEATHER_LABELS,
  getCozyWeatherType
} from '../../constants/cozyWeather';

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

  // Memoize random stats so they don't change on every render
  const [meteorologicalStats] = useState(() => ({
    accuracy: Math.floor(Math.random() * 30 + 70),
    totalForecasts: Math.floor(Math.random() * 50) + 10
  }));

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

  const cozyWeather = getCozyWeatherType(state.weather);
  const weatherEffects = COZY_WEATHER_EFFECTS[cozyWeather] || COZY_WEATHER_EFFECTS.cloudy;

  return (
    <div className="space-y-4">
      {/* Current Weather Status - Premium */}
      <Card className="p-5 bg-gradient-to-br from-sky-50/95 via-blue-50/90 to-cyan-50/95 backdrop-blur-sm border-sky-200/60 shadow-lg shadow-sky-200/30 relative overflow-hidden">
        {/* Decorative weather */}
        <div className="absolute -right-4 -top-2 text-6xl opacity-10 rotate-12">🌤️</div>

        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-sky-700 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              🌤️ Current Weather
            </h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-4xl drop-shadow-sm">{COZY_WEATHER_EMOJI[cozyWeather]}</span>
              <span className="text-lg font-bold capitalize text-slate-800">{COZY_WEATHER_LABELS[cozyWeather]}</span>
            </div>
            <p className="text-xs text-sky-700/80 mt-1 font-medium">
              Cozy forecast based on {state.weather} conditions.
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-sky-500 to-blue-500 text-white font-bold px-3 py-1.5 shadow-md shadow-sky-200/40">
            {weatherEffects.growth} Growth
          </Badge>
        </div>
      </Card>

      {/* Weather Effects - Premium */}
      <Card className="p-5 bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-sm shadow-lg border-slate-200/60">
        <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
          📊 Cozy Weather Effects
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100 hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
              🌱
            </div>
            <div className="font-bold text-sm text-emerald-800">Growth Rate</div>
            <div className="text-emerald-600 font-semibold">{weatherEffects.growth}</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
              💧
            </div>
            <div className="font-bold text-sm text-blue-800">Water Usage</div>
            <div className="text-blue-600 font-semibold">{weatherEffects.water}</div>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100 hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-red-400 to-rose-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
              🦠
            </div>
            <div className="font-bold text-sm text-red-800">Disease Risk</div>
            <div className="text-red-600 font-semibold">{weatherEffects.disease}</div>
          </div>
        </div>
      </Card>

      {/* Weather Forecast - Premium */}
      {state.weatherForecast && state.weatherForecast.length > 0 && (
        <Card className="p-5 bg-gradient-to-br from-white/95 to-indigo-50/50 backdrop-blur-sm shadow-lg border-indigo-100">
          <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
            📅 3-Day Forecast
          </h4>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {state.weatherForecast.slice(0, 3).map((forecast, index) => (
              <div
                key={index}
                className="flex-1 min-w-[110px] text-center p-4 bg-gradient-to-br from-white to-slate-50/80 rounded-xl shadow-md border border-slate-200/60 flex flex-col items-center justify-between hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                  {index === 0 ? 'Tomorrow' : `Day ${index + 1}`}
                </span>
                <div className="text-5xl mb-3 drop-shadow-sm hover:scale-110 transition-transform cursor-default">
                  {getWeatherEmoji(forecast.type)}
                </div>
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold capitalize px-2.5 py-1 shadow-sm">
                  {COZY_WEATHER_LABELS[getCozyWeather(forecast.type)]}
                </Badge>
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

      {/* Weather Statistics - Premium */}
      <Card className="p-5 bg-gradient-to-br from-slate-50/95 to-gray-50/90 backdrop-blur-sm shadow-lg border-slate-200/60">
        <h4 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
          📊 Meteorological Data
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 flex flex-col items-center justify-center hover:shadow-md transition-all">
            <div className="w-10 h-10 mb-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
              🎯
            </div>
            <div className="text-xs text-indigo-600 uppercase tracking-wide font-bold mb-1">Accuracy</div>
            <div className="font-black text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {meteorologicalStats.accuracy}%
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center hover:shadow-md transition-all">
            <div className="w-10 h-10 mb-2 bg-gradient-to-br from-slate-400 to-gray-500 rounded-xl flex items-center justify-center text-white text-xl shadow-md">
              📈
            </div>
            <div className="text-xs text-slate-600 uppercase tracking-wide font-bold mb-1">Total Forecasts</div>
            <div className="font-black text-2xl text-slate-800">
              {meteorologicalStats.totalForecasts}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
});

WeatherTab.displayName = 'WeatherTab';
export default WeatherTab;
