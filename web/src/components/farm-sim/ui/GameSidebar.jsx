import React, { memo, useState, lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Tabs, TabsContent } from '../../ui/tabs';
import { Card } from '../../ui/card';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import TabWrapper from './tabs/TabWrapper';
import { TAB_INFO, NAV_SECTIONS } from './NavBar';
import { Circle, Package, Home, PawPrint, Star } from 'lucide-react';

// Lazy load tab components for better performance
const FarmingTab = lazy(() => import('./tabs/FarmingTab'));
const InventoryTab = lazy(() => import('./tabs/InventoryTab'));
const ShopTab = lazy(() => import('./tabs/ShopTab'));
const BuildingsTab = lazy(() => import('./tabs/BuildingsTab'));
const ResearchTab = lazy(() => import('./tabs/ResearchTab'));
const GeneticsTab = lazy(() => import('./tabs/GeneticsTab'));
const WeatherTab = lazy(() => import('./tabs/WeatherTab'));
const PetsTab = lazy(() => import('./tabs/PetsTab'));
const LivestockTab = lazy(() => import('./tabs/LivestockTab'));
const FishingTab = lazy(() => import('./tabs/FishingTab'));
const ChallengesTab = lazy(() => import('./tabs/ChallengesTab'));
const EventsTab = lazy(() => import('./tabs/EventsTab'));
const ProcessingTab = lazy(() => import('./tabs/ProcessingTab'));
const AchievementsTab = lazy(() => import('./tabs/AchievementsTab'));
const AlmanacTab = lazy(() => import('./tabs/AlmanacTab'));
const SocialTab = lazy(() => import('./tabs/SocialTab'));
const AnalyticsTab = lazy(() => import('./tabs/AnalyticsTab'));
const MysteryShopTab = lazy(() => import('./tabs/MysteryShopTab'));
const DailyQuestsTab = lazy(() => import('./tabs/DailyQuestsTab'));
const DiseaseManagementTab = lazy(() => import('./tabs/DiseaseManagementTab'));
const ExpandTab = lazy(() => import('./tabs/ExpandTab'));
const SettingsTab = lazy(() => import('./tabs/SettingsTab'));
const NotificationCenterTab = lazy(() => import('./tabs/NotificationCenterTab'));

// Loading fallback component — skeleton screen that mimics real tab layout
const TabLoader = () => (
  <div className="space-y-5 p-1">
    {/* Hero Section */}
    <div className="flex items-start gap-3">
      <div className="skeleton-base skeleton-shimmer w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="skeleton-base skeleton-shimmer h-4 w-3/5 rounded-md" />
        <div className="skeleton-base skeleton-shimmer h-3 w-full rounded-md" />
        <div className="skeleton-base skeleton-shimmer h-3 w-4/5 rounded-md" />
      </div>
    </div>

    {/* Metric Tiles */}
    <div className="grid grid-cols-3 gap-2">
      <div className="skeleton-base skeleton-shimmer h-[72px] rounded-2xl" />
      <div className="skeleton-base skeleton-shimmer h-[72px] rounded-2xl" />
      <div className="skeleton-base skeleton-shimmer h-[72px] rounded-2xl" />
    </div>

    {/* Content Rows */}
    <div className="space-y-3">
      <div className="skeleton-base skeleton-shimmer h-20 rounded-xl" />
      <div className="skeleton-base skeleton-shimmer h-10 rounded-lg" />
      <div className="skeleton-base skeleton-shimmer h-10 rounded-lg" />
      <div className="skeleton-base skeleton-shimmer h-10 rounded-lg" />
    </div>
  </div>
);

