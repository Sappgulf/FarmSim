import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

describe('Tabs', () => {
  it('respects explicit layout classes on TabsList', () => {
    render(
      <Tabs defaultValue="farm">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="farm">Farm</TabsTrigger>
          <TabsTrigger value="town">Town</TabsTrigger>
        </TabsList>
      </Tabs>
    );

    const tablist = screen.getByRole('tablist');
    expect(tablist.className.includes('grid')).toBe(true);
    expect(tablist.className.includes('flex flex-wrap gap-1.5')).toBe(false);
  });

  it('supports arrow-key tab navigation', () => {
    render(
      <Tabs defaultValue="farm">
        <TabsList>
          <TabsTrigger value="farm">Farm</TabsTrigger>
          <TabsTrigger value="town">Town</TabsTrigger>
        </TabsList>
        <TabsContent value="farm">Farm Content</TabsContent>
        <TabsContent value="town">Town Content</TabsContent>
      </Tabs>
    );

    const farmTab = screen.getByRole('tab', { name: 'Farm' });
    fireEvent.keyDown(farmTab, { key: 'ArrowRight' });

    const townTab = screen.getByRole('tab', { name: 'Town' });
    expect(townTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('Town Content')).toBeTruthy();
  });
});
