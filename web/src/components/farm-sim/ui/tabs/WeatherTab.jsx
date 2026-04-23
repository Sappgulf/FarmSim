import React, { memo, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Card } from '../../../ui/card';
import Sparkline from '../../../ui/sparkline';
import { getWeatherMeta, normalizeWeatherType } from '../../constants/weatherData';
import { GAME_SETTINGS, SEASON_DATA } from '../../../../data/constants';
import { TabHero, MetricTile, TabSection } from './TabSurface';

/* ── constants ── */
const WEATHER_PATTERNS = [
  {
    pattern: ['sunny', 'sunny', 'cloudy'],
    nextWeather: 'rainy',
    confidence: 0.8,
    hint: 'Three day pattern suggests incoming rain'
  },
  {
    pattern: ['rainy', 'cloudy'],
    nextWeather: 'sunny',
    confidence: 0.7,
    hint: 'Rain clearing leads to sunshine'
  },
  {
    pattern: ['windy', 'windy'],
    nextWeather: 'stormy',
    confidence: 0.9,
    hint: 'Strong winds often bring storms'
  },
  {
    pattern: ['sunny', 'sunny', 'windy'],
    nextWeather: 'drought',
    confidence: 0.6,
    hint: 'Extended dry winds may trigger drought'
  }
];

const WEATHER_PREDICTION_REWARDS = {
  perfect: { coins: 100, xp: 50, accuracy: 1.0 },
  good: { coins: 60, xp: 30, accuracy: 0.8 },
  okay: { coins: 30, xp: 15, accuracy: 0.6 },
  poor: { coins: 10, xp: 5, accuracy: 0.4 }
};

const PREDICTION_OPTIONS = Array.from(
  new Set(['sunny', 'rainy', 'stormy', 'cloudy', ...WEATHER_PATTERNS.map((p) => p.nextWeather)])
);

/** Map weather to a growth-score for sparklines */
const weatherToScore = (w) => {
  const scores = {
    sunny: 1.2, rainy: 1.1, cloudy: 1.0, windy: 0.9,
    foggy: 0.95, stormy: 0.8, drought: 0.6, hail: 0.5,
    snow: 0.3, snowy: 0.3, frost: 0.3, tornado: 0.0,
  };
  return scores[normalizeWeatherType(w)] ?? 0.5;
};

/** Derive a plausible temperature from season + weather */
const getDerivedTemp = (weather, seasonKey) => {
  const base = { spring: 18, summer: 28, fall: 15, winter: 2 }[seasonKey] ?? 18;
  const mods = {
    sunny: 5, rainy: -3, stormy: -5, cloudy: -2,
    snow: -10, snowy: -10, frost: -12, drought: 8,
    windy: -1, foggy: -1, hail: -6, tornado: -3,
  };
  return base + (mods[normalizeWeatherType(weather)] ?? 0);
};

const getWeatherEmoji = (weather) => getWeatherMeta(weather).emoji;

const getCurrentWeatherEffects = (weather) => {
  const effects = {
    sunny: { growth: '+20%', water: '-10%', disease: 'Low', description: 'Fast growth, moderate water needs' },
    rainy: { growth: '+10%', water: '+50%', disease: 'Medium', description: 'Auto-water + growth boost' },
    cloudy: { growth: 'Normal', water: 'Normal', disease: 'Low', description: 'Normal conditions' },
    stormy: { growth: '-20%', water: '+20%', disease: 'High', description: 'Risk of crop damage' },
    windy: { growth: '-10%', water: '-5%', disease: 'Medium', description: 'Moderate effects' },
    drought: { growth: '-30%', water: '-20%', disease: 'High', description: 'Fast wilting, water needed' },
    snow: { growth: '-70%', water: '+10%', disease: 'Low', description: 'Freezing conditions, minimal growth' },
    frost: { growth: '-70%', water: 'Normal', disease: 'Low', description: 'Growth stopped, frost damage' },
    foggy: { growth: '-5%', water: '+5%', disease: 'Low', description: 'High humidity, slow drying' },
    hail: { growth: '-50%', water: '+30%', disease: 'Low', description: 'DANGER! Crop damage likely' },
    tornado: { growth: '-100%', water: '0%', disease: 'None', description: 'SEVERE WARNING! Take shelter!' },
  };
  return effects[normalizeWeatherType(weather)] || effects.cloudy;
};

const SEVERE_WEATHER = ['stormy', 'drought', 'hail', 'tornado'];

/* ── sub-components ── */

