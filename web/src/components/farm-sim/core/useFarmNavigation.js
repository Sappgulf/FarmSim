import { useCallback, useMemo, useState } from 'react';
import { logDebugAction } from '../../../utils/debugTools';
import { NAV_SECTIONS } from '../ui/NavBar';

const NAV_TAB_IDS = Object.values(NAV_SECTIONS).flatMap((section) => section.tabs);
const LAST_TAB_STORAGE_KEY = 'farm_sim_active_tab_v1';

export const DEFAULT_ACTIVE_TAB = 'farming';

export const isValidTabId = (tabId) => NAV_TAB_IDS.includes(tabId);

export const getSectionForTab = (tabId) =>
  Object.values(NAV_SECTIONS).find((section) => section.tabs.includes(tabId))?.id || null;

const readPersistedActiveTab = () => {
  if (typeof window === 'undefined') return DEFAULT_ACTIVE_TAB;
  try {
    const stored = window.localStorage.getItem(LAST_TAB_STORAGE_KEY);
    return isValidTabId(stored) ? stored : DEFAULT_ACTIVE_TAB;
  } catch (error) {
    return DEFAULT_ACTIVE_TAB;
  }
};

const persistActiveTab = (tabId) => {
  if (typeof window === 'undefined') return;
  try {
    if (isValidTabId(tabId)) {
      window.localStorage.setItem(LAST_TAB_STORAGE_KEY, tabId);
    }
  } catch (error) {
    // best effort: ignore persistence failures on restricted environments
  }
};

export function useFarmNavigation({ actions }) {
  const initialNavigation = useMemo(() => {
    const tab = readPersistedActiveTab();
    return {
      activeTab: tab,
      activeSection: getSectionForTab(tab) || 'farm',
    };
  }, []);

  const [activeTab, setActiveTab] = useState(initialNavigation.activeTab);
  const [activeSection, setActiveSection] = useState(initialNavigation.activeSection);

  const handleTabChange = useCallback(
    (tabId) => {
      if (!isValidTabId(tabId)) return;

      setActiveTab(tabId);
      persistActiveTab(tabId);

      const sectionId = getSectionForTab(tabId);
      if (sectionId) {
        setActiveSection(sectionId);
      }

      logDebugAction('tab_change', { tabId });
      if (tabId === 'events') {
        actions.recordOnboardingEvent('board_open');
      }
    },
    [actions]
  );

  const handleSectionChange = useCallback((sectionId) => {
    setActiveSection(sectionId);
    logDebugAction('nav_section_change', { sectionId });

    const section = NAV_SECTIONS[sectionId];
    if (!section) return;

    setActiveTab((currentTab) => {
      if (section.tabs.includes(currentTab)) return currentTab;
      const nextTab = section.tabs[0] || DEFAULT_ACTIVE_TAB;
      persistActiveTab(nextTab);
      return nextTab;
    });
  }, []);

  return {
    activeTab,
    activeSection,
    handleSectionChange,
    handleTabChange,
  };
}
