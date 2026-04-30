import React, { memo, useEffect, useMemo, useState } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { getLatestReleaseNotes } from '../../../utils/changelog';
import { APP_VERSION } from '../../../config/release';
import { getContentManager } from '../../../content/ContentManager';
import { Sparkles, PartyPopper, Wrench, Zap, Palette, Plus } from 'lucide-react';
import { ONBOARDING_TUTORIAL_COMPLETE_STEP_INDEX } from '../data/onboardingTutorialSteps';

const SECTION_ICONS = {
  Added: Plus,
  Changed: Sparkles,
  Fixed: Wrench,
  Performance: Zap,
  'UI/UX': Palette,
};

const SECTION_EMOJIS = {
  Added: '✨',
  Changed: '🔄',
  Fixed: '🛠️',
  Performance: '⚡',
  'UI/UX': '🎨',
};

export const MIN_ONBOARDING_STEP_FOR_WHATS_NEW = ONBOARDING_TUTORIAL_COMPLETE_STEP_INDEX;

export const shouldShowWhatsNew = ({
  hasNotes,
  lastSeenVersion,
  appVersion = APP_VERSION,
  onboardingStep = 0,
  onboardingSkipped = false,
}) => (
  hasNotes
  && lastSeenVersion !== appVersion
  && (onboardingSkipped || onboardingStep >= MIN_ONBOARDING_STEP_FOR_WHATS_NEW)
);

const WhatsNewModal = memo(() => {
  const actions = useGameActions();
  const whatsNew = useGameSelector((state) => state.whatsNew || null);
  const onboardingStep = useGameSelector((state) => state.onboardingStep || 0);
  const onboardingSkipped = useGameSelector((state) => Boolean(state.onboardingSkipped));
  const [isOpen, setIsOpen] = useState(false);

  const content = getContentManager();
  const releaseNotes = useMemo(() => getLatestReleaseNotes(), []);
  const hasNotes = releaseNotes.sections?.length > 0;
  const lastSeenVersion = whatsNew?.lastSeenVersion || null;
  const shouldShow = shouldShowWhatsNew({
    hasNotes,
    lastSeenVersion,
    onboardingStep,
    onboardingSkipped,
  });

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8 sm:p-8">
      <section className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] shadow-[0_30px_90px_-36px_rgba(15,23,42,0.65)] backdrop-blur-xl max-h-[min(88vh,calc(100dvh-4rem))] mx-auto">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300" />

        {/* Header with celebration feel */}
        <div className="relative overflow-hidden border-b border-emerald-100/70 px-5 py-5">
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center gap-8 pt-2 opacity-40">
            <PartyPopper className="h-5 w-5 text-emerald-400 animate-bounce" style={{ animationDelay: '0s' }} />
            <Sparkles className="h-4 w-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <PartyPopper className="h-5 w-5 text-teal-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600">
                  {releaseNotes.title}
                </div>
                <Badge variant="outline" className="text-[10px] font-bold text-emerald-700 border-emerald-200 bg-emerald-50/60">
                  v{APP_VERSION}
                </Badge>
              </div>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-emerald-950">
                ✨ {title}
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="max-h-[70vh] space-y-3 overflow-y-auto scrollbar-smart px-5 py-4 text-sm text-slate-700">
          {releaseNotes.sections.map((section) => {
            const SectionIcon = SECTION_ICONS[section.title] || Sparkles;
            const emoji = SECTION_EMOJIS[section.title] || '✨';
            return (
              <div
                key={section.title}
                className="rounded-[22px] border border-slate-200/60 bg-white/80 px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
                  <SectionIcon className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{emoji} {section.title}</span>
                </div>
                <ul className="mt-2.5 space-y-2">
                  {section.items.map((item, index) => (
                    <li key={`${section.title}-${index}`} className="flex items-start gap-2.5 text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-emerald-100/70 px-5 py-4">
          <Button size="sm" variant="default" onClick={handleDismiss}>
            Got it
          </Button>
        </div>
      </section>
    </div>
  );
});

WhatsNewModal.displayName = 'WhatsNewModal';

export default WhatsNewModal;
