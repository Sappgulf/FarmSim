import React, { memo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { getCropsByLevel, CROP_CATEGORIES } from '../../constants/cropData';

// Farming Tab Component
const FarmingTab = memo(() => {
  const { state, actions } = useGame();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get crops available at player's level
  const availableCrops = getCropsByLevel(state.level);
  
  // Filter by category
  const crops = selectedCategory === 'all' 
    ? availableCrops
    : availableCrops.filter(crop => crop.category === selectedCategory);

  const cropList = crops.map(crop => ({
    ...crop,
    value: crop.baseValue,
    time: crop.growthTime,
  }));

  const handleSelectCrop = (cropId) => {
    actions.setSelectedCrop(cropId);
    actions.addNotification({
      message: `Selected ${cropList.find(c => c.id === cropId)?.name}! Click empty plots to plant.`,
      type: 'info'
    });
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'Water All':
        actions.waterAllPlots();
        actions.addNotification({
          message: `💧 Watered all plots!`,
          type: 'success'
        });
        break;
      case 'Harvest All':
        const plotsArray = Array.isArray(state.plots) ? state.plots : [];
        const readyCount = plotsArray.filter(p => p.state === 'ready').length;
        if (readyCount > 0) {
          actions.harvestAllReadyCrops();
          actions.addNotification({
            message: `🌾 Harvested ${readyCount} crops!`,
            type: 'success'
          });
        } else {
          actions.addNotification({
            message: `No crops ready to harvest!`,
            type: 'info'
          });
        }
        break;
      case 'Fertilize All':
        const plotsArray2 = Array.isArray(state.plots) ? state.plots : [];
        const fertilizablePlots = plotsArray2.length;
        const maxFertilizations = Math.floor(state.coins / 15);
        if (maxFertilizations > 0) {
          actions.fertilizeAllPlots();
          const actualFertilizations = Math.min(fertilizablePlots, maxFertilizations);
          actions.addNotification({
            message: `🌱 Fertilized ${actualFertilizations} plots! (-${actualFertilizations * 15}🪙)`,
            type: 'success'
          });
        } else {
          actions.addNotification({
            message: `Not enough coins! Need at least 15🪙 for one plot.`,
            type: 'error'
          });
        }
        break;
      case 'Pesticide All':
        const plotsArray3 = Array.isArray(state.plots) ? state.plots : [];
        const diseasedCount = plotsArray3.filter(p => p.disease).length;
        const maxTreatments = Math.floor(state.coins / 20);
        if (diseasedCount > 0 && maxTreatments > 0) {
          actions.treatAllDiseases();
          const actualTreatments = Math.min(diseasedCount, maxTreatments);
          actions.addNotification({
            message: `🐛 Treated ${actualTreatments} diseased crops! (-${actualTreatments * 20}🪙)`,
            type: 'success'
          });
        } else if (diseasedCount === 0) {
          actions.addNotification({
            message: `No diseased crops to treat!`,
            type: 'info'
          });
        } else {
          actions.addNotification({
            message: `Not enough coins! Need at least 20🪙 for one treatment.`,
            type: 'error'
          });
        }
        break;
      default:
        actions.addNotification({
          message: `${action} action completed!`,
          type: 'info'
        });
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <h3 className="font-semibold mb-2 text-green-800">🌱 Crop Categories</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="text-xs"
          >
            All ({availableCrops.length})
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
                className="text-xs"
              >
                {label} ({count})
              </Button>
            );
          })}
        </div>
      </Card>
      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleBulkAction('Water All')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            💧 Water All
          </Button>
          <Button
            onClick={() => handleBulkAction('Harvest All')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🌾 Harvest All
          </Button>
          <Button
            onClick={() => handleBulkAction('Fertilize All')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🌱 Fertilize All
          </Button>
          <Button
            onClick={() => handleBulkAction('Pesticide All')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🐛 Pesticide All
          </Button>
        </div>
      </Card>

      {/* Available Crops */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">🌱 Select Crop to Plant</h3>
          <Badge variant="outline">{cropList.length} available</Badge>
        </div>
        <p className="text-xs text-gray-600 mb-3">Click a crop, then click empty plots on your farm</p>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {cropList.map(crop => {
            const isSelected = state.selectedCrop === crop.id;
            return (
              <div 
                key={crop.id} 
                className={`
                  flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
                  ${isSelected 
                    ? 'bg-green-100 border-2 border-green-500 shadow-md' 
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
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
                    </div>
                    <div className="text-xs text-gray-600">
                      Cost: {crop.cost}🪙 • Time: {crop.time}s • Sell: {crop.value}🪙
                    </div>
                    <div className="text-[10px] text-gray-500 italic mt-0.5">
                      {crop.description}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <Badge className="bg-green-600">✓ Selected</Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Farm Statistics */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">📊 Farm Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Active Plots</span>
            <Badge variant="outline">
              {(() => {
                const plotsArray = Array.isArray(state.plots) ? state.plots : [];
                return `${plotsArray.filter(p => p.state !== 'empty').length}/${plotsArray.length}`;
              })()}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Ready to Harvest</span>
            <Badge variant="outline">
              {(() => {
                const plotsArray = Array.isArray(state.plots) ? state.plots : [];
                return plotsArray.filter(p => p.state === 'ready').length;
              })()}
            </Badge>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">Farm Efficiency</span>
              <span className="text-sm font-medium">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Farming Tips */}
      <Card className="p-4 bg-blue-50">
        <h3 className="font-semibold mb-2 text-blue-800">💡 Farming Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
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
