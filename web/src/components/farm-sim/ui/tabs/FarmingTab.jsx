import React, { memo, useCallback, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { getCropsByLevel, CROP_CATEGORIES } from '../../constants/cropData';
import { formatDisplayLabel } from '../../../../utils/textFormat';
import { getSoilAnalyzerEnabled } from '../../../../utils/farmUpgrades';
import { getDailyCropFocus } from '../../../../utils/dailyFocus';
import { SUPPLY_UNIT_COSTS } from '../../../../utils/supplies';

// Farming Tab Component
const FarmingTab = memo(() => {
  const { state, actions } = useGame();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const hasSoilAnalyzer = getSoilAnalyzerEnabled(state.inventory);
  const dailyFocus = getDailyCropFocus(state);
  const plotsArray = useMemo(() => (Array.isArray(state.plots) ? state.plots : []), [state.plots]);
  const seasonName = state.season?.config?.name || 'Spring';
  const weatherLabel = state.weather || 'sunny';

  // Get crops available at player's level
  const availableCrops = useMemo(() => getCropsByLevel(state.level), [state.level]);

  // Filter by category
  const crops =
    selectedCategory === 'all'
      ? availableCrops
      : availableCrops.filter((crop) => crop.category === selectedCategory);

  const cropList = useMemo(
    () =>
      crops.map((crop) => ({
        ...crop,
        value: crop.baseValue,
        time: crop.growthTime,
      })),
    [crops]
  );

  const farmStats = useMemo(() => {
    const totalPlots = plotsArray.length;
    if (totalPlots === 0) {
      return {
        totalPlots: 0,
        activePlots: 0,
        readyPlots: 0,
        avgSoilFertilityLabel: '100%',
        efficiencyPercent: 0,
      };
    }

    let activePlots = 0;
    let readyPlots = 0;
    let healthyPlots = 0;
    let soilTotal = 0;

    plotsArray.forEach((plot) => {
      const stateLabel = plot?.state;
      if (stateLabel !== 'empty') {
        activePlots += 1;
      }
      if (stateLabel === 'ready') {
        readyPlots += 1;
      }
      if (stateLabel !== 'empty' && stateLabel !== 'withered') {
        healthyPlots += 1;
      }
      soilTotal += plot?.soilFertility || 1.0;
    });

    const avgSoilFertilityLabel = `${Math.round((soilTotal / totalPlots) * 100)}%`;
    const efficiencyPercent = Math.round(
      ((activePlots / totalPlots) * 0.5 +
        (activePlots > 0 ? healthyPlots / activePlots : 1) * 0.5) *
        100
    );

    return {
      totalPlots,
      activePlots,
      readyPlots,
      avgSoilFertilityLabel,
      efficiencyPercent,
    };
  }, [plotsArray]);

  const plotInsights = useMemo(() => {
    let emptyPlots = 0;
    let readyPlots = 0;
    let diseasedPlots = 0;
    let thirstyPlots = 0;
    let activeGrowingPlots = 0;

    plotsArray.forEach((plot) => {
      if (!plot) return;
      const plotState = plot.state;
      if (plotState === 'empty') emptyPlots += 1;
      if (plotState === 'ready') readyPlots += 1;
      if (plot?.disease) diseasedPlots += 1;
      if ((plotState === 'planted' || plotState === 'growing') && (plot.waterLevel || 0) <= 40) {
        thirstyPlots += 1;
      }
      if (plotState === 'planted' || plotState === 'growing') {
        activeGrowingPlots += 1;
      }
    });

    return {
      emptyPlots,
      readyPlots,
      diseasedPlots,
      thirstyPlots,
      activeGrowingPlots,
    };
  }, [plotsArray]);

  const handleSelectCrop = useCallback(
    (cropId) => {
      actions.setSelectedCrop(cropId);
      actions.addNotification({
        message: `Selected ${cropList.find((c) => c.id === cropId)?.name}! Click empty plots to plant.`,
        type: 'info',
      });
    },
    [actions, cropList]
  );

  const handleBulkAction = useCallback(
    (action) => {
      switch (action) {
        case 'Water All':
          actions.waterAllPlots();
          actions.addNotification({
            message: `💧 Watered all plots!`,
            type: 'success',
          });
          break;
        case 'Harvest All':
          const readyCount = farmStats.readyPlots;
          if (readyCount > 0) {
            actions.harvestAllReadyCrops();
            actions.addNotification({
              message: `🌾 Harvested ${readyCount} crops!`,
              type: 'success',
            });
          } else {
            actions.addNotification({
              message: `No crops ready to harvest!`,
              type: 'info',
            });
          }
          break;
        case 'Fertilize All':
          {
            const result = actions.fertilizeAllPlots?.();
            if (!result || !result.applied) {
              actions.addNotification({
                message: `Not enough fertilizer or coins. Fertilizer costs ${SUPPLY_UNIT_COSTS.fertilizer}🪙 each in the shop.`,
                type: 'error',
              });
              break;
            }
            const parts = [];
            if (result.usedFromInventory) parts.push(`used ${result.usedFromInventory} fertilizer`);
            if (result.boughtUnits)
              parts.push(`bought ${result.boughtUnits} (-${result.coinCost}🪙)`);
            actions.addNotification({
              message: `🌱 Fertilized ${result.applied} plots${parts.length ? ` (${parts.join(', ')})` : ''}!`,
              type: 'success',
            });
          }
          break;
        case 'Pesticide All':
          {
            const diseasedCount = plotsArray.filter((p) => p.disease).length;
            if (diseasedCount === 0) {
              actions.addNotification({
                message: `No diseased crops to treat!`,
                type: 'info',
              });
              break;
            }

            const result = actions.treatAllDiseases?.();
            if (!result || !result.applied) {
              actions.addNotification({
                message: `Not enough pesticide or coins. Pesticide costs ${SUPPLY_UNIT_COSTS.pesticide}🪙 each in the shop.`,
                type: 'error',
              });
              break;
            }
            const parts = [];
            if (result.usedFromInventory) parts.push(`used ${result.usedFromInventory} pesticide`);
            if (result.boughtUnits)
              parts.push(`bought ${result.boughtUnits} (-${result.coinCost}🪙)`);
            actions.addNotification({
              message: `🐛 Treated ${result.applied} diseased crops${parts.length ? ` (${parts.join(', ')})` : ''}!`,
              type: 'success',
            });
          }
          break;
        default:
          actions.addNotification({
            message: `${action} action completed!`,
            type: 'info',
          });
      }
    },
    [actions, farmStats.readyPlots, plotsArray]
  );

  const advisorCard = useMemo(() => {
    if (plotInsights.diseasedPlots > 0) {
      return {
        title: 'Disease Alert',
        emoji: '🚨',
        detail: `${plotInsights.diseasedPlots} plot${plotInsights.diseasedPlots === 1 ? '' : 's'} infected. Treat now before yield drops.`,
        cta: 'Treat All',
        action: 'Pesticide All',
        cardClass: 'from-rose-50 to-red-50 border-rose-200',
        buttonClass: 'bg-rose-600 hover:bg-rose-700 text-white',
      };
    }
    if (plotInsights.readyPlots > 0) {
      return {
        title: 'Harvest Window',
        emoji: '🌾',
        detail: `${plotInsights.readyPlots} crop${plotInsights.readyPlots === 1 ? '' : 's'} ready. Cash out before they overripe.`,
        cta: 'Harvest Ready',
        action: 'Harvest All',
        cardClass: 'from-amber-50 to-yellow-50 border-amber-200',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      };
    }
    if (plotInsights.thirstyPlots > 0) {
      return {
        title: 'Hydration Needed',
        emoji: '💧',
        detail: `${plotInsights.thirstyPlots} active plot${plotInsights.thirstyPlots === 1 ? '' : 's'} are getting dry.`,
        cta: 'Water All',
        action: 'Water All',
        cardClass: 'from-sky-50 to-cyan-50 border-sky-200',
        buttonClass: 'bg-sky-600 hover:bg-sky-700 text-white',
      };
    }
    if (plotInsights.emptyPlots > 0) {
      const focusName =
        dailyFocus?.crop?.name ||
        cropList.find((crop) => crop.id === state.selectedCrop)?.name ||
        'your selected crop';
      return {
        title: 'Planting Opportunity',
        emoji: '🌱',
        detail: `${plotInsights.emptyPlots} empty plot${plotInsights.emptyPlots === 1 ? '' : 's'} available. Fill them for stronger farm efficiency.`,
        cta: `Pick ${focusName}`,
        action: 'SELECT_CROP',
        cardClass: 'from-emerald-50 to-green-50 border-emerald-200',
        buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      };
    }
    return {
      title: 'Farm Flow Stable',
      emoji: '✨',
      detail:
        plotInsights.activeGrowingPlots > 0
          ? `${plotInsights.activeGrowingPlots} crop${plotInsights.activeGrowingPlots === 1 ? '' : 's'} are growing smoothly. Keep rotating crops to maintain long-term fertility.`
          : 'Everything looks healthy. Keep rotating crops to maintain long-term fertility.',
      cta: 'Refresh Soil',
      action: 'Fertilize All',
      cardClass: 'from-violet-50 to-indigo-50 border-violet-200',
      buttonClass: 'bg-violet-600 hover:bg-violet-700 text-white',
    };
  }, [
    cropList,
    dailyFocus?.crop?.name,
    plotInsights.activeGrowingPlots,
    plotInsights.diseasedPlots,
    plotInsights.emptyPlots,
    plotInsights.readyPlots,
    plotInsights.thirstyPlots,
    state.selectedCrop,
  ]);

  const runAdvisorAction = useCallback(() => {
    if (advisorCard.action === 'SELECT_CROP') {
      const fallbackCrop = cropList[0];
      const cropId = dailyFocus?.cropId || state.selectedCrop || fallbackCrop?.id;
      if (cropId) {
        handleSelectCrop(cropId);
      }
      return;
    }
    handleBulkAction(advisorCard.action);
  }, [
    advisorCard.action,
    cropList,
    dailyFocus?.cropId,
    handleBulkAction,
    handleSelectCrop,
    state.selectedCrop,
  ]);

  return (
    <div className="space-y-4">
      <Card className={`p-4 border bg-gradient-to-r ${advisorCard.cardClass}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-lg">{advisorCard.emoji}</span>
              {advisorCard.title}
            </h3>
            <p className="text-sm text-gray-700 mt-1">{advisorCard.detail}</p>
            <p className="text-xs text-gray-500 mt-1">
              {seasonName} • {weatherLabel}
            </p>
          </div>
          <Button
            size="sm"
            className={`min-h-[40px] ${advisorCard.buttonClass}`}
            onClick={runAdvisorAction}
          >
            {advisorCard.cta}
          </Button>
        </div>
      </Card>

      {/* Daily Focus */}
      {dailyFocus?.crop && (
        <Card className="overflow-hidden border-amber-200/70 bg-gradient-to-br from-white via-amber-50/30 to-orange-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">Daily market focus</h3>
              <p className="text-sm text-slate-600">
                Today, {dailyFocus.crop.emoji} {dailyFocus.crop.name} sells for +
                {Math.round((dailyFocus.bonusMultiplier - 1) * 100)}%.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="min-h-[40px]"
              onClick={() => {
                if (typeof window.switchToTab === 'function') {
                  window.switchToTab('inventory');
                }
              }}
            >
              Open Inventory
            </Button>
          </div>
        </Card>
      )}

      {/* Category Filter */}
      <Card className="overflow-hidden border-emerald-200/70 bg-gradient-to-br from-white via-emerald-50/30 to-green-50/40 p-4">
        <h3 className="mb-2 font-semibold text-slate-900">Crop categories</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="text-xs"
          >
            All ({availableCrops.length})
          </Button>
          {Object.values(CROP_CATEGORIES).map((category) => {
            const count = availableCrops.filter((c) => c.category === category).length;
            if (count === 0) return null;
            return (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="text-xs"
              >
                {formatDisplayLabel(category)} ({count})
              </Button>
            );
          })}
        </div>
      </Card>
      {/* Quick Actions */}
      <Card className="overflow-hidden border-slate-200/70 bg-white/85 p-4">
        <h3 className="mb-3 font-semibold text-slate-900">Quick actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleBulkAction('Water All')}
            variant="outline"
            size="sm"
            className="text-xs min-h-[44px]"
            disabled={plotInsights.thirstyPlots === 0}
          >
            💧 Water ({plotInsights.thirstyPlots})
          </Button>
          <Button
            onClick={() => handleBulkAction('Harvest All')}
            variant="outline"
            size="sm"
            className="text-xs min-h-[44px]"
            disabled={plotInsights.readyPlots === 0}
          >
            🌾 Harvest ({plotInsights.readyPlots})
          </Button>
          <Button
            onClick={() => handleBulkAction('Fertilize All')}
            variant="outline"
            size="sm"
            className="text-xs min-h-[44px]"
          >
            🌱 Fertilize All
          </Button>
          <Button
            onClick={() => handleBulkAction('Pesticide All')}
            variant="outline"
            size="sm"
            className="text-xs min-h-[44px]"
            disabled={plotInsights.diseasedPlots === 0}
          >
            🐛 Treat ({plotInsights.diseasedPlots})
          </Button>
        </div>
        <div className="mt-3 text-[11px] text-slate-500">
          Hotkeys: <kbd className="px-1 py-0.5 bg-gray-100 rounded">W</kbd> water,{' '}
          <kbd className="px-1 py-0.5 bg-gray-100 rounded">H</kbd> harvest,{' '}
          <kbd className="px-1 py-0.5 bg-gray-100 rounded">F</kbd> fertilize,{' '}
          <kbd className="px-1 py-0.5 bg-gray-100 rounded">T</kbd> treat
        </div>
      </Card>

      {/* Available Crops */}
      <Card className="overflow-hidden border-slate-200/70 bg-white/85 p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-slate-900">Select crop to plant</h3>
          <Badge variant="outline" className="bg-white/80 text-slate-600">
            {cropList.length} available
          </Badge>
        </div>
        <p className="mb-3 text-xs text-slate-600">
          Click a crop, then click empty plots on your farm
        </p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {cropList.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">🌱</div>
              <p className="text-sm text-slate-600">No crops unlocked for this category yet.</p>
              <p className="text-xs text-slate-500 mt-1">Level up to discover new seeds.</p>
            </div>
          ) : (
            cropList.map((crop) => {
              const isSelected = state.selectedCrop === crop.id;
              const isDailyFocusCrop = dailyFocus?.cropId === crop.id;
              return (
                <div
                  key={crop.id}
                  className={`
                    flex items-center justify-between rounded-2xl border p-3 cursor-pointer transition-all
                    ${
                      isSelected
                        ? 'bg-green-50 border-green-500 shadow-md'
                        : isDailyFocusCrop
                          ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }
                  `}
                  onClick={() => handleSelectCrop(crop.id)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{crop.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{crop.name}</span>
                        {crop.level > 1 && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            Lvl {crop.level}
                          </Badge>
                        )}
                        {isDailyFocusCrop && (
                          <Badge className="text-[10px] px-1 py-0 bg-amber-600">Focus</Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-600">
                        Cost: {crop.cost}🪙 • Time: {crop.time}s • Sell: {crop.value}🪙
                      </div>
                      <div className="mt-0.5 text-[10px] italic text-slate-500">
                        {crop.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Badge className="bg-green-600">✓ Selected</Badge>}
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Farm Statistics */}
      <Card className="overflow-hidden border-slate-200/70 bg-white/85 p-4">
        <h3 className="mb-3 font-semibold text-slate-900">Farm statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Active Plots</span>
            <Badge variant="outline">{`${farmStats.activePlots}/${farmStats.totalPlots}`}</Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Ready to Harvest</span>
            <Badge variant="outline">{farmStats.readyPlots}</Badge>
          </div>
          {hasSoilAnalyzer && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg Soil Fertility</span>
              <Badge variant="outline">{farmStats.avgSoilFertilityLabel}</Badge>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Farm Efficiency</span>
              <span className="text-sm font-medium">{`${farmStats.efficiencyPercent}%`}</span>
            </div>
            <Progress value={farmStats.efficiencyPercent} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Farming Tips */}
      <Card className="overflow-hidden border-sky-200/70 bg-gradient-to-br from-white via-sky-50/30 to-blue-50/40 p-4">
        <h3 className="mb-2 font-semibold text-slate-900">Farming tips</h3>
        <ul className="space-y-1 text-sm text-slate-700">
          <li>• Plant crops during optimal seasons for bonus yields</li>
          <li>• Water crops regularly to prevent withering</li>
          <li>• Use fertilizers to speed up growth</li>
          <li>• Monitor weather forecasts for better planning</li>
        </ul>
      </Card>
    </div>
  );
});

FarmingTab.displayName = 'FarmingTab';

export default FarmingTab;
