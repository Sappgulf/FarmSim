/**
 * MenuDrawer Component
 * Slide-out drawer for settings, achievements, breeding, and other secondary actions
 */
import React, { memo, useEffect } from 'react';
import {
  X, Settings, Trophy, Dna, RotateCcw, Volume2, VolumeX,
  HelpCircle, Info, Accessibility, BookOpen, PiggyBank, Factory, Crown
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
  onShowLivestock,
  onShowProcessing,
  onShowPrestige,
  onShowStats,
  onShowHelp,
}) {
  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
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
    return () => { document.body.style.overflow = ''; };
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
        className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl
          flex flex-col overflow-hidden"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
          <div>
            <h2 id="menu-title" className="text-lg font-bold text-gray-900">Menu</h2>
            {coins != null && (
              <p className="text-xs text-emerald-700 font-medium">{coins.toLocaleString()} 🪙</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-white/80 transition-colors"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">

          {/* Quick Actions - primary panels */}
          <div className="px-4 pt-4 pb-2">
            <SectionLabel>Panels</SectionLabel>
            <div className="space-y-1.5 mt-2">
              <MenuButton
                icon={Trophy}
                label="Achievements"
                sublabel="Track your progress"
                iconBg="bg-amber-100"
                iconColor="text-amber-600"
                onClick={() => { onShowAchievements?.(); onClose(); }}
              />
              <MenuButton
                icon={PiggyBank}
                label="Livestock"
                sublabel="Animals & passive income"
                iconBg="bg-pink-100"
                iconColor="text-pink-600"
                onClick={() => { onShowLivestock?.(); onClose(); }}
              />
              <MenuButton
                icon={Factory}
                label="Processing"
                sublabel="Convert crops into goods"
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
                onClick={() => { onShowProcessing?.(); onClose(); }}
              />
              <MenuButton
                icon={Crown}
                label="Prestige"
                sublabel="End-game bonuses"
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
                onClick={() => { onShowPrestige?.(); onClose(); }}
              />
              <MenuButton
                icon={Dna}
                label="Breeding Lab"
                sublabel="Create hybrid crops"
                iconBg="bg-teal-100"
                iconColor="text-teal-600"
                onClick={() => { onShowBreeding?.(); onClose(); }}
              />
              <MenuButton
                icon={BookOpen}
                label="Scrapbook"
                sublabel="Memories & chapters"
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
                onClick={() => { onShowScrapbook?.(); onClose(); }}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="px-4 pt-4 pb-2 border-t mt-2">
            <SectionLabel>Settings</SectionLabel>
            <div className="space-y-1.5 mt-2">
              <ToggleButton
                icon={soundEnabled ? Volume2 : VolumeX}
                label="Sound Effects"
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                enabled={soundEnabled}
                onToggle={onToggleSound}
              />
              <ToggleButton
                icon={Accessibility}
                label="Reduced Motion"
                iconBg="bg-slate-100"
                iconColor="text-slate-600"
                enabled={reducedMotion}
                onToggle={onToggleReducedMotion}
              />
            </div>
          </div>

          {/* Level Selection */}
          <div className="px-4 pt-4 pb-2 border-t mt-2">
            <SectionLabel>Quick Start Level</SectionLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {LEVELS.map(L => (
                <button
                  key={L.id}
                  onClick={() => { onStartLevel?.(L.id); onClose(); }}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${levelId === L.id
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }
                  `}
                >
                  {L.id === 'endless' ? '♾️ Endless' : L.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Help */}
          <div className="px-4 pt-4 pb-2 border-t mt-2">
            <SectionLabel>Help</SectionLabel>
            <div className="space-y-1.5 mt-2">
              <MenuButton
                icon={HelpCircle}
                label="How to Play"
                sublabel="Tutorial & tips"
                iconBg="bg-sky-100"
                iconColor="text-sky-600"
                onClick={() => { onShowHelp?.('basics'); onClose(); }}
              />
              <MenuButton
                icon={Info}
                label="About"
                sublabel="Version 5.0.0"
                iconBg="bg-gray-100"
                iconColor="text-gray-500"
                onClick={() => { onShowHelp?.('about'); onClose(); }}
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="px-4 pt-4 pb-6 border-t mt-2">
            <SectionLabel className="text-red-500">Danger Zone</SectionLabel>
            <Button
              variant="destructive"
              size="sm"
              onClick={onResetGame}
              className="w-full mt-2"
            >
              <RotateCcw size={15} className="mr-2" />
              Reset All Progress
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper Components
function SectionLabel({ children, className = '' }) {
  return (
    <span className={`text-[11px] font-bold uppercase tracking-widest text-gray-400 ${className}`}>
      {children}
    </span>
  );
}

function MenuButton({ icon: Icon, label, sublabel, onClick, iconBg = 'bg-gray-100', iconColor = 'text-gray-600' }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50
        transition-colors text-left active:scale-[0.98] group"
    >
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900">{label}</div>
        {sublabel && <div className="text-xs text-gray-500 leading-tight">{sublabel}</div>}
      </div>
    </button>
  );
}

function ToggleButton({ icon: Icon, label, enabled, onToggle, iconBg = 'bg-gray-100', iconColor = 'text-gray-600' }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl
        hover:bg-gray-50 transition-colors active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon size={18} className={iconColor} />
        </div>
        <span className="font-semibold text-sm text-gray-900">{label}</span>
      </div>
      {/* Toggle pill */}
      <div className={`
        w-11 h-6 rounded-full transition-colors relative flex-shrink-0
        ${enabled ? 'bg-emerald-500' : 'bg-gray-200'}
      `}>
        <div className={`
          absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `} />
      </div>
    </button>
  );
}

export const MenuDrawer = memo(MenuDrawerComponent);