const SeasonProgressRing = memo(({ seasonKey, lastChangeTime }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const durationMs = GAME_SETTINGS.SEASON_DURATION * 1000;
  const elapsed = Math.max(0, Date.now() - (lastChangeTime || Date.now()));
  const progress = Math.min(1, elapsed / durationMs);
  const offset = circumference * (1 - progress);

  const season = SEASON_DATA[seasonKey] || SEASON_DATA.spring;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 88, height: 88 }}>
        <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
          <circle cx="44" cy="44" r={radius} className="progress-ring-track" />
          <circle
            cx="44" cy="44" r={radius}
            className="progress-ring-value"
            stroke={seasonKey === 'spring' ? '#34d399' : seasonKey === 'summer' ? '#fbbf24' : seasonKey === 'fall' ? '#fb923c' : '#7dd3fc'}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg leading-none">{season.emoji}</span>
          <span className="mt-0.5 text-[10px] font-bold text-slate-600">{Math.round(progress * 100)}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500">{season.name} Progress</span>
    </div>
  );
});
SeasonProgressRing.displayName = 'SeasonProgressRing';

const WeatherAdvisory = memo(({ weather }) => {
  const isSevere = SEVERE_WEATHER.includes(normalizeWeatherType(weather));
  if (!isSevere) return null;

  const meta = getWeatherMeta(weather);
  const messages = {
    stormy: 'Storms can damage crops. Ensure greenhouse protection is active.',
    drought: 'Water demand is critical. Consider upgrading your well or irrigating manually.',
    hail: 'Hail can destroy exposed crops. Move valuable harvests to storage.',
    tornado: 'Extreme danger! Seek shelter and protect livestock immediately.',
  };

  return (
    <div className="advisory-pulse rounded-[20px] border border-red-200 bg-red-50/80 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <div className="text-sm font-semibold text-red-800">
            Weather Advisory: {meta.label}
          </div>
          <div className="mt-0.5 text-xs text-red-700">
            {messages[normalizeWeatherType(weather)]}
          </div>
        </div>
      </div>
    </div>
  );
});
WeatherAdvisory.displayName = 'WeatherAdvisory';

const ForecastDayCard = memo(({ dayName, weather, temp, isToday }) => {
  const meta = getWeatherMeta(weather);
  const effects = getCurrentWeatherEffects(weather);
  const animClass = `weather-icon-${normalizeWeatherType(weather)}`;

  return (
    <div className={`forecast-card relative flex flex-col items-center rounded-[20px] border border-slate-200/60 bg-white/72 p-3 text-center ${isToday ? 'ring-2 ring-sky-300/60' : ''}`}>
      {isToday && (
        <Badge variant="info" className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px]">Today</Badge>
      )}
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{dayName}</span>
      <span className={`my-1 text-2xl leading-none ${animClass}`}>{meta.emoji}</span>
      <span className="text-xs font-medium capitalize text-slate-700">{meta.label}</span>
      <span className="mt-0.5 text-xs text-slate-500">{temp}°C</span>
      <span className="mt-1 text-[10px] leading-tight text-slate-400">{effects.description}</span>
    </div>
  );
});
ForecastDayCard.displayName = 'ForecastDayCard';

