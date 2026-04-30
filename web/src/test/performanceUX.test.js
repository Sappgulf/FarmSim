import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  clearAdaptiveParticlePersistence,
  duplicatePerfPreset,
  handleAdaptiveQuality,
  normalizeGraphicsQuality,
  perfConfig,
  QUALITY_PRESETS,
  restoreAdaptiveParticleOverlayIfMatching,
  setQualityPreset,
} from '../performance.js';

describe('performance module', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    clearAdaptiveParticlePersistence();
    setQualityPreset('high');
  });

  it('duplicatePerfPreset clones nested fields without aliasing presets', () => {
    const copy = duplicatePerfPreset(QUALITY_PRESETS.low);
    copy.particles.maxCount = 9999;
    expect(QUALITY_PRESETS.low.particles.maxCount).toBe(30);
  });

  it('normalizeGraphicsQuality defaults invalid values to high', () => {
    expect(normalizeGraphicsQuality(null)).toBe('high');
    expect(normalizeGraphicsQuality('medium')).toBe('medium');
  });

  it('handleAdaptiveQuality reduces budgets and persists when FPS is low', () => {
    const logSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const changed = handleAdaptiveQuality(10);
    expect(changed).toBe(true);
    expect(perfConfig.particles.maxCount).toBeLessThan(150);

    const raw = localStorage.getItem('farm.perf.adaptiveOverlay.v1');
    expect(raw).toBeTruthy();
    const snap = JSON.parse(String(raw));
    expect(snap.quality).toBe('high');
    expect(Number(snap.particles?.maxCount)).toBe(perfConfig.particles.maxCount);
    logSpy.mockRestore();
  });

  it('restoreAdaptiveParticleOverlayIfMatching reapplies trims for same preset', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    handleAdaptiveQuality(12);
    const lowered = perfConfig.particles.maxCount;
    expect(lowered).toBeLessThan(150);

    setQualityPreset('high');
    expect(perfConfig.particles.maxCount).toBe(150);

    const restored = restoreAdaptiveParticleOverlayIfMatching('high');
    expect(restored).toBe(true);
    expect(perfConfig.particles.maxCount).toBe(lowered);
  });

  it('restoreAdaptiveParticleOverlayIfMatching rejects mismatched preset tag', () => {
    handleAdaptiveQuality(15);
    setQualityPreset('medium');
    const ok = restoreAdaptiveParticleOverlayIfMatching('medium');
    expect(ok).toBe(false);
    expect(perfConfig.particles.maxCount).toBe(75);
  });
});
