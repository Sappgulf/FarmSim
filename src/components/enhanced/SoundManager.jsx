import React, { useEffect, useRef, useState } from 'react';

/**
 * Advanced Sound Manager for Enhanced Audio Experience
 * Provides spatial audio, dynamic music, and rich sound effects
 */

class SoundEngine {
  constructor() {
    this.audioContext = null;
    this.masterGainNode = null;
    this.sfxGainNode = null;
    this.musicGainNode = null;
    this.sounds = new Map();
    this.musicTracks = new Map();
    this.currentMusic = null;
    this.initialized = false;
    this.volume = {
      master: 0.7,
      sfx: 0.8,
      music: 0.5
    };
  }

  async initialize() {
    if (this.initialized || typeof window === 'undefined' || !window.AudioContext) return;

    try {
      // Resume AudioContext on user interaction
      const resumeContext = () => {
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        window.removeEventListener('click', resumeContext);
        window.removeEventListener('touchend', resumeContext);
      };
      window.addEventListener('click', resumeContext);
      window.addEventListener('touchend', resumeContext);

      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.masterGainNode = this.audioContext.createGain();
      this.sfxGainNode = this.audioContext.createGain();
      this.musicGainNode = this.audioContext.createGain();

      // Connect the audio graph
      this.sfxGainNode.connect(this.masterGainNode);
      this.musicGainNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.audioContext.destination);

      // Set initial volumes
      this.updateVolumes();

      // Generate sound effects
      this.generateSounds();
      
      this.initialized = true;
      console.log('🎵 Sound Engine initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize audio. Sound will be disabled.', error);
      this.initialized = false;
    }
  }

  generateSounds() {
    // Generate various sound effects using Web Audio API
    this.sounds.set('plant', this.createPlantSound());
    this.sounds.set('harvest', this.createHarvestSound());
    this.sounds.set('coins', this.createCoinSound());
    this.sounds.set('achievement', this.createAchievementSound());
    this.sounds.set('weather', this.createWeatherSound());
    this.sounds.set('click', this.createClickSound());
    this.sounds.set('error', this.createErrorSound());
    this.sounds.set('success', this.createSuccessSound());
    this.sounds.set('level_up', this.createLevelUpSound());
    this.sounds.set('magic', this.createMagicSound());
  }

  createPlantSound() {
    return () => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    };
  }

  createHarvestSound() {
    return () => {
      // Create a more complex harvest sound with multiple oscillators
      const frequencies = [330, 440, 550];
      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.1);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime + index * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4 + index * 0.1);
        
        oscillator.start(this.audioContext.currentTime + index * 0.1);
        oscillator.stop(this.audioContext.currentTime + 0.4 + index * 0.1);
      });
    };
  }

  createCoinSound() {
    return () => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    };
  }

  createAchievementSound() {
    return () => {
      // Triumphant chord progression
      const notes = [
        { freq: 261.63, time: 0 },    // C4
        { freq: 329.63, time: 0.1 },  // E4
        { freq: 392.00, time: 0.2 },  // G4
        { freq: 523.25, time: 0.3 }   // C5
      ];
      
      notes.forEach(note => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(note.freq, this.audioContext.currentTime + note.time);
        
        gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime + note.time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + note.time + 0.8);
        
        oscillator.start(this.audioContext.currentTime + note.time);
        oscillator.stop(this.audioContext.currentTime + note.time + 0.8);
      });
    };
  }

  createWeatherSound() {
    return () => {
      // White noise for rain/wind effect
      const bufferSize = this.audioContext.sampleRate * 0.5;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() - 0.5) * 0.1;
      }
      
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      source.start(this.audioContext.currentTime);
      source.stop(this.audioContext.currentTime + 0.5);
    };
  }

  createClickSound() {
    return () => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    };
  }

  createErrorSound() {
    return () => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    };
  }

  createSuccessSound() {
    return () => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(660, this.audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    };
  }

  createLevelUpSound() {
    return () => {
      // Ascending scale
      const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
      
      scale.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.1);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + index * 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.1 + 0.2);
        
        oscillator.start(this.audioContext.currentTime + index * 0.1);
        oscillator.stop(this.audioContext.currentTime + index * 0.1 + 0.2);
      });
    };
  }

  createMagicSound() {
    return () => {
      // Magical shimmer effect
      for (let i = 0; i < 5; i++) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.type = 'sine';
        const baseFreq = 800 + Math.random() * 800;
        oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime + i * 0.05);
        oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 2, this.audioContext.currentTime + i * 0.05 + 0.3);
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime + i * 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + i * 0.05 + 0.4);
        
        oscillator.start(this.audioContext.currentTime + i * 0.05);
        oscillator.stop(this.audioContext.currentTime + i * 0.05 + 0.4);
      }
    };
  }

  updateVolumes() {
    if (!this.initialized) return;
    
    this.masterGainNode.gain.setValueAtTime(this.volume.master, this.audioContext.currentTime);
    this.sfxGainNode.gain.setValueAtTime(this.volume.sfx, this.audioContext.currentTime);
    this.musicGainNode.gain.setValueAtTime(this.volume.music, this.audioContext.currentTime);
  }

  setVolume(type, value) {
    this.volume[type] = Math.max(0, Math.min(1, value));
    this.updateVolumes();
  }

  playSound(soundName, options = {}) {
    if (!this.initialized || !this.sounds.has(soundName)) return;
    
    try {
      const soundFunction = this.sounds.get(soundName);
      soundFunction();
    } catch (error) {
      console.warn(`Failed to play sound: ${soundName}`, error);
    }
  }

  // Play spatial sound with position-based panning
  playSpatialSound(soundName, x, y, screenWidth = 800) {
    if (!this.initialized || !this.sounds.has(soundName)) return;
    
    // Calculate pan based on x position (-1 left, 1 right)
    const pan = (x / screenWidth) * 2 - 1;
    
    // Create a panner node for spatial audio
    const panner = this.audioContext.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), this.audioContext.currentTime);
    panner.connect(this.sfxGainNode);
    
    // This would require modifying the sound generation to use the panner
    this.playSound(soundName);
  }
}

// Global sound engine instance
const soundEngine = new SoundEngine();

export function SoundManager({ enabled = true, volumes = {} }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (enabled && !initialized) {
      soundEngine.initialize().then(() => {
        setInitialized(true);
      });
    }
  }, [enabled, initialized]);

  useEffect(() => {
    if (volumes) {
      Object.entries(volumes).forEach(([type, value]) => {
        soundEngine.setVolume(type, value);
      });
    }
  }, [volumes]);

  // Expose sound engine globally
  useEffect(() => {
    window.soundEngine = soundEngine;
  }, []);

  return null; // This component doesn't render anything
}

// Utility functions for easy sound playing
export const playSound = (soundName, options = {}) => {
  if (window.soundEngine) {
    window.soundEngine.playSound(soundName, options);
  }
};

export const playSpatialSound = (soundName, x, y, screenWidth) => {
  if (window.soundEngine) {
    window.soundEngine.playSpatialSound(soundName, x, y, screenWidth);
  }
};

export const setVolume = (type, value) => {
  if (window.soundEngine) {
    window.soundEngine.setVolume(type, value);
  }
};

export default SoundManager;
