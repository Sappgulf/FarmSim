import type { CropKey, FarmState, PlotState } from './data'

export function plotList(state: FarmState): PlotState[] {
  return Object.values(state.plots).sort((left, right) => left.id - right.id)
}

export function selectedPlotIds(state: FarmState): number[] {
  return state.selectedPlotIds
}

export function plantedPlots(state: FarmState): PlotState[] {
  return plotList(state).filter((plot) => plot.crop !== null)
}

export function plantedPlotIds(state: FarmState): number[] {
  return plantedPlots(state).map((plot) => plot.id)
}

export function wateredPlotIds(state: FarmState): number[] {
  return plantedPlots(state).filter((plot) => plot.watered).map((plot) => plot.id)
}

export function readyPlotIds(state: FarmState): number[] {
  return plantedPlots(state).filter((plot) => plot.ready).map((plot) => plot.id)
}

export function plantedCrop(state: FarmState): CropKey | null {
  return plantedPlots(state)[0]?.crop ?? null
}

export function growthDays(state: FarmState): number {
  return plantedPlots(state)[0]?.growthDays ?? 0
}
