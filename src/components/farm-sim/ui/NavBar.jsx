import React, { memo, useState, useMemo, useCallback } from 'react';
import {
    BarChart3,
    BookOpen,
    CalendarDays,
    Circle,
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
        icon: Home,
        emoji: '🏠',
        tabs: ['farming'],
        description: 'Manage crops and farming'
    },
    inventory: {
        id: 'inventory',
        label: 'Items',
        icon: Package,
        emoji: '📦',
        tabs: ['inventory', 'shop', 'processing'],
        description: 'Items, shop, and processing'
    },
    build: {
        id: 'build',
        label: 'Build',
        icon: Building2,
        emoji: '🏗️',
        tabs: ['buildings', 'expand', 'research', 'genetics'],
        description: 'Buildings and upgrades'
    },
    animals: {
        id: 'animals',
        label: 'Animals',
        icon: PawPrint,
        emoji: '🐾',
        tabs: ['livestock', 'pets', 'fishing'],
        description: 'Animals and fishing'
    },
    more: {
        id: 'more',
        label: 'More',
        icon: Settings,
        emoji: '⚙️',
        tabs: ['settings', 'notifications', 'achievements', 'almanac', 'quests', 'analytics', 'weather', 'events', 'challenges', 'social', 'mystery', 'diseases'],
        description: 'Settings and extras'
    }
};

// Map tab IDs to their display info
export const TAB_INFO = {
    farming: { label: 'Farming', icon: Leaf, emoji: '🌾' },
    inventory: { label: 'Inventory', icon: Package, emoji: '🎒' },
    shop: { label: 'Shop', icon: ShoppingCart, emoji: '🛒' },
    processing: { label: 'Processing', icon: Factory, emoji: '🏭' },
    buildings: { label: 'Buildings', icon: Building2, emoji: '🏗️' },
    expand: { label: 'Expand', icon: Maximize2, emoji: '📈' },
    research: { label: 'Research', icon: FlaskRound, emoji: '🔬' },
    genetics: { label: 'Genetics', icon: Dna, emoji: '🧬' },
    livestock: { label: 'Livestock', icon: PawPrint, emoji: '🐄' },
    pets: { label: 'Pets', icon: PawPrint, emoji: '🐕' },
    fishing: { label: 'Fishing', icon: Fish, emoji: '🎣' },
    settings: { label: 'Settings', icon: Settings, emoji: '⚙️' },
    notifications: { label: 'Inbox', icon: Bell, emoji: '🔔' },
    achievements: { label: 'Achievements', icon: Trophy, emoji: '🏆' },
    almanac: { label: 'Almanac', icon: BookOpen, emoji: '📖' },
    quests: { label: 'Quests', icon: ClipboardList, emoji: '📋' },
    analytics: { label: 'Analytics', icon: BarChart3, emoji: '📊' },
    weather: { label: 'Weather', icon: CloudSun, emoji: '🌤️' },
    events: { label: 'Events', icon: CalendarDays, emoji: '🎉' },
    challenges: { label: 'Challenges', icon: Target, emoji: '🎯' },
    social: { label: 'Social', icon: Users, emoji: '👥' },
    mystery: { label: 'Mystery', icon: Sparkles, emoji: '🎰' },
    diseases: { label: 'Diseases', icon: ShieldAlert, emoji: '🐛' },
};

