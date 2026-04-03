import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StartScreen } from '../components/farm-sim/ui/StartScreen';

describe('StartScreen', () => {
  it('renders the launch gate and starts the game from either action', () => {
    const onStart = vi.fn();
    render(<StartScreen onStart={onStart} />);

    expect(screen.getByTestId('start-screen')).toBeInTheDocument();
    expect(screen.getByText('Build a farm that feels alive.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /start farming/i }));
    expect(onStart).toHaveBeenCalledTimes(1);

  });
});
