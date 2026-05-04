import React, { memo, useEffect, useMemo, useState } from 'react';
import { useGameActions, useGameSelector } from '../context/GameContext';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { getLatestReleaseNotes } from '../../../utils/changelog';
import { APP_VERSION } from '../../../config/release';
import { getContentManager } from '../../../content/ContentManager';
import { ONBOARDING_STEP_COUNT } from '../../../constants/onboardingWalkthrough';

const WhatsNewModal = memo(() => {
  const actions = useGameActions();
  const whatsNew = useGameSelector((state) => state.whatsNew || null);
  const [isOpen, setIsOpen] = useState(false);

  const content = getContentManager();
  const releaseNotes = useMemo(() => getLatestReleaseNotes(), []);
  const hasNotes = releaseNotes.sections?.length > 0;
  const lastSeenVersion = whatsNew?.lastSeenVersion || null;
  const walkthroughComplete = useGameSelector((state) => {
    const step = state.onboardingStep || 0;
    return Boolean(state.onboardingSkipped || step >= ONBOARDING_STEP_COUNT);
  });
  const shouldShow =
    hasNotes && lastSeenVersion !== APP_VERSION && walkthroughComplete;

  useEffect(() => {
    if (shouldShow) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4 py-6 animate-overlay-backdrop">
      <Card className="w-full max-w-lg bg-white shadow-xl animate-overlay-card">
        <div className="border-b border-emerald-100 p-4">
          <div className="text-xs uppercase tracking-wide text-emerald-600">
            {releaseNotes.title}
          </div>
          <h2 className="mt-1 text-lg font-semibold text-emerald-900">✨ {title}</h2>
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4 text-sm text-gray-700">
          {releaseNotes.sections.map((section) => (
            <div key={section.title}>
              <div className="text-xs uppercase tracking-wide text-emerald-500">
                {section.title}
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {section.items.map((item, index) => (
                  <li key={`${section.title}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-emerald-100 p-4">
          <Button size="sm" onClick={handleDismiss}>
            Dismiss
          </Button>
        </div>
      </Card>
    </div>
  );
});

WhatsNewModal.displayName = 'WhatsNewModal';

export default WhatsNewModal;
