/**
 * 3D Visualization System
 * Modern 3D rendering for farm visualization using CSS 3D transforms
 */

// 3D View modes
export const VIEW_MODES = {
  TOP_DOWN: {
    id: 'topDown',
    name: 'Top Down',
    emoji: '⬇️',
    description: 'Classic 2D overhead view',
    camera: { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0 }
  },
  
  ISOMETRIC: {
    id: 'isometric',
    name: 'Isometric',
    emoji: '📐',
    description: '3D angled view for depth perception',
    camera: { x: 0, y: 0, z: 200, rotateX: 45, rotateY: 45 }
  },
  
  PERSPECTIVE: {
    id: 'perspective',
    name: 'Perspective',
    emoji: '🎥',
    description: 'Realistic 3D perspective view',
    camera: { x: 0, y: -100, z: 150, rotateX: 25, rotateY: 0 }
  },
  
  DRONE: {
    id: 'drone',
    name: 'Drone View',
    emoji: '🚁',
    description: 'Aerial drone-like perspective',
    camera: { x: 0, y: -50, z: 300, rotateX: 60, rotateY: 15 }
  }
};

// 3D Asset definitions
export const ASSET_3D = {
  // Crop 3D models (using CSS transforms and gradients)
  crops: {
    wheat: {
      stages: {
        planted: { height: 5, color: '#8B4513', animation: 'sprout' },
        growing: { height: 15, color: '#90EE90', animation: 'grow' },
        ready: { height: 25, color: '#FFD700', animation: 'sway' }
      }
    },
    carrot: {
      stages: {
        planted: { height: 3, color: '#8B4513', animation: 'sprout' },
        growing: { height: 12, color: '#32CD32', animation: 'grow' },
        ready: { height: 20, color: '#FF8C00', animation: 'glow' }
      }
    },
    tomato: {
      stages: {
        planted: { height: 4, color: '#8B4513', animation: 'sprout' },
        growing: { height: 18, color: '#228B22', animation: 'grow' },
        ready: { height: 30, color: '#FF6347', animation: 'ripen' }
      }
    }
  },
  
  // Building 3D models
  buildings: {
    greenhouse: {
      width: 80, height: 40, depth: 60,
      color: '#87CEEB', opacity: 0.7,
      effects: ['glass', 'reflection']
    },
    barn: {
      width: 100, height: 50, depth: 80,
      color: '#8B4513', opacity: 1.0,
      effects: ['wood_texture', 'shadow']
    },
    silo: {
      width: 40, height: 80, depth: 40,
      color: '#C0C0C0', opacity: 1.0,
      effects: ['metal_texture', 'shine']
    }
  },
  
  // AI Bot 3D models
  aiBots: {
    seedBot: {
      width: 20, height: 15, depth: 20,
      color: '#00FF00', animation: 'hover',
      effects: ['led_lights', 'energy_field']
    },
    harvestBot: {
      width: 30, height: 20, depth: 35,
      color: '#FFD700', animation: 'work',
      effects: ['mechanical_arms', 'dust_trail']
    },
    droneSwarm: {
      width: 15, height: 8, depth: 15,
      color: '#00BFFF', animation: 'fly',
      effects: ['propellers', 'scanning_beam']
    }
  }
};

// 3D Animation definitions
export const ANIMATIONS_3D = {
  sprout: {
    keyframes: [
      { transform: 'scale(0.1) rotateY(0deg)', opacity: 0.3 },
      { transform: 'scale(0.5) rotateY(90deg)', opacity: 0.7 },
      { transform: 'scale(1) rotateY(180deg)', opacity: 1 }
    ],
    duration: 2000,
    easing: 'ease-out'
  },
  
  grow: {
    keyframes: [
      { transform: 'scaleY(0.5)', filter: 'hue-rotate(0deg)' },
      { transform: 'scaleY(0.8)', filter: 'hue-rotate(30deg)' },
      { transform: 'scaleY(1.2)', filter: 'hue-rotate(60deg)' },
      { transform: 'scaleY(1)', filter: 'hue-rotate(90deg)' }
    ],
    duration: 3000,
    easing: 'ease-in-out'
  },
  
  sway: {
    keyframes: [
      { transform: 'rotateZ(0deg) rotateY(0deg)' },
      { transform: 'rotateZ(2deg) rotateY(5deg)' },
      { transform: 'rotateZ(0deg) rotateY(10deg)' },
      { transform: 'rotateZ(-2deg) rotateY(5deg)' },
      { transform: 'rotateZ(0deg) rotateY(0deg)' }
    ],
    duration: 4000,
    easing: 'ease-in-out',
    iterationCount: 'infinite'
  },
  
  hover: {
    keyframes: [
      { transform: 'translateY(0px) rotateY(0deg)', boxShadow: '0 5px 15px rgba(0,255,0,0.3)' },
      { transform: 'translateY(-10px) rotateY(180deg)', boxShadow: '0 15px 25px rgba(0,255,0,0.5)' },
      { transform: 'translateY(0px) rotateY(360deg)', boxShadow: '0 5px 15px rgba(0,255,0,0.3)' }
    ],
    duration: 3000,
    easing: 'ease-in-out',
    iterationCount: 'infinite'
  },
  
  fly: {
    keyframes: [
      { transform: 'translateY(0px) translateX(0px) rotateZ(0deg)' },
      { transform: 'translateY(-20px) translateX(10px) rotateZ(5deg)' },
      { transform: 'translateY(-15px) translateX(-5px) rotateZ(-3deg)' },
      { transform: 'translateY(-25px) translateX(0px) rotateZ(0deg)' }
    ],
    duration: 2500,
    easing: 'ease-in-out',
    iterationCount: 'infinite'
  }
};

