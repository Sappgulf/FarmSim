/**
 * GameLauncher
 * Simple mode selector to access both FarmSim (full) and Cozy Path B.
 */
import React, { memo } from 'react';
import { Button } from './ui/button';

function GameLauncherComponent({ onSelect }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white/90 backdrop-blur border-2 border-emerald-100 rounded-2xl shadow-lg p-6 space-y-4">
        <div className="text-center space-y-1">
          <div className="text-2xl">🌿</div>
          <h1 className="text-xl font-bold text-gray-800">Choose Your Farm</h1>
          <p className="text-sm text-gray-600">
            Both modes are available. You can switch anytime by adding <span className="font-mono">?mode=select</span> to the URL.
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
            <div className="text-sm font-semibold text-gray-800">Cozy Sim (Path B)</div>
            <div className="text-xs text-gray-600">Story Dashboard, scrapbook chapters, mood & wishes.</div>
            <Button className="mt-3 w-full" onClick={() => onSelect?.('cozy')}>Play Cozy Sim</Button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="text-sm font-semibold text-gray-800">Full FarmSim</div>
            <div className="text-xs text-gray-600">Expanded systems, tabs, and deep progression.</div>
            <Button variant="outline" className="mt-3 w-full" onClick={() => onSelect?.('full')}>Play Full Sim</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const GameLauncher = memo(GameLauncherComponent);
