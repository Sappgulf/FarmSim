import React, { memo, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  CloudSun,
  Dna,
  Factory,
  Fish,
  FlaskRound,
  Leaf,
  Maximize2,
  Package,
  PawPrint,
  ShoppingCart,
  Sparkles,
  Settings,
  ShieldAlert,
  Target,
  Trophy,
  Bell,
  Users,
  Building2,
  Home,
} from 'lucide-react';
import { useGameSelector } from '../context/GameContext';
import SoraIcon from './SoraIcon';

/**
 * NavBar - Consolidated navigation with 5 main sections
 * Replaces the 21-tab grid with grouped navigation
 *
 * Sections:
 * - Farm: Main gameplay (FarmGrid is always visible, this shows FarmingTab)
 * - Inventory: Items, Shop, Processing
 * - Build: Buildings, Expand, Research, Genetics
 * - Animals: Livestock, Pets, Fishing
 * - More: Settings, Achievements, Quests, Analytics, Weather, Events, etc.
 */

// Section definitions with their sub-tabs
export const NAV_SECTIONS = {
  farm: {
    id: 'farm',
    label: 'Farm',
    assetId: 'nav-section-farm',
    icon: Home,
    emoji: '🏠',
    tabs: ['farming'],
    description: 'Manage crops and farming',
  },
  inventory: {
    id: 'inventory',
    label: 'Items',
    assetId: 'nav-section-items',
    icon: Package,
    emoji: '📦',
    tabs: ['inventory', 'shop', 'processing'],
    description: 'Items, shop, and processing',
  },
  build: {
    id: 'build',
    label: 'Build',
    assetId: 'nav-section-build',
    icon: Building2,
    emoji: '🏗️',
    tabs: ['buildings', 'expand', 'research', 'genetics'],
    description: 'Buildings and upgrades',
  },
  animals: {
    id: 'animals',
    label: 'Animals',
    assetId: 'nav-section-animals',
    icon: PawPrint,
    emoji: '🐾',
    tabs: ['livestock', 'pets', 'fishing'],
    description: 'Animals and fishing',
  },
  more: {
    id: 'more',
    label: 'More',
    assetId: 'nav-section-more',
    icon: Settings,
    emoji: '⚙️',
    tabs: [
      'settings',
      'notifications',
      'achievements',
      'almanac',
      'quests',
      'analytics',
      'weather',
      'events',
      'challenges',
      'social',
      'mystery',
      'diseases',
    ],
    description: 'Settings and extras',
  },
};

// Map tab IDs to their display info
export const TAB_INFO = {
  farming: { label: 'Farming', assetId: 'tab-farming', icon: Leaf, emoji: '🌾' },
  inventory: { label: 'Inventory', assetId: 'tab-inventory', icon: Package, emoji: '🎒' },
  shop: { label: 'Shop', assetId: 'tab-shop', icon: ShoppingCart, emoji: '🛒' },
  processing: { label: 'Processing', assetId: 'tab-processing', icon: Factory, emoji: '🏭' },
  buildings: { label: 'Buildings', assetId: 'tab-buildings', icon: Building2, emoji: '🏗️' },
  expand: { label: 'Expand', assetId: 'tab-expand', icon: Maximize2, emoji: '📈' },
  research: { label: 'Research', assetId: 'tab-research', icon: FlaskRound, emoji: '🔬' },
  genetics: { label: 'Genetics', assetId: 'tab-genetics', icon: Dna, emoji: '🧬' },
  livestock: { label: 'Livestock', assetId: 'tab-livestock', icon: PawPrint, emoji: '🐄' },
  pets: { label: 'Pets', assetId: 'tab-pets', icon: PawPrint, emoji: '🐕' },
  fishing: { label: 'Fishing', assetId: 'tab-fishing', icon: Fish, emoji: '🎣' },
  settings: { label: 'Settings', assetId: 'tab-settings', icon: Settings, emoji: '⚙️' },
  notifications: { label: 'Inbox', assetId: 'tab-notifications', icon: Bell, emoji: '🔔' },
  achievements: { label: 'Achievements', assetId: 'tab-achievements', icon: Trophy, emoji: '🏆' },
  almanac: { label: 'Almanac', assetId: 'tab-almanac', icon: BookOpen, emoji: '📖' },
  quests: { label: 'Quests', assetId: 'tab-quests', icon: ClipboardList, emoji: '📋' },
  analytics: { label: 'Analytics', assetId: 'tab-analytics', icon: BarChart3, emoji: '📊' },
  weather: { label: 'Weather', assetId: 'tab-weather', icon: CloudSun, emoji: '🌤️' },
  events: { label: 'Events', assetId: 'tab-events', icon: CalendarDays, emoji: '🎉' },
  challenges: { label: 'Challenges', assetId: 'tab-challenges', icon: Target, emoji: '🎯' },
  social: { label: 'Social', assetId: 'tab-social', icon: Users, emoji: '👥' },
  mystery: { label: 'Mystery', assetId: 'tab-mystery', icon: Sparkles, emoji: '🎰' },
  diseases: { label: 'Diseases', assetId: 'tab-diseases', icon: ShieldAlert, emoji: '🐛' },
};

