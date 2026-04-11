import React, { memo, useState, lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Tabs, TabsContent } from '../../ui/tabs';
import { Card } from '../../ui/card';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import TabWrapper from './tabs/TabWrapper';
import { TAB_INFO, NAV_SECTIONS } from './NavBar';
import { Circle } from 'lucide-react';

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

// Loading fallback component
const TabLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
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
    <Card className="h-fit overflow-hidden border border-white/70 bg-white/90 shadow-[0_20px_54px_-30px_rgba(15,23,42,0.48)]">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="sm:hidden border-b border-white/70 bg-gradient-to-r from-slate-50/90 via-white to-emerald-50/70 px-3 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-700/70">
            {Object.values(NAV_SECTIONS).find(s => s.tabs.includes(activeTab))?.label || 'Game'}
          </div>
          <div className="mt-1 text-base font-semibold tracking-tight text-slate-900">
            {TAB_INFO[activeTab]?.emoji} {TAB_INFO[activeTab]?.label || activeConfig.label}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Use the bottom bar to switch sections and open tab options.
          </div>
        </div>

        <div className="hidden sm:block border-b border-white/70 bg-gradient-to-b from-slate-50/90 to-white px-3 py-3">
          {/* Active tab header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-700/70">
                {Object.values(NAV_SECTIONS).find(s => s.tabs.includes(activeTab))?.label || 'Game'}
              </div>
              <div className="text-base font-semibold tracking-tight text-slate-900">
                {TAB_INFO[activeTab]?.emoji} {TAB_INFO[activeTab]?.label || activeConfig.label}
              </div>
            </div>
            <div className="text-[10px] text-gray-400 hidden sm:block">1-9 to jump</div>
          </div>

          {/* Tab Navigation - grouped by section */}
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-smart scrollbar-gutter-stable">
            {Object.values(NAV_SECTIONS).map((section) => {
              const sectionTabConfigs = TAB_CONFIGS.filter(t => section.tabs.includes(t.id));
              if (sectionTabConfigs.length === 0) return null;
              const SectionIcon = section.icon;
              return (
                <div key={section.id}>
                  <div className="flex items-center gap-1 mb-1 px-1">
                    <SectionIcon className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {section.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {sectionTabConfigs.map((tab) => (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        data-onboard={tab.id === 'events' ? 'events-tab' : undefined}
                        className={`
                          flex items-center gap-1.5 rounded-xl border px-2.5 py-2.5 min-h-[44px] text-left text-xs font-semibold
                          transition-[transform,color,background-color,box-shadow,border-color] duration-150 touch-manipulation
                          ${activeTab === tab.id
                            ? 'border-emerald-100 bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100 scale-[1.01]'
                            : 'border-transparent bg-white/50 text-gray-600 hover:bg-white hover:text-gray-800 active:scale-95'
                          }
                        `}
                      >
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
          </div>
        </div>

        {/* Active tab only: avoids creating all tab panels on each render. */}
        <TabsContent key={activeConfig.id} value={activeConfig.id} className="mt-4 px-3">
          <Suspense fallback={<TabLoader />}>
            <TabWrapper>
              <ActiveTabComponent />
            </TabWrapper>
          </Suspense>
        </TabsContent>
      </Tabs>

      <div className="mt-4 border-t border-white/70 bg-gradient-to-r from-slate-50/90 via-white to-emerald-50/70 p-3">
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="rounded-2xl border border-white/80 bg-white/80 p-2.5 text-center shadow-sm">
            <div className="font-bold text-emerald-700 text-sm">{inventoryCount}</div>
            <div className="text-gray-500 text-xs font-medium">Items</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-2.5 text-center shadow-sm">
            <div className="font-bold text-amber-600 text-sm">{builtCount}</div>
            <div className="text-gray-500 text-xs font-medium">Built</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-2.5 text-center shadow-sm">
            <div className="font-bold text-blue-600 text-sm">{animalCount}</div>
            <div className="text-gray-500 text-xs font-medium">Animals</div>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/80 p-2.5 text-center shadow-sm">
            <div className="font-bold text-purple-600 text-sm">{reputation}</div>
            <div className="text-gray-500 text-xs font-medium">Rep</div>
          </div>
        </div>
      </div>
    </Card>
  );
});

GameSidebar.displayName = 'GameSidebar';

export default GameSidebar;
