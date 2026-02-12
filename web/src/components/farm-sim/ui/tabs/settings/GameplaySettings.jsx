import React, { memo } from 'react';
import { Card } from '../../../../ui/card';

export const GameplaySettings = memo(({
    autoSaveEnabled,
    animationsEnabled,
    showFPS,
    reducedMotion,
    showTooltips,
    showAlmanacHints,
    showWelcomeBackSummary,
    fastMode,
    particleEffects,
    handleToggleAnimations,
    handleToggleAutoSave,
    handleToggleShowFps,
    handleToggleReducedMotion,
    handleToggleTooltips,
    handleToggleAlmanacHints,
    handleToggleWelcomeBackSummary,
    handleToggleFastMode,
    handleToggleParticleEffects
}) => {
    return (
        <>
            <Card className="p-4">
                <h4 className="font-semibold mb-3">🎛️ Preferences</h4>

                <div className="space-y-3">
                    {/* Auto-save */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div className="font-medium">Auto-Save</div>
                            <div className="text-sm text-gray-600">Save every 30 seconds</div>
                        </div>
                        <button
                            onClick={handleToggleAutoSave}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${autoSaveEnabled ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${autoSaveEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>

                    {/* Animations */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div className="font-medium">Animations</div>
                            <div className="text-sm text-gray-600">Enable UI animations</div>
                        </div>
                        <button
                            onClick={handleToggleAnimations}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${animationsEnabled ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${animationsEnabled ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>

                    {/* FPS Overlay */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div className="font-medium">Show FPS Overlay</div>
                            <div className="text-sm text-gray-600">Display performance stats</div>
                        </div>
                        <button
                            onClick={handleToggleShowFps}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${showFPS ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${showFPS ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>

                    {/* Reduced Motion */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div className="font-medium">Reduced Motion</div>
                            <div className="text-sm text-gray-600">Disable heavy animations</div>
                        </div>
                        <button
                            onClick={handleToggleReducedMotion}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                ${reducedMotion ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${reducedMotion ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>
                </div>
            </Card>

            {/* Gameplay Settings */}
            <Card className="p-4">
                <h4 className="font-semibold mb-3">🎮 Gameplay Settings</h4>

                <div className="space-y-3">
                    {/* Show Tutorial */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div className="font-medium">Show Tooltips</div>
                            <div className="text-sm text-gray-600">Display helpful hints</div>
                        </div>
                        <button
                            onClick={handleToggleTooltips}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${showTooltips ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${showTooltips ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>

                    {/* Almanac Hints */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div className="font-medium">Almanac Hints</div>
                            <div className="text-sm text-gray-600">Show locked page hints</div>
                        </div>
                        <button
                            onClick={handleToggleAlmanacHints}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${showAlmanacHints ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${showAlmanacHints ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>

                    {/* Welcome Back Summary */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div className="font-medium">Welcome Back Summary</div>
                            <div className="text-sm text-gray-600">Show return recap on the Town Board</div>
                        </div>
                        <button
                            onClick={handleToggleWelcomeBackSummary}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${showWelcomeBackSummary ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${showWelcomeBackSummary ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>

                    {/* Fast Mode */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div className="font-medium">Fast Mode</div>
                            <div className="text-sm text-gray-600">2x growth speed (for testing)</div>
                        </div>
                        <button
                            onClick={handleToggleFastMode}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${fastMode ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${fastMode ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>

                    {/* Particle Effects */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div className="font-medium">Particle Effects</div>
                            <div className="text-sm text-gray-600">Show harvest & level-up particles</div>
                        </div>
                        <button
                            onClick={handleToggleParticleEffects}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${particleEffects ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${particleEffects ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>
                </div>
            </Card>
        </>
    );
});

GameplaySettings.displayName = 'GameplaySettings';
