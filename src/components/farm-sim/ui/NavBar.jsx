import React, { memo, useState } from 'react';
import { useGame } from '../context/GameContext';

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
        emoji: '🏠',
        tabs: ['farming'],
        description: 'Manage crops and farming'
    },
    inventory: {
        id: 'inventory',
        label: 'Items',
        emoji: '📦',
        tabs: ['inventory', 'shop', 'processing'],
        description: 'Items, shop, and processing'
    },
    build: {
        id: 'build',
        label: 'Build',
        emoji: '🏗️',
        tabs: ['buildings', 'expand', 'research', 'genetics'],
        description: 'Buildings and upgrades'
    },
    animals: {
        id: 'animals',
        label: 'Animals',
        emoji: '🐾',
        tabs: ['livestock', 'pets', 'fishing'],
        description: 'Animals and fishing'
    },
    more: {
        id: 'more',
        label: 'More',
        emoji: '⚙️',
        tabs: ['settings', 'achievements', 'quests', 'analytics', 'weather', 'events', 'challenges', 'social', 'mystery', 'diseases'],
        description: 'Settings and extras'
    }
};

// Map tab IDs to their display info
export const TAB_INFO = {
    farming: { label: 'Farming', emoji: '🌾' },
    inventory: { label: 'Inventory', emoji: '🎒' },
    shop: { label: 'Shop', emoji: '🛒' },
    processing: { label: 'Processing', emoji: '🏭' },
    buildings: { label: 'Buildings', emoji: '🏗️' },
    expand: { label: 'Expand', emoji: '📈' },
    research: { label: 'Research', emoji: '🔬' },
    genetics: { label: 'Genetics', emoji: '🧬' },
    livestock: { label: 'Livestock', emoji: '🐄' },
    pets: { label: 'Pets', emoji: '🐕' },
    fishing: { label: 'Fishing', emoji: '🎣' },
    settings: { label: 'Settings', emoji: '⚙️' },
    achievements: { label: 'Achievements', emoji: '🏆' },
    quests: { label: 'Quests', emoji: '📋' },
    analytics: { label: 'Analytics', emoji: '📊' },
    weather: { label: 'Weather', emoji: '🌤️' },
    events: { label: 'Events', emoji: '🎉' },
    challenges: { label: 'Challenges', emoji: '🎯' },
    social: { label: 'Social', emoji: '👥' },
    mystery: { label: 'Mystery', emoji: '🎰' },
    diseases: { label: 'Diseases', emoji: '🐛' },
};

const NavBar = memo(({ activeSection, activeTab, onSectionChange, onTabChange }) => {
    const { state } = useGame();
    const [showSubTabs, setShowSubTabs] = useState(false);

    const sections = Object.values(NAV_SECTIONS);

    // Get notification counts for badges
    const getNotificationCount = (sectionId) => {
        switch (sectionId) {
            case 'animals':
                // Count animals that need attention
                const animalsNeedingCare = (state.livestock?.animals || []).filter(
                    a => a.hunger < 30 || a.happiness < 30 || a.productionReady
                ).length;
                return animalsNeedingCare > 0 ? animalsNeedingCare : null;
            case 'more':
                // Count unclaimed quest rewards
                const unclaimedQuests = (state.dailyChallenges || []).filter(
                    q => q.completed && !q.claimed
                ).length;
                return unclaimedQuests > 0 ? unclaimedQuests : null;
            default:
                return null;
        }
    };

    return (
        <nav className="bg-white border-t border-gray-200 shadow-lg">
            {/* Sub-tabs panel (slides up when section selected) */}
            {showSubTabs && activeSection && NAV_SECTIONS[activeSection].tabs.length > 1 && (
                <div className="border-b border-gray-100 bg-gray-50 px-2 py-2 animate-fade-in">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        {NAV_SECTIONS[activeSection].tabs.map(tabId => {
                            const tabInfo = TAB_INFO[tabId];
                            const isActive = activeTab === tabId;
                            return (
                                <button
                                    key={tabId}
                                    onClick={() => onTabChange(tabId)}
                                    className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                    whitespace-nowrap transition-all touch-manipulation
                    ${isActive
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:bg-white/50 active:bg-white/70'
                                        }
                  `}
                                >
                                    <span>{tabInfo.emoji}</span>
                                    <span>{tabInfo.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main section buttons */}
            <div className="flex justify-around items-center px-1 py-2 safe-area-pb">
                {sections.map(section => {
                    const isActive = activeSection === section.id;
                    const notifCount = getNotificationCount(section.id);

                    return (
                        <button
                            key={section.id}
                            onClick={() => {
                                onSectionChange(section.id);
                                // Show sub-tabs if section has multiple tabs
                                if (section.tabs.length > 1) {
                                    setShowSubTabs(isActive ? !showSubTabs : true);
                                } else {
                                    setShowSubTabs(false);
                                    onTabChange(section.tabs[0]);
                                }
                            }}
                            className={`
                relative flex flex-col items-center justify-center
                min-w-[60px] min-h-[56px] px-2 py-1.5 rounded-xl
                transition-all touch-manipulation
                ${isActive
                                    ? 'text-green-700 bg-green-50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                                }
              `}
                        >
                            <span className="text-2xl">{section.emoji}</span>
                            <span className={`text-xs mt-0.5 font-medium ${isActive ? 'text-green-700' : 'text-gray-500'}`}>
                                {section.label}
                            </span>

                            {/* Notification badge */}
                            {notifCount && (
                                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                                    {notifCount > 9 ? '9+' : notifCount}
                                </span>
                            )}

                            {/* Active indicator */}
                            {isActive && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-500 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
});

NavBar.displayName = 'NavBar';

export default NavBar;
