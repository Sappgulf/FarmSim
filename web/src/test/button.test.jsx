import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/button';

describe('Button', () => {
  it('defaults to type button', () => {
    render(<Button>Play</Button>);
    const button = screen.getByRole('button', { name: 'Play' });
    expect(button.getAttribute('type')).toBe('button');
  });

  it('preserves explicit type', () => {
    render(<Button type="submit">Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.getAttribute('type')).toBe('submit');
  });
});
