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
    actions.triggerParticles(window.innerWidth / 2, window.innerHeight / 2, 'levelup');

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
      <Card className="p-6 bg-gradient-to-r from-red-500 to-rose-600 text-white overflow-hidden relative shadow-lg">
        <div className="absolute -right-6 -top-6 p-8 opacity-20 text-9xl pointer-events-none rotate-12">🦠</div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">🛡️</span> Disease Control
            </h3>
            <p className="text-red-100 mt-1 font-medium">Monitor crop health and prevent outbreaks</p>
          </div>
          <div className="text-right bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
            <div className={`text-3xl font-black ${diseaseStats.healthPercent >= 80 ? 'text-green-300' : diseaseStats.healthPercent >= 50 ? 'text-yellow-300' : 'text-red-300'}`}>
              {Math.round(diseaseStats.healthPercent)}%
            </div>
            <div className="text-xs text-white/80 uppercase tracking-widest">Health</div>
          </div>
        </div>

        <div className="mt-4 bg-black/20 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${diseaseStats.healthPercent >= 80 ? 'bg-green-400' : diseaseStats.healthPercent >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
            style={{ width: `${diseaseStats.healthPercent}%` }}
          ></div>
        </div>
      </Card>

      {/* Active Diseases Alert */}
      {diseaseStats.totalDiseased > 0 && (
        <Card className="p-4 bg-red-50 border-l-4 border-l-red-500 shadow-sm animate-pulse-soft">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-red-800 text-lg mb-1">
                ⚠️ Outbreak Detected!
              </div>
              <div className="text-sm text-red-700 mb-3 font-medium">
                {diseaseStats.totalDiseased} plot{diseaseStats.totalDiseased > 1 ? 's' : ''} are currently infected. Treat immediately to prevent spread!
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(diseaseStats.diseaseTypes).map(([diseaseId, count]) => {
                  const disease = DISEASE_TYPES[diseaseId];
                  return disease ? (
                    <Badge key={diseaseId} className="bg-red-200 text-red-800 hover:bg-red-300 border-0">
                      {disease.emoji} {disease.name}: {count}
                    </Badge>
                  ) : null;
                })}
              </div>

              <Button
                onClick={handleCureAll}
                className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
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
        <Card className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-bold text-green-800">Barn Active protection provided</span>
          </div>
          <Badge className="bg-green-500 hover:bg-green-600 text-white">50% Resistance</Badge>
        </Card>
      )}

      {/* Cure Items Shop */}
      <Card className="p-5 border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><Droplet className="w-4 h-4" /></span>
          Treatment Center
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(CURE_ITEMS).map((cureItem) => {
            const canAfford = state.coins >= cureItem.cost;
            const hasMatchingDisease = state.plots.some(plot =>
              plot.disease && cureItem.cures.includes(plot.disease)
            );
            const isUniversal = cureItem.id === 'universal_cure';

            return (
              <Card
                key={cureItem.id}
                className={`p-4 border transition-all hover:shadow-md ${hasMatchingDisease && canAfford
                  ? 'border-green-400 bg-green-50/50 ring-1 ring-green-200'
                  : isUniversal
                    ? 'border-purple-200 bg-purple-50/30'
                    : 'border-gray-200'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="text-4xl filter drop-shadow-sm">{cureItem.emoji}</div>
                  <Badge variant="outline" className="font-mono font-bold bg-white">
                    {cureItem.cost}🪙
                  </Badge>
                </div>

                <div className="font-bold text-gray-800 mb-1">{cureItem.name}</div>
                <p className="text-xs text-gray-500 mb-3 min-h-[32px]">{cureItem.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {cureItem.cures.map(diseaseId => {
                    const disease = DISEASE_TYPES[diseaseId];
                    return disease ? (
                      <span key={diseaseId} className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                        {disease.emoji} {disease.name}
                      </span>
                    ) : null;
                  })}
                </div>

                <Button
                  onClick={() => isUniversal ? handleCureAll() : handleApplyCure(cureItem.id)}
                  size="sm"
                  disabled={!canAfford || (!hasMatchingDisease && !isUniversal)}
                  className={`w-full font-bold ${canAfford && hasMatchingDisease ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' : ''}`}
                >
                  {!canAfford
                    ? 'Insufficient Funds'
                    : !hasMatchingDisease && !isUniversal
                      ? 'No Infection'
                      : isUniversal
                        ? '✨ Perfect Cure'
                        : '💊 Apply Treatment'
                  }
                </Button>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Disease Encyclopedia Grid */}
      <Card className="p-5 border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-800 mb-4">📚 Disease Encyclopedia</h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.values(DISEASE_TYPES).map((disease) => {
            const activeCount = diseaseStats.diseaseTypes[disease.id] || 0;

            return (
              <div
                key={disease.id}
                className={`
                    p-3 rounded-xl border relative overflow-hidden group hover:shadow-md transition-all
                    ${activeCount > 0 ? 'bg-red-50 border-red-300 ring-1 ring-red-200' : 'bg-white border-gray-200'}
                `}
              >
                {activeCount > 0 && (
                  <div className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </div>
                )}

                <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform">{disease.emoji}</div>
                <div className="font-bold text-gray-800 text-sm mb-1">{disease.name}</div>
                <div className="text-[10px] text-gray-500 leading-tight mb-2 h-8 overflow-hidden">{disease.description}</div>

                <div className="grid grid-cols-2 gap-1 text-[10px] bg-gray-50 p-1.5 rounded-lg">
                  <div className="text-center">
                    <div className="text-gray-400 uppercase tracking-tighter">Spread</div>
                    <div className="font-bold text-gray-700">{Math.round(disease.spreadChance * 100)}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 uppercase tracking-tighter">Loss</div>
                    <div className="font-bold text-red-600">-{Math.round(disease.yieldPenalty * 100)}%</div>
                  </div>
                </div>
              </div>
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

