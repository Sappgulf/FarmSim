import React, { memo, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { TrendingUp, TrendingDown, DollarSign, Zap, Target, Award, BarChart3, PieChart } from 'lucide-react';

/**
 * Farm Analytics Dashboard
 * Provides detailed statistics, insights, and performance metrics
 */
const AnalyticsTab = memo(() => {
  const { state } = useGame();
  const [timeRange, setTimeRange] = useState('session'); // session, today, week, allTime

  // Calculate comprehensive stats
  const analytics = useMemo(() => {
    const activePlots = (state.plots || []).filter(p => p.state !== 'empty');
    const readyPlots = (state.plots || []).filter(p => p.state === 'ready');
    const growingPlots = (state.plots || []).filter(p => p.state === 'growing' || p.state === 'planted');
    const witheredPlots = (state.plots || []).filter(p => p.state === 'withered');
    
    // Calculate total harvests and earnings
    const totalHarvests = state.inventory ? Object.values(state.inventory).reduce((sum, count) => sum + count, 0) : 0;
    const estimatedEarnings = totalHarvests * 15; // Rough estimate based on average crop value
    
    // Calculate efficiency metrics
    const plotUtilization = (activePlots.length / state.plots.length) * 100;
    const harvestReadiness = readyPlots.length > 0 ? (readyPlots.length / activePlots.length) * 100 : 0;
    const healthRate = activePlots.length > 0 ? ((activePlots.length - witheredPlots.length) / activePlots.length) * 100 : 100;
    
    // Calculate ROI
    const totalSpent = state.coins < 100 ? (100 - state.coins) : 0; // Coins spent from starting 100
    const roi = totalSpent > 0 ? ((state.coins - 100) / totalSpent) * 100 : 0;
    
    // Crop diversity
    const uniqueCrops = new Set(activePlots.map(p => p.crop?.id).filter(Boolean));
    const diversityScore = (uniqueCrops.size / 17) * 100; // Out of 17 total crops
    
    // Building efficiency
    const buildingsOwned = Object.keys(state.buildings).filter(id => state.buildings[id]?.built).length;
    const buildingScore = (buildingsOwned / 6) * 100; // Out of 6 total buildings
    
    // XP per hour estimate (rough)
    const sessionTime = (Date.now() - (state.gameLoop?.lastUpdate || Date.now())) / 1000 / 3600 || 0.1;
    const xpPerHour = sessionTime > 0 ? state.xp / sessionTime : 0;
    
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
        estimatedEarnings,
        roi,
        xpPerHour: Math.round(xpPerHour),
        harvestReadiness,
        healthRate,
      },
      progression: {
        level: state.level,
        xp: state.xp,
        coins: state.coins,
        achievements: state.achievements?.filter(a => a.unlocked).length || 0,
        buildingsOwned,
      },
      efficiency: {
        diversityScore,
        buildingScore,
        weatherImpact: state.weather === 'sunny' ? 20 : state.weather === 'rainy' ? 10 : state.weather === 'stormy' ? -20 : 0,
      }
    };
  }, [state]);

  // Get top performing crops
  const topCrops = useMemo(() => {
    if (!state.inventory) return [];
    return Object.entries(state.inventory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cropId, count]) => ({ id: cropId, count }));
  }, [state.inventory]);

  // Insights and recommendations
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
    
    if (analytics.performance.roi > 200) {
      tips.push({ type: 'success', message: '💰 Excellent ROI! You\'re managing your farm efficiently.', priority: 'low' });
    }
    
    if (state.weather === 'stormy' && !state.buildings?.greenhouse?.built) {
      tips.push({ type: 'warning', message: '⛈️ Storm active! Consider building greenhouse for protection.', priority: 'medium' });
    }
    
    return tips.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    });
  }, [analytics, state]);

  // Stat card component
  const StatCard = ({ icon: Icon, label, value, change, trend, color = 'blue' }) => (
    <Card className={`p-4 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-${color}-100 rounded-lg`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              📊 Farm Analytics Dashboard
            </h3>
            <p className="text-sm text-blue-600 mt-1">Real-time performance metrics and insights</p>
          </div>
          <div className="flex gap-2">
            {['session', 'today', 'week', 'allTime'].map((range) => (
              <Button
                key={range}
                size="sm"
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range === 'session' ? 'Session' : range === 'today' ? 'Today' : range === 'week' ? 'Week' : 'All Time'}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Coins"
          value={analytics.progression.coins.toLocaleString()}
          change="+24%"
          trend="up"
          color="green"
        />
        <StatCard
          icon={Zap}
          label="XP Per Hour"
          value={analytics.performance.xpPerHour}
          change="+12%"
          trend="up"
          color="yellow"
        />
        <StatCard
          icon={Target}
          label="Plot Utilization"
          value={`${Math.round(analytics.plots.utilization)}%`}
          change={analytics.plots.utilization > 70 ? '+5%' : '-3%'}
          trend={analytics.plots.utilization > 70 ? 'up' : 'down'}
          color="blue"
        />
        <StatCard
          icon={Award}
          label="Health Rate"
          value={`${Math.round(analytics.performance.healthRate)}%`}
          change={analytics.performance.healthRate > 90 ? '+2%' : '-8%'}
          trend={analytics.performance.healthRate > 90 ? 'up' : 'down'}
          color="purple"
        />
      </div>

      {/* Insights & Recommendations */}
      {insights.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            💡 Insights & Recommendations
          </h4>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${
                  insight.type === 'success' ? 'bg-green-50 border-green-500' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  insight.type === 'error' ? 'bg-red-50 border-red-500' :
                  'bg-blue-50 border-blue-500'
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
        <Card className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            🌱 Plot Statistics
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
                  style={{ width: `${(analytics.plots.ready / analytics.plots.total) * 100}%` }}
                  title="Ready"
                />
                <div 
                  className="bg-green-500" 
                  style={{ width: `${(analytics.plots.growing / analytics.plots.total) * 100}%` }}
                  title="Growing"
                />
                <div 
                  className="bg-red-500" 
                  style={{ width: `${(analytics.plots.withered / analytics.plots.total) * 100}%` }}
                  title="Withered"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">📈 Performance Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Harvests</span>
              <span className="font-semibold">{analytics.performance.totalHarvests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estimated Earnings</span>
              <span className="font-semibold">{analytics.performance.estimatedEarnings.toLocaleString()}🪙</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ROI</span>
              <span className="font-semibold text-green-600">
                {analytics.performance.roi > 0 ? '+' : ''}{Math.round(analytics.performance.roi)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Harvest Readiness</span>
              <span className="font-semibold">{Math.round(analytics.performance.harvestReadiness)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Crop Health Rate</span>
              <span className={`font-semibold ${analytics.performance.healthRate > 90 ? 'text-green-600' : 'text-yellow-600'}`}>
                {Math.round(analytics.performance.healthRate)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Top Performing Crops */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">🏆 Top Crops</h4>
          {topCrops.length > 0 ? (
            <div className="space-y-2">
              {topCrops.map((crop, idx) => (
                <div key={crop.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-600">{idx + 1}</Badge>
                    <span className="text-sm capitalize">{crop.id}</span>
                  </div>
                  <span className="font-semibold">{crop.count} harvested</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No crops harvested yet. Start farming to see your top performers!</p>
          )}
        </Card>

        {/* Efficiency Scores */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">⚡ Efficiency Scores</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Crop Diversity</span>
                <span className="text-sm font-semibold">{Math.round(analytics.efficiency.diversityScore)}%</span>
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
                <span className="text-sm font-semibold">{Math.round(analytics.efficiency.buildingScore)}%</span>
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
                <Badge className={
                  analytics.efficiency.weatherImpact > 0 ? 'bg-green-600' :
                  analytics.efficiency.weatherImpact < 0 ? 'bg-red-600' : 'bg-gray-600'
                }>
                  {analytics.efficiency.weatherImpact > 0 ? '+' : ''}{analytics.efficiency.weatherImpact}%
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Overall Farm Score */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="text-center">
          <h4 className="text-lg font-semibold mb-2">🌟 Overall Farm Score</h4>
          <div className="text-5xl font-bold text-amber-600 mb-2">
            {Math.round((
              analytics.plots.utilization * 0.3 +
              analytics.performance.healthRate * 0.3 +
              analytics.efficiency.diversityScore * 0.2 +
              analytics.efficiency.buildingScore * 0.2
            ))}
          </div>
          <p className="text-sm text-gray-600">
            {Math.round((analytics.plots.utilization * 0.3 + analytics.performance.healthRate * 0.3 + analytics.efficiency.diversityScore * 0.2 + analytics.efficiency.buildingScore * 0.2)) >= 80 ? 'Outstanding! 🎉' :
             Math.round((analytics.plots.utilization * 0.3 + analytics.performance.healthRate * 0.3 + analytics.efficiency.diversityScore * 0.2 + analytics.efficiency.buildingScore * 0.2)) >= 60 ? 'Great Work! 👍' :
             Math.round((analytics.plots.utilization * 0.3 + analytics.performance.healthRate * 0.3 + analytics.efficiency.diversityScore * 0.2 + analytics.efficiency.buildingScore * 0.2)) >= 40 ? 'Keep Going! 🌱' :
             'Room for Improvement 💪'}
          </p>
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