const TAB_CONFIGS = [
  { id: 'farming', label: 'Farming', component: FarmingTab },
  { id: 'inventory', label: 'Inventory', component: InventoryTab },
  { id: 'shop', label: 'Shop', component: ShopTab },
  { id: 'buildings', label: 'Buildings', component: BuildingsTab },
  { id: 'research', label: 'Research', component: ResearchTab },
  { id: 'genetics', label: 'Genetics', component: GeneticsTab },
  { id: 'weather', label: 'Weather', component: WeatherTab },
  { id: 'pets', label: 'Pets', component: PetsTab },
  { id: 'livestock', label: 'Livestock', component: LivestockTab },
  { id: 'fishing', label: 'Fishing', component: FishingTab },
  { id: 'challenges', label: 'Challenges', component: ChallengesTab },
  { id: 'events', label: 'Events', component: EventsTab },
  { id: 'processing', label: 'Processing', component: ProcessingTab },
  { id: 'achievements', label: 'Achievements', component: AchievementsTab },
  { id: 'almanac', label: 'Almanac', component: AlmanacTab },
  { id: 'social', label: 'Social', component: SocialTab },
  { id: 'analytics', label: 'Analytics', component: AnalyticsTab },
  { id: 'mystery', label: 'Mystery', component: MysteryShopTab },
  { id: 'quests', label: 'Quests', component: DailyQuestsTab },
  { id: 'diseases', label: 'Diseases', component: DiseaseManagementTab },
  { id: 'expand', label: 'Expand', component: ExpandTab },
  { id: 'settings', label: 'Settings', component: SettingsTab },
  { id: 'notifications', label: 'Inbox', component: NotificationCenterTab },
];

export const TAB_IDS = TAB_CONFIGS.map((tab) => tab.id);
const TAB_CONFIG_BY_ID = Object.fromEntries(TAB_CONFIGS.map((tab) => [tab.id, tab]));

