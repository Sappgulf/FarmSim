import React, { memo, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { getCropsByLevel, CROP_CATEGORIES } from '../../constants/cropData';
import { Droplets, Sprout, Bug, Wheat, Check, Clock, Coins } from 'lucide-react';

// Farming Tab Component
const FarmingTab = memo(() => {
  const { state, actions } = useGame();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get crops available at player's level
  const availableCrops = useMemo(() => getCropsByLevel(state.level), [state.level]);

  // Filter by category
  const crops = useMemo(() => (
    selectedCategory === 'all'
      ? availableCrops
      : availableCrops.filter(crop => crop.category === selectedCategory)
  ), [availableCrops, selectedCategory]);

  const cropList = useMemo(() => crops.map(crop => ({
    ...crop,
    value: crop.baseValue,
    time: crop.growthTime,
  })), [crops]);

  const handleSelectCrop = (cropId) => {
    actions.setSelectedCrop(cropId);
    // Notification handled by selection visual feedback implies action, 
    // optional: distinct sound or subtle toast could go here if needed
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'Water All':
        actions.waterAllPlots();
        actions.addNotification({ message: `💧 Watered all plots!`, type: 'success' });
        break;
      case 'Harvest All':
        const plotsArray = Array.isArray(state.plots) ? state.plots : [];
        const readyCount = plotsArray.filter(p => p.state === 'ready').length;
        if (readyCount > 0) {
          actions.harvestAllReadyCrops();
          // Notification handled by harvest action usually, but duplicative here ensures feedback
        } else {
          actions.addNotification({ message: `No crops ready to harvest!`, type: 'info' });
        }
        break;
      case 'Fertilize All':
        // Logic handled in action, just UI trigger here
        if (state.coins >= 15 || (state.inventory?.fertilizer || 0) > 0) {
          actions.fertilizeAllPlots();
        } else {
          actions.addNotification({ message: "Not enough coins (15 per plot)", type: "error" });
        }
        break;
      case 'Pesticide All':
        if (state.coins >= 20 || (state.inventory?.pesticide || 0) > 0) {
          actions.treatAllDiseases();
        } else {
          actions.addNotification({ message: "Not enough coins (20 per plot)", type: "error" });
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
        <h3 className="font-semibold mb-3 text-green-800 flex items-center gap-2">
          <Sprout className="w-4 h-4" /> Crop Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="text-xs h-8"
          >
            All
          </Button>
          {Object.entries(CROP_CATEGORIES).map(([key, label]) => {
            const count = availableCrops.filter(c => c.category === key).length;
            if (count === 0) return null;
            return (
              <Button
                key={key}
                size="sm"
                variant={selectedCategory === key ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(key)}
                className="text-xs h-8"
              >
                {label}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => handleBulkAction('Water All')} variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800">
          <Droplets className="w-5 h-5" />
          <span className="text-xs font-medium">Water All</span>
        </Button>
        <Button onClick={() => handleBulkAction('Harvest All')} variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800">
          <Wheat className="w-5 h-5" />
          <span className="text-xs font-medium">Harvest All</span>
        </Button>
        <Button onClick={() => handleBulkAction('Fertilize All')} variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800">
          <Sprout className="w-5 h-5" />
          <span className="text-xs font-medium">Fertilize All</span>
        </Button>
        <Button onClick={() => handleBulkAction('Pesticide All')} variant="outline" className="h-auto py-3 flex flex-col gap-1 items-center bg-red-50 hover:bg-red-100 border-red-200 text-red-800">
          <Bug className="w-5 h-5" />
          <span className="text-xs font-medium">Treat All</span>
        </Button>
      </div>

      {/* Available Crops Grid */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Sprout className="w-4 h-4 text-green-600" /> Select Crop
          </h3>
          <Badge variant="outline" className="bg-gray-50">{cropList.length} unlocked</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {cropList.map(crop => {
            const isSelected = state.selectedCrop === crop.id;
            return (
              <div
                key={crop.id}
                className={`
                  relative flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all border-2
                  ${isSelected
                    ? 'bg-green-50 border-green-500 shadow-md transform scale-[1.02]'
                    : 'bg-white border-gray-100 hover:border-green-200 hover:shadow-sm'
                  }
                `}
                onClick={() => handleSelectCrop(crop.id)}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 text-green-600">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <span className="text-3xl mb-2 filter drop-shadow-sm">{crop.emoji}</span>
                <span className="font-semibold text-sm text-center leading-tight mb-1">{crop.name}</span>

                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 w-full justify-center">
                  <span className="flex items-center gap-0.5" title="Cost">
                    <Coins className="w-3 h-3 text-yellow-600" />
                    {crop.cost}
                  </span>
                  <span className="flex items-center gap-0.5" title="Growth Time">
                    <Clock className="w-3 h-3 text-blue-400" />
                    {crop.time}s
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Farm Stats Footer */}
      <Card className="p-4 bg-gray-50">
        <div className="flex justify-between items-center text-sm mb-2">
          <span className="text-gray-600">Farm Efficiency</span>
          <span className="font-medium text-gray-900">100%</span>
        </div>
        <Progress value={100} className="h-2 bg-gray-200" indicatorClassName="bg-green-500" />
      </Card>
    </div>
  );
});

FarmingTab.displayName = 'FarmingTab';

export default FarmingTab;
