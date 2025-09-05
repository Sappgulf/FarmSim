import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

/**
 * Farm Grid Component
 * Renders the main farming plots with interactive functionality
 */
export function FarmGrid({ 
  plots, 
  gridSize, 
  selectedSeed,
  onPlotClick,
  onPlotRightClick,
  animationsEnabled = true 
}) {
  const getPlotEmoji = (plot) => {
    switch (plot.state) {
      case "empty": return "⬜";
      case "planted": return "🌱";
      case "growing": return "🌿";
      case "ready": return plot.seed?.emoji || "🌾";
      case "withered": return "🥀";
      default: return "⬜";
    }
  };

  const getPlotColor = (plot) => {
    switch (plot.state) {
      case "empty": return "bg-amber-100 border-amber-300";
      case "planted": return "bg-green-100 border-green-300";
      case "growing": return "bg-green-200 border-green-400";
      case "ready": return "bg-yellow-200 border-yellow-400 shadow-md";
      case "withered": return "bg-red-100 border-red-300";
      default: return "bg-gray-100 border-gray-300";
    }
  };

  const getPlotAnimations = (plot) => {
    if (!animationsEnabled) return "";
    
    let animations = "transition-all duration-300 hover:scale-105";
    
    if (plot.state === "ready") {
      animations += " animate-pulse";
    } else if (plot.state === "growing") {
      animations += " hover:shadow-lg";
    }
    
    return animations;
  };

  const getPlotStatus = (plot) => {
    const status = [];
    
    if (plot.fertilizedAt > 0) status.push("💊");
    if (plot.wateredAt > 0) status.push("💧");
    if (plot.pesticideAt > 0) status.push("🧪");
    if (plot.disease) status.push("🦠");
    
    return status;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          🚜 Farm Grid
          <Badge variant="secondary">{gridSize}×{gridSize}</Badge>
        </h2>
        <div className="text-sm text-slate-600">
          Selected: {selectedSeed} 
        </div>
      </div>
      
      <div 
        className="grid gap-2 mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          maxWidth: `${gridSize * 70}px`
        }}
      >
        {plots.slice(0, gridSize * gridSize).map((plot, index) => (
          <div
            key={plot.id || index}
            className={`
              relative w-16 h-16 border-2 rounded-lg cursor-pointer
              flex items-center justify-center text-2xl
              ${getPlotColor(plot)}
              ${getPlotAnimations(plot)}
            `}
            onClick={() => onPlotClick(index)}
            onContextMenu={(e) => {
              e.preventDefault();
              onPlotRightClick(index);
            }}
            title={`Plot ${index + 1}: ${plot.state}${plot.seed ? ` (${plot.seed.name})` : ''}`}
          >
            {/* Main plot emoji */}
            <span className="text-2xl">
              {getPlotEmoji(plot)}
            </span>
            
            {/* Progress indicator */}
            {plot.state === "growing" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b">
                <div 
                  className="h-full bg-green-500 rounded-b transition-all duration-500"
                  style={{ width: `${plot.progress}%` }}
                />
              </div>
            )}
            
            {/* Status indicators */}
            {getPlotStatus(plot).length > 0 && (
              <div className="absolute -top-1 -right-1 flex gap-0.5">
                {getPlotStatus(plot).map((status, i) => (
                  <span key={i} className="text-xs">
                    {status}
                  </span>
                ))}
              </div>
            )}
            
            {/* Ready indicator */}
            {plot.state === "ready" && (
              <div className="absolute inset-0 rounded-lg border-2 border-yellow-400 animate-pulse" />
            )}
          </div>
        ))}
      </div>
      
      {/* Grid expansion controls */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {/* TODO: Implement grid size change */}}
          disabled={gridSize <= 3}
        >
          Smaller
        </Button>
        <span className="text-sm text-slate-600 px-2">
          {gridSize * gridSize} plots
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {/* TODO: Implement grid size change */}}
          disabled={gridSize >= 5}
        >
          Larger
        </Button>
      </div>
    </div>
  );
}
