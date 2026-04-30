import React, { memo, useEffect, useMemo, useState } from 'react';
import { isDevelopmentMode } from '../../../config/release';
import { createLogger } from '../../../utils/logger';

const perfHudLog = createLogger('farm-perf');

const HUD_FLAG_KEY = 'farm.perf.hud';
const LOG_FLAG_KEY = 'farm.perf.log';

const readFlag = (key) => {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(key) === '1';
};

const writeFlag = (key, enabled) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, enabled ? '1' : '0');
};

const PerfHud = memo(() => {
  const [hudEnabled, setHudEnabled] = useState(() => readFlag(HUD_FLAG_KEY));
  const [logEnabled, setLogEnabled] = useState(() => readFlag(LOG_FLAG_KEY));
  const [snapshot, setSnapshot] = useState({ fps: 0, updateMs: 0, renderMs: 0 });

  useEffect(() => {
    if (!isDevelopmentMode()) return undefined;

    const onStorage = () => {
      setHudEnabled(readFlag(HUD_FLAG_KEY));
      setLogEnabled(readFlag(LOG_FLAG_KEY));
    };

    const onKeyDown = (event) => {
      if (!event.altKey || !event.shiftKey) return;
      if (event.code === 'KeyP') {
        const next = !readFlag(HUD_FLAG_KEY);
        writeFlag(HUD_FLAG_KEY, next);
        setHudEnabled(next);
      }
      if (event.code === 'KeyL') {
        const next = !readFlag(LOG_FLAG_KEY);
        writeFlag(LOG_FLAG_KEY, next);
        setLogEnabled(next);
      }
    };

    const syncInterval = setInterval(() => {
      const metrics = window.__farmPerfMetrics || {};
      const fps = Number(window.__currentFPS || metrics.avgFps || 0);
      const updateMs = Number(window.__lastUpdateTime || metrics.updateTime || 0);
      const renderMs = Number(metrics.renderTime || Math.max(0, (metrics.avgFrameTime || 0) - updateMs));
      const next = {
        fps: Number.isFinite(fps) ? fps : 0,
        updateMs: Number.isFinite(updateMs) ? updateMs : 0,
        renderMs: Number.isFinite(renderMs) ? renderMs : 0,
      };
      setSnapshot(next);
    }, 500);

    window.addEventListener('storage', onStorage);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isDevelopmentMode() || !logEnabled) return undefined;

    const logInterval = setInterval(() => {
      const payload = {
        fps: snapshot.fps,
        updateMs: Number(snapshot.updateMs.toFixed(2)),
        renderMs: Number(snapshot.renderMs.toFixed(2)),
        ts: new Date().toISOString(),
      };
      perfHudLog.debug('interval snapshot', payload);
    }, 5000);

    return () => clearInterval(logInterval);
  }, [logEnabled, snapshot]);

  const fpsColor = useMemo(() => {
    if (snapshot.fps >= 55) return 'text-green-300';
    if (snapshot.fps >= 30) return 'text-yellow-300';
    return 'text-red-300';
  }, [snapshot.fps]);

  if (!isDevelopmentMode() || !hudEnabled) return null;

  return (
    <div className="fixed bottom-2 left-2 z-50 rounded-lg border border-white/20 bg-black/70 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-sm pointer-events-none">
      <div className="font-semibold">Perf HUD</div>
      <div className={fpsColor}>FPS: {Math.round(snapshot.fps)}</div>
      <div>Tick: {snapshot.updateMs.toFixed(2)}ms</div>
      <div>Render: {snapshot.renderMs.toFixed(2)}ms</div>
      <div className="text-[10px] text-gray-300 mt-1">Alt+Shift+P HUD, Alt+Shift+L logs</div>
    </div>
  );
});

PerfHud.displayName = 'PerfHud';

export default PerfHud;
