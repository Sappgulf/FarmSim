/**
 * ScrapbookPanel
 * Chapters + memory pages (identity system).
 */
import React, { memo, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

function ScrapbookPanelComponent({
  chapters = [],
  memories = [],
  memoryFlags = {},
  almanacLinks = {},
  almanacUnlocked = {},
  onOpenAlmanac,
  spotlight,
  onSetSpotlight,
  onOpen,
}) {
  const [activeChapter, setActiveChapter] = useState('all');

  useEffect(() => {
    onOpen?.();
  }, [onOpen]);

  const sortedChapters = useMemo(() => {
    return [...chapters].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [chapters]);

  const totalUnlocked = useMemo(() => {
    return memories.reduce((count, memory) => count + (memoryFlags[memory.id] ? 1 : 0), 0);
  }, [memories, memoryFlags]);

  const filteredMemories = useMemo(() => {
    const list = [...memories].sort((a, b) => (a.order || 0) - (b.order || 0));
    if (activeChapter === 'all') return list;
    return list.filter(memory => memory.chapterId === activeChapter);
  }, [memories, activeChapter]);

  const chapterProgress = useMemo(() => {
    const progress = {};
    sortedChapters.forEach((chapter) => {
      const chapterMemories = memories.filter(m => m.chapterId === chapter.id);
      const unlocked = chapterMemories.reduce((count, m) => count + (memoryFlags[m.id] ? 1 : 0), 0);
      progress[chapter.id] = {
        total: chapterMemories.length,
        unlocked,
      };
    });
    return progress;
  }, [sortedChapters, memories, memoryFlags]);

  const spotlightMemory = useMemo(() => {
    if (spotlight?.type !== 'memory' || !spotlight?.id) return null;
    return memories.find((memory) => memory.id === spotlight.id) || null;
  }, [memories, spotlight]);

  return (
    <Card className="border-2 border-emerald-100 bg-white/95 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-xl">📖</span>
            Scrapbook
          </CardTitle>
          <span className="text-xs font-semibold text-gray-500">
            {totalUnlocked}/{memories.length} pages
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {onSetSpotlight && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-sm text-gray-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">Farm Card Spotlight</div>
                <div className="mt-1 font-semibold">
                  {spotlight?.mode === 'latest'
                    ? 'Latest Memory (auto)'
                    : (spotlightMemory?.title || 'Select a memory')}
                </div>
                <div className="text-xs text-gray-600">
                  {spotlight?.mode === 'latest'
                    ? 'Automatically highlights the newest unlocked memory.'
                    : 'This memory will appear on your Farm Card.'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSetSpotlight({ mode: 'latest', type: 'memory', id: null })}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Use Latest
              </button>
            </div>
          </div>
        )}

        {/* Chapter Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              activeChapter === 'all'
                ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveChapter('all')}
          >
            All Chapters
          </button>
          {sortedChapters.map((chapter) => {
            const progress = chapterProgress[chapter.id] || { total: 0, unlocked: 0 };
            return (
              <button
                key={chapter.id}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  activeChapter === chapter.id
                    ? 'bg-amber-100 border-amber-200 text-amber-800'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveChapter(chapter.id)}
              >
                {chapter.name} {progress.unlocked}/{progress.total}
              </button>
            );
          })}
        </div>

        {/* Chapter Summary */}
        {activeChapter !== 'all' && (
          <div className="text-sm text-gray-600">
            {sortedChapters.find(c => c.id === activeChapter)?.description}
          </div>
        )}

        {/* Memory Pages */}
        <div className="space-y-2">
          {filteredMemories.map((memory) => {
            const unlocked = !!memoryFlags[memory.id];
            const relatedAlmanacId = almanacLinks[memory.id];
            const relatedAlmanacUnlocked = relatedAlmanacId && almanacUnlocked[relatedAlmanacId];
            return (
              <div
                key={memory.id}
                className={`p-3 rounded-lg border transition-colors ${
                  unlocked
                    ? 'bg-white border-emerald-100 shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl">{memory.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">
                      {memory.title}
                      {!unlocked && <span className="ml-2 text-[10px] uppercase">Locked</span>}
                    </div>
                    <div className="text-xs text-gray-600">
                      {unlocked ? memory.description : memory.hint}
                    </div>
                    {relatedAlmanacId && (
                      <button
                        type="button"
                        onClick={() => onOpenAlmanac?.(relatedAlmanacId)}
                        className="mt-2 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        {relatedAlmanacUnlocked ? 'Open related Almanac page' : 'Related Almanac page (locked)'}
                      </button>
                    )}
                  </div>
                  {unlocked && (
                    <div className="flex flex-col items-end gap-2">
                      {onSetSpotlight && (
                        <button
                          type="button"
                          onClick={() => onSetSpotlight({ mode: 'favorite', type: 'memory', id: memory.id })}
                          className={`text-[10px] px-2 py-1 rounded-full border ${
                            spotlight?.mode === 'favorite' && spotlight?.type === 'memory' && spotlight?.id === memory.id
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50'
                          }`}
                        >
                          {spotlight?.mode === 'favorite' && spotlight?.type === 'memory' && spotlight?.id === memory.id
                            ? 'Spotlighted'
                            : 'Set Spotlight'}
                        </button>
                      )}
                      <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                        Saved
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export const ScrapbookPanel = memo(ScrapbookPanelComponent);
