import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameSidebar from '../components/farm-sim/ui/GameSidebar';
import NavBar from '../components/farm-sim/ui/NavBar';

const mockActions = {
  waterAllPlots: vi.fn(),
  harvestAllReadyCrops: vi.fn(),
  fertilizeAllPlots: vi.fn(),
  treatAllDiseases: vi.fn(),
  saveGame: vi.fn(() => true),
  addNotification: vi.fn(),
  pauseGame: vi.fn(),
  resumeGame: vi.fn(),
};

const mockState = {
  settings: { keyboardShortcuts: true },
  gameLoop: { paused: false },
  inventory: {},
  buildings: {},
  livestock: { animals: [] },
  social: { reputation: 0 },
  plots: [{ state: 'empty' }, { state: 'empty' }],
  dailyChallenges: [],
  notifications: [],
};

vi.mock('../hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

vi.mock('../components/farm-sim/context/GameContext', () => ({
  useGameActions: () => mockActions,
  useGameSelector: (selector) => selector(mockState),
}));

vi.mock('../components/farm-sim/ui/tabs/FarmingTab', () => ({
  default: () => <div>Farming content</div>,
}));

describe('FarmSim navigation semantics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('connects sidebar tabs to the active panel without duplicating farm quick actions', async () => {
    render(<GameSidebar activeTab="farming" onTabChange={vi.fn()} />);

    const tabList = screen.getByRole('tablist', { name: 'Farm tabs' });
    const farmingTab = within(tabList).getByRole('tab', { name: 'Open Farming' });

    expect(farmingTab).toHaveAttribute('id', 'tab-farming');
    expect(farmingTab).toHaveAttribute('aria-controls', 'panel-farming');
    expect(farmingTab).toHaveAttribute('aria-selected', 'true');

    const panel = await screen.findByRole('tabpanel');
    expect(panel).toHaveAttribute('id', 'panel-farming');
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-farming');
    expect(screen.queryByText('Quick actions')).not.toBeInTheDocument();
  });

  it('keeps bottom sections compact until the active section drawer is opened', async () => {
    const user = userEvent.setup();
    const handleSectionChange = vi.fn();
    const handleTabChange = vi.fn();

    render(
      <NavBar
        activeSection="inventory"
        activeTab="shop"
        onSectionChange={handleSectionChange}
        onTabChange={handleTabChange}
      />
    );

    const nav = screen.getByRole('navigation', { name: 'Game section navigation' });
    const itemsSection = within(nav).getByRole('button', {
      name: 'Items. Items, shop, and processing, 3 tabs',
    });

    expect(itemsSection).toHaveAttribute('aria-current', 'page');
    expect(itemsSection).not.toHaveAttribute('role', 'tab');
    expect(itemsSection).not.toHaveAttribute('aria-selected');
    expect(screen.queryByRole('tablist', { name: 'Items sub-tabs' })).not.toBeInTheDocument();

    await user.click(itemsSection);

    const subTabs = screen.getByRole('tablist', { name: 'Items sub-tabs' });
    const shopTab = within(subTabs).getByRole('tab', { name: 'Shop' });
    expect(shopTab).toHaveAttribute('aria-selected', 'true');
  });

  it('only shows the mode banner when the starter flow needs it', () => {
    const props = {
      activeSection: 'farm',
      activeTab: 'farming',
      onSectionChange: vi.fn(),
      onTabChange: vi.fn(),
    };
    const { rerender } = render(<NavBar {...props} />);

    expect(screen.queryByText('Active play mode')).not.toBeInTheDocument();
    expect(screen.queryByText('Starter flow active')).not.toBeInTheDocument();

    rerender(<NavBar {...props} isFirstRunMode />);

    expect(screen.getByText('Starter flow active')).toBeInTheDocument();
  });
});
