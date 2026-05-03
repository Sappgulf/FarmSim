import React, { memo, useState, lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Tabs, TabsContent } from '../../ui/tabs';
import { Card } from '../../ui/card';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import TabWrapper from './tabs/TabWrapper';
import { TAB_INFO } from './NavBar';
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

// Loading fallback for lazy panels (accessible + lightweight)
const TabLoader = () => (
  <div
    className="flex flex-col items-center justify-center gap-3 p-8"
    role="status"
    aria-busy="true"
    aria-label="Loading panel"
  >
    <div className="h-9 w-full max-w-xs animate-pulse rounded-lg bg-emerald-100/80" />
    <div className="h-9 w-full max-w-md animate-pulse rounded-lg bg-slate-100/90" />
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <div
        className="h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"
        aria-hidden={true}
      />
      <span>Loading panel…</span>
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
  const keyboardShortcutsEnabled = useGameSelector(
    (state) => state.settings?.keyboardShortcuts !== false
  );
  const paused = useGameSelector((state) => Boolean(state.gameLoop?.paused));
  const inventoryCount = useGameSelector((state) => {
    const inventory = state.inventory || {};
    let total = 0;
    for (const qty of Object.values(inventory)) {
      const count =
        typeof qty === 'number'
          ? qty
          : typeof qty === 'object' && qty !== null
            ? qty.count || qty.quantity || 0
            : 0;
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

  const handleTabChange = useCallback(
    (tabId) => {
      if (onTabChange) {
        onTabChange(tabId);
      } else {
        setInternalTab(tabId);
      }
    },
    [onTabChange]
  );

  // Keyboard shortcuts: 1-9 for tabs, W/H/F/T for bulk actions
  const handleBulkAction = useCallback(
    (action) => {
      switch (action) {
        case 'water':
          actions.waterAllPlots?.();
          break;
        case 'harvest':
          actions.harvestAllReadyCrops?.();
          break;
        case 'fertilize':
          actions.fertilizeAllPlots?.();
          break;
        case 'treat':
          actions.treatAllDiseases?.();
          break;
      }
    },
    [actions]
  );

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
      return (
        <span className="text-base" aria-hidden="true">
          {fallbackEmoji}
        </span>
      );
    }
    return <Circle className="icon-16" aria-hidden="true" />;
  };

  const activeConfig = TAB_CONFIG_BY_ID[activeTab] || TAB_CONFIG_BY_ID.farming;
  const ActiveTabComponent = activeConfig.component;

  return (
    <Card className="h-fit rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Tab Navigation - Premium styled scrollable grid */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 p-2.5">
          <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto scrollbar-smart scrollbar-gutter-stable">
            {TAB_CONFIGS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                data-onboard={tab.id === 'events' ? 'events-tab' : undefined}
                className={`
                  text-xs px-2.5 py-2 rounded-lg transition-all duration-200 text-left touch-manipulation
                  ${
                    activeTab === tab.id
                      ? 'bg-white text-emerald-700 font-semibold shadow-md ring-1 ring-emerald-100 scale-[1.02]'
                      : 'bg-transparent text-gray-600 hover:bg-white/70 hover:text-gray-900 active:scale-95'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {renderIcon(TAB_INFO[tab.id]?.icon, TAB_INFO[tab.id]?.emoji)}
                  <span>{TAB_INFO[tab.id]?.label || tab.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active tab only: avoids creating all tab panels on each render. */}
        <TabsContent key={activeConfig.id} value={activeConfig.id} className="mt-4">
          <Suspense fallback={<TabLoader />}>
            <TabWrapper panelKey={activeConfig.id}>
              <ActiveTabComponent />
            </TabWrapper>
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Footer - Premium styled */}
      <div className="mt-4 p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-100/50">
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
            <div className="font-bold text-emerald-700 text-sm">{inventoryCount}</div>
            <div className="text-gray-500 text-xs font-medium">Items</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
            <div className="font-bold text-amber-600 text-sm">{builtCount}</div>
            <div className="text-gray-500 text-xs font-medium">Built</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
            <div className="font-bold text-blue-600 text-sm">{animalCount}</div>
            <div className="text-gray-500 text-xs font-medium">Animals</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
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
