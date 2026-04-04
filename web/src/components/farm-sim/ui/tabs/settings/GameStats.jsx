import React, { memo } from 'react';
import { useGameSelector } from '../../../context/GameContext';
import { Badge } from '../../../../ui/badge';
import { APP_VERSION, getReleaseModeLabel } from '../../../../../config/release';
import { TabSection } from '../TabSurface';

const TONE_CLASSES = {
  green: 'text-green-600',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  blue: 'text-blue-600',
  violet: 'text-violet-600',
  orange: 'text-orange-600',
  cyan: 'text-cyan-600',
  pink: 'text-pink-600',
  slate: 'text-slate-600',
};

const StatTile = ({ value, label, tone = 'emerald' }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-white/78 p-3 shadow-sm">
    <div className={`text-lg font-bold tabular-nums ${TONE_CLASSES[tone] || TONE_CLASSES.emerald}`}>
      {value}
    </div>
    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
      {label}
    </div>
  </div>
);

export const GameStats = memo(() => {
  const level = useGameSelector((state) => state.level || 1);
  const coins = useGameSelector((state) => state.coins || 0);
  const xp = useGameSelector((state) => state.xp || 0);
  const gridSize = useGameSelector((state) => state.gridSize || 3);
  const animalCount = useGameSelector((state) => state.livestock?.animals?.length || 0);
  const fishCaught = useGameSelector((state) => state.fishing?.stats?.totalCaught || 0);
  const season = useGameSelector((state) => state.season?.current || 'spring');
  const weather = useGameSelector((state) => state.weather || 'sunny');

  const stats = [
    { value: level, label: 'Farm level', tone: 'green' },
    { value: `${coins}🪙`, label: 'Coins', tone: 'amber' },
    { value: `${xp} XP`, label: 'Experience', tone: 'blue' },
    { value: `${gridSize}×${gridSize}`, label: 'Farm size', tone: 'violet' },
    { value: animalCount, label: 'Animals', tone: 'orange' },
    { value: fishCaught, label: 'Fish caught', tone: 'cyan' },
    { value: season, label: 'Season', tone: 'pink' },
    { value: weather, label: 'Weather', tone: 'slate' },
    { value: APP_VERSION, label: 'App version', tone: 'emerald' },
    { value: getReleaseModeLabel(), label: 'Release mode', tone: 'slate' },
  ];

  return (
    <TabSection
      title="Game statistics"
      description="Current progress at a glance."
      tone="slate"
      action={<Badge variant="outline" className="bg-white/80 text-slate-600">Live</Badge>}
    >

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <StatTile key={`${stat.label}-${String(stat.value)}`} {...stat} />
        ))}
      </div>
    </TabSection>
  );
});

GameStats.displayName = 'GameStats';
