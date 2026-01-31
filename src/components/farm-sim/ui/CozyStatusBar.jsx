import React, { memo, useEffect, useMemo, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { CROP_DATA } from '../constants/cropData';
import { getNextTownTier, getTownTierByRep } from '../constants/townData';

const CozyStatusBar = memo(() => {
  const { state } = useGame();

  const cozyWeatherMap = {
    sunny: { label: 'Clear', emoji: '☀️', help: 'Bright skies with gentle growth.' },
    rainy: { label: 'Rain', emoji: '🌧️', help: 'Cozy rain keeps plots watered.' },
    cloudy: { label: 'Cloudy', emoji: '☁️', help: 'Soft light with steady growth.' },
    stormy: { label: 'Rain', emoji: '🌧️', help: 'A brief storm with mild impact.' },
    snow: { label: 'Cloudy', emoji: '☁️', help: 'Snowy calm slows growth slightly.' },
    windy: { label: 'Cloudy', emoji: '☁️', help: 'Breezy weather with light effects.' },
    drought: { label: 'Heatwave', emoji: '🌤️', help: 'Dry air increases thirst.' },
    heatwave: { label: 'Heatwave', emoji: '🌤️', help: 'Warm breezes mean extra thirst.' },
    hot: { label: 'Heatwave', emoji: '🌤️', help: 'Warm breezes mean extra thirst.' },
  };

  const cozyWeather = cozyWeatherMap[state.weather] || {
    label: state.weather || 'Weather',
    emoji: '🌤️',
    help: 'Gentle conditions today.',
  };

  const seasonLabel = state.season?.config?.name || 'Season';
  const seasonEmoji = state.season?.config?.emoji || '🌸';
  const dayInSeason = state.season?.dayInSeason || 1;
  const daysPerSeason = state.season?.daysPerSeason || 4;

  const currentTier = getTownTierByRep(state.social?.reputation || 0);
  const nextTier = getNextTownTier(state.social?.reputation || 0);
  const repProgress = nextTier
    ? Math.min(100, ((state.social?.reputation - currentTier.minRep) / (nextTier.minRep - currentTier.minRep)) * 100)
    : 100;

  const collectionSummary = useMemo(() => {
    const crops = Object.values(CROP_DATA);
    const discovered = crops.filter((crop) => state.collections?.crops?.[crop.id]?.discovered).length;
    return { discovered, total: crops.length };
  }, [state.collections]);

  const refs = {
    season: useRef(null),
    day: useRef(null),
    weather: useRef(null),
    rep: useRef(null),
    repBar: useRef(null),
    collection: useRef(null),
  };
  const lastValues = useRef({});

  useEffect(() => {
    const updates = [
      ['season', seasonLabel],
      ['day', `Day ${dayInSeason}/${daysPerSeason}`],
      ['weather', `${cozyWeather.emoji} ${cozyWeather.label}`],
      ['rep', `${state.social?.reputation || 0} Rep`],
      ['collection', `${collectionSummary.discovered}/${collectionSummary.total}`],
    ];

    updates.forEach(([key, value]) => {
      if (lastValues.current[key] === value) return;
      const node = refs[key]?.current;
      if (node) {
        node.textContent = value;
        lastValues.current[key] = value;
      }
    });

    if (refs.repBar.current && lastValues.current.repProgress !== repProgress) {
      refs.repBar.current.style.width = `${repProgress}%`;
      lastValues.current.repProgress = repProgress;
    }
  }, [
    seasonLabel,
    dayInSeason,
    daysPerSeason,
    cozyWeather.emoji,
    cozyWeather.label,
    state.social?.reputation,
    repProgress,
    collectionSummary,
  ]);

  return (
    <div className="mt-2 rounded-xl border border-emerald-100 bg-white/90 px-3 py-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-base">{seasonEmoji}</span>
          <div className="flex flex-col leading-tight">
            <span ref={refs.season} className="font-semibold text-emerald-900">{seasonLabel}</span>
            <span ref={refs.day} className="text-[10px] text-emerald-700">Day {dayInSeason}/{daysPerSeason}</span>
          </div>
        </div>

        <button
          type="button"
          className="group relative flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-2 py-1 text-[11px] text-sky-700"
          title={cozyWeather.help}
          aria-label={`Weather: ${cozyWeather.label}`}
        >
          <span ref={refs.weather} className="font-semibold">{cozyWeather.emoji} {cozyWeather.label}</span>
          <span className="hidden sm:inline text-[10px] text-sky-500">Tap for details</span>
          <span className="absolute left-0 top-full mt-2 hidden w-48 rounded-lg border border-sky-100 bg-white p-2 text-[10px] text-sky-700 shadow-lg group-hover:block">
            {cozyWeather.help}
          </span>
        </button>

        <div className="flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-2 py-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-700">Town Rep</span>
            <span ref={refs.rep} className="font-semibold text-amber-900">{state.social?.reputation || 0} Rep</span>
          </div>
          <div className="w-20 h-1.5 rounded-full bg-amber-100 overflow-hidden">
            <span ref={refs.repBar} className="block h-full rounded-full bg-amber-400" style={{ width: `${repProgress}%` }} />
          </div>
          <span className="text-[10px] text-amber-700">{currentTier.name}</span>
        </div>

        <button
          type="button"
          onClick={() => window.switchToTab?.('collections')}
          className="ml-auto flex w-full items-center justify-between gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700 sm:w-auto sm:justify-start"
          aria-label="Open Collections"
        >
          <span>📚</span>
          <span className="font-semibold">Collections</span>
          <span ref={refs.collection} className="rounded-full bg-white px-2 text-[10px] text-emerald-700">{collectionSummary.discovered}/{collectionSummary.total}</span>
        </button>
      </div>
    </div>
  );
});

CozyStatusBar.displayName = 'CozyStatusBar';
export default CozyStatusBar;
