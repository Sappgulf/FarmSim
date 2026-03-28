import React, { memo } from 'react';
import { Card } from '../../../../ui/card';
import { Button } from '../../../../ui/button';
import { Badge } from '../../../../ui/badge';

export const SaveLoadSettings = memo(({
  handleSaveGame,
  handleLoadGame,
  handleExportSave,
  handleImportSave,
  handleClearCache,
  handleResetGame
}) => {
  const actions = [
    { label: 'Save Game', icon: '💾', onClick: handleSaveGame, variant: 'outline' },
    { label: 'Load Game', icon: '📂', onClick: handleLoadGame, variant: 'outline' },
    { label: 'Export Save File', icon: '📤', onClick: handleExportSave, variant: 'outline' },
    { label: 'Import Save File', icon: '📥', onClick: handleImportSave, variant: 'outline' },
  ];

  return (
    <Card className="overflow-hidden border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-amber-50/30 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Save
          </div>
          <h4 className="text-base font-semibold text-slate-900">Save and load tools</h4>
        </div>
        <Badge variant="outline" className="bg-white/80 text-slate-600">
          Safe
        </Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            onClick={action.onClick}
            className="justify-start gap-2"
            variant={action.variant}
          >
            <span aria-hidden="true">{action.icon}</span>
            {action.label}
          </Button>
        ))}
        <div className="sm:col-span-2 border-t border-slate-200/80 pt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              onClick={handleClearCache}
              className="justify-start gap-2"
              variant="outline"
            >
              <span aria-hidden="true">🗑️</span>
              Clear Cache
            </Button>

            <Button
              onClick={handleResetGame}
              className="justify-start gap-2 bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-600"
              variant="destructive"
            >
              <span aria-hidden="true">🔄</span>
              Reset Farm
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
});

SaveLoadSettings.displayName = 'SaveLoadSettings';
