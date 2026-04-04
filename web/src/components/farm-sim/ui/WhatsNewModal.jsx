import React, { memo, useEffect, useMemo, useState } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Button } from '../../ui/button';
import { getLatestReleaseNotes } from '../../../utils/changelog';
import { APP_VERSION } from '../../../config/release';
import { getContentManager } from '../../../content/ContentManager';

const WhatsNewModal = memo(() => {
  const actions = useGameActions();
  const whatsNew = useGameSelector((state) => state.whatsNew || null);
  const [isOpen, setIsOpen] = useState(false);

  const content = getContentManager();
  const releaseNotes = useMemo(() => getLatestReleaseNotes(), []);
  const hasNotes = releaseNotes.sections?.length > 0;
  const lastSeenVersion = whatsNew?.lastSeenVersion || null;
  const shouldShow = hasNotes && lastSeenVersion !== APP_VERSION;

  useEffect(() => {
    if (shouldShow) {
      setIsOpen(true);
    }
  }, [shouldShow]);

  const handleDismiss = () => {
    const current = whatsNew || { dismissed: {} };
    actions.updateWhatsNew({
      ...current,
      lastSeenVersion: APP_VERSION,
    });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const title = content.strings?.ui?.whatsNewTitle || "What's New";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6">
      <section className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.9))] shadow-[0_30px_90px_-36px_rgba(15,23,42,0.65)] backdrop-blur-xl">
        <div className="h-1 bg-gradient-to-r from-emerald-300 via-emerald-200 to-teal-200" />
        <div className="border-b border-emerald-100/70 px-5 py-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-emerald-600">{releaseNotes.title}</div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-emerald-950">✨ {title}</h2>
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto scrollbar-smart px-5 py-4 text-sm text-slate-700">
          {releaseNotes.sections.map((section) => (
            <div key={section.title} className="rounded-[22px] border border-slate-200/60 bg-white/72 px-4 py-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-600">{section.title}</div>
              <ul className="mt-2 space-y-2">
                {section.items.map((item, index) => (
                  <li key={`${section.title}-${index}`} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-emerald-100/70 px-5 py-4">
          <Button size="sm" onClick={handleDismiss}>
            Dismiss
          </Button>
        </div>
      </section>
    </div>
  );
});

WhatsNewModal.displayName = 'WhatsNewModal';

export default WhatsNewModal;
