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
      actions.setXp(state.xp + 30);
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

      {/* Expansion Options */}
      {state.gridSize >= maxSize ? (
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h4 className="text-xl font-bold text-orange-800 mb-2">Maximum Size Reached!</h4>
            <p className="text-orange-700 mb-4">
              Your farm is at its maximum size of {maxSize}×{maxSize} ({currentPlots} plots)
            </p>
            <div className="inline-block bg-orange-100 px-4 py-2 rounded-lg">
              <span className="font-semibold text-orange-800">✨ Achievement Unlocked: Farm Master!</span>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <h4 className="font-semibold mb-4">🚀 Upgrade Options</h4>

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Current Farm</div>
                <div className="text-2xl font-bold text-gray-800 mb-1">{state.gridSize}×{state.gridSize}</div>
                <div className="text-xs text-gray-500">{currentPlots} plots</div>
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border-2 border-green-300">
              <div className="text-center">
                <div className="text-sm text-green-700 mb-1">Next Size</div>
                <div className="text-2xl font-bold text-green-800 mb-1">{state.gridSize + 1}×{state.gridSize + 1}</div>
                <div className="text-xs text-green-600">
                  {nextPlots} plots (+{nextPlots - currentPlots})
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h5 className="font-semibold text-blue-800 mb-2">✨ Expansion Benefits:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• +{nextPlots - currentPlots} additional plots for crops</li>
              <li>• Unlock more crop variety options</li>
              <li>• Increase daily earning potential</li>
              <li>• Gain +30 XP bonus for expanding</li>
            </ul>
          </div>

          {/* Cost Breakdown */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-700">Expansion Cost:</span>
              <span className="font-bold text-gray-900">{expansionCost}🪙</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700">Your Balance:</span>
              <span className={`font-bold ${state.coins >= expansionCost ? 'text-green-600' : 'text-red-600'}`}>
                {state.coins}🪙
              </span>
            </div>
          </div>

          {/* Expand Button */}
          <Button
            onClick={handleExpand}
            disabled={state.coins < expansionCost}
            className={`w-full ${state.coins >= expansionCost ? 'bg-green-600 hover:bg-green-700' : ''}`}
            size="lg"
          >
            {state.coins >= expansionCost 
              ? `🏗️ Expand Farm (${expansionCost}🪙)` 
              : `Need ${expansionCost - state.coins} more coins`
            }
          </Button>
        </Card>
      )}

      {/* Farm Size Progress */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📊 Expansion Progress</h4>

        <div className="space-y-2 text-sm">
          {[3, 4, 5].map(size => {
            const isCompleted = state.gridSize > size;
            const isCurrent = state.gridSize === size;
            
            return (
              <div key={size} className={`flex items-center justify-between p-2 rounded ${
                isCompleted ? 'bg-green-50' :
                isCurrent ? 'bg-blue-50' :
                'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  {isCompleted && <span className="text-green-600">✓</span>}
                  {isCurrent && <span className="text-blue-600">●</span>}
                  {!isCompleted && !isCurrent && <span className="text-gray-400">○</span>}
                  <span className={`font-medium ${
                    isCompleted ? 'text-green-700' :
                    isCurrent ? 'text-blue-700' :
                    'text-gray-500'
                  }`}>
                    {size}×{size} Farm
                  </span>
                </div>
                <span className="text-xs text-gray-600">{size * size} plots</span>
              </div>
            );
          })}
        </div>
      </Card>

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
