import React, { memo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';

const ExpandTab = memo(() => {
  const { state, actions } = useGame();

  const expansionCost = state.gridSize === 3 ? 60 : state.gridSize === 4 ? 180 : 0;
  const maxSize = 5;
  const currentPlots = state.gridSize * state.gridSize;
  const nextPlots = (state.gridSize + 1) * (state.gridSize + 1);

  const handleExpand = () => {
    if (state.coins >= expansionCost && state.gridSize < maxSize) {
      actions.setCoins(state.coins - expansionCost);
      actions.updateDailyQuestProgress?.('spend_coins', { amount: expansionCost });
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
      <Card className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl pointer-events-none">🚜</div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              📈 Farm Expansion
            </h3>
            <p className="text-green-100 mt-1">Grow your agricultural empire!</p>
          </div>
          <div className="text-right bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
            <div className="text-2xl font-bold">
              {state.gridSize}×{state.gridSize}
            </div>
            <div className="text-xs text-white/90 uppercase tracking-widest">{currentPlots} Plots</div>
          </div>
        </div>
      </Card>

      {/* Farm Size Progress */}
      <Card className="p-6 bg-white border border-green-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-green-100 p-1 rounded text-green-700">📊</span> Expansion Roadmap
          </h4>
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 font-mono">
            Level {state.gridSize - 2} / {maxSize - 2}
          </Badge>
        </div>

        <div className="relative pt-6 pb-2 px-4">
          {/* Progress Bar Background */}
          <div className="h-3 bg-gray-100 rounded-full w-full absolute top-1/2 -translate-y-1/2 -z-0"></div>

          {/* Progress Fill */}
          <div
            className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-1000 -z-0 shadow-sm"
            style={{ width: `${((state.gridSize - 3) / (maxSize - 3)) * 100}%` }}
          ></div>

          {/* Milestones */}
          <div className="flex justify-between relative z-10 w-full">
            {[3, 4, 5].map(size => {
              const isCompleted = state.gridSize >= size;
              const isCurrent = state.gridSize === size;

              return (
                <div key={size} className="flex flex-col items-center group cursor-default">
                  <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                ${isCompleted
                      ? 'bg-green-500 border-green-200 text-white shadow-lg scale-110'
                      : isCurrent
                        ? 'bg-white border-green-500 text-green-600 shadow-xl scale-125 ring-4 ring-green-100'
                        : 'bg-gray-50 border-gray-200 text-gray-300'
                    }
                            `}>
                    <span className="font-bold text-sm">{size}x</span>
                  </div>
                  <div className={`
                                mt-4 text-xs font-bold transition-colors px-2 py-0.5 rounded
                                ${isCompleted || isCurrent ? 'text-green-800 bg-green-50' : 'text-gray-400'}
                            `}>
                    {size}x{size}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Expansion Options */}
      {state.gridSize >= maxSize ? (
        <Card className="p-8 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-orange-200 text-center relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 to-transparent"></div>
          <div className="relative z-10">
            <div className="text-6xl mb-4 animate-bounce filter drop-shadow-md">🏆</div>
            <h4 className="text-2xl font-black text-orange-900 mb-2">Maximum Size Reached!</h4>
            <p className="text-orange-800/80 mb-6 max-w-md mx-auto font-medium">
              You have cultivated every available acre. Your farm is a masterpiece!
            </p>
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full border border-orange-200 shadow-md">
              <span className="text-2xl">🌟</span>
              <span className="font-bold text-orange-800 tracking-wide uppercase text-sm">Master Harvester</span>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-0 border-0 shadow-lg overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <span className="bg-white/20 p-1 rounded backdrop-blur-sm">🚀</span> Available Expansion
            </h4>
          </div>

          <div className="p-6">
            {/* Before / After Comparison */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {/* Current */}
              <div className="text-center opacity-70">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Current Size</div>
                <div className="w-24 h-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">{state.gridSize}×{state.gridSize}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-1">
                <div className="text-blue-500 text-2xl animate-pulse">➔</div>
              </div>

              {/* Next */}
              <div className="text-center relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap z-20">
                  +{nextPlots - currentPlots} PLOTS
                </div>
                <div className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">Next Level</div>
                <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-4 border-green-500 shadow-xl flex flex-col items-center justify-center relative z-10 transform scale-105">
                  <span className="text-3xl font-black text-green-800">{state.gridSize + 1}×{state.gridSize + 1}</span>
                  <span className="text-xs text-green-600 font-bold mt-1">{nextPlots} Plots Total</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mt-6">
              {/* Benefits List */}
              <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h5 className="font-bold text-blue-900 mb-3 text-xs uppercase tracking-wider">Features Unlocked</h5>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                    <div className="bg-green-100 p-1 rounded-full text-green-600"><span className="text-xs">✓</span></div>
                    <span className="text-gray-700"><strong>{nextPlots - currentPlots} new plots</strong> for planting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-green-100 p-1 rounded-full text-green-600"><span className="text-xs">✓</span></div>
                    <span className="text-gray-700">Maximum yield potential increased</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-green-100 p-1 rounded-full text-green-600"><span className="text-xs">✓</span></div>
                    <span className="text-gray-700">+30 Prestige XP Awarded</span>
                  </li>
                </ul>
              </div>

              {/* Action Area */}
              <div className="flex-1 flex flex-col justify-end">
                <div className="flex justify-between items-end mb-3 px-1">
                  <div className="text-sm font-medium text-gray-500">Expansion Cost</div>
                  <div className="text-right">
                    <span className={`text-3xl font-black ${state.coins >= expansionCost ? 'text-gray-800' : 'text-red-500'}`}>
                      {expansionCost}🪙
                    </span>
                    {state.coins < expansionCost && (
                      <div className="text-xs text-red-500 font-bold mt-1 bg-red-50 px-2 py-1 rounded">Missing {expansionCost - state.coins} coins</div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleExpand}
                  disabled={state.coins < expansionCost}
                  className={`
                                w-full h-12 text-lg font-bold shadow-md transition-all rounded-xl
                                ${state.coins >= expansionCost
                      ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                            `}
                >
                  {state.coins >= expansionCost ? '🏗️ Purchase Expansion' : '🔒 Insufficient Funds'}
                </Button>
              </div>
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
