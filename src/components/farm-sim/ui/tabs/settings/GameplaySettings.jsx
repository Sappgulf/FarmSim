import React, { memo } from 'react';
import { Card } from '../../../../ui/card';

export const GameplaySettings = memo(({
    state,
    actions,
    handleToggleAnimations,
    handleToggleAutoSave
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
                ${state.settings.autoSave ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${state.settings.autoSave ? 'translate-x-6' : 'translate-x-1'}
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
                ${state.settings.animationsEnabled ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${state.settings.animationsEnabled ? 'translate-x-6' : 'translate-x-1'}
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
                            onClick={() => actions.updateSettings({
                                showFPS: !state.settings.showFPS
                            })}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${state.settings.showFPS ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${state.settings.showFPS ? 'translate-x-6' : 'translate-x-1'}
                `}
                            />
                        </button>
                    </div>

                    {/* Reduced Motion */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                            <div className="font-medium">Reduced Effects / Motion</div>
                            <div className="text-sm text-gray-600">Minimize ambient and lighting effects</div>
                        </div>
                        <button
                            onClick={() => actions.updateSettings({
                                reducedMotion: !state.settings.reducedMotion
                            })}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                ${state.settings.reducedMotion ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${state.settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'}
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
                            onClick={() => actions.updateSettings({
                                showTooltips: !state.settings.showTooltips
                            })}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${(state.settings.showTooltips !== false) ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${(state.settings.showTooltips !== false) ? 'translate-x-6' : 'translate-x-1'}
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
                            onClick={() => actions.updateSettings({
                                fastMode: !state.settings.fastMode
                            })}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${state.settings.fastMode ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${state.settings.fastMode ? 'translate-x-6' : 'translate-x-1'}
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
                            onClick={() => actions.updateSettings({
                                particleEffects: !state.settings.particleEffects
                            })}
                            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${(state.settings.particleEffects !== false) ? 'bg-green-600' : 'bg-gray-300'}
              `}
                        >
                            <span
                                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${(state.settings.particleEffects !== false) ? 'translate-x-6' : 'translate-x-1'}
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
