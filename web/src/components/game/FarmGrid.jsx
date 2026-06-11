/**
 * FarmGrid Component
 * The main farm plot grid display
 */
import React, { memo, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { PlotTile } from './PlotTile';

function FarmGridComponent({
  gridSize,
  plots,
  getPlotStatus,
  onPlant,
  onHarvest,
  onWater,
  onTreatPest,
  onTreatDisease,
  onFertilize,
  onHarvestAll,
  disabled = false,
}) {
  // Calculate grid layout
  const gridStyle = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
      gap: '0.5rem',
    }),
    [gridSize]
  );

  // Count ready crops
  const readyCrops = useMemo(() => {
    return plots.reduce((count, _, index) => {
      const { status } = getPlotStatus(index);
      return count + (status === 'ready' ? 1 : 0);
    }, 0);
  }, [plots, getPlotStatus]);

  // Render plots
  const plotElements = useMemo(() => {
    return plots.map((plot, index) => {
      const { status, progress, stage, cropData } = getPlotStatus(index);

      return (
        <PlotTile
          key={index}
          index={index}
          plot={plot}
          cropData={cropData}
          status={status}
          progress={progress}
          stage={stage}
          onPlant={onPlant}
          onHarvest={onHarvest}
          onWater={onWater}
          onTreatPest={onTreatPest}
          onTreatDisease={onTreatDisease}
          onFertilize={onFertilize}
          disabled={disabled}
        />
      );
    });
  }, [
    plots,
    getPlotStatus,
    onPlant,
    onHarvest,
    onWater,
    onTreatPest,
    onTreatDisease,
    onFertilize,
    disabled,
  ]);

  return (
    <div className="space-y-3">
      {/* Quick action bar */}
      {readyCrops > 0 && (
        <div className="flex justify-center">
          <button
            onClick={onHarvestAll}
            disabled={disabled}
            className="
              flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-gradient-to-r from-emerald-500 to-green-600 text-white
              font-semibold shadow-lg shadow-emerald-500/30
              hover:from-emerald-600 hover:to-green-700
              active:scale-[0.98] transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              touch-manipulation min-h-[44px]
            "
          >
            <Sparkles size={18} />
            Harvest All ({readyCrops})
          </button>
        </div>
      )}

      {/* Farm grid */}
      <div
        id="farm-grid"
        className="farm-grid bg-gradient-to-br from-amber-50 to-green-50 rounded-xl p-3 sm:p-4 border-2 border-amber-200 shadow-inner"
        style={gridStyle}
      >
        {plotElements}
      </div>
    </div>
  );
}

export const FarmGrid = memo(FarmGridComponent);
