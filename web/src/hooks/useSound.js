/**
 * useSound Hook - Web Audio API sound effects
 * Generates satisfying sounds without external audio files
 */
import { useCallback, useRef, useEffect } from 'react';
import { createLogger } from '../utils/logger.js';

const soundLog = createLogger('sound');

// Audio context singleton
let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Resume audio context on user interaction (required by browsers)
function ensureAudioReady() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

// Sound synthesis functions
const sounds = {
  // Plant seed - soft "ploop" sound
  plant: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  },

  // Water - bubbly splash sound
  water: (ctx) => {
    // Multiple short blips for water droplet effect
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      filter.type = 'lowpass';
      filter.frequency.value = 2000;

      const startTime = ctx.currentTime + i * 0.04;
      const freq = 600 + Math.random() * 400;

      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, startTime + 0.08);

      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    }
  },

  // Harvest - satisfying "pop" with rising tone
  harvest: (ctx) => {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const gain2 = ctx.createGain();

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(ctx.destination);
    gain2.connect(ctx.destination);

    // Main pop
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    // Harmonic overtone
    osc2.frequency.setValueAtTime(600, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.06);
    osc2.type = 'triangle';

    gain2.gain.setValueAtTime(0.08, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.12);
  },

  // Coin collect - classic coin sound
  coin: (ctx, pitch = 1) => {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    const baseFreq = 987 * pitch; // B5
    const harmonic = 1318 * pitch; // E6

    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc2.frequency.setValueAtTime(harmonic, ctx.currentTime);
    osc.type = 'square';
    osc2.type = 'square';

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.15);
  },

  // Combo - ascending chime
  combo: (ctx, level = 1) => {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    const noteIndex = Math.min(level - 1, notes.length - 1);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(notes[noteIndex], ctx.currentTime);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  },

  // Level up - triumphant fanfare
  levelUp: (ctx) => {
    const notes = [523, 659, 784, 1047, 1318]; // C5 to E6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const startTime = ctx.currentTime + i * 0.1;

      osc.frequency.setValueAtTime(freq, startTime);
      osc.type = 'triangle';

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  },

  // Error/denied - low buzz
  error: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.type = 'sawtooth';

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  },

  // Click - subtle UI feedback
  click: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  },

  // Success - pleasant confirmation
  success: (ctx) => {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(523, ctx.currentTime); // C5
    osc2.frequency.setValueAtTime(659, ctx.currentTime); // E5
    osc.type = 'sine';
    osc2.type = 'sine';

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.25);
  },

  // Whoosh - for animations
  whoosh: (ctx) => {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / buffer.length);
    }

    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.15);
    filter.Q.value = 0.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(ctx.currentTime);
  },
};

export function useSound(enabled = true) {
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const play = useCallback((soundName, options = {}) => {
    if (!enabledRef.current) return;

    try {
      const ctx = ensureAudioReady();
      const soundFn = sounds[soundName];

      if (soundFn) {
        soundFn(ctx, options.pitch || options.level || 1);
      }
    } catch (e) {
      // Audio might not be available
      soundLog.debug('Sound playback failed:', e);
    }
  }, []);

  // Convenience methods
  const playPlant = useCallback(() => play('plant'), [play]);
  const playWater = useCallback(() => play('water'), [play]);
  const playHarvest = useCallback(() => play('harvest'), [play]);
  const playCoin = useCallback((pitch = 1) => play('coin', { pitch }), [play]);
  const playCombo = useCallback((level = 1) => play('combo', { level }), [play]);
  const playLevelUp = useCallback(() => play('levelUp'), [play]);
  const playError = useCallback(() => play('error'), [play]);
  const playClick = useCallback(() => play('click'), [play]);
  const playSuccess = useCallback(() => play('success'), [play]);
  const playWhoosh = useCallback(() => play('whoosh'), [play]);

  return {
    play,
    playPlant,
    playWater,
    playHarvest,
    playCoin,
    playCombo,
    playLevelUp,
    playError,
    playClick,
    playSuccess,
    playWhoosh,
  };
}
