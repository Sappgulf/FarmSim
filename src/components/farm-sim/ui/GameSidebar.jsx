import React, { memo, useState, lazy, Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import TabWrapper from './tabs/TabWrapper';

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
const SocialTab = lazy(() => import('./tabs/SocialTab'));
const AnalyticsTab = lazy(() => import('./tabs/AnalyticsTab'));
const MysteryShopTab = lazy(() => import('./tabs/MysteryShopTab'));
const DailyQuestsTab = lazy(() => import('./tabs/DailyQuestsTab'));
const DiseaseManagementTab = lazy(() => import('./tabs/DiseaseManagementTab'));
const ExpandTab = lazy(() => import('./tabs/ExpandTab'));
const SettingsTab = lazy(() => import('./tabs/SettingsTab'));

// Loading fallback component
const TabLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
);

const TAB_CONFIGS = [
  { id: 'farming', label: '🌾 Farming', component: FarmingTab },
  { id: 'inventory', label: '🎒 Inventory', component: InventoryTab },
  { id: 'shop', label: '🛒 Shop', component: ShopTab },
  { id: 'buildings', label: '🏗️ Buildings', component: BuildingsTab },
  { id: 'research', label: '🔬 Research', component: ResearchTab },
  { id: 'genetics', label: '🧬 Genetics', component: GeneticsTab },
  { id: 'weather', label: '🌤️ Weather', component: WeatherTab },
  { id: 'pets', label: '🐕 Pets', component: PetsTab },
  { id: 'livestock', label: '🐄 Livestock', component: LivestockTab },
  { id: 'fishing', label: '🎣 Fishing', component: FishingTab },
  { id: 'challenges', label: '🎯 Challenges', component: ChallengesTab },
  { id: 'events', label: '🎉 Events', component: EventsTab },
  { id: 'processing', label: '🏭 Processing', component: ProcessingTab },
  { id: 'achievements', label: '🏆 Achievements', component: AchievementsTab },
  { id: 'social', label: '👥 Social', component: SocialTab },
  { id: 'analytics', label: '📊 Analytics', component: AnalyticsTab },
  { id: 'mystery', label: '🎰 Mystery', component: MysteryShopTab },
  { id: 'quests', label: '📋 Quests', component: DailyQuestsTab },
  { id: 'diseases', label: '🐛 Diseases', component: DiseaseManagementTab },
  { id: 'expand', label: '📈 Expand', component: ExpandTab },
  { id: 'settings', label: '⚙️ Settings', component: SettingsTab },
];

export const TAB_IDS = TAB_CONFIGS.map((tab) => tab.id);

// Game Sidebar Component - Now accepts controlled props
const GameSidebar = memo(({ activeTab: controlledTab, onTabChange }) => {
  const { state } = useGame();
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

  // Expose tab switching globally so header buttons can use it
  const handleTabChangeRef = useRef(handleTabChange);
  useEffect(() => {
    handleTabChangeRef.current = handleTabChange;
  }, [handleTabChange]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.switchToTab = (tabId) => {
        if (TAB_CONFIGS.find(t => t.id === tabId)) {
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

  const inventoryCount = useMemo(() => {
    return Object.values(state.inventory || {}).reduce((sum, qty) => {
      const count = typeof qty === 'number' ? qty : (typeof qty === 'object' && qty !== null ? (qty.count || qty.quantity || 0) : 0);
      return sum + (Number(count) || 0);
    }, 0);
  }, [state.inventory]);

  const builtCount = useMemo(() => {
    return Object.keys(state.buildings || {}).filter(k => state.buildings[k]?.built).length;
  }, [state.buildings]);

  return (
    <Card className="h-fit rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Tab Navigation - Premium styled scrollable grid */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 p-2.5">
          <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto scrollbar-hide">
            {TAB_CONFIGS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  text-xs px-2.5 py-2 rounded-lg transition-all duration-200 text-left touch-manipulation
                  ${activeTab === tab.id
                    ? 'bg-white text-emerald-700 font-semibold shadow-md ring-1 ring-emerald-100 scale-[1.02]'
                    : 'bg-transparent text-gray-600 hover:bg-white/70 hover:text-gray-900 active:scale-95'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content with Suspense for lazy loading */}
        {TAB_CONFIGS.map(tab => {
          const TabComponent = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-4">
              <Suspense fallback={<TabLoader />}>
                <TabWrapper>
                  <TabComponent />
                </TabWrapper>
              </Suspense>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Quick Stats Footer - Premium styled */}
      <div className="mt-4 p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-100/50">
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
            <div className="font-bold text-emerald-700 text-sm">
              {inventoryCount}
            </div>
            <div className="text-gray-500 text-[10px] font-medium">Items</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
            <div className="font-bold text-amber-600 text-sm">
              {builtCount}
            </div>
            <div className="text-gray-500 text-[10px] font-medium">Built</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
            <div className="font-bold text-blue-600 text-sm">
              {state.livestock?.animals?.length || 0}
            </div>
            <div className="text-gray-500 text-[10px] font-medium">Animals</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/60 shadow-sm">
            <div className="font-bold text-purple-600 text-sm">
              {state.social.reputation}
            </div>
            <div className="text-gray-500 text-[10px] font-medium">Rep</div>
          </div>
        </div>
      </div>
    </Card>
  );
});

GameSidebar.displayName = 'GameSidebar';

export default GameSidebar;