// Game Sidebar Component - Now accepts controlled props
const GameSidebar = memo(({ activeTab: controlledTab, onTabChange }) => {
  const actions = useGameActions();
  const keyboardShortcutsEnabled = useGameSelector((state) => state.settings?.keyboardShortcuts !== false);
  const paused = useGameSelector((state) => Boolean(state.gameLoop?.paused));
  const inventoryCount = useGameSelector((state) => {
    const inventory = state.inventory || {};
    let total = 0;
    for (const qty of Object.values(inventory)) {
      const count = typeof qty === 'number'
        ? qty
        : (typeof qty === 'object' && qty !== null ? (qty.count || qty.quantity || 0) : 0);
      total += Number(count) || 0;
    }
    return total;
  });
  const builtCount = useGameSelector((state) => {
    const buildings = state.buildings || {};
    let total = 0;
    for (const key of Object.keys(buildings)) {
      if (buildings[key]?.built) total += 1;
    }
    return total;
  });
  const animalCount = useGameSelector((state) => state.livestock?.animals?.length || 0);
  const reputation = useGameSelector((state) => state.social?.reputation ?? 0);
  // Use controlled mode if props provided, otherwise internal state (backward compat)
  const [internalTab, setInternalTab] = useState('farming');
  const activeTab = controlledTab ?? internalTab;

  const handleTabChange = useCallback((tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalTab(tabId);
    }
  }, [onTabChange]);

  // Keyboard shortcuts: 1-9 for tabs, W/H/F/T for bulk actions
  const handleBulkAction = useCallback((action) => {
    switch (action) {
      case 'water': actions.waterAllPlots?.(); break;
      case 'harvest': actions.harvestAllReadyCrops?.(); break;
      case 'fertilize': actions.fertilizeAllPlots?.(); break;
      case 'treat': actions.treatAllDiseases?.(); break;
    }
  }, [actions]);

  const handleQuickSave = useCallback(() => {
    try {
      const success = actions.saveGame?.();
      actions.addNotification?.({
        message: success ? '💾 Game saved successfully!' : '❌ Failed to save game',
        type: success ? 'success' : 'error',
      });
    } catch (error) {
      console.error('[farm]', 'Quick save shortcut error', error);
      actions.addNotification?.({ message: '❌ Failed to save game', type: 'error' });
    }
  }, [actions]);

  const handleTogglePause = useCallback(() => {
    try {
      if (paused) {
        actions.resumeGame?.();
      } else {
        actions.pauseGame?.();
      }
    } catch (error) {
      console.error('[farm]', 'Pause shortcut error', error);
    }
  }, [actions, paused]);

  useKeyboardShortcuts({
    enabled: keyboardShortcutsEnabled,
    onTabChange: handleTabChange,
    onBulkAction: handleBulkAction,
    onQuickSave: handleQuickSave,
    onTogglePause: handleTogglePause,
  });

  // Expose tab switching globally so header buttons can use it
  const handleTabChangeRef = useRef(handleTabChange);
  useEffect(() => {
    handleTabChangeRef.current = handleTabChange;
  }, [handleTabChange]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.switchToTab = (tabId) => {
        if (TAB_CONFIG_BY_ID[tabId]) {
          handleTabChangeRef.current(tabId);
        }
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.switchToTab;
      }
    };
  }, []); // Empty deps - only run once on mount

  const renderIcon = (IconComponent, fallbackEmoji) => {
    if (IconComponent) {
      return <IconComponent className="icon-16" aria-hidden="true" />;
    }
    if (fallbackEmoji) {
      return <span className="text-base" aria-hidden="true">{fallbackEmoji}</span>;
    }
    return <Circle className="icon-16" aria-hidden="true" />;
  };

  const activeConfig = TAB_CONFIG_BY_ID[activeTab] || TAB_CONFIG_BY_ID.farming;
  const ActiveTabComponent = activeConfig.component;

  return (
    <Card className="h-fit overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.55),0_0_0_1px_rgba(255,255,255,0.6)_inset,0_8px_32px_-8px_rgba(16,185,129,0.14)] backdrop-blur-xl dark:bg-slate-800/80 dark:border-slate-700/60">
      <style>{`
        .elegant-scroll::-webkit-scrollbar { width: 5px; }
        .elegant-scroll::-webkit-scrollbar-track { background: transparent; }
        .elegant-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.35); border-radius: 9999px; }
        .elegant-scroll::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.55); }
        .dark .elegant-scroll::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.45); }
        .dark .elegant-scroll::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.65); }
      `}</style>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="sm:hidden border-b border-white/70 bg-gradient-to-r from-slate-50/90 via-white to-emerald-50/70 px-4 py-4 dark:border-slate-700/70 dark:from-slate-900/90 dark:via-slate-900 dark:to-emerald-950/70">
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-700/80 drop-shadow-sm dark:text-emerald-400/80">
            {Object.values(NAV_SECTIONS).find(s => s.tabs.includes(activeTab))?.label || 'Game'}
          </div>
          <div className="mt-1.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {TAB_INFO[activeTab]?.emoji} {TAB_INFO[activeTab]?.label || activeConfig.label}
          </div>
          <div className="mt-1 text-xs text-gray-500/80 font-medium leading-relaxed dark:text-gray-400/80">
            Use the bottom bar to switch sections and open tab options.
          </div>
        </div>

        <div className="hidden sm:block border-b border-white/70 bg-gradient-to-b from-slate-50/90 to-white px-4 py-3.5 dark:border-slate-700/70 dark:from-slate-900/90 dark:to-slate-900">
          {/* Active tab header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-700/80 drop-shadow-sm dark:text-emerald-400/80">
                {Object.values(NAV_SECTIONS).find(s => s.tabs.includes(activeTab))?.label || 'Game'}
              </div>
              <div className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {TAB_INFO[activeTab]?.emoji} {TAB_INFO[activeTab]?.label || activeConfig.label}
              </div>
            </div>
            <div className="text-[10px] text-gray-400 hidden sm:block font-medium tracking-wide dark:text-gray-500">1-9 to jump</div>
          </div>

          {/* Tab Navigation - grouped by section */}
          <nav className="space-y-2.5 max-h-[min(56vh,21rem)] overflow-y-auto pr-2 elegant-scroll scrollbar-gutter-stable" aria-label="Sidebar tabs">
            {Object.values(NAV_SECTIONS).map((section) => {
              const sectionTabConfigs = TAB_CONFIGS.filter(t => section.tabs.includes(t.id));
              if (sectionTabConfigs.length === 0) return null;
              const SectionIcon = section.icon;
              return (
                <div key={section.id}>
                  <div className="flex items-center gap-1.5 mb-1.5 px-1">
                    <SectionIcon className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      {section.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {sectionTabConfigs.map((tab) => (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        data-onboard={tab.id === 'events' ? 'events-tab' : undefined}
                        className={`
                          group relative flex items-center gap-2 rounded-xl border px-2.5 py-2.5 min-h-[46px] text-left text-xs font-semibold leading-tight
                          transition-all duration-200 touch-manipulation overflow-hidden
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2
                          ${activeTab === tab.id
                            ? 'border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/60 text-emerald-700 shadow-[0_2px_8px_-2px_rgba(16,185,129,0.18)] ring-1 ring-emerald-100/80 scale-[1.02] dark:from-slate-800 dark:to-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 dark:shadow-[0_2px_8px_-2px_rgba(16,185,129,0.12)] dark:ring-emerald-800/60'
                            : 'border-transparent bg-white/40 text-gray-600 hover:bg-white/80 hover:text-gray-800 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 dark:bg-slate-800/40 dark:text-gray-300 dark:hover:bg-slate-700/80 dark:hover:text-gray-100'
                          }
                        `}
                      >
                        <span className={`
                          absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]
                          transition-opacity duration-200
                          ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}
                        `} />
                        <span className="flex-shrink-0 text-sm leading-none">
                          {TAB_INFO[tab.id]?.emoji || renderIcon(TAB_INFO[tab.id]?.icon, null)}
                        </span>
                        <span className="truncate">{TAB_INFO[tab.id]?.label || tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Active tab only: avoids creating all tab panels on each render. */}
        <TabsContent key={activeConfig.id} value={activeConfig.id} className="mt-3 px-3 pb-3 sm:mt-4 sm:px-4 sm:pb-4">
          <div className="tab-content-enter">
            <Suspense fallback={<TabLoader />}>
              <TabWrapper>
                <ActiveTabComponent />
              </TabWrapper>
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>

      <div className="border-t border-white/70 bg-gradient-to-r from-slate-50/90 via-white to-emerald-50/70 p-3 sm:p-4 dark:border-slate-700/70 dark:from-slate-900/90 dark:via-slate-900 dark:to-emerald-950/70">
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br from-white/90 to-emerald-50/70 p-2.5 text-center shadow-sm min-h-[66px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group dark:border-slate-700/60 dark:from-slate-800/90 dark:to-emerald-950/50">
            <Package className="absolute -right-1 -top-1 w-7 h-7 text-emerald-500/10 rotate-12 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
            <div className="font-bold text-emerald-700 text-sm tabular-nums tracking-tight dark:text-emerald-400">{inventoryCount}</div>
            <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5 dark:text-gray-400">Items</div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br from-white/90 to-amber-50/70 p-2.5 text-center shadow-sm min-h-[66px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group dark:border-slate-700/60 dark:from-slate-800/90 dark:to-amber-950/50">
            <Home className="absolute -right-1 -top-1 w-7 h-7 text-amber-500/10 rotate-12 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
            <div className="font-bold text-amber-600 text-sm tabular-nums tracking-tight dark:text-amber-400">{builtCount}</div>
            <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5 dark:text-gray-400">Built</div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br from-white/90 to-blue-50/70 p-2.5 text-center shadow-sm min-h-[66px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group dark:border-slate-700/60 dark:from-slate-800/90 dark:to-blue-950/50">
            <PawPrint className="absolute -right-1 -top-1 w-7 h-7 text-blue-500/10 rotate-12 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
            <div className="font-bold text-blue-600 text-sm tabular-nums tracking-tight dark:text-blue-400">{animalCount}</div>
            <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5 dark:text-gray-400">Animals</div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br from-white/90 to-purple-50/70 p-2.5 text-center shadow-sm min-h-[66px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group dark:border-slate-700/60 dark:from-slate-800/90 dark:to-purple-950/50">
            <Star className="absolute -right-1 -top-1 w-7 h-7 text-purple-500/10 rotate-12 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" />
            <div className="font-bold text-purple-600 text-sm tabular-nums tracking-tight dark:text-purple-400">{reputation}</div>
            <div className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5 dark:text-gray-400">Rep</div>
          </div>
        </div>
      </div>
    </Card>
  );
});

GameSidebar.displayName = 'GameSidebar';

export default GameSidebar;