const NavBar = memo(
  ({ activeSection, activeTab, onSectionChange, onTabChange, isFirstRunMode = false }) => {
    const animalsNeedingCareCount = useGameSelector((state) => {
      const animals = Array.isArray(state.livestock?.animals) ? state.livestock.animals : [];
      let count = 0;
      for (let i = 0; i < animals.length; i++) {
        const animal = animals[i];
        if (animal?.hunger < 30 || animal?.happiness < 30 || animal?.productionReady) {
          count += 1;
        }
      }
      return count;
    });
    const unclaimedQuestCount = useGameSelector((state) => {
      const challenges = Array.isArray(state.dailyChallenges) ? state.dailyChallenges : [];
      let count = 0;
      for (let i = 0; i < challenges.length; i++) {
        const challenge = challenges[i];
        if (challenge?.completed && !challenge?.claimed) count += 1;
      }
      return count;
    });
    const activeNotificationCount = useGameSelector((state) =>
      Array.isArray(state.notifications) ? state.notifications.length : 0
    );
    const [showSubTabs, setShowSubTabs] = useState(false);
    const subTabRefs = useRef({});
    const sections = useMemo(() => Object.values(NAV_SECTIONS), []);
    const activeSectionConfig = useMemo(
      () => (activeSection ? NAV_SECTIONS[activeSection] : null),
      [activeSection]
    );
    const activeTabInfo = TAB_INFO[activeTab];
    const activeSectionHasMultipleTabs = Boolean(
      activeSectionConfig && activeSectionConfig.tabs.length > 1
    );
    const activeSectionTabs = useMemo(() => activeSectionConfig?.tabs || [], [activeSectionConfig]);

    useEffect(() => {
      setShowSubTabs(false);
    }, [activeSection]);

    useEffect(() => {
      if (!activeSectionHasMultipleTabs) {
        setShowSubTabs(false);
      }
    }, [activeSectionHasMultipleTabs]);

    // Get notification counts for badges
    const getNotificationCount = useCallback(
      (sectionId) => {
        switch (sectionId) {
          case 'animals':
            return animalsNeedingCareCount > 0 ? animalsNeedingCareCount : null;
          case 'more':
            const totalMoreAlerts = unclaimedQuestCount + activeNotificationCount;
            return totalMoreAlerts > 0 ? totalMoreAlerts : null;
          default:
            return null;
        }
      },
      [activeNotificationCount, animalsNeedingCareCount, unclaimedQuestCount]
    );
    const handleSectionPress = useCallback(
      (section, isActive) => {
        onSectionChange(section.id);
        if (section.tabs.length > 1) {
          setShowSubTabs(isActive ? !showSubTabs : false);
          return;
        }
        setShowSubTabs(false);
        onTabChange(section.tabs[0]);
      },
      [onSectionChange, onTabChange, showSubTabs]
    );

    const handleSubTabKeyDown = useCallback(
      (event, index) => {
        if (!activeSectionHasMultipleTabs || activeSectionTabs.length <= 1) return;

        const lastIndex = activeSectionTabs.length - 1;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          const nextIndex = index === lastIndex ? 0 : index + 1;
          const nextId = activeSectionTabs[nextIndex];
          if (nextId && subTabRefs.current[nextId]) {
            subTabRefs.current[nextId].focus();
          }
          if (activeSectionTabs[nextIndex]) {
            onTabChange(activeSectionTabs[nextIndex]);
          }
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          const nextIndex = index === 0 ? lastIndex : index - 1;
          const nextId = activeSectionTabs[nextIndex];
          if (nextId && subTabRefs.current[nextId]) {
            subTabRefs.current[nextId].focus();
          }
          if (activeSectionTabs[nextIndex]) {
            onTabChange(activeSectionTabs[nextIndex]);
          }
        }

        if (event.key === 'Home') {
          event.preventDefault();
          const firstId = activeSectionTabs[0];
          if (firstId && subTabRefs.current[firstId]) {
            subTabRefs.current[firstId].focus();
          }
          if (firstId) {
            onTabChange(firstId);
          }
        }

        if (event.key === 'End') {
          event.preventDefault();
          const lastId = activeSectionTabs[lastIndex];
          if (lastId && subTabRefs.current[lastId]) {
            subTabRefs.current[lastId].focus();
          }
          if (lastId) {
            onTabChange(lastId);
          }
        }
      },
      [activeSectionHasMultipleTabs, activeSectionTabs, onTabChange]
    );

    return (
      <nav
        className="bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-2xl mobile-scroll relative"
        role="navigation"
        aria-label="Game section navigation"
      >
        {isFirstRunMode && (
          <div
            className="border-b border-amber-200 bg-amber-100 px-3 py-1.5 text-center text-[10px] font-semibold text-amber-700"
            aria-live="polite"
          >
            Starter flow active
          </div>
        )}
        {activeSectionHasMultipleTabs && (
          <div className="px-3 pt-2 pb-1 border-b border-gray-100/80 bg-gradient-to-r from-emerald-50/70 to-teal-50/60">
            <button
              type="button"
              onClick={() => setShowSubTabs((value) => !value)}
              className="w-full flex items-center justify-between gap-2 text-left rounded-lg px-2 py-1.5 hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60"
              aria-expanded={showSubTabs}
              aria-controls={`subtabs-${activeSection}`}
              aria-label={`${activeSectionConfig.label} tabs: ${showSubTabs ? 'hide options' : 'show options'}`}
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[11px] font-semibold text-emerald-900/90">
                  {activeSectionConfig.label} · {activeTabInfo?.label || activeTab}
                </span>
                <span className="text-[10px] font-medium text-emerald-700/80">
                  {showSubTabs
                    ? 'Hide options'
                    : `${activeSectionConfig.tabs.length} tools available`}
                </span>
              </span>
              <ChevronDown
                className={`icon-16 text-emerald-700 transition-transform ${showSubTabs ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        )}

        {/* Sub-tabs panel (slides up when section selected) */}
        {showSubTabs && activeSectionHasMultipleTabs && (
          <div
            id={`subtabs-${activeSection}`}
            className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 px-2 py-2.5 animate-tab-slide-in"
            role="tablist"
            aria-label={`${activeSectionConfig.label} sub-tabs`}
          >
            <div className="flex gap-1.5 overflow-x-auto scrollbar-smart scrollbar-gutter-stable">
              {activeSectionConfig.tabs.map((tabId, index) => {
                const tabInfo = TAB_INFO[tabId];
                const isActive = activeTab === tabId;
                const TabIcon = tabInfo?.icon;
                return (
                  <button
                    key={tabId}
                    ref={(element) => {
                      if (element) {
                        subTabRefs.current[tabId] = element;
                      } else {
                        delete subTabRefs.current[tabId];
                      }
                    }}
                    onClick={() => onTabChange(tabId)}
                    data-onboard={tabId === 'events' ? 'events-tab' : undefined}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={tabInfo?.label || tabId}
                    onKeyDown={(event) => handleSubTabKeyDown(event, index)}
                    className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold
                    whitespace-nowrap transition-all duration-200 touch-manipulation
                    ${
                      isActive
                        ? 'bg-white text-emerald-700 shadow-md ring-1 ring-emerald-100'
                        : 'text-gray-600 hover:bg-white/70 hover:text-gray-800 active:scale-95'
                    }
                  `}
                  >
                    <SoraIcon
                      id={tabInfo?.assetId}
                      className="icon-16"
                      fallbackIcon={TabIcon}
                      fallbackEmoji={tabInfo?.emoji}
                    />
                    <span>{tabInfo?.label || tabId}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main section buttons */}
        <div className="flex justify-around items-center px-2 py-2 safe-area-pb">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            const notifCount = getNotificationCount(section.id);
            const SectionIcon = section.icon;
            const sectionHasMultipleTabs = section.tabs.length > 1;
            const sectionSubTabsVisible = isActive && sectionHasMultipleTabs && showSubTabs;
            const sectionSubTabsId = `subtabs-${section.id}`;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => handleSectionPress(section, isActive)}
                aria-expanded={sectionHasMultipleTabs ? sectionSubTabsVisible : undefined}
                aria-controls={sectionHasMultipleTabs ? sectionSubTabsId : undefined}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${section.label}. ${section.description}${sectionHasMultipleTabs ? `, ${section.tabs.length} tabs` : ''}`}
                className={`
                relative flex flex-col items-center justify-center
                min-w-[64px] min-h-[60px] px-2 py-1.5 rounded-2xl
                transition-all duration-200 touch-manipulation
                ${
                  isActive
                    ? 'text-emerald-700 bg-gradient-to-br from-emerald-50 to-green-100 shadow-lg scale-105'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
                }
              `}
              >
                <span
                  className={`flex items-center justify-center ${isActive ? 'drop-shadow-sm' : ''}`}
                >
                  <SoraIcon
                    id={section.assetId}
                    className="icon-24"
                    fallbackIcon={SectionIcon}
                    fallbackEmoji={section.emoji}
                  />
                </span>
                <span
                  className={`text-[11px] mt-0.5 font-semibold ${isActive ? 'text-emerald-700' : 'text-gray-500'}`}
                >
                  {section.label}
                </span>
                {sectionHasMultipleTabs && (
                  <span
                    className={`text-[9px] leading-none mt-0.5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}
                  >
                    {sectionSubTabsVisible ? 'Hide' : `${section.tabs.length} tabs`}
                  </span>
                )}

                {/* Notification badge */}
                {notifCount && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-bold rounded-full px-1 shadow-lg animate-pulse">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}

                {/* Active indicator */}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }
);

NavBar.displayName = 'NavBar';

export default NavBar;
