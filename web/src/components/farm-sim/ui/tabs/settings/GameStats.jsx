import React, { memo } from 'react';
import { useGameSelector } from '../../../context/GameContext';
import { Card } from '../../../../ui/card';
import { APP_VERSION, getReleaseModeLabel } from '../../../../../config/release';

export const GameStats = memo(() => {
    const level = useGameSelector((state) => state.level || 1);
    const coins = useGameSelector((state) => state.coins || 0);
    const xp = useGameSelector((state) => state.xp || 0);
    const gridSize = useGameSelector((state) => state.gridSize || 3);
    const animalCount = useGameSelector((state) => state.livestock?.animals?.length || 0);
    const fishCaught = useGameSelector((state) => state.fishing?.stats?.totalCaught || 0);
    const season = useGameSelector((state) => state.season?.current || 'spring');
    const weather = useGameSelector((state) => state.weather || 'sunny');

    return (
        <Card className="p-4 bg-gray-50">
            <h4 className="font-semibold mb-3">📊 Game Statistics</h4>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-green-600">{level}</div>
                    <div className="text-gray-600">Farm Level</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-yellow-600">{coins}🪙</div>
                    <div className="text-gray-600">Total Coins</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-blue-600">{xp} XP</div>
                    <div className="text-gray-600">Experience</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-purple-600">{gridSize}×{gridSize}</div>
                    <div className="text-gray-600">Farm Size</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-amber-600">{animalCount}</div>
                    <div className="text-gray-600">Animals</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-cyan-600">{fishCaught}</div>
                    <div className="text-gray-600">Fish Caught</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-pink-600">{season}</div>
                    <div className="text-gray-600 capitalize">Current Season</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                    <div className="font-bold text-gray-600">{weather}</div>
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