const NavBar = memo(({ activeSection, activeTab, onSectionChange, onTabChange }) => {
    const livestockAnimals = useGameSelector((state) => state.livestock?.animals || []);
    const dailyChallenges = useGameSelector((state) => state.dailyChallenges || []);
    const notifications = useGameSelector((state) => state.notifications || []);
    const [showSubTabs, setShowSubTabs] = useState(false);
    const sections = useMemo(() => Object.values(NAV_SECTIONS), []);
    const renderIcon = (IconComponent, fallbackEmoji, className) => {
        if (IconComponent) {
            return <IconComponent className={className} aria-hidden="true" />;
        }
        if (fallbackEmoji) {
            return <span className={`text-base ${className}`} aria-hidden="true">{fallbackEmoji}</span>;
        }
        return <Circle className={className} aria-hidden="true" />;
    };

    // Get notification counts for badges
    const getNotificationCount = useCallback((sectionId) => {
        switch (sectionId) {
            case 'animals':
                // Count animals that need attention
                const animalsNeedingCare = livestockAnimals.filter(
                    a => a.hunger < 30 || a.happiness < 30 || a.productionReady
                ).length;
                return animalsNeedingCare > 0 ? animalsNeedingCare : null;
            case 'more':
                // Count unclaimed quest rewards
                const unclaimedQuests = dailyChallenges.filter(
                    q => q.completed && !q.claimed
                ).length;
                const activeNotifications = Array.isArray(notifications) ? notifications.length : 0;
                const totalMoreAlerts = unclaimedQuests + activeNotifications;
                return totalMoreAlerts > 0 ? totalMoreAlerts : null;
            default:
                return null;
        }
    }, [dailyChallenges, livestockAnimals, notifications]);

    const handleSectionPress = useCallback((section, isActive) => {
        onSectionChange(section.id);
        if (section.tabs.length > 1) {
            setShowSubTabs(isActive ? !showSubTabs : true);
            return;
        }
        setShowSubTabs(false);
        onTabChange(section.tabs[0]);
    }, [onSectionChange, onTabChange, showSubTabs]);

    return (
        <nav className="bg-white/95 backdrop-blur-lg border-t border-gray-100 shadow-2xl mobile-scroll relative">
            {/* Sub-tabs panel (slides up when section selected) */}
            {showSubTabs && activeSection && NAV_SECTIONS[activeSection].tabs.length > 1 && (
                <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-slate-50 px-2 py-2.5 animate-tab-slide-in">
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-smart scrollbar-gutter-stable">
                        {NAV_SECTIONS[activeSection].tabs.map(tabId => {
                            const tabInfo = TAB_INFO[tabId];
                            const isActive = activeTab === tabId;
                            const TabIcon = tabInfo?.icon;
                            return (
                                <button
                                    key={tabId}
                                    onClick={() => onTabChange(tabId)}
                                    data-onboard={tabId === 'events' ? 'events-tab' : undefined}
                                    className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold
                    whitespace-nowrap transition-all duration-200 touch-manipulation
                    ${isActive
                                            ? 'bg-white text-emerald-700 shadow-md ring-1 ring-emerald-100'
                                            : 'text-gray-600 hover:bg-white/70 hover:text-gray-800 active:scale-95'
                                        }
                  `}
                                >
                                    {renderIcon(TabIcon, tabInfo?.emoji, 'icon-16')}
                                    <span>{tabInfo?.label || tabId}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main section buttons */}
            <div className="flex justify-around items-center px-2 py-2 safe-area-pb">
                {sections.map(section => {
                    const isActive = activeSection === section.id;
                    const notifCount = getNotificationCount(section.id);
                    const SectionIcon = section.icon;

                    return (
                        <button
                            key={section.id}
                            onClick={() => handleSectionPress(section, isActive)}
                            className={`
                relative flex flex-col items-center justify-center
                min-w-[64px] min-h-[60px] px-2 py-1.5 rounded-2xl
                transition-all duration-200 touch-manipulation
                ${isActive
                                    ? 'text-emerald-700 bg-gradient-to-br from-emerald-50 to-green-100 shadow-lg scale-105'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
                                }
              `}
                        >
                            <span className={`flex items-center justify-center ${isActive ? 'drop-shadow-sm' : ''}`}>
                                {renderIcon(SectionIcon, section.emoji, 'icon-24')}
                            </span>
                            <span className={`text-[11px] mt-0.5 font-semibold ${isActive ? 'text-emerald-700' : 'text-gray-500'}`}>
                                {section.label}
                            </span>

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
});

NavBar.displayName = 'NavBar';

export default NavBar;
