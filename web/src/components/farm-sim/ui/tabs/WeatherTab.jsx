import React, { memo, useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { getWeatherMeta, normalizeWeatherType } from '../../constants/weatherData';
import { TabHero, MetricTile, TabSection } from './TabSurface';

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
    actions.earnMoney(reward.coins);
    actions.addXP(reward.xp, { source: 'minigame', minigameId: 'weather_prediction', skillFactor: reward.accuracy || 0, label: 'Weather Prediction' });

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
      <TabHero
        icon={getWeatherEmoji(state.weather)}
        tone="sky"
        title="Current weather"
        description={`Right now the farm reads as ${currentWeatherMeta.label.toLowerCase()}.`}
        badge={<Badge variant="outline" className="bg-white/80 text-slate-600">{weatherEffects.growth} Growth</Badge>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricTile tone="emerald" label="Growth Rate" value={weatherEffects.growth} hint="Crop speed effect" icon="🌿" />
          <MetricTile tone="sky" label="Water Usage" value={weatherEffects.water} hint="Water demand shift" icon="💧" />
          <MetricTile tone="rose" label="Disease Risk" value={weatherEffects.disease} hint="Health pressure" icon="⚠️" />
        </div>
      </TabHero>

      {state.weatherForecast && state.weatherForecast.length > 0 ? (
        <TabSection title="3-day forecast" description="The next few weather beats." tone="slate">
          <div className="grid gap-2 sm:grid-cols-3">
            {state.weatherForecast.slice(0, 3).map((forecast, index) => (
              <div key={index} className="rounded-[20px] border border-slate-200/60 bg-white/72 p-3 text-center">
                <div className="text-lg">{getWeatherEmoji(forecast.type)}</div>
                <div className="text-xs capitalize text-slate-600">{forecast.type}</div>
                <div className="text-xs text-slate-500">{forecast.duration}s</div>
              </div>
            ))}
          </div>
        </TabSection>
      ) : null}

      <TabSection title="Weather prediction" description="Read the pattern and call the next turn." tone="violet">
        {predictionGame.active ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-2 text-sm text-violet-700">Predict the next weather pattern</div>
              <div className="mb-4 flex justify-center gap-2">
                {predictionGame.currentPattern.map((weather, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <span className="text-2xl">{getWeatherEmoji(weather)}</span>
                    <span className="text-xs capitalize text-slate-600">{weather}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center">
                  <span className="text-2xl">→</span>
                  <span className="text-xs text-slate-600">?</span>
                </div>
              </div>
              <div className="mb-4 text-xs italic text-slate-600">💡 {predictionGame.hint}</div>
              {!predictionGame.result ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
              ) : (
                <div className={`rounded-[20px] border p-3 ${predictionGame.result.correct ? 'border-green-200 bg-green-50/80' : 'border-red-200 bg-red-50/80'}`}>
                  <div className="mb-1 text-lg">
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
            {(!state.weatherForecast || state.weatherForecast.length < 3) ? (
              <div className="text-xs text-slate-500">Need 3+ weather history entries to play</div>
            ) : null}
          </div>
        )}
      </TabSection>

      <TabSection title="Weather statistics" description="A compact read on forecast familiarity." tone="slate">
        <div className="grid gap-3 sm:grid-cols-2">
          <MetricTile
            tone="sky"
            label="Forecasts Seen"
            value={state.weatherForecast?.length || 0}
            hint="Weather history count"
            icon="🛰️"
          />
          <MetricTile
            tone="emerald"
            label="Current Streak"
            value={state.weatherForecast
              ? state.weatherForecast.filter((f) => normalizeWeatherType(f.type) === normalizeWeatherType(state.weather)).length
              : 0}
            hint="Matching forecast entries"
            icon="🔥"
          />
        </div>
      </TabSection>
    </div>
  );
});

WeatherTab.displayName = 'WeatherTab';
export default WeatherTab;
