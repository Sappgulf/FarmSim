/**
 * Music System - Background music with seasonal themes
 * Uses Web Audio API to generate procedural music
 */
import { isDevelopmentMode } from '../../../config/release';
import { createLogger } from '../../../utils/logger';

const log = createLogger('MusicSystem');

export class MusicSystem {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.baseVolume = 0.15; // Lower volume for background music
    this.volume = 0.15;
    this.currentSeason = 'spring';
    this.isPlaying = false;
    this.scheduledNotes = [];
    this.nextNoteTime = 0;
    this.scheduleAheadTime = 0.1;
    this.tempo = 120; // BPM
    this.currentNote = 0;
    this.duckMultiplier = 1;
    this.duckTimeout = null;

    this.initializeAudioContext();
  }

  initializeAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (error) {
      log.warn('Web Audio API not supported', error);
      this.enabled = false;
    }
  }

  async resume() {
    if (!this.audioContext) return;
    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      // Silent fail - user might not have interacted yet
      if (isDevelopmentMode()) {
        log.debug('resume failed:', error);
      }
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
    // FIXED: Don't auto-play when enabled - wait for user interaction
    // else if (enabled && !this.isPlaying) {
    //   this.play();
    // }
  }

  setVolume(volume) {
    this.baseVolume = Math.max(0, Math.min(1, volume));
    this.volume = this.baseVolume * this.duckMultiplier;
  }

  duckForSfx(durationMs = 850, multiplier = 0.5) {
    this.duckMultiplier = Math.min(this.duckMultiplier, multiplier);
    this.volume = this.baseVolume * this.duckMultiplier;
    if (this.duckTimeout) {
      clearTimeout(this.duckTimeout);
    }
    this.duckTimeout = setTimeout(() => {
      this.duckMultiplier = 1;
      this.volume = this.baseVolume;
      this.duckTimeout = null;
    }, durationMs);
  }

  setSeason(season) {
    this.currentSeason = season;
    this.currentNote = 0; // Reset melody
  }

  // Seasonal music themes
  getSeasonalMelody(season) {
    const melodies = {
      spring: {
        // Bright, uplifting melody in C major
        notes: [
          { pitch: 523, duration: 0.5 }, // C5
          { pitch: 587, duration: 0.5 }, // D5
          { pitch: 659, duration: 0.5 }, // E5
          { pitch: 784, duration: 0.5 }, // G5
          { pitch: 659, duration: 0.5 }, // E5
          { pitch: 587, duration: 0.5 }, // D5
          { pitch: 523, duration: 1.0 }, // C5
          { pitch: 0, duration: 0.5 }, // Rest
        ],
        bassNotes: [262, 196, 349, 262], // C3, G2, F3, C3
        tempo: 120,
        instrument: 'sine',
        mood: 'cheerful',
      },
      summer: {
        // Warm, lazy melody
        notes: [
          { pitch: 392, duration: 0.75 }, // G4
          { pitch: 440, duration: 0.75 }, // A4
          { pitch: 494, duration: 0.5 }, // B4
          { pitch: 523, duration: 1.0 }, // C5
          { pitch: 440, duration: 0.75 }, // A4
          { pitch: 392, duration: 0.75 }, // G4
          { pitch: 349, duration: 1.0 }, // F4
          { pitch: 0, duration: 0.5 }, // Rest
        ],
        bassNotes: [196, 220, 247, 196],
        tempo: 100,
        instrument: 'triangle',
        mood: 'relaxed',
      },
      fall: {
        // Contemplative, warm melody
        notes: [
          { pitch: 440, duration: 0.5 }, // A4
          { pitch: 494, duration: 0.5 }, // B4
          { pitch: 523, duration: 0.5 }, // C5
          { pitch: 587, duration: 0.5 }, // D5
          { pitch: 523, duration: 0.5 }, // C5
          { pitch: 494, duration: 0.5 }, // B4
          { pitch: 440, duration: 1.0 }, // A4
          { pitch: 392, duration: 1.0 }, // G4
        ],
        bassNotes: [220, 247, 262, 220],
        tempo: 90,
        instrument: 'triangle',
        mood: 'nostalgic',
      },
      winter: {
        // Gentle, crystalline melody
        notes: [
          { pitch: 659, duration: 0.5 }, // E5
          { pitch: 698, duration: 0.5 }, // F5
          { pitch: 784, duration: 0.75 }, // G5
          { pitch: 659, duration: 0.75 }, // E5
          { pitch: 587, duration: 0.5 }, // D5
          { pitch: 523, duration: 0.5 }, // C5
          { pitch: 587, duration: 1.0 }, // D5
          { pitch: 0, duration: 0.5 }, // Rest
        ],
        bassNotes: [262, 294, 330, 262],
        tempo: 80,
        instrument: 'sine',
        mood: 'calm',
      },
    };

    return melodies[season] || melodies.spring;
  }

  // Create a musical note
  playNote(frequency, duration, time = 0, type = 'sine') {
    if (!this.enabled || !this.audioContext || frequency === 0) return;

    // Check if AudioContext is running - don't access currentTime if suspended
    // This prevents browser warnings about AudioContext not being allowed to start
    if (this.audioContext.state === 'suspended') {
      return; // AudioContext hasn't been resumed yet (needs user gesture)
    }

    const now = this.audioContext.currentTime + time;

    // Oscillator for melody
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // ADSR envelope for natural sound
    const attackTime = 0.05;
    const decayTime = 0.1;
    const sustainLevel = this.volume * 0.7;
    const releaseTime = 0.1;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume, now + attackTime);
    gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    gainNode.gain.setValueAtTime(sustainLevel, now + duration - releaseTime);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Schedule next note in the melody
  scheduleNote() {
    if (!this.enabled || !this.audioContext) return;

    // Check if AudioContext is running - don't access currentTime if suspended
    if (this.audioContext.state === 'suspended') {
      return; // AudioContext hasn't been resumed yet (needs user gesture)
    }

    const melody = this.getSeasonalMelody(this.currentSeason);
    const secondsPerBeat = 60.0 / melody.tempo;

    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      const note = melody.notes[this.currentNote % melody.notes.length];

      if (note.pitch > 0) {
        this.playNote(
          note.pitch,
          note.duration * secondsPerBeat,
          this.nextNoteTime - this.audioContext.currentTime,
          melody.instrument
        );

        // Add subtle bass note every 4 beats
        if (this.currentNote % 4 === 0) {
          const bassIndex = Math.floor(this.currentNote / 4) % melody.bassNotes.length;
          this.playNote(
            melody.bassNotes[bassIndex],
            note.duration * secondsPerBeat * 2,
            this.nextNoteTime - this.audioContext.currentTime,
            'triangle'
          );
        }
      }

      this.nextNoteTime += note.duration * secondsPerBeat;
      this.currentNote++;
    }
  }

  // Main music loop
  scheduler() {
    if (!this.isPlaying) return;

    this.scheduleNote();

    // Schedule next check
    setTimeout(() => {
      this.scheduler();
    }, 25); // Check every 25ms
  }

  // Start playing music
  async play() {
    if (!this.enabled || !this.audioContext) return;

    await this.resume();

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.currentNote = 0;
      this.nextNoteTime = this.audioContext.currentTime;
      this.scheduler();
      if (isDevelopmentMode()) {
        log.debug(`Music started: ${this.currentSeason} theme`);
      }
    }
  }

  // Stop music
  stop() {
    this.isPlaying = false;
    this.currentNote = 0;
  }

  // Toggle music on/off
  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  // Cleanup
  destroy() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Create singleton instance
let musicSystemInstance = null;

export const getMusicSystem = () => {
  if (!musicSystemInstance) {
    musicSystemInstance = new MusicSystem();
  }
  return musicSystemInstance;
};

export default MusicSystem;
