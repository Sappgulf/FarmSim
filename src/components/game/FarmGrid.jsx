/**
 * FarmGrid Component
 * The main farm plot grid display
 */
import React, { memo, useMemo } from 'react';
import { PlotTile } from './PlotTile';

function FarmGridComponent({
  gridSize,
  plots,
  getPlotStatus,
  getCropData,
  onPlant,
  onHarvest,
  onWater,
  onTreatPest,
  onTreatDisease,
  onFertilize,
  disabled = false,
}) {
  // Calculate grid layout
  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
    gap: '0.5rem',
  }), [gridSize]);

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
  }, [plots, getPlotStatus, onPlant, onHarvest, onWater, onTreatPest, onTreatDisease, onFertilize, disabled]);

  return (
    <div
      id="farm-grid"
      className="farm-grid bg-gradient-to-br from-amber-50 to-green-50 rounded-xl p-3 sm:p-4 border-2 border-amber-200 shadow-inner"
      style={gridStyle}
    >
      {plotElements}
    </div>
  );
}

export const FarmGrid = memo(FarmGridComponent);
