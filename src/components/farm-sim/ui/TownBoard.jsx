import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Card } from '../../ui/card';
import { CROP_DATA } from '../constants/cropData';
import { getNextTownTier, getTownTierByRep } from '../constants/townData';
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
    <Card className="town-board-card">
      <div className="town-board-header">
        <div>
          <div className="town-board-title">📌 Town Board</div>
          <div className="town-board-subtitle">Daily vibes from the village square</div>
        </div>
        <button
          type="button"
          className="town-board-toggle"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        >
          {isOpen ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className={`town-board-content ${isOpen ? 'open' : 'closed'}`}>
        <div className="town-board-grid">
          <div className="town-board-block">
            <div className="town-board-label">Today</div>
            <div className="town-board-row">
              <span className="text-lg">{seasonEmoji}</span>
              <span className="font-semibold">{seasonLabel}</span>
            </div>
            <div className="town-board-row">
              <span className="text-lg">{weatherEmoji}</span>
              <span>{weatherLabel}</span>
            </div>
          </div>

          <div className="town-board-block">
            <div className="town-board-label">Town Rep</div>
            <div className="town-board-row">
              <span className="font-semibold">{state.social?.reputation || 0} Rep</span>
              <span className="town-board-tier">{currentTier.name}</span>
            </div>
            <div className="town-board-bar">
              <span ref={repBarRef} className="town-board-bar-fill" />
            </div>
            {nextTier && (
              <div className="town-board-hint">Next: {nextTier.name} at {nextTier.minRep} rep</div>
            )}
          </div>

          <div className="town-board-block">
            <div className="town-board-label">Market Mood</div>
            <div className="town-board-row">
              <span className="text-lg">{dailyMood.emoji}</span>
              <span className="font-semibold">{dailyMood.label}</span>
            </div>
            <div className="town-board-hint">{dailyMood.description || 'Local stalls feel cozy today.'}</div>
          </div>

          <div className="town-board-block">
            <div className="town-board-label">Featured Crop</div>
            <div className="town-board-row">
              <span className="text-lg">{featuredCrop ? featuredCrop.emoji : '🌿'}</span>
              <span className="font-semibold">{featuredCrop ? featuredCrop.name : 'No spotlight'}</span>
            </div>
            <div className="town-board-hint">{featuredCrop ? 'Small bonus at the market.' : 'Check back after the next day.'}</div>
          </div>
        </div>

        <div className="town-board-footer">
          <span className="town-board-label">What’s happening today</span>
          <p>{hint}</p>
        </div>

        <div className="town-board-plan">
          <div className="town-board-plan-header">
            <span className="town-board-label">Today’s Plan</span>
            {dailyPlanDay && (
              <span className="town-board-plan-day">Day {dailyPlanDay}</span>
            )}
          </div>
          {dailyPlan.length > 0 ? (
            <ul className="town-board-plan-list">
              {dailyPlan.map((item, index) => (
                <li key={`${item}-${index}`} className="town-board-plan-item">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="town-board-hint">Check back tomorrow for fresh guidance.</p>
          )}
        </div>
      </div>
    </Card>
  );
});

TownBoard.displayName = 'TownBoard';

export default TownBoard;
