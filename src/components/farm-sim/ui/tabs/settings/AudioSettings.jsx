import React, { memo } from 'react';
import { Card } from '../../../../ui/card';

export const AudioSettings = memo(({
    soundEnabled,
    musicEnabled,
    handleToggleSound,
    handleToggleMusic,
    handleSoundVolumeChange,
    handleMusicVolumeChange,
    soundVolume,
    musicVolume
}) => {
    return (
        <>
            <Card className="p-4">
                <h4 className="font-semibold mb-3">🎛️ Audio Settings</h4>

                <div className="space-y-3">
                    {/* Sound Toggle */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div className="font-medium">Sound Effects</div>
                            <div className="text-sm text-gray-600">Enable game sounds</div>
                        </div>
                        <button
                            onClick={handleToggleSound}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${soundEnabled ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>

                    {/* Music Toggle */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div className="font-medium">Background Music</div>
                            <div className="text-sm text-gray-600">Seasonal music themes</div>
                        </div>
                        <button
                            onClick={handleToggleMusic}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${musicEnabled ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${musicEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <h4 className="font-semibold mb-3">🔊 Volume Controls</h4>

                <div className="space-y-4">
                    {/* Sound Volume */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Sound Effects Volume</span>
                            <span className="text-gray-600">{Math.round(soundVolume * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={soundVolume}
                            onChange={handleSoundVolumeChange}
                            disabled={!soundEnabled}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>

                    {/* Music Volume */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Music Volume</span>
                            <span className="text-gray-600">{Math.round(musicVolume * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="0.5"
                            step="0.025"
                            value={musicVolume}
                            onChange={handleMusicVolumeChange}
                            disabled={!musicEnabled}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="text-xs text-gray-500">
                            🎵 Music theme changes with seasons
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );
});

AudioSettings.displayName = 'AudioSettings';
