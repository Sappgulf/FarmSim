import React, { memo } from 'react';
import { Card } from '../../../../ui/card';
import { Button } from '../../../../ui/button';

export const SaveLoadSettings = memo(({
    handleSaveGame,
    handleLoadGame,
    handleExportSave,
    handleImportSave,
    handleClearCache,
    handleResetGame
}) => {
    return (
        <Card className="p-4">
            <h4 className="font-semibold mb-3">💾 Save & Load</h4>

            <div className="space-y-2">
                <Button
                    onClick={handleSaveGame}
                    className="w-full"
                    variant="outline"
                >
                    💾 Save Game
                </Button>

                <Button
                    onClick={handleLoadGame}
                    className="w-full"
                    variant="outline"
                >
                    📂 Load Game
                </Button>

                <Button
                    onClick={handleExportSave}
                    className="w-full"
                    variant="outline"
                >
                    📤 Export Save File
                </Button>

                <Button
                    onClick={handleImportSave}
                    className="w-full"
                    variant="outline"
                >
                    📥 Import Save File
                </Button>

                <div className="pt-2 border-t">
                    <Button
                        onClick={handleClearCache}
                        className="w-full"
                        variant="outline"
                    >
                        🗑️ Clear Cache
                    </Button>

                    <Button
                        onClick={handleResetGame}
                        className="w-full bg-red-600 hover:bg-red-700 text-white mt-2"
                        variant="destructive"
                    >
                        🔄 Reset Farm (Delete All Data)
                    </Button>
                </div>
            </div>
        </Card>
    );
});

SaveLoadSettings.displayName = 'SaveLoadSettings';