/* ── main tab ── */
const WeatherTab = memo(() => {
  const { state, actions } = useGame();
  const [predictionGame, setPredictionGame] = React.useState({
    active: false,
    currentPattern: [],
    selectedPrediction: null,
    hint: '',
    correctWeather: null,
    result: null
  });

  const currentWeatherMeta = getWeatherMeta(state.weather);
  const weatherEffects = getCurrentWeatherEffects(state.weather);
  const currentTemp = getDerivedTemp(state.weather, state.season?.current);

  /* 5-day forecast data */
  const forecastDays = useMemo(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIdx = new Date().getDay();

    // Day 0 = today (current weather)
    days.push({
      name: 'Today',
      weather: state.weather,
      temp: currentTemp,
      isToday: true,
    });

    // Use forecast entries for upcoming days
    const forecast = state.weatherForecast || [];
    for (let i = 0; i < 4; i++) {
      const f = forecast[i];
      const w = f?.type || 'sunny';
      days.push({
        name: dayNames[(todayIdx + i + 1) % 7],
        weather: w,
        temp: getDerivedTemp(w, state.season?.current),
        isToday: false,
      });
    }
    return days;
  }, [state.weather, state.weatherForecast, state.season?.current, currentTemp]);

  /* Weather history sparkline data */
  const weatherSparklineData = useMemo(() => {
    // Build a timeline: current weather + forecast mapped to scores
    const timeline = [state.weather, ...(state.weatherForecast || []).map((f) => f.type)];
    return timeline.map((w) => weatherToScore(w) * 100);
  }, [state.weather, state.weatherForecast]);

  const startPredictionGame = () => {
    if (!state.weatherForecast || state.weatherForecast.length < 3) {
      actions.addNotification({
        message: 'Need more weather history to predict!',
        type: 'warning'
      });
      return;
    }
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
      const pattern = WEATHER_PATTERNS.find((p) =>
        p.pattern.join(',') === predictionGame.currentPattern.join(',')
      );
      const confidence = pattern?.confidence || 0.5;
      if (confidence >= 0.8) reward = WEATHER_PREDICTION_REWARDS.perfect;
      else if (confidence >= 0.7) reward = WEATHER_PREDICTION_REWARDS.good;
      else reward = WEATHER_PREDICTION_REWARDS.okay;
    }
    actions.earnMoney(reward.coins);
    actions.addXP(reward.xp, { source: 'minigame', minigameId: 'weather_prediction', skillFactor: reward.accuracy || 0, label: 'Weather Prediction' });
    setPredictionGame((prev) => ({
      ...prev,
      selectedPrediction: predictedWeather,
      result: { correct: isCorrect, reward, actualWeather: predictionGame.correctWeather }
    }));
    setTimeout(() => {
      setPredictionGame((prev) => ({ ...prev, active: false }));
    }, 3000);
  };

  const animClass = `weather-icon-${normalizeWeatherType(state.weather)}`;

  return (
    <div className="space-y-4">
      {/* Current Weather Card */}
      <TabHero
        icon={getWeatherEmoji(state.weather)}
        tone="sky"
        title="Current weather"
        description={`Right now the farm reads as ${currentWeatherMeta.label.toLowerCase()}.`}
        badge={<Badge variant="outline" className="bg-white/80 text-slate-600">{weatherEffects.growth} Growth</Badge>}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="col-span-1 flex flex-col items-center justify-center gap-2 rounded-[24px] p-5 sm:col-span-1">
            <span className={`text-6xl leading-none ${animClass}`}>{currentWeatherMeta.emoji}</span>
            <div className="text-2xl font-bold text-slate-900">{currentTemp}°C</div>
            <div className="text-sm font-medium text-slate-600">{currentWeatherMeta.label}</div>
            <div className="text-xs text-slate-500 text-center">{weatherEffects.description}</div>
          </Card>

          <div className="col-span-1 sm:col-span-2 grid gap-3 sm:grid-cols-3">
            <MetricTile tone="emerald" label="Growth Rate" value={weatherEffects.growth} hint="Crop speed effect" icon="🌿" />
            <MetricTile tone="sky" label="Water Usage" value={weatherEffects.water} hint="Water demand shift" icon="💧" />
            <MetricTile tone="rose" label="Disease Risk" value={weatherEffects.disease} hint="Health pressure" icon="⚠️" />

            <div className="sm:col-span-3 rounded-[18px] border border-slate-200/60 bg-white/72 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weather Pattern</span>
                <Sparkline data={weatherSparklineData} width={160} height={36} color="#0ea5e9" fill />
              </div>
            </div>
          </div>
        </div>
      </TabHero>

      {/* 5-Day Forecast */}
      <TabSection title="5-day forecast" description="Upcoming conditions at a glance." tone="slate">
        <div className="grid grid-cols-5 gap-2">
          {forecastDays.map((day, idx) => (
            <ForecastDayCard
              key={idx}
              dayName={day.name}
              weather={day.weather}
              temp={day.temp}
              isToday={day.isToday}
            />
          ))}
        </div>
      </TabSection>

      {/* Advisory + Season Ring */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TabSection title="Weather advisory" description="Active alerts for the farm." tone="rose">
          <WeatherAdvisory weather={state.weather} />
          {!SEVERE_WEATHER.includes(normalizeWeatherType(state.weather)) && (
            <div className="rounded-[18px] border border-green-200 bg-green-50/60 px-4 py-3 text-sm text-green-700">
              ✅ Conditions are stable. No severe weather advisories at this time.
            </div>
          )}
        </TabSection>

        <TabSection title="Season progress" description="How far through the current season." tone="emerald">
          <div className="flex items-center justify-center py-2">
            <SeasonProgressRing seasonKey={state.season?.current} lastChangeTime={state.season?.lastChangeTime} />
          </div>
        </TabSection>
      </div>

      {/* Prediction Game */}
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
                  {PREDICTION_OPTIONS.map((weather) => (
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

      {/* Weather Statistics */}
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
