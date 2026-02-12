/**
 * BuildingIndicators Component
 * Shows owned buildings with their active effects
 */
import React, { memo } from 'react';
import { BUILDINGS } from '../../data/buildings';

function BuildingIndicatorsComponent({ buildings = [] }) {
  if (buildings.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {buildings.map((buildingId) => {
        const building = BUILDINGS[buildingId];
        if (!building) return null;

        return (
          <div
            key={buildingId}
            className="
              flex items-center gap-1.5 px-3 py-1.5
              bg-white/80 backdrop-blur-sm rounded-full
              border border-gray-200 shadow-sm
              text-xs font-medium
            "
            title={building.description}
          >
            <span className="text-base">{building.emoji}</span>
            <span className="text-gray-700">{building.shortEffect || building.effect}</span>
          </div>
        );
      })}
    </div>
  );
}

export const BuildingIndicators = memo(BuildingIndicatorsComponent);
