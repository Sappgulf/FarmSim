import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Card } from '../../ui/card';
import { CROP_DATA } from '../constants/cropData';
import { getNextTownTier, getTownTierByRep, getTownTierIndex } from '../constants/townData';
import {
  COZY_WEATHER_EMOJI,
  COZY_WEATHER_LABELS,
  getCozyWeatherType
} from '../constants/cozyWeather';

const buildDailyHint = ({ season, cozyWeather }) => {
  if (cozyWeather === 'rain') return 'Rain keeps plots watered — a relaxing planting day.';
  if (cozyWeather === 'heatwave') return 'Heatwave boosts warmth — keep an eye on thirsty crops.';
  if (cozyWeather === 'cloudy') return 'Soft light helps steady growth and calm routines.';
  if (season === 'winter') return 'Frosty air slows growth — plan cozy harvests.';
  if (season === 'fall') return 'Harvest vibes are strong — market prices feel warm.';
  if (season === 'summer') return 'Lush sunlight energizes the farm today.';
  return 'Fresh spring energy makes planting feel effortless.';
};

const TownBoard = memo(() => {
  const { state } = useGame();
  const [isOpen, setIsOpen] = useState(true);
  const repBarRef = useRef(null);

  const season = state.season?.current || 'spring';
  const seasonLabel = state.season?.config?.name || 'Season';
  const seasonEmoji = state.season?.config?.emoji || '🌸';

  const cozyWeather = getCozyWeatherType(state.weather);
  const weatherLabel = COZY_WEATHER_LABELS[cozyWeather] || 'Cloudy';
  const weatherEmoji = COZY_WEATHER_EMOJI[cozyWeather] || '🌤️';

  const currentTier = getTownTierByRep(state.social?.reputation || 0);
  const nextTier = getNextTownTier(state.social?.reputation || 0);
  const repProgress = nextTier
    ? Math.min(100, ((state.social?.reputation - currentTier.minRep) / (nextTier.minRep - currentTier.minRep)) * 100)
    : 100;

  const featuredCrop = useMemo(() => {
    const cropId = state.market?.dailyFeaturedCrop;
    return cropId ? CROP_DATA[cropId] : null;
  }, [state.market?.dailyFeaturedCrop]);

  const dailyMood = state.market?.dailyMood || { emoji: '🪴', label: 'Steady Market' };

  const hint = useMemo(() => buildDailyHint({ season, cozyWeather }), [season, cozyWeather]);
  const dailyPlan = state.dailyPlan?.items || [];
  const dailyPlanDay = state.dailyPlan?.dayCount;

  useEffect(() => {
    if (repBarRef.current) {
      repBarRef.current.style.width = `${repProgress}%`;
    }
  }, [repProgress]);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full max-w-4xl mx-auto animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {state.farmName || 'My Farm'}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {seasonLabel} • Day {state.season?.dayInSeason || 1} • {weatherLabel} {weatherEmoji}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.switchToTab?.('settings')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Settings"
          >
            <span className="text-xl">⚙️</span>
          </button>
        </div>
      </div>

      {/* Daily Focus / Hero Section */}
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100 shadow-sm p-0 overflow-hidden">
        <div className="p-4 sm:p-6 pb-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-indigo-900 mb-1">Today's Focus</h2>
              <p className="text-sm text-indigo-700 leading-relaxed max-w-md">
                {hint}
              </p>
            </div>
            <div className="hidden sm:block text-4xl opacity-80">
              {cozyWeather === 'rain' ? '🌧️' :
                cozyWeather === 'storm' ? '⛈️' :
                  season === 'winter' ? '❄️' : '☀️'}
            </div>
          </div>
        </div>

        {/* Dynamic Suggested Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 p-2 bg-white/50 border-t border-indigo-100/50">
          <button
            onClick={() => window.switchToTab?.('farming')}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              🌾
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">Tend Farm</div>
              <div className="text-xs text-gray-500">Check crops</div>
            </div>
          </button>

          <button
            onClick={() => window.switchToTab?.('shop')}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              🛒
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">Visit Market</div>
              <div className="text-xs text-gray-500">
                {featuredCrop ? `${featuredCrop.emoji} Featured` : 'See deals'}
              </div>
            </div>
          </button>

          <button
            onClick={() => window.switchToTab?.('collections')}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              🏆
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm">Collections</div>
              <div className="text-xs text-gray-500">Track progress</div>
            </div>
          </button>
        </div>
      </Card>

      {/* Town Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Town Rep Card */}
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">Town Reputation</div>
            <div className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">
              Tier {getTownTierIndex(state.social?.reputation) + 1}
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900">{state.social?.reputation || 0}</span>
            <span className="text-sm text-gray-600 font-medium">{currentTier.name}</span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2 mb-1 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${repProgress}%` }}
            />
          </div>
          {nextTier && (
            <div className="text-xs text-gray-400 text-right">
              Next: {nextTier.name} ({nextTier.minRep})
            </div>
          )}
        </Card>

        {/* Market Mood Card */}
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">Market Report</div>
            <div className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Updated Daily
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="text-3xl filter drop-shadow-sm">{dailyMood.emoji}</div>
            <div>
              <div className="font-bold text-gray-900">{dailyMood.label}</div>
              <div className="text-xs text-gray-500 line-clamp-1">{dailyMood.description || 'Standard trading day'}</div>
            </div>
          </div>

          {featuredCrop && (
            <div className="mt-2 text-xs bg-gray-50 p-2 rounded flex items-center gap-2">
              <span>🔥 Hot Item:</span>
              <span className="font-medium text-gray-900">{featuredCrop.emoji} {featuredCrop.name}</span>
            </div>
          )}
        </Card>
      </div>

      {/* Daily Plan List */}
      <div className="mt-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 pl-1">
          Recommended Plan
        </h3>
        {dailyPlan.length > 0 ? (
          <div className="space-y-2">
            {dailyPlan.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm"
              >
                <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-100">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 italic pl-1">
            Relax and enjoy the farm life today.
          </div>
        )}
      </div>
    </div>
  );
});

TownBoard.displayName = 'TownBoard';

export default TownBoard;
