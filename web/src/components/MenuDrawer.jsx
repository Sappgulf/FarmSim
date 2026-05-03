/**
 * MenuDrawer Component
 * Slide-out drawer for settings, achievements, breeding, and other secondary actions
 */
import React, { memo, useEffect, useCallback } from 'react';
import {
  X,
  Settings,
  Trophy,
  Dna,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  Info,
  Moon,
  Sun,
  Accessibility,
  BookOpen,
} from 'lucide-react';
import { Button } from './ui/button';
import { LEVELS } from '../data/constants';

function MenuDrawerComponent({
  isOpen,
  onClose,
  // Settings
  soundEnabled,
  onToggleSound,
  reducedMotion,
  onToggleReducedMotion,
  // Game state
  coins,
  prestige,
  levelId,
  // Actions
  onStartLevel,
  onResetGame,
  onShowAchievements,
  onShowBreeding,
  onShowScrapbook,
  onShowStats,
  onShowHelp,
}) {
  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-xl
          transform transition-transform duration-300 ease-out
          flex flex-col safe-area-pr"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 id="menu-title" className="text-lg font-bold text-gray-900">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Actions */}
          <div className="p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>

            <MenuButton
              icon={Trophy}
              label="Achievements"
              sublabel="Track your progress"
              onClick={() => {
                onShowAchievements?.();
                onClose();
              }}
            />

            <MenuButton
              icon={Dna}
              label="Breeding Lab"
              sublabel="Create hybrid crops"
              onClick={() => {
                onShowBreeding?.();
                onClose();
              }}
            />

            <MenuButton
              icon={BookOpen}
              label="Scrapbook"
              sublabel="Memories & chapters"
              onClick={() => {
                onShowScrapbook?.();
                onClose();
              }}
            />
          </div>

          {/* Settings */}
          <div className="p-4 border-t space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Settings
            </h3>

            <ToggleButton
              icon={soundEnabled ? Volume2 : VolumeX}
              label="Sound Effects"
              enabled={soundEnabled}
              onToggle={onToggleSound}
            />

            <ToggleButton
              icon={Accessibility}
              label="Reduced Motion"
              enabled={reducedMotion}
              onToggle={onToggleReducedMotion}
            />
          </div>

          {/* Level Selection */}
          <div className="p-4 border-t">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Quick Start Level
            </h3>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((L) => (
                <button
                  key={L.id}
                  onClick={() => {
                    onStartLevel?.(L.id);
                    onClose();
                  }}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      levelId === L.id
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {L.id === 'endless' ? '♾️ Endless' : L.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Help */}
          <div className="p-4 border-t space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Help
            </h3>

            <MenuButton
              icon={HelpCircle}
              label="How to Play"
              sublabel="Tutorial & tips"
              onClick={() => {
                onShowHelp?.('basics');
                onClose();
              }}
            />

            <MenuButton
              icon={Info}
              label="About"
              sublabel="Version 5.0.0"
              onClick={() => {
                onShowHelp?.('about');
                onClose();
              }}
            />
          </div>

          {/* Danger Zone */}
          <div className="p-4 border-t">
            <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">
              Danger Zone
            </h3>
            <Button variant="destructive" size="sm" onClick={onResetGame} className="w-full">
              <RotateCcw size={16} className="mr-2" />
              Reset All Progress
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper Components
function MenuButton({ icon: Icon, label, sublabel, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100
        transition-colors text-left active:scale-[0.98]"
    >
      <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
        <Icon size={20} className="text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900">{label}</div>
        {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
      </div>
    </button>
  );
}

function ToggleButton({ icon: Icon, label, enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50
        hover:bg-gray-100 transition-colors active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
          <Icon size={20} className="text-gray-600" />
        </div>
        <span className="font-medium text-gray-900">{label}</span>
      </div>
      <div
        className={`
        w-11 h-6 rounded-full transition-colors relative
        ${enabled ? 'bg-emerald-500' : 'bg-gray-300'}
      `}
      >
        <div
          className={`
          absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `}
        />
      </div>
    </button>
  );
}

export const MenuDrawer = memo(MenuDrawerComponent);
