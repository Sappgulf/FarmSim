/**
 * Sound System - Web Audio API based sound effects
 * Provides procedurally generated sound effects for game actions
 */

export class SoundSystem {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.3; // Default volume (0.0 to 1.0)
    this.initializeAudioContext();
  }

  initializeAudioContext() {
    try {
      // Create AudioContext (with browser prefixes for compatibility)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (error) {
      console.warn('[farm]', 'Web Audio API not supported', error);
      this.enabled = false;
    }
  }

  // Resume audio context (required for some browsers)
  async resume() {
    if (!this.audioContext) return;
    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      // Silent fail - user might not have interacted yet
      if (import.meta.env.MODE === 'development') {
        console.debug('[farm] SoundSystem resume failed:', error);
      }
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Create oscillator and gain nodes
  createSound(frequency, type = 'sine', duration = 0.1) {
    if (!this.enabled || !this.audioContext) return;
    
    // Check if AudioContext is running - don't access currentTime if suspended
    // This prevents browser warnings about AudioContext not being allowed to start
    if (this.audioContext.state === 'suspended') {
      // AudioContext hasn't been resumed yet (needs user gesture)
      // Silently return - sounds will work after user interaction
      return null;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // Envelope - safe to access currentTime now that we've checked state
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);

    return { oscillator, gainNode };
  }

  // Sound effects for different actions

  /**
   * Plant seed sound - gentle chirp
   */
  playPlantSound() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Two quick ascending tones
    this.createSound(300, 'sine', 0.08);
    setTimeout(() => {
      this.createSound(400, 'sine', 0.08);
    }, 40);
  }

  /**
   * Harvest sound - satisfying pop and ding
   */
  playHarvestSound() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Pop sound
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);
    
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(100, now);
    osc1.frequency.exponentialRampToValueAtTime(50, now + 0.1);
    
    gain1.gain.setValueAtTime(this.volume * 0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc1.start(now);
    osc1.stop(now + 0.1);

    // Ding sound (delayed)
    setTimeout(() => {
      this.createSound(800, 'sine', 0.15);
      setTimeout(() => {
        this.createSound(1200, 'sine', 0.2);
      }, 50);
    }, 80);
  }

  /**
   * Water sound - gentle splash
   */
  playWaterSound() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Create noise-like sound for water
    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate filtered noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    
    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    gainNode.gain.setValueAtTime(this.volume * 0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    source.start(now);
  }

  /**
   * Fertilize sound - sprinkle
   */
  playFertilizeSound() {
    if (!this.enabled || !this.audioContext) return;
    
    // Quick series of high-pitched tones
    const frequencies = [600, 700, 800, 750, 650];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.createSound(freq, 'triangle', 0.05);
      }, index * 30);
    });
  }

  /**
   * Coin/money sound - cha-ching
   */
  playMoneySound() {
    if (!this.enabled || !this.audioContext) return;
    
    this.createSound(440, 'sine', 0.1);
    setTimeout(() => {
      this.createSound(880, 'sine', 0.15);
    }, 40);
    setTimeout(() => {
      this.createSound(1320, 'sine', 0.2);
    }, 80);
  }

  /**
   * Level up sound - fanfare
   */
  playLevelUpSound() {
    if (!this.enabled || !this.audioContext) return;
    
    const melody = [
      { freq: 523, time: 0 },    // C
      { freq: 659, time: 100 },  // E
      { freq: 784, time: 200 },  // G
      { freq: 1047, time: 300 }, // C (high)
    ];
    
    melody.forEach(note => {
      setTimeout(() => {
        this.createSound(note.freq, 'triangle', 0.25);
      }, note.time);
    });
  }

  /**
   * Achievement unlock sound
   */
  playAchievementSound() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Ascending arpeggio
    const notes = [392, 494, 587, 784]; // G, B, D, G
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.createSound(freq, 'triangle', 0.3);
      }, index * 100);
    });
  }

  /**
   * Building constructed sound
   */
  playBuildSound() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Deep thud
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
    
    gain.gain.setValueAtTime(this.volume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);

    // Follow-up success tone
    setTimeout(() => {
      this.createSound(600, 'sine', 0.2);
    }, 200);
  }

  /**
   * Error/negative sound
   */
  playErrorSound() {
    if (!this.enabled || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    // Descending tones
    this.createSound(300, 'sawtooth', 0.1);
    setTimeout(() => {
      this.createSound(200, 'sawtooth', 0.15);
    }, 80);
  }

  /**
   * Button click sound
   */
  playClickSound() {
    if (!this.enabled || !this.audioContext) return;

    this.createSound(400, 'square', 0.05);
  }

  // Fishing-specific sounds
  playReelSound() {
    if (!this.enabled || !this.audioContext) return;
    this.createSound(200, 'sawtooth', 0.08);
  }

  playFishHookedSound() {
    if (!this.enabled || !this.audioContext) return;
    // Exciting hook sound
    this.createSound(800, 'triangle', 0.1);
    setTimeout(() => this.createSound(1000, 'triangle', 0.1), 50);
  }

  playFishEscapeSound() {
    if (!this.enabled || !this.audioContext) return;
    // Sad escape sound
    this.createSound(300, 'sawtooth', 0.15);
    setTimeout(() => this.createSound(250, 'sawtooth', 0.15), 100);
  }

  /**
   * Weather change sound
   */
  playWeatherSound(weatherType) {
    if (!this.enabled || !this.audioContext) return;
    
    switch (weatherType) {
      case 'rainy':
      case 'stormy':
        // Rain/storm ambient (handled separately for continuous sounds)
        this.createSound(150, 'sawtooth', 0.5);
        break;
      case 'sunny':
        this.createSound(800, 'sine', 0.3);
        setTimeout(() => {
          this.createSound(1000, 'sine', 0.3);
        }, 100);
        break;
      case 'snowy':
      case 'snow':
        this.createSound(600, 'triangle', 0.4);
        break;
      default:
        break;
    }
  }

  /**
   * Notification sound
   */
  playNotificationSound(type = 'info') {
    if (!this.enabled || !this.audioContext) return;
    
    switch (type) {
      case 'success':
        this.createSound(800, 'sine', 0.1);
        setTimeout(() => {
          this.createSound(1000, 'sine', 0.15);
        }, 60);
        break;
      case 'error':
        this.playErrorSound();
        break;
      case 'warning':
        this.createSound(500, 'triangle', 0.2);
        break;
      default:
        this.createSound(600, 'sine', 0.1);
        break;
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Create singleton instance
let soundSystemInstance = null;

export const getSoundSystem = () => {
  if (!soundSystemInstance) {
    soundSystemInstance = new SoundSystem();
  }
  return soundSystemInstance;
};

export default SoundSystem;

