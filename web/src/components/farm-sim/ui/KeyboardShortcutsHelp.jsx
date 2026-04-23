import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/button';

const CATEGORIES = [
  {
    name: 'Navigation',
    items: [
      { keys: ['1 – 9'], desc: 'Switch tabs' },
      { keys: ['?'], desc: 'Open this cheat sheet' },
    ],
  },
  {
    name: 'Actions',
    items: [
      { keys: ['W'], desc: 'Water all plots' },
      { keys: ['H'], desc: 'Harvest all ready crops' },
      { keys: ['F'], desc: 'Fertilize all plots' },
      { keys: ['T'], desc: 'Treat diseases' },
      { keys: ['Shift + Click'], desc: 'Select multiple plots' },
    ],
  },
  {
    name: 'System',
    items: [
      { keys: ['Space'], desc: 'Pause / Resume game' },
      { keys: ['Ctrl + S'], desc: 'Quick save' },
      { keys: ['Esc'], desc: 'Close modals / this sheet' },
    ],
  },
];

export default function KeyboardShortcutsHelp({ open, onClose }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="relative w-full max-w-lg rounded-[28px] border border-slate-700/60 bg-slate-900/90 backdrop-blur-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-100">Keyboard Shortcuts</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon-sm"
            className="text-slate-400 hover:text-slate-100"
            aria-label="Close shortcuts"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-5">
          {CATEGORIES.map((cat) => (
            <div key={cat.name}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                {cat.name}
              </h3>
              <div className="grid gap-2">
                {cat.items.map((item) => (
                  <div
                    key={item.desc}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-slate-300">{item.desc}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, i) => (
                        <React.Fragment key={k}>
                          <kbd className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-mono font-bold text-slate-200 shadow-sm">
                            {k}
                          </kbd>
                          {i < item.keys.length - 1 && (
                            <span className="text-slate-500 text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
          <p className="text-xs text-slate-500">
            Press{' '}
            <kbd className="px-1.5 py-0.5 rounded border border-slate-600 bg-slate-800 text-slate-300 text-[10px] font-mono">
              ?
            </kbd>{' '}
            anytime to reopen this sheet.
          </p>
        </div>
      </div>
    </div>
  );
}
