import React, { memo, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { CROP_DATA } from '../../constants/cropData';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Award,
  BarChart3,
  PieChart,
} from 'lucide-react';

/**
 * Farm Analytics Dashboard
 * Provides detailed statistics, insights, and performance metrics
 */
const COLOR_CLASSES = {
  blue: { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600' },
  yellow: { border: 'border-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-600' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' },
  red: { border: 'border-red-500', bg: 'bg-red-100', text: 'text-red-600' },
};
const clampPercent = (value) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
const plotSharePercent = (count, total) => clampPercent(total > 0 ? (count / total) * 100 : 0);

const StatCard = memo(({ icon: Icon, label, value, change, trend, color = 'blue' }) => {
  const cls = COLOR_CLASSES[color] || COLOR_CLASSES.blue;
  return (
    <Card className={`p-4 border-l-4 ${cls.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${cls.bg} rounded-lg`}>
            <Icon className={`w-5 h-5 ${cls.text}`} />
          </div>
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {change}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

const AnalyticsTab = memo(() => {
  const { state } = useGame();

  // Calculate comprehensive stats
  const analytics = useMemo(() => {
    const plots = Array.isArray(state.plots) ? state.plots : [];
    const buildings = state.buildings || {};
    const activePlots = plots.filter((p) => p.state !== 'empty');
    const readyPlots = plots.filter((p) => p.state === 'ready');
    const growingPlots = plots.filter((p) => p.state === 'growing' || p.state === 'planted');
    const witheredPlots = plots.filter((p) => p.state === 'withered');

    const cropInventoryEntries = Object.entries(state.inventory || {}).filter(
      ([itemId, quantity]) => CROP_DATA[itemId] && Number(quantity) > 0
    );
    const processedInventoryEntries = Object.entries(state.processedInventory || {}).filter(
      ([, quantity]) => Number(quantity) > 0
    );

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
      state.milestones?.progress?.daysPlayed || state.almanac?.counters?.dayCount || 0
    );
    const cropStockValue = cropInventoryEntries.reduce((sum, [cropId, quantity]) => {
      const marketPrice = Number(state.inventory?.[`${cropId}_price`]);
      const fallbackPrice = Number(CROP_DATA[cropId]?.sellPrice || 0);
      const unitPrice =
        Number.isFinite(marketPrice) && marketPrice > 0 ? marketPrice : fallbackPrice;
      return sum + Math.max(0, Number(quantity) || 0) * unitPrice;
    }, 0);
    const processedStockValue = processedInventoryEntries.reduce(
      (sum, [productId, quantity]) =>
        sum + Math.max(0, Number(quantity) || 0) * (processedProductValues[productId] || 0),
      0
    );
    const totalStockValue = cropStockValue + processedStockValue;
    const totalStockUnits =
      cropInventoryEntries.reduce(
        (sum, [, quantity]) => sum + Math.max(0, Number(quantity) || 0),
        0
      ) +
      processedInventoryEntries.reduce(
        (sum, [, quantity]) => sum + Math.max(0, Number(quantity) || 0),
        0
      );
    const stockTypeCount = cropInventoryEntries.length + processedInventoryEntries.length;

    // Calculate efficiency metrics
    const plotUtilization = plots.length > 0 ? (activePlots.length / plots.length) * 100 : 0;
    const harvestReadiness =
      activePlots.length > 0 ? (readyPlots.length / activePlots.length) * 100 : 0;
    const healthRate =
      activePlots.length > 0
        ? ((activePlots.length - witheredPlots.length) / activePlots.length) * 100
        : 100;

    // Crop diversity
    const uniqueCrops = new Set(activePlots.map((p) => p.crop?.id).filter(Boolean));
    const cropCatalogCount = Math.max(1, Object.keys(CROP_DATA).length);
    const diversityScore = clampPercent((uniqueCrops.size / cropCatalogCount) * 100);

    // Building efficiency
    const buildingsOwned = Object.keys(buildings).filter((id) => buildings[id]?.built).length;
    const buildingScore = clampPercent((buildingsOwned / Math.max(6, buildingsOwned || 1)) * 100);

    return {
      plots: {
        total: plots.length,
        active: activePlots.length,
        ready: readyPlots.length,
        growing: growingPlots.length,
        withered: witheredPlots.length,
        utilization: clampPercent(plotUtilization),
      },
      performance: {
        totalHarvests,
        daysPlayed,
        totalStockUnits,
        totalStockValue,
        stockTypeCount,
        queuedBatches: (state.processingQueue || []).length,
        harvestReadiness: clampPercent(harvestReadiness),
        healthRate: clampPercent(healthRate),
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
        weatherImpact:
          state.weather === 'sunny'
            ? 20
            : state.weather === 'rainy'
              ? 10
              : state.weather === 'stormy'
                ? -20
                : 0,
      },
    };
  }, [state]);

  // Get top performing crops
  const topCrops = useMemo(() => {
    if (!state.inventory) return [];
    return Object.entries(state.inventory)
      .filter(([cropId, count]) => CROP_DATA[cropId] && Number(count) > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cropId, count]) => ({ id: cropId, count: Number(count) || 0 }));
  }, [state.inventory]);

  const overallScore = useMemo(
    () =>
      Math.round(
        analytics.plots.utilization * 0.3 +
          analytics.performance.healthRate * 0.3 +
          analytics.efficiency.diversityScore * 0.2 +
          analytics.efficiency.buildingScore * 0.2
      ),
    [analytics]
  );

  const overallStatus = useMemo(() => {
    if (overallScore >= 80) return 'Outstanding! 🎉';
    if (overallScore >= 60) return 'Great Work! 👍';
    if (overallScore >= 40) return 'Keep Going! 🌱';
    return 'Room for Improvement 💪';
  }, [overallScore]);

  // Insights and recommendations
  const insights = useMemo(() => {
    const tips = [];

    if (analytics.plots.utilization < 50) {
      tips.push({
        type: 'warning',
        message: '⚠️ Low plot utilization! Plant more crops to maximize earnings.',
        priority: 'high',
      });
    }

    if (analytics.plots.ready >= 3) {
      tips.push({
        type: 'success',
        message: '🌾 You have crops ready to harvest! Collect them now for coins.',
        priority: 'high',
      });
    }

    if (analytics.plots.withered >= 2) {
      tips.push({
        type: 'error',
        message: '💀 Multiple withered crops! Check water levels and weather protection.',
        priority: 'high',
      });
    }

    if (analytics.efficiency.diversityScore < 30) {
      tips.push({
        type: 'info',
        message: '🌱 Try growing different crops! Diversity unlocks achievements.',
        priority: 'medium',
      });
    }

    if (analytics.progression.buildingsOwned === 0 && state.coins > 150) {
      tips.push({
        type: 'success',
        message: '🏗️ You can afford a building! Water Well provides weather protection.',
        priority: 'high',
      });
    }

    if (analytics.performance.totalHarvests >= 50) {
      tips.push({
        type: 'success',
        message: '📦 Harvest volume is climbing. Keep the sell queue moving to avoid idle stock.',
        priority: 'low',
      });
    }

    if (state.weather === 'stormy' && !state.buildings?.greenhouse?.built) {
      tips.push({
        type: 'warning',
        message: '⛈️ Storm active! Consider building greenhouse for protection.',
        priority: 'medium',
      });
    }

    return tips.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    });
  }, [analytics, state]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-slate-900/10 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-5 text-white shadow-2xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-white">
                Farm performance dashboard
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                Real-time metrics, stock value, and recommendations drawn directly from the live
                farm state.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[280px] lg:grid-cols-1">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                Live snapshot
              </div>
              <div className="mt-1 flex items-end justify-between gap-3">
                <div>
                  <div className="text-3xl font-bold tabular-nums text-white">{overallScore}</div>
                  <div className="text-sm text-white/70">{overallStatus}</div>
                </div>
                <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                  Current
                </Badge>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                Snapshot note
              </div>
              <p className="mt-1 text-sm leading-relaxed text-white/75">
                Plot usage, stock health, diversity, and buildings are weighted into the overall
                score.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Coins"
          value={analytics.progression.coins.toLocaleString()}
          color="green"
        />
        <StatCard
          icon={Award}
          label="Harvested"
          value={analytics.performance.totalHarvests.toLocaleString()}
          color="yellow"
        />
        <StatCard
          icon={PieChart}
          label="Stock Value"
          value={`${analytics.performance.totalStockValue.toLocaleString()}🪙`}
          color="blue"
        />
        <StatCard
          icon={Zap}
          label="Days Played"
          value={analytics.performance.daysPlayed.toLocaleString()}
          color="purple"
        />
      </div>

      {/* Insights & Recommendations */}
      {insights.length > 0 && (
        <Card className="overflow-hidden border-amber-200/70 bg-gradient-to-br from-white via-amber-50/30 to-rose-50/30 p-4">
          <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
            <Award className="h-4 w-4 text-amber-600" />
            Insights and recommendations
          </h4>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-3 shadow-sm ${
                  insight.type === 'success'
                    ? 'bg-green-50 border-green-500'
                    : insight.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-500'
                      : insight.type === 'error'
                        ? 'bg-red-50 border-red-500'
                        : 'bg-blue-50 border-blue-500'
                }`}
              >
                <p className="text-sm">{insight.message}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plot Statistics */}
        <Card className="overflow-hidden border-slate-200/70 bg-white/85 p-4">
          <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
            <PieChart className="w-4 h-4" />
            Plot statistics
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Plots</span>
              <Badge>{analytics.plots.total}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Plots</span>
              <Badge className="bg-green-600">{analytics.plots.active}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ready to Harvest</span>
              <Badge className="bg-yellow-600">{analytics.plots.ready}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Growing</span>
              <Badge className="bg-blue-600">{analytics.plots.growing}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Withered</span>
              <Badge className="bg-red-600">{analytics.plots.withered}</Badge>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-4">
              <div className="text-xs text-gray-600 mb-1">Plot Status Distribution</div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-yellow-500"
                  style={{
                    width: `${plotSharePercent(analytics.plots.ready, analytics.plots.total)}%`,
                  }}
                  title="Ready"
                />
                <div
                  className="bg-green-500"
                  style={{
                    width: `${plotSharePercent(analytics.plots.growing, analytics.plots.total)}%`,
                  }}
                  title="Growing"
                />
                <div
                  className="bg-red-500"
                  style={{
                    width: `${plotSharePercent(analytics.plots.withered, analytics.plots.total)}%`,
                  }}
                  title="Withered"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="overflow-hidden border-slate-200/70 bg-white/85 p-4">
          <h4 className="mb-3 font-semibold text-slate-900">Performance metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Harvests</span>
              <span className="font-semibold">{analytics.performance.totalHarvests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stored Item Types</span>
              <span className="font-semibold">{analytics.performance.stockTypeCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stored Units</span>
              <span className="font-semibold">
                {analytics.performance.totalStockUnits.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Stock Value</span>
              <span className="font-semibold">
                {analytics.performance.totalStockValue.toLocaleString()}🪙
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Queued Batches</span>
              <span className="font-semibold">{analytics.performance.queuedBatches}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Harvest Readiness</span>
              <span
                className={`font-semibold ${analytics.performance.harvestReadiness > 70 ? 'text-green-600' : 'text-yellow-600'}`}
              >
                {Math.round(analytics.performance.harvestReadiness)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Crop Health Rate</span>
              <span
                className={`font-semibold ${analytics.performance.healthRate > 90 ? 'text-green-600' : 'text-yellow-600'}`}
              >
                {Math.round(analytics.performance.healthRate)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Top Performing Crops */}
        <Card className="overflow-hidden border-slate-200/70 bg-white/85 p-4">
          <h4 className="mb-3 font-semibold text-slate-900">Stored crops</h4>
          {topCrops.length > 0 ? (
            <div className="space-y-2">
              {topCrops.map((crop, idx) => (
                <div
                  key={crop.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 p-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-600 text-white">{idx + 1}</Badge>
                    <span className="text-sm capitalize">{crop.id}</span>
                  </div>
                  <span className="font-semibold">{crop.count} in stock</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No crops harvested yet. Start farming to see your top performers!
            </p>
          )}
        </Card>

        {/* Efficiency Scores */}
        <Card className="overflow-hidden border-slate-200/70 bg-white/85 p-4">
          <h4 className="mb-3 font-semibold text-slate-900">Efficiency scores</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Crop Diversity</span>
                <span className="text-sm font-semibold">
                  {Math.round(analytics.efficiency.diversityScore)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${analytics.efficiency.diversityScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Building Progress</span>
                <span className="text-sm font-semibold">
                  {Math.round(analytics.efficiency.buildingScore)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${analytics.efficiency.buildingScore}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Weather Impact</span>
                <Badge
                  className={
                    analytics.efficiency.weatherImpact > 0
                      ? 'bg-green-600'
                      : analytics.efficiency.weatherImpact < 0
                        ? 'bg-red-600'
                        : 'bg-gray-600'
                  }
                >
                  {analytics.efficiency.weatherImpact > 0 ? '+' : ''}
                  {analytics.efficiency.weatherImpact}%
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Overall Farm Score */}
      <Card className="overflow-hidden border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6">
        <div className="text-center">
          <h4 className="mb-2 text-lg font-semibold text-slate-900">Overall farm score</h4>
          <div className="text-5xl font-bold text-amber-600 mb-2 tabular-nums">{overallScore}</div>
          <p className="text-sm text-gray-600">{overallStatus}</p>
          <div className="mt-4 text-xs text-gray-500">
            Based on: Plot Utilization (30%), Health Rate (30%), Diversity (20%), Buildings (20%)
          </div>
        </div>
      </Card>
    </div>
  );
});

AnalyticsTab.displayName = 'AnalyticsTab';
export default AnalyticsTab;
