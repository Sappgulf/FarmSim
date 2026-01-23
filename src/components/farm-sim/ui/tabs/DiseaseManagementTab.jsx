import React, { memo, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';
import { AlertTriangle, Shield, Droplet, Bug } from 'lucide-react';
import { DISEASE_TYPES, CURE_ITEMS } from '../../constants/diseaseData';

/**
 * Disease Management Tab - Handle crop diseases and pests
 */
const DiseaseManagementTab = memo(() => {
  const { state, actions } = useGame();

  // Calculate disease statistics
  const diseaseStats = useMemo(() => {
    const diseasedPlots = (state.plots || []).filter(p => p.disease);
    const diseaseTypes = {};
    
    diseasedPlots.forEach(plot => {
      diseaseTypes[plot.disease] = (diseaseTypes[plot.disease] || 0) + 1;
    });
    
    const totalPlots = (state.plots || []).filter(p => p.state !== 'empty').length;
    const healthyPlots = totalPlots - diseasedPlots.length;
    const healthPercent = totalPlots > 0 ? (healthyPlots / totalPlots) * 100 : 100;
    
    return {
      totalDiseased: diseasedPlots.length,
      diseaseTypes,
      healthyPlots,
      totalPlots,
      healthPercent,
    };
  }, [state.plots]);

  // Handle cure purchase and application
  const handleApplyCure = (cureItemId) => {
    const cureItem = CURE_ITEMS[cureItemId];
    if (!cureItem) return;
    
    // Find first diseased plot that this cure can fix
    const targetPlotIndex = state.plots.findIndex(plot => 
      plot.disease && cureItem.cures.includes(plot.disease)
    );
    
    if (targetPlotIndex === -1) {
      actions.addNotification({
        message: `No crops infected with diseases that ${cureItem.name} can cure!`,
        type: 'warning',
      });
      return;
    }
    
    // Apply cure via disease system action
    if (state.diseaseSystem) {
      state.diseaseSystem.applyCure(targetPlotIndex, cureItemId);
    } else {
      // Fallback: apply cure directly
      if (state.coins >= cureItem.cost) {
        const updatedPlots = [...state.plots];
        updatedPlots[targetPlotIndex] = {
          ...updatedPlots[targetPlotIndex],
          disease: null,
          diseasedAt: null,
          curedAt: Date.now(),
        };
        actions.updatePlots(updatedPlots);
        actions.setCoins(state.coins - cureItem.cost);
        actions.setXp(state.xp + 10);
        
        actions.addNotification({
          message: `${cureItem.emoji} Cured plot #${targetPlotIndex + 1}!`,
          type: 'success',
        });
      } else {
        actions.addNotification({
          message: `Not enough coins! Need ${cureItem.cost}🪙`,
          type: 'error',
        });
      }
    }
  };

  // Handle universal cure (cure all)
  const handleCureAll = () => {
    const universalCure = CURE_ITEMS.universal_cure;
    const diseasedPlots = (state.plots || []).filter(p => p.disease);
    
    if (diseasedPlots.length === 0) {
      actions.addNotification({
        message: 'No diseased crops to cure!',
        type: 'warning',
      });
      return;
    }
    
    if (state.coins < universalCure.cost) {
      actions.addNotification({
        message: `Not enough coins! Need ${universalCure.cost}🪙`,
        type: 'error',
      });
      return;
    }
    
    // Cure all diseased plots
    const updatedPlots = state.plots.map(plot => {
      if (plot.disease) {
        return {
          ...plot,
          disease: null,
          diseasedAt: null,
          curedAt: Date.now(),
          protection: Date.now() + (universalCure.preventionDuration || 0),
        };
      }
      return plot;
    });
    
    actions.updatePlots(updatedPlots);
    actions.setCoins(state.coins - universalCure.cost);
    actions.setXp(state.xp + 50);
    
    // Particle effect
    if (typeof window.triggerParticleEffect === 'function') {
      window.triggerParticleEffect(window.innerWidth / 2, window.innerHeight / 2, 'levelup');
    }
    
    actions.addNotification({
      message: `✨ Cured ALL diseases! +24h protection!`,
      type: 'success',
    });
  };

  const getHealthColor = (percent) => {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 50) return 'text-yellow-600';
    if (percent >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const hasBarn = state.buildings?.barn?.built;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
              <Bug className="w-5 h-5" />
              🐛 Disease Management
            </h3>
            <p className="text-sm text-red-600 mt-1">Protect your crops from diseases and pests!</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getHealthColor(diseaseStats.healthPercent)}`}>
              {Math.round(diseaseStats.healthPercent)}%
            </div>
            <div className="text-xs text-gray-600">Farm Health</div>
          </div>
        </div>
        
        <div className="mt-3">
          <Progress value={diseaseStats.healthPercent} className="h-2" />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>🌱 Healthy: {diseaseStats.healthyPlots}</span>
            <span>🦠 Diseased: {diseaseStats.totalDiseased}</span>
          </div>
        </div>
      </Card>

      {/* Active Diseases Alert */}
      {diseaseStats.totalDiseased > 0 && (
        <Card className="p-4 bg-red-50 border-2 border-red-400">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="font-semibold text-red-800 mb-2">
                ⚠️ {diseaseStats.totalDiseased} Active Infection{diseaseStats.totalDiseased > 1 ? 's' : ''}!
              </div>
              <div className="text-sm text-red-700 space-y-1">
                {Object.entries(diseaseStats.diseaseTypes).map(([diseaseId, count]) => {
                  const disease = DISEASE_TYPES[diseaseId];
                  return disease ? (
                    <div key={diseaseId}>
                      {disease.emoji} {disease.name}: {count} plot{count > 1 ? 's' : ''}
                    </div>
                  ) : null;
                })}
              </div>
              <Button
                onClick={handleCureAll}
                className="mt-3 bg-red-600 hover:bg-red-700"
                size="sm"
              >
                ✨ Cure All ({CURE_ITEMS.universal_cure.cost}🪙)
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Disease Protection Info */}
      {hasBarn && (
        <Card className="p-3 bg-green-50 border-green-300">
          <div className="flex items-center gap-2 text-green-800">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">🏚️ Barn Provides 50% Disease Protection!</span>
          </div>
        </Card>
      )}

      {/* Cure Items Shop */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Droplet className="w-4 h-4" />
          Treatment Shop
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.values(CURE_ITEMS).map((cureItem) => {
            const canAfford = state.coins >= cureItem.cost;
            const hasMatchingDisease = state.plots.some(plot => 
              plot.disease && cureItem.cures.includes(plot.disease)
            );
            const isUniversal = cureItem.id === 'universal_cure';
            
            return (
              <Card
                key={cureItem.id}
                className={`p-3 border-2 transition-all ${
                  hasMatchingDisease && canAfford
                    ? 'border-green-400 bg-green-50'
                    : isUniversal
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{cureItem.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">
                      {cureItem.name}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {cureItem.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {cureItem.cures.map(diseaseId => {
                        const disease = DISEASE_TYPES[diseaseId];
                        return disease ? (
                          <Badge key={diseaseId} variant="outline" className="text-xs">
                            {disease.emoji} {disease.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-yellow-700">
                        {cureItem.cost}🪙
                      </span>
                      <Button
                        onClick={() => isUniversal ? handleCureAll() : handleApplyCure(cureItem.id)}
                        size="sm"
                        disabled={!canAfford || (!hasMatchingDisease && !isUniversal)}
                        className={canAfford && hasMatchingDisease ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {!canAfford 
                          ? `Need ${cureItem.cost}🪙` 
                          : !hasMatchingDisease && !isUniversal
                          ? 'No Target'
                          : isUniversal
                          ? '✨ Cure All'
                          : '💊 Apply'
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Disease Encyclopedia */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📚 Disease Encyclopedia</h4>
        
        <div className="space-y-3">
          {Object.values(DISEASE_TYPES).map((disease) => {
            const activeCount = diseaseStats.diseaseTypes[disease.id] || 0;
            
            return (
              <Card
                key={disease.id}
                className={`p-3 border-2 ${activeCount > 0 ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{disease.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-gray-800">{disease.name}</div>
                      {activeCount > 0 && (
                        <Badge className="bg-red-600">⚠️ {activeCount} Active</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{disease.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Spread Rate:</span>
                        <Progress value={disease.spreadChance * 100} className="h-1 mt-1" />
                      </div>
                      <div>
                        <span className="text-gray-500">Yield Loss:</span>
                        <span className="ml-1 font-semibold text-red-600">
                          -{Math.round(disease.yieldPenalty * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                      <span>Favorable:</span>
                      {disease.favorableWeather.map(w => (
                        <Badge key={w} variant="outline" className="text-xs">
                          {w === 'sunny' ? '☀️' : w === 'rainy' ? '🌧️' : w === 'cloudy' ? '☁️' : '⛈️'}
                          {w}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold mb-2 text-blue-800">💡 Disease Prevention Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Diseases spread to adjacent plots - treat infections quickly!</li>
          <li>Low water and poor soil health increase disease risk</li>
          <li>Build a Barn to reduce disease chance by 50%</li>
          <li>Weather affects disease occurrence - rainy weather increases fungal infections</li>
          <li>Universal Cure provides 24h immunity to all diseases!</li>
        </ul>
      </Card>
    </div>
  );
});

DiseaseManagementTab.displayName = 'DiseaseManagementTab';
export default DiseaseManagementTab;

