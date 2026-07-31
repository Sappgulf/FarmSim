import React, { memo, useMemo } from 'react';
import {
  BadgeCheck,
  CalendarCheck,
  CloudSun,
  Droplets,
  Leaf,
  Scissors,
  ShieldAlert,
  Sprout,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { CROP_LIST } from '../constants/cropData';
import { FARM_TITLES } from '../../../data/cozyExpansion';
import { getDailyCropFocus } from '../../../utils/dailyFocus';
import { formatDisplayLabel } from '../../../utils/textFormat';
import WeatherDecisionPanel from './WeatherDecisionPanel';

const countPlots = (plots = []) => {
  const counts = {
    total: 0,
    ready: 0,
    empty: 0,
    thirsty: 0,
    diseased: 0,
    withered: 0,
    activeGrowing: 0,
  };

  plots.forEach((plot) => {
    if (!plot) return;
    counts.total += 1;
    if (plot.state === 'ready') counts.ready += 1;
    if (plot.state === 'empty') counts.empty += 1;
    if (plot.state === 'withered') counts.withered += 1;
    if (plot?.disease) counts.diseased += 1;
    if ((plot.state === 'planted' || plot.state === 'growing') && (plot.waterLevel || 0) <= 40) {
      counts.thirsty += 1;
    }
    if (plot.state === 'planted' || plot.state === 'growing') {
      counts.activeGrowing += 1;
    }
  });

  return counts;
};

const countAnimalNeeds = (animals = []) =>
  animals.reduce(
    (counts, animal) => {
      if (!animal) return counts;
      if (animal.hasProduct || animal.productionReady) counts.products += 1;
      if (
        (animal.hunger || 0) > 70 ||
        (animal.happiness ?? 100) < 35 ||
        (animal.health ?? 100) < 55
      ) {
        counts.care += 1;
      }
      return counts;
    },
    { care: 0, products: 0 }
  );

const countClaimableRewards = ({ dailyChallenges = [], dailyQuests }) => {
  const challengeCount = dailyChallenges.filter(
    (challenge) => challenge?.completed && !challenge?.claimed
  ).length;
  const questCount = Array.isArray(dailyQuests?.quests)
    ? dailyQuests.quests.filter((quest) => quest?.completed && !quest?.claimed).length
    : 0;
  return challengeCount + questCount;
};

const getNextUnlock = (level) => {
  const nextCrop = CROP_LIST.filter((crop) => Number(crop.level || 1) > level).sort(
    (a, b) => Number(a.level || 1) - Number(b.level || 1)
  )[0];

  if (nextCrop) {
    return `Level ${nextCrop.level}: ${nextCrop.name}`;
  }

  return 'Build upgrades and farm titles';
};

const getSeasonImplication = (seasonConfig, weather) => {
  const growth = seasonConfig?.bonuses?.growthSpeed;
  const market = seasonConfig?.bonuses?.marketPrices;
  const parts = [];

  if (Number.isFinite(growth)) {
    const delta = Math.round((growth - 1) * 100);
    if (delta !== 0) parts.push(`${delta > 0 ? '+' : ''}${delta}% growth`);
  }
  if (Number.isFinite(market)) {
    const delta = Math.round((market - 1) * 100);
    if (delta !== 0) parts.push(`${delta > 0 ? '+' : ''}${delta}% market`);
  }

  if (weather === 'rainy') parts.push('rain helps water');
  if (weather === 'stormy') parts.push('storm risk');
  if (weather === 'drought') parts.push('water pressure');
  if (weather === 'snow') parts.push('cold slowdown');

  return parts.length ? parts.join(' · ') : seasonConfig?.description || 'Stable farm conditions';
};

const getRecommendedCrop = ({ level, coins, inventory, dailyFocus }) => {
  const eligible = CROP_LIST.filter((crop) => Number(crop.level || 1) <= level);
  if (!eligible.length) return null;

  const stockedOrAffordable = (crop) =>
    (inventory?.[crop.id] || 0) > 0 || coins >= (crop.cost || 0);
  const dailyCrop = dailyFocus?.cropId
    ? eligible.find((crop) => crop.id === dailyFocus.cropId && stockedOrAffordable(crop))
    : null;
  if (dailyCrop) return dailyCrop;

  return [...eligible].filter(stockedOrAffordable).sort((a, b) => {
    const aScore = ((a.baseValue || 0) - (a.cost || 0)) / Math.max(1, a.growthTime || 1);
    const bScore = ((b.baseValue || 0) - (b.cost || 0)) / Math.max(1, b.growthTime || 1);
    return bScore - aScore;
  })[0];
};

const FarmRhythmPanel = memo(({ onNavigate }) => {
  const actions = useGameActions();
  const plots = useGameSelector((state) => state.plots || []);
  const animals = useGameSelector((state) => state.livestock?.animals || []);
  const dailyChallenges = useGameSelector((state) => state.dailyChallenges || []);
  const dailyQuests = useGameSelector((state) => state.dailyQuests || null);
  const inventory = useGameSelector((state) => state.inventory || {});
  const coins = useGameSelector((state) => Number(state.coins) || 0);
  const level = useGameSelector((state) => Number(state.level) || 1);
  const weather = useGameSelector((state) => state.weather || 'sunny');
  const seasonName = useGameSelector((state) => state.season?.config?.name || 'Spring');
  const seasonConfig = useGameSelector((state) => state.season?.config || null);
  const farmTheme = useGameSelector((state) => state.farmTheme || 'meadow');
  const activeTitleId = useGameSelector(
    (state) => state.cozyExpansion?.farmTitles?.activeId || 'home_grower'
  );

  const plotCounts = useMemo(() => countPlots(plots), [plots]);
  const animalNeeds = useMemo(() => countAnimalNeeds(animals), [animals]);
  const claimableRewards = useMemo(
    () => countClaimableRewards({ dailyChallenges, dailyQuests }),
    [dailyChallenges, dailyQuests]
  );
  const dailyFocus = useMemo(() => getDailyCropFocus({ level }), [level]);
  const recommendedCrop = useMemo(
    () => getRecommendedCrop({ level, coins, inventory, dailyFocus }),
    [coins, dailyFocus, inventory, level]
  );
  const seasonImplication = useMemo(
    () => getSeasonImplication(seasonConfig, weather),
    [seasonConfig, weather]
  );
  const nextUnlock = useMemo(() => getNextUnlock(level), [level]);
  const farmTitle = FARM_TITLES[activeTitleId]?.name || 'Home Grower';

  const primaryAction = useMemo(() => {
    if (plotCounts.diseased > 0) {
      return {
        label: 'Treat Crops',
        detail: `${plotCounts.diseased} infected`,
        icon: ShieldAlert,
        run: () => actions.treatAllDiseases?.(),
      };
    }
    if (plotCounts.ready > 0) {
      return {
        label: 'Harvest Ready',
        detail: `${plotCounts.ready} ready`,
        icon: Scissors,
        run: () => actions.harvestAllReadyCrops?.(),
      };
    }
    if (animalNeeds.products > 0 || animalNeeds.care > 0) {
      return {
        label: 'Check Animals',
        detail:
          animalNeeds.products > 0
            ? `${animalNeeds.products} product${animalNeeds.products === 1 ? '' : 's'}`
            : `${animalNeeds.care} need care`,
        icon: BadgeCheck,
        run: () => onNavigate?.('livestock'),
      };
    }
    if (claimableRewards > 0) {
      return {
        label: 'Claim Rewards',
        detail: `${claimableRewards} waiting`,
        icon: CalendarCheck,
        run: () => onNavigate?.('quests'),
      };
    }
    if (plotCounts.thirsty > 0) {
      return {
        label: 'Water Dry Plots',
        detail: `${plotCounts.thirsty} dry`,
        icon: Droplets,
        run: () => actions.waterAllPlots?.(),
      };
    }
    if (plotCounts.empty > 0 && recommendedCrop) {
      return {
        label: `Pick ${recommendedCrop.name}`,
        detail: `${plotCounts.empty} open`,
        icon: Sprout,
        run: () => {
          actions.setSelectedCrop?.(recommendedCrop.id);
          actions.addNotification?.({
            type: 'info',
            message: `${recommendedCrop.name} selected. Tap empty plots to plant.`,
          });
        },
      };
    }
    return {
      label: 'Open Town Board',
      detail: 'Plan ahead',
      icon: CalendarCheck,
      run: () => onNavigate?.('events'),
    };
  }, [
    actions,
    animalNeeds.care,
    animalNeeds.products,
    claimableRewards,
    onNavigate,
    plotCounts.diseased,
    plotCounts.empty,
    plotCounts.ready,
    plotCounts.thirsty,
    recommendedCrop,
  ]);

  const PrimaryIcon = primaryAction.icon || Leaf;

  return (
    <Card className="mb-2 overflow-hidden border-emerald-200/80 bg-white/88 p-3 shadow-lg backdrop-blur sm:mb-3 sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
              Today
            </span>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
              {seasonName}
            </Badge>
            <Badge variant="outline" className="bg-sky-50 text-sky-700">
              <CloudSun className="mr-1 h-3 w-3" aria-hidden="true" />
              {formatDisplayLabel(weather)}
            </Badge>
          </div>
          <h2 className="mt-1 text-base font-bold leading-tight text-slate-950 sm:text-lg">
            {primaryAction.label}
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">{seasonImplication}</p>
        </div>

        <Button
          type="button"
          onClick={primaryAction.run}
          className="min-h-[44px] shrink-0 justify-center gap-2 bg-emerald-700 px-4 text-white hover:bg-emerald-800"
        >
          <PrimaryIcon className="h-4 w-4" aria-hidden="true" />
          <span>{primaryAction.label}</span>
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 xl:grid-cols-7">
        <RhythmMetric label="Ready" value={plotCounts.ready} tone="emerald" />
        <RhythmMetric label="Dry" value={plotCounts.thirsty} tone="sky" />
        <RhythmMetric label="Disease" value={plotCounts.diseased} tone="rose" />
        <RhythmMetric label="Withered" value={plotCounts.withered} tone="amber" />
        <RhythmMetric
          label="Animals"
          value={animalNeeds.care + animalNeeds.products}
          tone="violet"
        />
        <RhythmMetric label="Rewards" value={claimableRewards} tone="lime" />
        <RhythmMetric label="Open Plots" value={plotCounts.empty} tone="slate" />
      </div>

      <WeatherDecisionPanel />

      <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600 sm:grid-cols-3">
        <div>
          <span className="font-semibold text-slate-900">Farm title:</span> {farmTitle}
        </div>
        <div>
          <span className="font-semibold text-slate-900">Specialization:</span>{' '}
          {formatDisplayLabel(farmTheme)}
        </div>
        <div>
          <span className="font-semibold text-slate-900">Next unlock:</span> {nextUnlock}
        </div>
      </div>
    </Card>
  );
});

const TONE_CLASSES = {
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-100',
  sky: 'bg-sky-50 text-sky-800 border-sky-100',
  rose: 'bg-rose-50 text-rose-800 border-rose-100',
  amber: 'bg-amber-50 text-amber-800 border-amber-100',
  violet: 'bg-violet-50 text-violet-800 border-violet-100',
  lime: 'bg-lime-50 text-lime-800 border-lime-100',
  slate: 'bg-slate-50 text-slate-800 border-slate-100',
};

function RhythmMetric({ label, value, tone }) {
  return (
    <div className={`rounded-lg border px-2 py-2 ${TONE_CLASSES[tone] || TONE_CLASSES.slate}`}>
      <div className="text-base font-bold leading-none tabular-nums">{value}</div>
      <div className="mt-1 truncate font-semibold">{label}</div>
    </div>
  );
}

FarmRhythmPanel.displayName = 'FarmRhythmPanel';

export { countPlots, countAnimalNeeds, countClaimableRewards };
export default FarmRhythmPanel;
