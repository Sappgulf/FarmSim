import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameplaySettings } from '../components/farm-sim/ui/tabs/settings/GameplaySettings';

const noop = () => {};

const baseProps = {
  autoSaveEnabled: true,
  animationsEnabled: true,
  showFPS: false,
  reducedMotion: false,
  showTooltips: true,
  showAlmanacHints: true,
  showWelcomeBackSummary: true,
  fastMode: false,
  particleEffects: true,
  keyboardShortcutsEnabled: true,
  handleToggleAnimations: noop,
  handleToggleAutoSave: noop,
  handleToggleShowFps: noop,
  handleToggleReducedMotion: noop,
  handleToggleTooltips: noop,
  handleToggleAlmanacHints: noop,
  handleToggleWelcomeBackSummary: noop,
  handleToggleFastMode: noop,
  handleToggleParticleEffects: noop,
  handleToggleKeyboardShortcuts: vi.fn(),
};

describe('GameplaySettings hotkey cheat sheet', () => {
  beforeEach(() => {
    baseProps.handleToggleKeyboardShortcuts = vi.fn();
  });

  it('lists the supported shortcuts and badges the active state', () => {
    render(<GameplaySettings {...baseProps} />);

    const list = screen.getByRole('list', { name: 'Keyboard shortcuts' });
    expect(list).toBeInTheDocument();

    expect(
      screen.getByText('Switch to tabs 1–9 (Farming, Inventory, Shop, …)')
    ).toBeInTheDocument();
    expect(screen.getByText('Water all plots')).toBeInTheDocument();
    expect(screen.getByText('Harvest all ready crops')).toBeInTheDocument();
    expect(screen.getByText('Fertilize all plots')).toBeInTheDocument();
    expect(screen.getByText('Treat diseased plots')).toBeInTheDocument();
    expect(screen.getByText('Pause / resume the game loop')).toBeInTheDocument();
    expect(screen.getByText('Save manually')).toBeInTheDocument();

    expect(screen.getByText('Shortcuts on')).toBeInTheDocument();
  });

  it('flips the badge to "paused" when shortcuts are disabled', () => {
    render(<GameplaySettings {...baseProps} keyboardShortcutsEnabled={false} />);

    expect(screen.getByText('Shortcuts paused')).toBeInTheDocument();
  });

  it('exposes a keyboard-shortcuts toggle that forwards to the handler', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<GameplaySettings {...baseProps} handleToggleKeyboardShortcuts={onToggle} />);

    await user.click(screen.getByRole('button', { name: 'Keyboard Shortcuts on' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
