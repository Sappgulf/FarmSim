import React, { memo, useMemo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Input } from '../../../ui/input';
import { PHILOSOPHIES } from '../../../../data/identity';
import { ALMANAC_PAGES, ALMANAC_SECTIONS } from '../../../../data/almanac';
import { getAlmanacText } from '../../../../systems/almanac';
import { FARM_THEMES, getFarmTheme } from '../../../../data/farmThemes';
import { buildFarmCardData, getSpotlightSelection } from '../../../../utils/farmCard';
import { CROP_TRAITS, FARM_TITLES } from '../../../../data/cozyExpansion';
import FarmCardShareButton from '../FarmCardShareButton';

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
  const spotlight = getSpotlightSelection(state);
  const farmCardSpotlight = buildFarmCardData(state).spotlight;
  const unlockedPages = ALMANAC_PAGES.filter((page) => state.almanac?.unlocked?.[page.id]);
  const activeTheme = getFarmTheme(state.farmTheme);

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
            <h4 className="font-semibold text-gray-800">Farm Title</h4>
            <p className="text-sm text-gray-600">Cosmetic title for your Farm Card and Town Board.</p>
          </div>
        </div>
        <div className="mt-3">
          <select
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            value={state.cozyExpansion?.farmTitles?.activeId || 'home_grower'}
            onChange={(event) => actions.setActiveFarmTitle(event.target.value)}
          >
            {Object.values(FARM_TITLES).filter((title) => state.cozyExpansion?.farmTitles?.unlocked?.[title.id]).map((title) => (
              <option key={title.id} value={title.id}>{title.name}</option>
            ))}
          </select>
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

      <Card className="p-4 theme-card-surface border theme-accent-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold">Farm Identity</h4>
            <p className="text-sm text-gray-600">Set a name and theme for your Farm Card.</p>
          </div>
          <Badge variant="outline" className="theme-accent-bg theme-accent-border border theme-accent-text">
            {activeTheme.name}
          </Badge>
        </div>
        <div className="mt-3 space-y-3">
          <div className="rounded-lg border theme-accent-border theme-accent-bg px-3 py-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">Live Farm Card Identity</div>
            <div className="text-sm font-semibold">{(state.farmName || 'Willowbrook Farm').trim() || 'Willowbrook Farm'}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Farm Name</label>
            <Input
              value={state.farmName || ''}
              onChange={(event) => actions.setFarmName(event.target.value)}
              placeholder="Name your farm"
              className="mt-1"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500">Farm Theme</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {FARM_THEMES.map((theme) => (
                <Button
                  key={theme.id}
                  size="sm"
                  variant={state.farmTheme === theme.id ? 'default' : 'outline'}
                  onClick={() => actions.setFarmTheme(theme.id)}
                >
                  {theme.name}
                </Button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">{activeTheme.description}</div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-gray-800">Farm Card Spotlight</h4>
            <p className="text-sm text-gray-600">Choose what the Farm Card highlights.</p>
          </div>
          <FarmCardShareButton size="sm" variant="outline" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={spotlight.mode === 'latest' ? 'default' : 'outline'}
            onClick={() => actions.setSpotlight({ mode: 'latest', type: 'memory', id: null })}
          >
            Latest Memory
          </Button>
          <Button
            size="sm"
            variant={spotlight.mode === 'favorite' && spotlight.type === 'almanac' ? 'default' : 'outline'}
            onClick={() => {
              const firstPage = unlockedPages[0]?.id || null;
              actions.setSpotlight({ mode: 'favorite', type: 'almanac', id: firstPage });
            }}
            disabled={unlockedPages.length === 0}
          >
            Favorite Almanac Page
          </Button>
        </div>
        {spotlight.mode === 'favorite' && spotlight.type === 'almanac' && (
          <div className="mt-3">
            <label className="text-xs font-semibold text-gray-500">Select Page</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
              value={spotlight.id || ''}
              onChange={(event) => actions.setSpotlight({ mode: 'favorite', type: 'almanac', id: event.target.value })}
            >
              {unlockedPages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-sm text-gray-700">
          <div className="text-xs uppercase tracking-wide text-gray-500">Current Spotlight</div>
          <div className="mt-1 font-semibold">{farmCardSpotlight.title}</div>
          <div className="text-sm text-gray-600">{farmCardSpotlight.text}</div>
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="font-semibold text-gray-800">Crop Trait Discoveries</h4>
        <p className="text-sm text-gray-600">Discovered passively on harvest. Cosmetic only.</p>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {Object.entries(state.cozyExpansion?.cropTraits?.discoveredByCrop || {}).length === 0 && (
            <div className="text-sm text-gray-500">No traits discovered yet.</div>
          )}
          {Object.entries(state.cozyExpansion?.cropTraits?.discoveredByCrop || {}).map(([cropId, traitId]) => {
            const trait = CROP_TRAITS[traitId];
            return (
              <div key={cropId} className="rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2 text-sm">
                <span className="font-semibold">{cropId}</span>: {trait?.icon || '🌿'} {trait?.name || traitId}
                <span className="ml-1 text-xs text-gray-600">{trait?.flavor}</span>
              </div>
            );
          })}
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
