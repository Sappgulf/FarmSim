import { useEffect, useRef } from 'react';
import { isDevelopmentMode } from '../../../config/release';
import { createLogger } from '../../../utils/logger';

const log = createLogger('AudioLifecycle');

export function useFarmAudioLifecycle({
  soundSystem,
  musicSystem,
  soundEnabled,
  musicEnabled,
  seasonCurrent,
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    window.soundSystem = soundSystem;
    window.musicSystem = musicSystem;

    soundSystem.setEnabled(soundEnabled);
    musicSystem.setEnabled(musicEnabled);

    let hasInteracted = false;
    const handleUserInteraction = async () => {
      if (hasInteracted) return;
      hasInteracted = true;

      try {
        await soundSystem.resume();
        await musicSystem.resume();

        if (musicEnabled && !musicSystem.isPlaying) {
          musicSystem.setSeason(seasonCurrent);
          musicSystem.play();
        }

        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      } catch (error) {
        if (isDevelopmentMode()) {
          log.debug('Audio resume failed:', error);
        }
      }
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    if (musicEnabled) {
      musicSystem.setSeason(seasonCurrent);
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      delete window.soundSystem;
      musicSystem.stop();
      delete window.musicSystem;
    };
  }, [musicEnabled, musicSystem, seasonCurrent, soundEnabled, soundSystem]);

  const prevSeasonRef = useRef(seasonCurrent);
  useEffect(() => {
    if (seasonCurrent && seasonCurrent !== prevSeasonRef.current && musicEnabled) {
      musicSystem.setSeason(seasonCurrent);
      prevSeasonRef.current = seasonCurrent;
      if (isDevelopmentMode()) {
        log.debug(`Music changed to ${seasonCurrent} theme`);
      }
    }
  }, [musicEnabled, musicSystem, seasonCurrent]);
}
