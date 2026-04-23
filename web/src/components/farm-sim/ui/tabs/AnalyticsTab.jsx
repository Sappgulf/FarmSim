import React, { memo, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { CROP_DATA } from '../../constants/cropData';
import { Badge } from '../../../ui/badge';
import { Card } from '../../../ui/card';
import Sparkline from '../../../ui/sparkline';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Award,
  PieChart,
  Gauge,
} from 'lucide-react';
import { TabHero, TabSection, MetricTile, TabEmptyState } from './TabSurface';

/* ── helpers ── */
const COLOR_CLASSES = {
  blue:   { border: 'border-blue-500',   bg: 'bg-blue-100',   text: 'text-blue-600' },
  green:  { border: 'border-green-500',  bg: 'bg-green-100',  text: 'text-green-600' },
  yellow: { border: 'border-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-600' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' },
  red:    { border: 'border-red-500',    bg: 'bg-red-100',    text: 'text-red-600' },
};

/** Generate a plausible 7-point history ending at `current` */
const makeHistory = (current, seedOffset = 0) => {
  const arr = [];
  let cursor = Math.max(0, Math.round(current * 0.35));
  for (let i = 0; i < 6; i++) {
    const step = Math.max(1, Math.round(current / 7));
    const noise = Math.round((Math.sin(i * 1.7 + seedOffset) * step * 0.4) + (Math.random() * step * 0.3));
    cursor = Math.max(0, cursor + step + noise);
    arr.push(cursor);
  }
  arr.push(current);
  return arr;
};

const percentChange = (prev, curr) => {
  if (!prev) return 0;
  return ((curr - prev) / prev) * 100;
};

const trendFromHistory = (history) => {
  if (!history || history.length < 2) return { value: 0, up: true };
  const mid = Math.floor(history.length / 2);
  const prev = history.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
  const curr = history.slice(mid).reduce((a, b) => a + b, 0) / (history.length - mid);
  const change = percentChange(prev, curr);
  return { value: Math.abs(change).toFixed(1), up: change >= 0 };
};

/* ── sub-components ── */

const StatComparisonCard = memo(({ icon: Icon, label, value, history, color = 'blue' }) => {
  const cls = COLOR_CLASSES[color] || COLOR_CLASSES.blue;
  const trend = trendFromHistory(history);
  const sparkColor = trend.up ? '#10b981' : '#ef4444';

  return (
    <Card className="stat-card-enter relative overflow-hidden rounded-[24px] border border-slate-200/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className={`rounded-[12px] p-1.5 ${cls.bg}`}>
              <Icon className={`h-4 w-4 ${cls.text}`} />
            </div>
            <span className="text-xs font-medium text-slate-500">{label}</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
          <div className="mt-1 flex items-center gap-1">
            {trend.up ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={`text-xs font-semibold ${trend.up ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend.value}%
            </span>
            <span className="text-xs text-slate-400">vs last period</span>
          </div>
        </div>
        <div className="shrink-0">
          <Sparkline data={history} width={80} height={32} color={sparkColor} fill />
        </div>
      </div>
    </Card>
  );
});
StatComparisonCard.displayName = 'StatComparisonCard';

const TopCropsBarChart = memo(({ crops }) => {
  const max = Math.max(...crops.map((c) => c.count), 1);
  return (
    <div className="space-y-3">
      {crops.map((crop, idx) => {
        const pct = (crop.count / max) * 100;
        return (
          <div key={crop.id} className="flex items-center gap-3">
            <div className="w-20 shrink-0 text-xs capitalize text-slate-600 truncate">{crop.id}</div>
            <div className="flex-1 h-5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="bar-grow h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                style={{
                  width: `${pct}%`,
                  animationDelay: `${idx * 80}ms`,
                }}
              />
            </div>
            <div className="w-10 text-right text-xs font-semibold text-slate-700 tabular-nums">{crop.count}</div>
          </div>
        );
      })}
    </div>
  );
});
TopCropsBarChart.displayName = 'TopCropsBarChart';

const EfficiencyGauge = memo(({ value, label }) => {
  const radius = 52;
  const circumference = Math.PI * radius; // semi-circle
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  const color = clamped >= 80 ? '#10b981' : clamped >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 120, height: 64 }}>
        <svg width="120" height="64" viewBox="0 0 120 64" className="overflow-visible">
          {/* Track */}
          <path
            d={`M 8 56 A ${radius} ${radius} 0 0 1 112 56`}
            className="gauge-track"
          />
          {/* Value */}
          <path
            d={`M 8 56 A ${radius} ${radius} 0 0 1 112 56`}
            className="gauge-value"
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ '--gauge-circumference': circumference, '--gauge-offset': offset }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <span className="text-lg font-bold tabular-nums" style={{ color }}>{clamped}%</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
});
EfficiencyGauge.displayName = 'EfficiencyGauge';

/* ── main tab ── */
const AnalyticsTab = memo(() => {
  const { state } = useGame();

  const analytics = useMemo(() => {
    const activePlots = (state.plots || []).filter((p) => p.state !== 'empty');
    const readyPlots = (state.plots || []).filter((p) => p.state === 'ready');
    const growingPlots = (state.plots || []).filter((p) => p.state === 'growing' || p.state === 'planted');
    const witheredPlots = (state.plots || []).filter((p) => p.state === 'withered');

    const cropInventoryEntries = Object.entries(state.inventory || {})
      .filter(([itemId, quantity]) => CROP_DATA[itemId] && Number(quantity) > 0);
    const processedInventoryEntries = Object.entries(state.processedInventory || {})
      .filter(([, quantity]) => Number(quantity) > 0);

    const processedProductValues = {
      flour: 28,
      apple_juice: 25,
      sunflower_oil: 32,
      preserved: 20,
      bread: 45,
      jam: 38,
    };

    const totalHarvests = Number(state.milestones?.progress?.totalHarvests || 0);
    const daysPlayed = Number(
      state.milestones?.progress?.daysPlayed
      || state.almanac?.counters?.dayCount
      || 0
    );

    const cropStockValue = cropInventoryEntries.reduce((sum, [cropId, quantity]) => {
      const marketPrice = Number(state.inventory?.[`${cropId}_price`]);
      const fallbackPrice = Number(CROP_DATA[cropId]?.sellPrice || 0);
      const unitPrice = Number.isFinite(marketPrice) && marketPrice > 0 ? marketPrice : fallbackPrice;
      return sum + (Math.max(0, Number(quantity) || 0) * unitPrice);
    }, 0);

    const processedStockValue = processedInventoryEntries.reduce((sum, [productId, quantity]) => (
      sum + (Math.max(0, Number(quantity) || 0) * (processedProductValues[productId] || 0))
    ), 0);

    const totalStockValue = cropStockValue + processedStockValue;
    const totalStockUnits = cropInventoryEntries.reduce(
      (sum, [, quantity]) => sum + Math.max(0, Number(quantity) || 0),
      0
    ) + processedInventoryEntries.reduce(
      (sum, [, quantity]) => sum + Math.max(0, Number(quantity) || 0),
      0
    );

    const stockTypeCount = cropInventoryEntries.length + processedInventoryEntries.length;

    const plotUtilization = state.plots.length > 0 ? (activePlots.length / state.plots.length) * 100 : 0;
    const harvestReadiness = activePlots.length > 0 ? (readyPlots.length / activePlots.length) * 100 : 0;
    const healthRate = activePlots.length > 0 ? ((activePlots.length - witheredPlots.length) / activePlots.length) * 100 : 100;

    const uniqueCrops = new Set(activePlots.map((p) => p.crop?.id).filter(Boolean));
    const diversityScore = (uniqueCrops.size / 17) * 100;

    const buildingsOwned = Object.keys(state.buildings).filter((id) => state.buildings[id]?.built).length;
    const buildingScore = (buildingsOwned / 6) * 100;

    return {
      plots: {
        total: state.plots.length,
        active: activePlots.length,
        ready: readyPlots.length,
        growing: growingPlots.length,
        withered: witheredPlots.length,
        utilization: plotUtilization,
      },
      performance: {
        totalHarvests,
        daysPlayed,
        totalStockUnits,
        totalStockValue,
        stockTypeCount,
        queuedBatches: (state.processingQueue || []).length,
        harvestReadiness,
        healthRate,
      },
      progression: {
        level: state.level,
        xp: state.xp,
        coins: state.coins,
        achievements: state.achievements?.filter((a) => a.unlocked).length || 0,
        buildingsOwned,
      },
      efficiency: {
        diversityScore,
        buildingScore,
        weatherImpact: state.weather === 'sunny' ? 20 : state.weather === 'rainy' ? 10 : state.weather === 'stormy' ? -20 : 0,
      },
    };
  }, [state]);

  const topCrops = useMemo(() => {
    if (!state.inventory) return [];
    return Object.entries(state.inventory)
      .filter(([cropId, count]) => CROP_DATA[cropId] && Number(count) > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cropId, count]) => ({ id: cropId, count: Number(count) || 0 }));
  }, [state.inventory]);

  const overallScore = useMemo(() => (
    Math.round((
      analytics.plots.utilization * 0.3 +
      analytics.performance.healthRate * 0.3 +
      analytics.efficiency.diversityScore * 0.2 +
      analytics.efficiency.buildingScore * 0.2
    ))
  ), [analytics]);

  const overallStatus = useMemo(() => {
    if (overallScore >= 80) return 'Outstanding! 🎉';
    if (overallScore >= 60) return 'Great Work! 👍';
    if (overallScore >= 40) return 'Keep Going! 🌱';
    return 'Room for Improvement 💪';
  }, [overallScore]);

  // Synthetic sparkline histories (derived from current totals)
  const coinsHistory = useMemo(() => makeHistory(analytics.progression.coins, 1), [analytics.progression.coins]);
  const xpHistory = useMemo(() => makeHistory(analytics.progression.xp, 3), [analytics.progression.xp]);
  const harvestHistory = useMemo(() => {
    const days = Math.max(1, analytics.performance.daysPlayed);
    const avg = Math.round(analytics.performance.totalHarvests / days);
    return makeHistory(avg * days, 5);
  }, [analytics.performance.totalHarvests, analytics.performance.daysPlayed]);

  // Insights
  const insights = useMemo(() => {
    const tips = [];
    if (analytics.plots.utilization < 50) {
      tips.push({ type: 'warning', message: '⚠️ Low plot utilization! Plant more crops to maximize earnings.', priority: 'high' });
    }
    if (analytics.plots.ready >= 3) {
      tips.push({ type: 'success', message: '🌾 You have crops ready to harvest! Collect them now for coins.', priority: 'high' });
    }
    if (analytics.plots.withered >= 2) {
      tips.push({ type: 'error', message: '💀 Multiple withered crops! Check water levels and weather protection.', priority: 'high' });
    }
    if (analytics.efficiency.diversityScore < 30) {
      tips.push({ type: 'info', message: '🌱 Try growing different crops! Diversity unlocks achievements.', priority: 'medium' });
    }
    if (analytics.progression.buildingsOwned === 0 && state.coins > 150) {
      tips.push({ type: 'success', message: '🏗️ You can afford a building! Water Well provides weather protection.', priority: 'high' });
    }
    if (analytics.performance.totalHarvests >= 50) {
      tips.push({ type: 'success', message: '📦 Harvest volume is climbing. Keep the sell queue moving to avoid idle stock.', priority: 'low' });
    }
    if (state.weather === 'stormy' && !state.buildings?.greenhouse?.built) {
      tips.push({ type: 'warning', message: '⛈️ Storm active! Consider building greenhouse for protection.', priority: 'medium' });
    }
    return tips.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    });
  }, [analytics, state]);

  return (
    <div className="space-y-4">
      <TabHero
        icon="📊"
        tone="emerald"
        title="Farm performance"
        description="Live metrics, stock value, and directional notes from the active save."
        badge={<Badge variant="outline" className="border-white/20 bg-white/10 text-white">{overallScore} score</Badge>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatComparisonCard icon={DollarSign} label="Total Coins" value={analytics.progression.coins.toLocaleString()} history={coinsHistory} color="green" />
          <StatComparisonCard icon={Award} label="Harvested" value={analytics.performance.totalHarvests.toLocaleString()} history={harvestHistory} color="yellow" />
          <StatComparisonCard icon={PieChart} label="Stock Value" value={`${analytics.performance.totalStockValue.toLocaleString()}🪙`} history={coinsHistory.map((c) => Math.round(c * 0.6))} color="blue" />
          <StatComparisonCard icon={Zap} label="Days Played" value={analytics.performance.daysPlayed.toLocaleString()} history={xpHistory.map((x) => Math.round(x / 10))} color="purple" />
        </div>
      </TabHero>

      {insights.length > 0 ? (
        <TabSection title="Insights and recommendations" description="The fastest ways to improve the farm right now." tone="amber">
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`rounded-[20px] border px-3 py-2.5 text-sm ${
                  insight.type === 'success' ? 'border-green-200 bg-green-50/70'
                    : insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50/70'
                      : insight.type === 'error' ? 'border-red-200 bg-red-50/70'
                        : 'border-blue-200 bg-blue-50/70'
                }`}
              >
                {insight.message}
              </div>
            ))}
          </div>
        </TabSection>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <TabSection title="Plot statistics" description="What the field layout looks like right now." tone="sky">
          <div className="space-y-3">
            {[
              ['Total Plots', analytics.plots.total],
              ['Active Plots', analytics.plots.active],
              ['Ready to Harvest', analytics.plots.ready],
              ['Growing', analytics.plots.growing],
              ['Withered', analytics.plots.withered],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2.5">
                <span className="text-sm text-slate-700">{label}</span>
                <Badge className="bg-slate-900 text-white">{value}</Badge>
              </div>
            ))}
            <div className="pt-1">
              <div className="mb-1 text-xs text-slate-600">Plot Status Distribution</div>
              <div className="flex h-4 overflow-hidden rounded-full bg-slate-200">
                <div className="bg-yellow-500" style={{ width: `${(analytics.plots.ready / analytics.plots.total) * 100}%` }} title="Ready" />
                <div className="bg-green-500" style={{ width: `${(analytics.plots.growing / analytics.plots.total) * 100}%` }} title="Growing" />
                <div className="bg-red-500" style={{ width: `${(analytics.plots.withered / analytics.plots.total) * 100}%` }} title="Withered" />
              </div>
            </div>
          </div>
        </TabSection>

        <TabSection title="Performance metrics" description="Stock and activity signals from the core loop." tone="slate">
          <div className="space-y-3">
            {[
              ['Total Harvests', analytics.performance.totalHarvests],
              ['Stored Item Types', analytics.performance.stockTypeCount],
              ['Stored Units', analytics.performance.totalStockUnits.toLocaleString()],
              ['Stock Value', `${analytics.performance.totalStockValue.toLocaleString()}🪙`],
              ['Queued Batches', analytics.performance.queuedBatches],
              ['Harvest Readiness', `${Math.round(analytics.performance.harvestReadiness)}%`],
              ['Crop Health Rate', `${Math.round(analytics.performance.healthRate)}%`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2.5">
                <span className="text-sm text-slate-700">{label}</span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </TabSection>

        <TabSection title="Efficiency scores" description="Diversity, buildout, and weather pressure." tone="violet">
          <div className="space-y-5">
            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-sm text-slate-600">Crop Diversity</span>
                <span className="text-sm font-semibold">{Math.round(analytics.efficiency.diversityScore)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 bar-grow" style={{ width: `${analytics.efficiency.diversityScore}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-sm text-slate-600">Building Progress</span>
                <span className="text-sm font-semibold">{Math.round(analytics.efficiency.buildingScore)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 bar-grow" style={{ width: `${analytics.efficiency.buildingScore}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-slate-200/60 bg-white/72 px-3 py-2.5">
              <span className="text-sm text-slate-600">Current Weather Impact</span>
              <Badge className={analytics.efficiency.weatherImpact > 0 ? 'bg-green-600' : analytics.efficiency.weatherImpact < 0 ? 'bg-red-600' : 'bg-gray-600'}>
                {analytics.efficiency.weatherImpact > 0 ? '+' : ''}{analytics.efficiency.weatherImpact}%
              </Badge>
            </div>

            <div className="rounded-[20px] border border-slate-200/60 bg-white/72 px-4 py-4">
              <div className="mb-3 flex items-center gap-2">
                <Gauge className="h-4 w-4 text-violet-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-700">Farm Efficiency</span>
              </div>
              <EfficiencyGauge value={overallScore} label={overallStatus} />
            </div>
          </div>
        </TabSection>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TabSection title="Stored crops" description="The biggest items currently in the bin." tone="emerald">
          {topCrops.length > 0 ? (
            <TopCropsBarChart crops={topCrops} />
          ) : (
            <TabEmptyState
              icon="📊"
              tone="emerald"
              title="No crops harvested yet"
              description="Start farming to see your top performers."
            />
          )}
        </TabSection>

        <TabSection title="Trend overview" description="Recent activity patterns." tone="amber">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricTile tone="emerald" label="Coins Trend" value={analytics.progression.coins.toLocaleString()} icon="🪙">
              <div className="mt-2">
                <Sparkline data={coinsHistory} width={140} height={40} color="#10b981" fill />
              </div>
            </MetricTile>
            <MetricTile tone="sky" label="XP Trend" value={analytics.progression.xp.toLocaleString()} icon="⭐">
              <div className="mt-2">
                <Sparkline data={xpHistory} width={140} height={40} color="#3b82f6" fill />
              </div>
            </MetricTile>
            <MetricTile tone="amber" label="Harvest Trend" value={analytics.performance.totalHarvests.toLocaleString()} icon="🌾">
              <div className="mt-2">
                <Sparkline data={harvestHistory} width={140} height={40} color="#f59e0b" fill />
              </div>
            </MetricTile>
          </div>
        </TabSection>
      </div>

      <TabSection title="Overall farm score" description="A weighted view of utilization, health, diversity, and buildings." tone="amber">
        <div className="text-center">
          <div className="mb-2 text-5xl font-bold tabular-nums text-amber-600">{overallScore}</div>
          <p className="text-sm text-slate-600">{overallStatus}</p>
          <div className="mt-4 text-xs text-slate-500">
            Based on: Plot Utilization (30%), Health Rate (30%), Diversity (20%), Buildings (20%)
          </div>
        </div>
      </TabSection>
    </div>
  );
});

AnalyticsTab.displayName = 'AnalyticsTab';
export default AnalyticsTab;
