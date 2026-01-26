import React, { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';

const ExpandTab = memo(() => {
  const { state, actions } = useGame();

  const expansionCost = state.gridSize === 3 ? 60 : state.gridSize === 4 ? 180 : 0;
  const maxSize = 5;
  const currentPlots = state.gridSize * state.gridSize;
  const nextPlots = (state.gridSize + 1) * (state.gridSize + 1);

  const handleExpand = () => {
    if (state.coins >= expansionCost && state.gridSize < maxSize) {
      actions.setCoins(state.coins - expansionCost);
      actions.setGridSize(state.gridSize + 1);
      actions.grantXP(30, 'farm_expand', { newSize: state.gridSize + 1 });
      actions.addNotification({
        message: `🎉 Farm expanded to ${state.gridSize + 1}×${state.gridSize + 1}!`,
        type: 'success'
      });
    } else if (state.coins < expansionCost) {
      actions.addNotification({
        message: `Not enough coins! Need ${expansionCost}🪙`,
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Farm Status */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-green-800">📈 Farm Expansion</h3>
            <p className="text-sm text-green-700">Expand your farm to grow more crops</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {state.gridSize}×{state.gridSize}
            </div>
            <div className="text-xs text-gray-600">{currentPlots} Plots</div>
          </div>
        </div>
      </Card>

      {/* Farm Size Progress */}
      <Card className="p-4 bg-white border-2 border-green-100">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-green-900">📊 Expansion Roadmap</h4>
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            Current: Level {state.gridSize - 2} / {maxSize - 2}
          </Badge>
        </div>

        <div className="relative pt-6 pb-2 px-2">
          {/* Progress Bar Background */}
          <div className="h-4 bg-gray-100 rounded-full w-full absolute top-1/2 -translate-y-1/2 -z-0"></div>

          {/* Progress Fill */}
          <div
            className="h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-1000 -z-0 shadow-sm"
            style={{ width: `${((state.gridSize - 3) / (maxSize - 3)) * 100}%` }}
          ></div>

          {/* Milestones */}
          <div className="flex justify-between relative z-10 w-full">
            {[3, 4, 5].map(size => {
              const isCompleted = state.gridSize >= size;
              const isCurrent = state.gridSize === size;
              const isFuturistic = state.gridSize < size;

              return (
                <div key={size} className="flex flex-col items-center group cursor-default">
                  <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                ${isCompleted
                      ? 'bg-green-500 border-green-200 text-white shadow-md scale-110'
                      : isCurrent
                        ? 'bg-white border-green-500 text-green-600 shadow-lg scale-125'
                        : 'bg-gray-100 border-white text-gray-400'
                    }
                            `}>
                    {size}x
                  </div>
                  <div className={`
                                mt-3 text-xs font-bold transition-colors
                                ${isCompleted || isCurrent ? 'text-green-800' : 'text-gray-400'}
                            `}>
                    {size}x{size}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    {size * size} plots
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Expansion Options */}
      {state.gridSize >= maxSize ? (
        <Card className="p-8 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-orange-200 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400"></div>
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h4 className="text-2xl font-bold text-orange-900 mb-2">Maximum Farm Size Reached!</h4>
          <p className="text-orange-800/80 mb-6 max-w-md mx-auto">
            Congratulations! You have cultivated every inch of land available. Your farm is a masterpiece at {maxSize}×{maxSize}!
          </p>
          <div className="inline-flex items-center gap-2 bg-white/60 px-6 py-3 rounded-full border border-orange-200 shadow-sm">
            <span className="text-2xl">🌟</span>
            <span className="font-bold text-orange-800">Master Harvester Status</span>
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-2 border-blue-50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl pointer-events-none">
            🚜
          </div>

          <h4 className="font-bold text-xl mb-6 flex items-center gap-2 text-gray-800 relative z-10">
            <span className="bg-blue-100 p-1.5 rounded-lg text-lg">🚀</span> Available Expansion
          </h4>

          {/* Before / After Comparison */}
          <div className="flex items-center justify-center gap-4 mb-8 relative z-10">
            {/* Current */}
            <div className="text-center opacity-60 scale-90">
              <div className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Current</div>
              <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">{state.gridSize}×{state.gridSize}</span>
                <span className="text-xs text-gray-400">{currentPlots} Plots</span>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-blue-500 text-2xl animate-pulse">
              ➔
            </div>

            {/* Next */}
            <div className="text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap z-20">
                +{nextPlots - currentPlots} PLOTS
              </div>
              <div className="text-sm font-bold text-green-600 mb-2 uppercase tracking-wide">Upgrade</div>
              <div className="w-32 h-32 bg-white rounded-xl border-4 border-green-500 shadow-lg flex flex-col items-center justify-center relative z-10">
                <span className="text-3xl font-bold text-gray-800">{state.gridSize + 1}×{state.gridSize + 1}</span>
                <span className="text-sm text-green-600 font-medium">{nextPlots} Plots Total</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Benefits List */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h5 className="font-bold text-blue-900 mb-3 text-sm uppercase">Expansion Benefits</h5>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Unlock {nextPlots - currentPlots} new planting spots
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Increase maximum yield potential
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Earn +30 Prestige XP
                </li>
              </ul>
            </div>

            {/* Action Area */}
            <div className="flex flex-col justify-end">
              <div className="flex justify-between items-end mb-3 px-1">
                <div className="text-sm text-gray-500">Upgrade Cost</div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${state.coins >= expansionCost ? 'text-gray-900' : 'text-red-500'}`}>
                    {expansionCost}🪙
                  </span>
                  {state.coins < expansionCost && (
                    <div className="text-xs text-red-500 font-medium">Missing {expansionCost - state.coins} coins</div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleExpand}
                disabled={state.coins < expansionCost}
                className={`
                        w-full h-12 text-lg shadow-md transition-all
                        ${state.coins >= expansionCost
                    ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5'
                    : 'opacity-50'
                  }
                    `}
              >
                {state.coins >= expansionCost ? 'Purchase Land Expansion' : 'Insufficient Funds'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-2">💡 Tips</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Save coins by completing daily challenges</li>
          <li>• Larger farms allow for more diverse crop strategies</li>
          <li>• Expansion costs increase with each upgrade</li>
          <li>• Maximum farm size is {maxSize}×{maxSize} ({maxSize * maxSize} plots)</li>
        </ul>
      </Card>
    </div>
  );
});

ExpandTab.displayName = 'ExpandTab';
export default ExpandTab;
