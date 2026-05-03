/**
 * StoryDashboard (Town Board)
 * Compact identity summary: vibe, suggestion, memory teaser, and wishing well.
 */
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PHILOSOPHIES } from '../../data/identity';

function StoryDashboardComponent({
  moodTier,
  vibeLine,
  suggestion,
  memoryTeaser,
  memoryProgress,
  philosophy,
  onSelectPhilosophy,
  onOpenScrapbook,
  storyPulse,
  activeBlessing,
  canWish,
  wishCost,
  wishDisabledReason,
  onWish,
}) {
  const philosophyLabel = PHILOSOPHIES.find((p) => p.id === philosophy)?.name || null;
  const wishLabel = canWish
    ? `Wish (${wishCost}🪙)`
    : wishDisabledReason?.includes('Need')
      ? `Need ${wishCost}🪙`
      : 'Resting';

  return (
    <Card className="border-2 border-amber-100 bg-white/90 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-xl">📌</span>
            Town Board
          </CardTitle>
          {storyPulse && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              new
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Today's vibe */}
        <div className="flex items-start gap-3">
          <div className="text-2xl">{moodTier?.emoji || '🌿'}</div>
          <div>
            <div className="text-sm font-semibold">
              Today&apos;s vibe:{' '}
              <span className="mood-accent-text">{moodTier?.name || 'Calm'}</span>
            </div>
            <div className="text-xs text-gray-600">{vibeLine}</div>
          </div>
        </div>

        {/* Cozy suggestion */}
        <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Cozy suggestion
          </div>
          {philosophy ? (
            <div className="text-sm text-gray-800">
              <span className="font-semibold">{philosophyLabel}:</span> {suggestion}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-gray-700">
                Choose a farm philosophy to guide suggestions.
              </div>
              <div className="flex flex-wrap gap-2">
                {PHILOSOPHIES.map((p) => (
                  <Button
                    key={p.id}
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectPhilosophy?.(p.id)}
                  >
                    {p.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Memory teaser */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Memory teaser
            </div>
            <div className="text-sm text-gray-700">{memoryTeaser}</div>
          </div>
          {memoryProgress && (
            <span className="text-[10px] font-semibold text-gray-500 bg-white/80 border border-gray-200 px-2 py-1 rounded-full">
              {memoryProgress}
            </span>
          )}
        </div>

        {/* Wishing Well */}
        <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                Wishing Well
              </div>
              {activeBlessing ? (
                <div className="text-sm text-gray-800">
                  <span className="font-semibold">
                    {activeBlessing.emoji} {activeBlessing.name}
                  </span>
                  <div className="text-xs text-gray-600">{activeBlessing.description}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-700">Make a wish for a cozy blessing today.</div>
              )}
              {!canWish && !activeBlessing && (
                <div className="text-[11px] text-gray-500">{wishDisabledReason}</div>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onWish}
              disabled={!canWish}
              className="whitespace-nowrap"
            >
              {wishLabel}
            </Button>
          </div>
        </div>

        {onOpenScrapbook && (
          <Button size="sm" variant="outline" onClick={onOpenScrapbook} className="w-full">
            Open Scrapbook
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export const StoryDashboard = memo(StoryDashboardComponent);
