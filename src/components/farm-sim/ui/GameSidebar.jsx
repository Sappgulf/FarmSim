import React, { memo, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { useGame } from '../context/GameContext';
import { Tabs, TabsContent } from '../../ui/tabs';
import { Card } from '../../ui/card';
import TabWrapper from './tabs/TabWrapper';

// Lazy load tab components for better performance
const lazyWithPreload = (importer) => {
  const Component = lazy(importer);
  Component.preload = importer;
  return Component;
};

const FarmingTab = lazyWithPreload(() => import('./tabs/FarmingTab'));
const InventoryTab = lazyWithPreload(() => import('./tabs/InventoryTab'));
const ShopTab = lazyWithPreload(() => import('./tabs/ShopTab'));
const BuildingsTab = lazyWithPreload(() => import('./tabs/BuildingsTab'));
const ResearchTab = lazyWithPreload(() => import('./tabs/ResearchTab'));
const GeneticsTab = lazyWithPreload(() => import('./tabs/GeneticsTab'));
const WeatherTab = lazyWithPreload(() => import('./tabs/WeatherTab'));
const PetsTab = lazyWithPreload(() => import('./tabs/PetsTab'));
const LivestockTab = lazyWithPreload(() => import('./tabs/LivestockTab'));
const FishingTab = lazyWithPreload(() => import('./tabs/FishingTab'));
const EventsTab = lazyWithPreload(() => import('./tabs/EventsTab'));
const ProcessingTab = lazyWithPreload(() => import('./tabs/ProcessingTab'));
const AchievementsTab = lazyWithPreload(() => import('./tabs/AchievementsTab'));
const SocialTab = lazyWithPreload(() => import('./tabs/SocialTab'));
const AnalyticsTab = lazyWithPreload(() => import('./tabs/AnalyticsTab'));
const MysteryShopTab = lazyWithPreload(() => import('./tabs/MysteryShopTab'));
const DailyQuestsTab = lazyWithPreload(() => import('./tabs/DailyQuestsTab'));
const DiseaseManagementTab = lazyWithPreload(() => import('./tabs/DiseaseManagementTab'));
const ExpandTab = lazyWithPreload(() => import('./tabs/ExpandTab'));
const SettingsTab = lazyWithPreload(() => import('./tabs/SettingsTab'));

// Loading fallback component
const TabLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
);

