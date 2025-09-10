/**
 * Simple Sound Manager for FarmLife
 * Provides audio feedback for game actions
 */

class SoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.3;
    this.audioContext = null;
    
    // Initialize audio context on first user interaction
    this.initAudio();
  }

  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Audio not supported in this browser');
      this.enabled = false;
    }
  }

  // Create sound using Web Audio API
  createSound(frequency, duration, type = 'sine', volumeMultiplier = 1) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * volumeMultiplier, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      // Silently fail if audio doesn't work
    }
  }

  // Sound effects for different game actions
  playPlant() {
    this.createSound(400, 0.2, 'sine', 0.5);
    setTimeout(() => this.createSound(600, 0.1, 'sine', 0.3), 100);
  }

  playHarvest() {
    this.createSound(800, 0.3, 'triangle', 0.6);
    setTimeout(() => this.createSound(1000, 0.2, 'triangle', 0.4), 150);
  }

  playPurchase() {
    this.createSound(523, 0.1, 'square', 0.4); // C5
    setTimeout(() => this.createSound(659, 0.1, 'square', 0.4), 100); // E5
    setTimeout(() => this.createSound(784, 0.2, 'square', 0.4), 200); // G5
  }

  playError() {
    this.createSound(200, 0.3, 'sawtooth', 0.4);
    setTimeout(() => this.createSound(150, 0.3, 'sawtooth', 0.3), 150);
  }

  playSuccess() {
    this.createSound(523, 0.1, 'sine', 0.5); // C5
    setTimeout(() => this.createSound(659, 0.1, 'sine', 0.5), 100); // E5
    setTimeout(() => this.createSound(784, 0.1, 'sine', 0.5), 200); // G5
    setTimeout(() => this.createSound(1047, 0.3, 'sine', 0.5), 300); // C6
  }

  playLevelUp() {
    // Ascending arpeggio
    const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
    notes.forEach((freq, index) => {
      setTimeout(() => this.createSound(freq, 0.2, 'triangle', 0.6), index * 100);
    });
  }

  playWater() {
    this.createSound(800, 0.1, 'sine', 0.3);
    setTimeout(() => this.createSound(700, 0.1, 'sine', 0.2), 50);
    setTimeout(() => this.createSound(600, 0.1, 'sine', 0.1), 100);
  }

  playBuild() {
    this.createSound(300, 0.2, 'square', 0.5);
    setTimeout(() => this.createSound(350, 0.2, 'square', 0.4), 100);
    setTimeout(() => this.createSound(400, 0.3, 'square', 0.3), 200);
  }

  playAnimal() {
    this.createSound(440, 0.15, 'triangle', 0.4);
    setTimeout(() => this.createSound(550, 0.15, 'triangle', 0.3), 80);
    setTimeout(() => this.createSound(660, 0.15, 'triangle', 0.2), 160);
  }

  playNotification() {
    this.createSound(1000, 0.1, 'sine', 0.3);
    setTimeout(() => this.createSound(1200, 0.2, 'sine', 0.2), 100);
  }

  playWeatherChange() {
    this.createSound(600, 0.5, 'triangle', 0.2);
    setTimeout(() => this.createSound(500, 0.5, 'triangle', 0.15), 250);
  }

  // Controls
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  enable() {
    this.enabled = true;
    if (!this.audioContext) {
      this.initAudio();
    }
  }

  disable() {
    this.enabled = false;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled && !this.audioContext) {
      this.initAudio();
    }
  }

  isEnabled() {
    return this.enabled;
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;
