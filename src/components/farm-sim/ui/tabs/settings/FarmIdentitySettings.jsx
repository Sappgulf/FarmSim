import React, { memo, useState, useCallback } from 'react';
import { Card } from '../../../../ui/card';
import { Button } from '../../../../ui/button';
import { THEME_PALETTES } from '../../../context/GamePersistence';

export const FarmIdentitySettings = memo(({
    state,
    actions
}) => {
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(state.farmName || 'My Farm');

    const handleNameSave = useCallback(() => {
        const trimmedName = nameInput.trim();
        if (trimmedName && trimmedName !== state.farmName) {
            actions.setFarmName(trimmedName);
            actions.addNotification({
                message: `Farm renamed to "${trimmedName}"`,
                type: 'success'
            });
        }
        setEditingName(false);
    }, [nameInput, state.farmName, actions]);

    const handleNameKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            handleNameSave();
        } else if (e.key === 'Escape') {
            setNameInput(state.farmName || 'My Farm');
            setEditingName(false);
        }
    }, [handleNameSave, state.farmName]);

    const handleThemeChange = useCallback((themeId) => {
        actions.setTheme(themeId);
        actions.addNotification({
            message: `Theme changed to ${THEME_PALETTES[themeId]?.name || 'Classic Farm'}`,
            type: 'success'
        });
    }, [actions]);

    const currentTheme = THEME_PALETTES[state.theme] || THEME_PALETTES.default;

    return (
        <>
            {/* Farm Name */}
            <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50">
                <h4 className="font-semibold mb-3">🏡 Farm Identity</h4>

                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded">
                        <div className="flex-1">
                            <div className="font-medium">Farm Name</div>
                            <div className="text-sm text-gray-600">Displayed on Town Board</div>
                        </div>
                        {editingName ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    onKeyDown={handleNameKeyDown}
                                    onBlur={handleNameSave}
                                    maxLength={30}
                                    autoFocus
                                    className="px-2 py-1 border rounded text-sm w-32 focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    placeholder="Farm name..."
                                />
                                <Button
                                    onClick={handleNameSave}
                                    size="sm"
                                    className="bg-amber-500 hover:bg-amber-600"
                                >
                                    Save
                                </Button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setNameInput(state.farmName || 'My Farm');
                                    setEditingName(true);
                                }}
                                className="px-3 py-1 bg-amber-100 hover:bg-amber-200 rounded text-amber-800 font-medium text-sm transition-colors"
                            >
                                {state.farmName || 'My Farm'} ✏️
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Theme Palettes */}
            <Card className="p-4 bg-gradient-to-r from-violet-50 to-purple-50">
                <h4 className="font-semibold mb-3">🎨 Theme Palette</h4>
                <p className="text-sm text-gray-600 mb-3">Choose a cozy color theme for your farm</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.values(THEME_PALETTES).map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id)}
                            className={`
                                p-3 rounded-lg border-2 transition-all text-left
                                ${state.theme === theme.id
                                    ? 'border-purple-500 bg-purple-50 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25'
                                }
                            `}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{theme.emoji}</span>
                                <span className="font-medium text-sm">{theme.name}</span>
                            </div>
                            <div className="flex gap-1">
                                <span
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: theme.primary }}
                                />
                                <span
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: theme.accent }}
                                />
                            </div>
                            {state.theme === theme.id && (
                                <div className="text-xs text-purple-600 mt-1">Active</div>
                            )}
                        </button>
                    ))}
                </div>
            </Card>
        </>
    );
});

FarmIdentitySettings.displayName = 'FarmIdentitySettings';