// Game Sidebar Component - Now accepts controlled props
const GameSidebar = memo(({ activeTab: controlledTab, onTabChange }) => {
  const { state } = useGame();
  const TAB_CACHE_LIMIT = 4;
  // Use controlled mode if props provided, otherwise internal state (backward compat)
  const [internalTab, setInternalTab] = useState('farming');
  const activeTab = controlledTab ?? internalTab;
  const [mountedTabs, setMountedTabs] = useState(() => ['farming']);
  const tabButtonRefs = useRef([]);

  const handleTabChange = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalTab(tabId);
    }
  };

  const inventoryCount = useMemo(() => Object.values(state.inventory || {}).reduce((sum, qty) => {
    const count = typeof qty === 'number' ? qty : (typeof qty === 'object' && qty !== null ? (qty.count || qty.quantity || 0) : 0);
    return sum + (Number(count) || 0);
  }, 0), [state.inventory]);

  const buildingsCount = useMemo(() => Object.keys(state.buildings).length, [state.buildings]);
  const animalsCount = useMemo(() => state.livestock?.animals?.length || 0, [state.livestock?.animals?.length]);
  const reputation = state.social.reputation;

  const tabConfigs = useMemo(() => ([
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
    // Challenges merged into Quests
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
  ]), []);

  useEffect(() => {
    setMountedTabs(prev => {
      if (prev.includes(activeTab)) {
        return prev;
      }
      const next = [...prev, activeTab];
      if (next.length > TAB_CACHE_LIMIT) {
        next.shift();
      }
      return next;
    });
  }, [activeTab]);

  const handleTabKeyDown = (event, index) => {
    const { key } = event;
    const maxIndex = tabConfigs.length - 1;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) {
      return;
    }

    event.preventDefault();
    let nextIndex = index;

    if (key === 'Home') {
      nextIndex = 0;
    } else if (key === 'End') {
      nextIndex = maxIndex;
    } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
      nextIndex = index === 0 ? maxIndex : index - 1;
    } else if (key === 'ArrowDown' || key === 'ArrowRight') {
      nextIndex = index === maxIndex ? 0 : index + 1;
    }

    const nextTab = tabConfigs[nextIndex];
    if (nextTab) {
      handleTabChange(nextTab.id);
      tabButtonRefs.current[nextIndex]?.focus();
    }
  };

  // Expose tab switching globally so header buttons can use it
  // FIXED: tabConfigs is recreated every render, use stable ref instead
  const tabConfigsRef = useRef(tabConfigs);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.switchToTab = (tabId) => {
        if (tabConfigsRef.current.find(t => t.id === tabId)) {
          handleTabChange(tabId);
        }
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.switchToTab;
      }
    };
  }, []); // Empty deps - only run once on mount

  return (
    <Card className="h-fit shadow-sm border-gray-200/60 bg-white/50 backdrop-blur-sm">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Tab Navigation - Vertical Scrollable List */}
        <div className="border-b border-gray-100 bg-gray-50/50 p-2 rounded-t-xl">
          <div
            className="grid grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1"
            role="tablist"
            aria-label="Game tabs"
            aria-orientation="vertical"
          >
            {tabConfigs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                onMouseEnter={() => tab.component.preload?.()}
                onFocus={() => tab.component.preload?.()}
                ref={(node) => {
                  tabButtonRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`panel-${tab.id}`}
                aria-selected={activeTab === tab.id}
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={`
                  relative overflow-hidden text-xs px-3 py-2.5 rounded-lg transition-all text-left font-medium
                  flex items-center gap-2 group
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2
                  ${activeTab === tab.id
                    ? 'bg-white text-green-700 shadow-sm ring-1 ring-gray-100'
                    : 'bg-transparent text-gray-500 hover:bg-white/60 hover:text-gray-900'
                  }
                `}
              >
                {/* Active Indicator Bar */}
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-green-500 rounded-r-full"></div>
                )}

                <span className={`text-base ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-200`}>
                  {tab.label.split(' ')[0]}
                </span>
                <span className="truncate">{tab.label.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content with Suspense for lazy loading */}
        {tabConfigs.map(tab => {
          const TabComponent = tab.component;
          const isActive = activeTab === tab.id;
          const shouldMount = isActive || mountedTabs.includes(tab.id);
          if (!shouldMount) return null;

          return (
            <TabsContent
              key={tab.id}
              value={tab.id}
              forceMount={mountedTabs.includes(tab.id)}
              className={`mt-4 motion-reduce:transition-none motion-reduce:animate-none ${isActive ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''}`}
            >
              <Suspense fallback={<TabLoader />}>
                <TabWrapper>
                  <TabComponent />
                </TabWrapper>
              </Suspense>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Quick Stats Footer */}
      <div className="mt-4 p-4 bg-gray-50/80 border-t border-gray-100/50 rounded-b-xl">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Farm Overview</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-2 rounded border border-gray-100 shadow-sm flex flex-col items-center">
            <span className="font-bold text-lg text-gray-800">
              {inventoryCount}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">Items</span>
          </div>

          <div className="bg-white p-2 rounded border border-gray-100 shadow-sm flex flex-col items-center">
            <span className="font-bold text-lg text-blue-600">
              {buildingsCount}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">Bldgs</span>
          </div>

          <div className="bg-white p-2 rounded border border-gray-100 shadow-sm flex flex-col items-center">
            <span className="font-bold text-lg text-amber-600">
              {animalsCount}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">Animals</span>
          </div>

          <div className="bg-white p-2 rounded border border-gray-100 shadow-sm flex flex-col items-center">
            <span className="font-bold text-lg text-purple-600">
              {reputation}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">Rep</span>
          </div>
        </div>
      </div>
    </Card>
  );
});

GameSidebar.displayName = 'GameSidebar';

export default GameSidebar;
