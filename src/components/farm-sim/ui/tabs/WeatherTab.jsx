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

  const getCozyWeather = (weather) => getCozyWeatherType(weather);

  const cozyWeather = getCozyWeatherType(state.weather);
  const weatherEffects = COZY_WEATHER_EFFECTS[cozyWeather] || COZY_WEATHER_EFFECTS.cloudy;

  // Dynamic header theme based on weather
  const getWeatherTheme = (type) => {
    switch (type) {
      case 'sunny': return 'from-orange-400 via-amber-400 to-yellow-300 shadow-[0_20px_50px_rgba(251,191,36,0.2)]';
      case 'rainy': return 'from-blue-600 via-indigo-600 to-sky-600 shadow-[0_20px_50px_rgba(37,99,235,0.2)]';
      case 'stormy': return 'from-indigo-900 via-purple-900 to-blue-900 shadow-[0_20px_50px_rgba(75,85,99,0.3)]';
      case 'snow': return 'from-slate-100 via-sky-100 to-white shadow-[0_20px_50px_rgba(203,213,225,0.2)] text-slate-800';
      case 'heatwave': return 'from-red-600 via-orange-600 to-yellow-600 shadow-[0_20px_50px_rgba(220,38,38,0.2)]';
      default: return 'from-sky-400 via-blue-500 to-indigo-500 shadow-[0_20px_50px_rgba(14,165,233,0.2)]';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Current Weather Status - Premium AAA Card */}
      <Card className={`p-8 bg-gradient-to-br ${getWeatherTheme(cozyWeather)} border-none relative overflow-hidden group transition-all duration-1000`}>
        {/* Animated clouds/atmosphere decoration */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
        </div>

        <div className="flex justify-between items-center relative z-10">
          <div className="space-y-2">
            <h3 className={`text-sm font-black uppercase tracking-[0.3em] ${cozyWeather === 'snow' ? 'text-slate-500' : 'text-white/70'}`}>
              Atmospheric Status
            </h3>
            <div className="flex items-center gap-6">
              <div className="text-8xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)] animate-bounce-subtle">
                {COZY_WEATHER_EMOJI[cozyWeather]}
              </div>
              <div>
                <div className={`text-5xl font-black tracking-tighter ${cozyWeather === 'snow' ? 'text-slate-900' : 'text-white'} flex items-center gap-3`}>
                  {COZY_WEATHER_LABELS[cozyWeather]}
                  <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                </div>
                <p className={`text-lg font-bold mt-1 ${cozyWeather === 'snow' ? 'text-slate-600' : 'text-white/80'}`}>
                  {state.weather === 'heatwave' ? 'Extreme Heat Active' : 'Optimal growing conditions'}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-3">
            <Badge className="h-12 px-6 bg-white/20 backdrop-blur-md text-white border-white/20 font-black text-xl rounded-2xl shadow-xl">
              {weatherEffects.growth} GROWTH
            </Badge>
            <div className={`text-sm font-bold opacity-60 ${cozyWeather === 'snow' ? 'text-slate-500' : 'text-white'}`}>
              Updated Every Cycle
            </div>
          </div>
        </div>
      </Card>

      {/* Weather Effects - Premium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Growth Rate', val: weatherEffects.growth, icon: '🌱', color: 'from-emerald-400 to-green-600', bg: 'bg-emerald-50' },
          { label: 'Hydration Usage', val: weatherEffects.water, icon: '💧', color: 'from-blue-400 to-sky-600', bg: 'bg-blue-50' },
          { label: 'Disease Risk', val: weatherEffects.disease, icon: '🦠', color: 'from-rose-400 to-red-600', bg: 'bg-red-50' }
        ].map((eff, i) => (
          <Card key={i} className={`p-6 bg-white/80 backdrop-blur-md shadow-xl border-slate-100 rounded-3xl group/eff transition-all duration-300 hover:-translate-y-1`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${eff.color} flex items-center justify-center text-2xl text-white shadow-lg group-hover/eff:rotate-6 transition-transform`}>
                {eff.icon}
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{eff.label}</div>
                <div className="text-xl font-black text-slate-800">{eff.val}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Weather Forecast - High-End Timeline */}
      {state.weatherForecast && state.weatherForecast.length > 0 && (
        <Card className="p-8 bg-white shadow-2xl border-slate-200/50 rounded-[2.5rem]">
          <h4 className="font-black text-2xl text-slate-800 mb-8 flex items-center gap-3">
            <span className="w-2 h-8 bg-indigo-500 rounded-full" />
            Meteorological Forecast
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {state.weatherForecast.slice(0, 3).map((forecast, index) => (
              <Card
                key={index}
                className="p-6 bg-slate-50 border-2 border-transparent hover:border-indigo-500/30 transition-all duration-500 group/forecast rounded-3xl text-center flex flex-col items-center gap-4"
              >
                <div className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                  {index === 0 ? 'TOMORROW' : `CYCLE +${index + 1}`}
                </div>
                <div className="text-7xl group-hover/forecast:scale-110 transition-transform duration-500 drop-shadow-md cursor-default py-4">
                  {getWeatherEmoji(forecast.type)}
                </div>
                <div className="text-lg font-black text-slate-800 capitalize tracking-tight">
                  {COZY_WEATHER_LABELS[getCozyWeather(forecast.type)]}
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-indigo-500 rounded-full animate-progress-indeterminate" style={{ width: '60%' }} />
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Oracle's Challenge - Mystical Interface */}
      <Card className="p-1.5 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 shadow-2xl rounded-[2.5rem] border-4 border-indigo-500/20 relative overflow-hidden group">
        {/* Magical aura decorations */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2)_0%,transparent_70%)] pointer-events-none" />

        <div className="p-10 relative z-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h4 className="font-black text-4xl text-white tracking-widest flex items-center gap-4">
                <span className="text-indigo-400 animate-pulse">🔮</span> ORACLE'S CHALLENGE
              </h4>
              <p className="text-indigo-200/60 font-bold text-sm tracking-wide mt-2 uppercase">Decode the sequence of nature</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-60">Success Rate</div>
              <div className="text-2xl font-black text-white">{meteorologicalStats.accuracy}%</div>
            </div>
          </div>

          {!predictionGame.active ? (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
              <div className="text-7xl mb-6 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] lab-icon-float">✨</div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">PREDICT THE FUTURE</h3>
              <p className="text-indigo-200/80 font-medium mb-8 max-w-md mx-auto leading-relaxed">
                Harness celestial data to identify incoming weather cycles.
                Perfect predictions grant legendary rewards.
              </p>

              <Button
                onClick={startPredictionGame}
                className="h-16 px-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xl rounded-2xl shadow-[0_10px_40px_rgba(99,102,241,0.4)] transform transition-all duration-300 hover:scale-105 active:scale-95 group-hover:shadow-[0_20px_60px_rgba(99,102,241,0.5)]"
                disabled={!state.weatherForecast || state.weatherForecast.length < 3}
              >
                INITIATE SCAN
              </Button>

              {(!state.weatherForecast || state.weatherForecast.length < 3) && (
                <div className="mt-4 text-xs font-black text-indigo-400/60 uppercase tracking-widest bg-black/40 inline-block px-4 py-2 rounded-full">
                  Collecting Satellite Data...
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10">
                <div className="flex justify-center items-center gap-8 mb-12">
                  {predictionGame.currentPattern.map((weather, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/10 group-hover:rotate-3 transition-transform">
                        {getWeatherEmoji(weather)}
                      </div>
                      <div className="h-4 w-px bg-white/20 my-2" />
                      <span className="text-[10px] font-black text-indigo-300 uppercase opacity-50">T - {2 - index}</span>
                    </div>
                  ))}

                  <div className="text-white/20 text-4xl mx-2">➞</div>

                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-indigo-500/20 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl border-4 border-indigo-400/30 animate-pulse text-indigo-300 font-black">
                      ?
                    </div>
                    <div className="h-4 w-px bg-indigo-400/40 my-2" />
                    <span className="text-[10px] font-black text-indigo-300 uppercase">FUTURE</span>
                  </div>
                </div>

                <Card className="p-6 bg-amber-950/30 border border-amber-500/20 rounded-2xl flex items-center gap-6 mb-10">
                  <div className="text-5xl filter drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">💡</div>
                  <div>
                    <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Oracle's Insight</h5>
                    <p className="text-lg text-amber-100 font-bold italic">"{predictionGame.hint}"</p>
                  </div>
                </Card>

                {!predictionGame.result ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {["sunny", "rainy", "cloudy", "stormy", "heatwave"].map(weather => (
                      <Button
                        key={weather}
                        onClick={() => makePrediction(weather)}
                        className="h-28 bg-white/5 hover:bg-white/20 border-2 border-white/10 hover:border-indigo-400 transition-all group/opt rounded-2xl"
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-4xl mb-2 group-hover/opt:scale-125 transition-all duration-300">{getWeatherEmoji(weather)}</span>
                          <span className="text-xs font-black uppercase tracking-widest text-indigo-100">{weather}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className={`
                                  p-8 rounded-[2rem] text-center animate-in fade-in zoom-in-95 duration-500 border-4
                                  ${predictionGame.result.correct
                      ? 'bg-emerald-500/20 border-emerald-400/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]'
                      : 'bg-rose-500/20 border-rose-400/30 shadow-[0_0_50px_rgba(244,63,94,0.2)]'}
                               `}>
                    <div className="text-7xl mb-4">{predictionGame.result.correct ? '🏆' : '💀'}</div>
                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">
                      {predictionGame.result.correct ? 'VISION CONFIRMED' : 'SIGNAL LOST'}
                    </h3>
                    <p className="text-indigo-200/60 font-medium mb-6 uppercase tracking-widest">
                      RESULT: <span className="text-white font-black">{predictionGame.result.actualWeather}</span>
                    </p>

                    {predictionGame.result.correct && (
                      <div className="inline-flex gap-4 p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                        <div className="text-center px-4">
                          <div className="text-[10px] text-indigo-300 uppercase font-black mb-1">Coins</div>
                          <div className="text-xl font-black text-yellow-400">+{predictionGame.result.reward.coins}</div>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-center px-4">
                          <div className="text-[10px] text-indigo-300 uppercase font-black mb-1">Experience</div>
                          <div className="text-xl font-black text-blue-400">+{predictionGame.result.reward.xp}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Meteorological Data - Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <Card className="p-8 bg-slate-50 border-slate-200/60 rounded-[2rem] flex items-center justify-between group hover:shadow-xl transition-all">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prediction Yield</div>
            <div className="text-4xl font-black text-slate-800">{meteorologicalStats.accuracy}%</div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Global consensus from Oracle predictions</p>
          </div>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-slate-200 group-hover:scale-110 transition-transform">
            🎯
          </div>
        </Card>
        <Card className="p-8 bg-slate-50 border-slate-200/60 rounded-[2rem] flex items-center justify-between group hover:shadow-xl transition-all">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Historical Log</div>
            <div className="text-4xl font-black text-slate-800">{meteorologicalStats.totalForecasts}</div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Total atmospheric scans completed</p>
          </div>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-slate-200 group-hover:scale-110 transition-transform">
            📜
          </div>
        </Card>
      </div>
    </div>
  );
});

WeatherTab.displayName = 'WeatherTab';
export default WeatherTab;