export class Visualization3D {
  constructor() {
    this.currentView = 'topDown';
    this.animationsEnabled = true;
    this.particleEffects = true;
    this.shadows = true;
    this.quality = 'high'; // low, medium, high
    this.camera = { ...VIEW_MODES.TOP_DOWN.camera };
  }

  // Generate CSS for 3D transforms
  generatePlotStyle(plotId, plot, viewMode = this.currentView) {
    const view = VIEW_MODES[viewMode];
    if (!view) return {};

    const col = plotId % 3;
    const row = Math.floor(plotId / 3);
    
    // Base positioning
    const baseX = col * 120; // spacing between plots
    const baseY = row * 120;
    const baseZ = 0;

    // Apply camera transform
    const transform = this.calculateTransform(baseX, baseY, baseZ, view.camera);
    
    return {
      position: 'absolute',
      left: `${baseX}px`,
      top: `${baseY}px`,
      transform: transform,
      transformStyle: 'preserve-3d',
      transition: 'all 0.5s ease-in-out'
    };
  }

  // Generate 3D crop visualization
  generateCropElement(plot, animations = this.animationsEnabled) {
    if (plot.state === 'empty') {
      return {
        className: 'plot-empty-3d',
        style: {
          width: '100px',
          height: '100px',
          backgroundColor: '#8B4513',
          border: '2px solid #654321',
          borderRadius: '8px',
          boxShadow: this.shadows ? 'inset 0 0 20px rgba(0,0,0,0.3)' : 'none'
        }
      };
    }

    const cropAsset = ASSET_3D.crops[plot.crop];
    if (!cropAsset) return this.generateCropElement({ ...plot, crop: 'wheat' }, animations);

    const stage = cropAsset.stages[plot.state] || cropAsset.stages.planted;
    
    return {
      className: `crop-3d crop-${plot.crop}-${plot.state}`,
      style: {
        width: '100px',
        height: '100px',
        background: `linear-gradient(45deg, ${stage.color}, ${this.lightenColor(stage.color, 20)})`,
        border: '2px solid #333',
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: this.shadows ? `0 ${stage.height}px ${stage.height * 2}px rgba(0,0,0,0.3)` : 'none',
        animation: animations && stage.animation ? this.getAnimationCSS(stage.animation) : 'none'
      },
      children: this.generateCropDetails(plot, stage)
    };
  }

  // Generate detailed crop elements (leaves, fruits, etc.)
  generateCropDetails(plot, stage) {
    const details = [];

    // Add height indicator
    if (stage.height > 10) {
      details.push({
        className: 'crop-height-indicator',
        style: {
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '60%',
          height: '60%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${stage.color}, transparent)`,
          borderRadius: '50%',
          opacity: 0.8
        }
      });
    }

    // Add quality indicators
    if (plot.quality > 1.5) {
      details.push({
        className: 'quality-glow',
        style: {
          position: 'absolute',
          top: '-5px',
          left: '-5px',
          right: '-5px',
          bottom: '-5px',
          background: 'linear-gradient(45deg, gold, orange)',
          borderRadius: '12px',
          opacity: 0.3,
          animation: 'pulse 2s ease-in-out infinite'
        }
      });
    }

    // Add genetic trait indicators
    if (plot.traits && plot.traits.length > 0) {
      plot.traits.forEach((trait, index) => {
        details.push({
          className: `trait-indicator trait-${trait}`,
          style: {
            position: 'absolute',
            top: `${10 + index * 15}px`,
            right: '5px',
            width: '8px',
            height: '8px',
            backgroundColor: this.getTraitColor(trait),
            borderRadius: '50%',
            boxShadow: '0 0 4px rgba(255,255,255,0.8)'
          }
        });
      });
    }

    return details;
  }

  // Generate 3D building visualization
  generateBuildingElement(buildingType, level = 1) {
    const asset = ASSET_3D.buildings[buildingType];
    if (!asset) return null;

    const scale = Math.min(2, 1 + (level - 1) * 0.2); // Scale with level

    return {
      className: `building-3d building-${buildingType}`,
      style: {
        width: `${asset.width * scale}px`,
        height: `${asset.height * scale}px`,
        backgroundColor: asset.color,
        opacity: asset.opacity,
        border: '3px solid #333',
        borderRadius: '8px',
        position: 'relative',
        transformStyle: 'preserve-3d',
        boxShadow: this.shadows ? 
          `0 ${asset.height * scale * 0.5}px ${asset.height * scale}px rgba(0,0,0,0.4)` : 
          'none',
        background: this.generateBuildingTexture(buildingType)
      },
      children: this.generateBuildingDetails(buildingType, level, scale)
    };
  }

