import React, { memo, useState, lazy, Suspense } from 'react';
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

// Game Sidebar Component
const GameSidebar = memo(() => {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState('farming');

  const tabConfigs = [
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

  // Expose tab switching globally so header buttons can use it
  // FIXED: tabConfigs is recreated every render, use stable ref instead
  const tabConfigsRef = React.useRef(tabConfigs);
  React.useEffect(() => {
    tabConfigsRef.current = tabConfigs;
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.switchToTab = (tabId) => {
        if (tabConfigsRef.current.find(t => t.id === tabId)) {
          setActiveTab(tabId);
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
    <Card className="h-fit">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Navigation - Vertical Scrollable List */}
        <div className="border-b border-gray-200 bg-gray-50 p-2">
          <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
            {tabConfigs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  text-xs px-2 py-2 rounded-md transition-colors text-left
                  ${activeTab === tab.id 
                    ? 'bg-white text-gray-900 font-semibold shadow-sm' 
                    : 'bg-transparent text-gray-600 hover:bg-white/50'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content with Suspense for lazy loading */}
        {tabConfigs.map(tab => {
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

      {/* Quick Stats Footer */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-center">
            <div className="font-semibold text-gray-800">
              {Object.values(state.inventory || {}).reduce((sum, qty) => {
                // Handle both numbers and objects - ensure we only count numeric values
                const count = typeof qty === 'number' ? qty : (typeof qty === 'object' && qty !== null ? (qty.count || qty.quantity || 0) : 0);
                return sum + (Number(count) || 0);
              }, 0)}
            </div>
            <div className="text-gray-600">Total Items</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">
              {Object.keys(state.buildings).length}
            </div>
            <div className="text-gray-600">Buildings</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">
              {state.livestock?.animals?.length || 0}
            </div>
            <div className="text-gray-600">Livestock</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">
              {state.social.reputation}
            </div>
            <div className="text-gray-600">Reputation</div>
          </div>
        </div>
      </div>
    </Card>
  );
});

GameSidebar.displayName = 'GameSidebar';

export default GameSidebar;
