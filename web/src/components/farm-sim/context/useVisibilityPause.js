import { useEffect } from 'react';
import { GAME_ACTIONS } from './GameActions';

export function useVisibilityPause({ stateRef, dispatchRef }) {
  useEffect(() => {
    const wasPausedRef = { current: false };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasPausedRef.current = stateRef.current.gameLoop?.paused || false;
        if (!stateRef.current.gameLoop?.paused) {
          dispatchRef.current({
            type: GAME_ACTIONS.UPDATE_GAME_LOOP,
            payload: { paused: true, pausedAt: Date.now(), pauseReason: 'hidden' },
          });
        }
      } else if (!wasPausedRef.current) {
        dispatchRef.current({
          type: GAME_ACTIONS.UPDATE_GAME_LOOP,
          payload: { paused: false, pauseReason: null },
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stateRef, dispatchRef]);
}