  // Generate AI bot visualization
  generateAIBotElement(botType, status = 'active') {
    const asset = ASSET_3D.aiBots[botType];
    if (!asset) return null;

    return {
      className: `ai-bot-3d bot-${botType} ${status}`,
      style: {
        width: `${asset.width}px`,
        height: `${asset.height}px`,
        backgroundColor: asset.color,
        border: '2px solid #000',
        borderRadius: '4px',
        position: 'absolute',
        transformStyle: 'preserve-3d',
        animation: this.animationsEnabled ? this.getAnimationCSS(asset.animation) : 'none',
        boxShadow: `0 0 15px ${asset.color}40, inset 0 0 5px rgba(255,255,255,0.3)`,
        zIndex: 100
      },
      children: this.generateBotEffects(botType, status)
    };
  }

  // Generate particle effects and environmental details
  generateEnvironmentalEffects(weather, season) {
    const effects = [];

    // Weather effects
    switch (weather) {
      case 'rainy':
        effects.push(this.generateRainEffect());
        break;
      case 'sunny':
        effects.push(this.generateSunbeamEffect());
        break;
      case 'stormy':
        effects.push(this.generateStormEffect());
        break;
    }

    // Seasonal effects
    switch (season) {
      case 'spring':
        effects.push(this.generatePollenEffect());
        break;
      case 'autumn':
        effects.push(this.generateLeavesEffect());
        break;
      case 'winter':
        effects.push(this.generateSnowEffect());
        break;
    }

    return effects;
  }

  // Camera controls
  setViewMode(viewMode) {
    if (VIEW_MODES[viewMode]) {
      this.currentView = viewMode;
      this.camera = { ...VIEW_MODES[viewMode].camera };
      return true;
    }
    return false;
  }

  // Smooth camera transitions
  animateCamera(targetView, duration = 1000) {
    if (!VIEW_MODES[targetView]) return;

    const startCamera = { ...this.camera };
    const endCamera = { ...VIEW_MODES[targetView].camera };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeInOutCubic(progress);

      // Interpolate camera position
      this.camera = {
        x: startCamera.x + (endCamera.x - startCamera.x) * eased,
        y: startCamera.y + (endCamera.y - startCamera.y) * eased,
        z: startCamera.z + (endCamera.z - startCamera.z) * eased,
        rotateX: startCamera.rotateX + (endCamera.rotateX - startCamera.rotateX) * eased,
        rotateY: startCamera.rotateY + (endCamera.rotateY - startCamera.rotateY) * eased
      };

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.currentView = targetView;
      }
    };

    animate();
  }

  // Utility functions
  calculateTransform(x, y, z, camera) {
    return `
      perspective(1000px)
      translate3d(${x + camera.x}px, ${y + camera.y}px, ${z + camera.z}px)
      rotateX(${camera.rotateX}deg)
      rotateY(${camera.rotateY}deg)
    `;
  }

  lightenColor(color, percent) {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + percent);
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + percent);
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + percent);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  getAnimationCSS(animationName) {
    const anim = ANIMATIONS_3D[animationName];
    if (!anim) return 'none';
    
    return `${animationName} ${anim.duration}ms ${anim.easing} ${anim.iterationCount || '1'}`;
  }

  getTraitColor(trait) {
    const colors = {
      fastGrowing: '#00FF00',
      droughtResistant: '#FF8C00',
      diseaseResistant: '#FF0000',
      highYield: '#FFD700',
      coldResistant: '#00BFFF'
    };
    return colors[trait] || '#FFFFFF';
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  // Generate building textures
  generateBuildingTexture(buildingType) {
    switch (buildingType) {
      case 'greenhouse':
        return 'linear-gradient(45deg, #87CEEB 25%, transparent 25%, transparent 50%, #87CEEB 50%, #87CEEB 75%, transparent 75%, transparent)';
      case 'barn':
        return 'linear-gradient(90deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)';
      case 'silo':
        return 'radial-gradient(circle, #E0E0E0, #C0C0C0)';
      default:
        return 'none';
    }
  }

  // Weather and environmental effects
  generateRainEffect() {
    return {
      className: 'rain-effect',
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\'><line x1=\'10\' y1=\'0\' x2=\'10\' y2=\'20\' stroke=\'%234169E1\' stroke-width=\'1\' opacity=\'0.6\'/></svg>") repeat',
        animation: 'rain-fall 1s linear infinite',
        pointerEvents: 'none'
      }
    };
  }

  generateSunbeamEffect() {
    return {
      className: 'sunbeam-effect',
      style: {
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(255,255,0,0.3), transparent)',
        borderRadius: '50%',
        animation: 'gentle-glow 3s ease-in-out infinite',
        pointerEvents: 'none'
      }
    };
  }
}

// CSS keyframe definitions to be injected
export const CSS_3D_KEYFRAMES = `
  @keyframes rain-fall {
    0% { transform: translateY(-100px); }
    100% { transform: translateY(calc(100vh + 100px)); }
  }
  
  @keyframes gentle-glow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

export default Visualization3D;
