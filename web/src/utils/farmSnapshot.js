export const SNAPSHOT_VERSION = 1;

const compactPlot = (plot) => ({
  state: plot?.state || 'empty',
  cropId: plot?.crop?.id || null,
  growthStage: Number.isFinite(plot?.growthStage) ? plot.growthStage : 0,
  decorationId: plot?.decorationId || null,
});

export const exportFarmSnapshot = (state) => ({
  version: SNAPSHOT_VERSION,
  farmName: state.farmName || 'Farm',
  farmTheme: state.farmTheme || 'meadow',
  season: state.season?.current || 'spring',
  dayCount: Number(state.almanac?.counters?.dayCount || 0),
  activeFarmTitle: state.cozyExpansion?.farmTitles?.activeId || 'home_grower',
  spotlight: state.spotlight || null,
  plots: (state.plots || []).map(compactPlot),
});

export const validateSnapshotPayload = (payload = {}) => {
  const errors = [];
  const warnings = [];
  if (!payload || typeof payload !== 'object') errors.push('Snapshot missing.');
  if (!Array.isArray(payload.plots)) errors.push('Snapshot plots missing.');
  if (payload.version !== SNAPSHOT_VERSION)
    warnings.push('Snapshot version differs; best-effort import applied.');
  return { ok: errors.length === 0, errors, warnings };
};

export const hydrateSnapshotPlots = (plots = []) =>
  plots.map((plot, index) => ({
    id: index,
    state: plot?.state || 'empty',
    crop: plot?.cropId
      ? { id: plot.cropId, name: plot.cropId, emoji: '🌱', growthTime: 10, stages: 3 }
      : null,
    decorationId: typeof plot?.decorationId === 'string' ? plot.decorationId : null,
    growthStage: Number.isFinite(plot?.growthStage) ? plot.growthStage : 0,
    waterLevel: 100,
    soilFertility: 1,
    progress: plot?.state === 'ready' ? 1 : 0,
  }));
