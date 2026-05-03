import { useRef, useCallback, useEffect } from 'react';
import { GAME_ACTIONS } from './GameActions';
import { SAVE_KEY, BACKUP_SAVE_KEY, saveStateToStorage } from './GamePersistence';
import { getDayKey } from '../../../systems/almanac';

export function useAutoSave({ stateRef, dispatchRef, actionsRef, paused, autoSaveEnabled }) {
  const autoSaveTimeoutRef = useRef(null);
  const deferredAutoSaveRef = useRef(null);
  const idleAutoSaveRef = useRef(null);
  const lastSaveStateRef = useRef('');

  const buildAutoSaveSignature = useCallback((stateToSave) => {
    if (!stateToSave || typeof stateToSave !== 'object') return '';
    const { gameLoop, ...rest } = stateToSave;
    return JSON.stringify({
      ...rest,
      notifications: [],
      gameLoop: {
        paused: Boolean(gameLoop?.paused),
        pauseReason: typeof gameLoop?.pauseReason === 'string' ? gameLoop.pauseReason : null,
      },
    });
  }, []);

  const debouncedAutoSave = useCallback(
    (stateToSave) => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (deferredAutoSaveRef.current) {
        clearTimeout(deferredAutoSaveRef.current);
        deferredAutoSaveRef.current = null;
      }
      if (idleAutoSaveRef.current && typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(idleAutoSaveRef.current);
        idleAutoSaveRef.current = null;
      }

      const stateSignature = buildAutoSaveSignature(stateToSave);
      if (stateSignature === lastSaveStateRef.current) return;

      autoSaveTimeoutRef.current = setTimeout(() => {
        try {
          const saveToStorage = () => {
            idleAutoSaveRef.current = null;
            deferredAutoSaveRef.current = null;

            try {
              const latestState = stateRef.current;
              if (!latestState?.settings?.autoSave) return;

              const latestSignature = buildAutoSaveSignature(latestState);
              if (latestSignature === lastSaveStateRef.current) return;

              const saveResult = saveStateToStorage(latestState, {
                key: SAVE_KEY,
                backupKey: BACKUP_SAVE_KEY,
              });
              if (saveResult.success) {
                lastSaveStateRef.current = latestSignature;
                if (dispatchRef.current) {
                  dispatchRef.current({
                    type: GAME_ACTIONS.UPDATE_GAME_LOOP,
                    payload: { lastSaveTime: saveResult.timestamp },
                  });
                }
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('[farm] Auto-save failed:', error);
            }
          };

          if (typeof requestIdleCallback !== 'undefined') {
            idleAutoSaveRef.current = requestIdleCallback(saveToStorage, { timeout: 1000 });
          } else {
            deferredAutoSaveRef.current = setTimeout(saveToStorage, 0);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[farm] Auto-save serialization failed:', error);
        }
      }, 2000);
    },
    [buildAutoSaveSignature, stateRef, dispatchRef]
  );

  // Performance loop: FPS monitoring and auto-save trigger
  useEffect(() => {
    if (paused) return;

    let frameCount = 0;
    let lastFPSUpdate = performance.now();
    let lastAutoSaveCheck = Date.now();
    let animationFrameId = null;

    const masterGameLoop = (currentTime) => {
      const currentState = stateRef.current;
      if (currentState.gameLoop.paused) return;

      frameCount++;
      if (currentTime - lastFPSUpdate >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFPSUpdate));
        window.__currentFPS = fps;
        frameCount = 0;
        lastFPSUpdate = currentTime;
      }

      const now = Date.now();
      if (autoSaveEnabled && now - lastAutoSaveCheck >= 30000) {
        const dayKey = getDayKey();
        if (dayKey !== currentState.almanac?.lastDayKey) {
          actionsRef.current?.recordAlmanacEvent('day_rollover', { dayKey });
          actionsRef.current?.recordCozyExpansionEvent('day_rollover', { dayKey });
          actionsRef.current?.recordRetentionVisit(dayKey, now);
          actionsRef.current?.recordMilestoneEvent('day_advance', { dayKey });
        }
        debouncedAutoSave(currentState);
        lastAutoSaveCheck = now;
      }

      animationFrameId = requestAnimationFrame(masterGameLoop);
    };

    animationFrameId = requestAnimationFrame(masterGameLoop);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      if (deferredAutoSaveRef.current) clearTimeout(deferredAutoSaveRef.current);
      if (idleAutoSaveRef.current && typeof cancelIdleCallback !== 'undefined') {
        cancelIdleCallback(idleAutoSaveRef.current);
      }
    };
  }, [paused, autoSaveEnabled, debouncedAutoSave, stateRef, actionsRef]);

  return { debouncedAutoSave };
}
