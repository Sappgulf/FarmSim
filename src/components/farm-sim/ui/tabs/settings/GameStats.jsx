import React, { memo } from 'react';
import { Card } from '../../../../ui/card';
import { APP_VERSION, getReleaseModeLabel } from '../../../../../config/release';

export const GameStats = memo(({ state }) => {
    return (
        <Card className="p-4 bg-gray-50">
            <h4 className="font-semibold mb-3">📊 Game Statistics</h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-green-600">{state.level}</div>
                    <div className="text-gray-600">Farm Level</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-yellow-600">{state.coins}🪙</div>
                    <div className="text-gray-600">Total Coins</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-blue-600">{state.xp} XP</div>
                    <div className="text-gray-600">Experience</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-purple-600">{state.gridSize}×{state.gridSize}</div>
                    <div className="text-gray-600">Farm Size</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-amber-600">{state.livestock?.animals?.length || 0}</div>
                    <div className="text-gray-600">Animals</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-cyan-600">{state.fishing?.stats?.totalCaught || 0}</div>
                    <div className="text-gray-600">Fish Caught</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-pink-600">{state.season?.current || 'spring'}</div>
                    <div className="text-gray-600 capitalize">Current Season</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-gray-600">{state.weather || 'sunny'}</div>
                    <div className="text-gray-600 capitalize">Weather</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-emerald-600">{APP_VERSION}</div>
                    <div className="text-gray-600">App Version</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-slate-600">{getReleaseModeLabel()}</div>
                    <div className="text-gray-600 capitalize">Release Mode</div>
                </div>
            </div>
        </Card>
    );
});

GameStats.displayName = 'GameStats';
