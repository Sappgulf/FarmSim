import React, { memo, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { PHILOSOPHIES } from '../../../../data/identity';
import { ALMANAC_PAGES, ALMANAC_SECTIONS } from '../../../../data/almanac';
import { getAlmanacText } from '../../../../systems/almanac';

const AlmanacTab = memo(() => {
  const { state, actions } = useGame();
  const [openSections, setOpenSections] = useState(() => ALMANAC_SECTIONS.map(section => section.id));
  const reduceMotion = state.settings?.reducedMotion;

  const pagesBySection = useMemo(() => {
    const grouped = {};
    ALMANAC_SECTIONS.forEach((section) => {
      grouped[section.id] = [];
    });
    ALMANAC_PAGES.forEach((page) => {
      if (!grouped[page.section]) {
        grouped[page.section] = [];
      }
      grouped[page.section].push(page);
    });
    return grouped;
  }, []);

  const totalUnlocked = ALMANAC_PAGES.reduce(
    (count, page) => count + (state.almanac?.unlocked?.[page.id] ? 1 : 0),
    0
  );

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => (
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    ));
  };

  const handleSelectPhilosophy = (philosophyId) => {
    actions.setPhilosophy(philosophyId);
    actions.recordAlmanacEvent('philosophy_selected', { philosophyId });
    actions.addNotification({
      message: `📌 Philosophy set: ${PHILOSOPHIES.find(p => p.id === philosophyId)?.name || philosophyId}`,
      type: 'info',
    });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-emerald-800">📖 Farm Almanac</h3>
            <p className="text-sm text-emerald-700">
              A living journal of what your farm has learned.
            </p>
          </div>
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700">
            {totalUnlocked}/{ALMANAC_PAGES.length} pages
          </Badge>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-gray-800">Farm Philosophy</h4>
            <p className="text-sm text-gray-600">Almanac voice shifts with your guiding outlook.</p>
          </div>
          {state.philosophy && (
            <Badge className="bg-amber-100 text-amber-700">
              {PHILOSOPHIES.find(p => p.id === state.philosophy)?.name || 'Chosen'}
            </Badge>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PHILOSOPHIES.map((philosophy) => (
            <Button
              key={philosophy.id}
              size="sm"
              variant={state.philosophy === philosophy.id ? 'default' : 'outline'}
              onClick={() => handleSelectPhilosophy(philosophy.id)}
            >
              {philosophy.name}
            </Button>
          ))}
        </div>
      </Card>

      {ALMANAC_SECTIONS.map((section) => {
        const sectionPages = pagesBySection[section.id] || [];
        const unlockedCount = sectionPages.filter(page => state.almanac?.unlocked?.[page.id]).length;
        const isOpen = openSections.includes(section.id);
        const motionClass = reduceMotion ? '' : 'transition-opacity transition-transform duration-200';

        return (
          <Card key={section.id} className="p-4">
            <button
              className="w-full flex items-center justify-between text-left"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{section.icon}</span>
                <div>
                  <div className="font-semibold text-gray-800">{section.title}</div>
                  <div className="text-xs text-gray-500">{section.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {unlockedCount}/{sectionPages.length}
                </Badge>
                <span className={`text-sm ${isOpen ? 'rotate-180' : ''} ${reduceMotion ? '' : 'transition-transform'}`}>
                  ▾
                </span>
              </div>
            </button>

            <div
              className={`${isOpen ? 'mt-4 max-h-[1200px]' : 'mt-0 max-h-0'} overflow-hidden ${motionClass} ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none'
              }`}
            >
              <div className="space-y-3">
                {sectionPages.map((page) => {
                  const unlocked = !!state.almanac?.unlocked?.[page.id];
                  const dateUnlocked = state.almanac?.dates?.[page.id];
                  const showHint = state.settings?.showAlmanacHints !== false;

                  return (
                    <div
                      key={page.id}
                      className={`p-3 rounded-lg border ${unlocked ? 'bg-white border-emerald-100' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-xl">{unlocked ? page.icon : '🔒'}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-gray-800">
                              {unlocked ? page.title : 'Unknown Page'}
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase">
                              {unlocked ? 'Unlocked' : 'Locked'}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {unlocked
                              ? getAlmanacText(page, state.philosophy)
                              : (showHint ? page.hint : 'Keep exploring to reveal this entry.')}
                          </div>
                          {unlocked && dateUnlocked && (
                            <div className="text-[10px] text-gray-400 mt-1">
                              First noted on {new Date(dateUnlocked).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
});

AlmanacTab.displayName = 'AlmanacTab';
export default AlmanacTab;
