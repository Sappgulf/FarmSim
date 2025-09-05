import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Advanced Farm Visualization with 3D-like Effects
 * Provides beautiful, animated farm grid with depth and lighting
 */

const PLOT_SIZE = 64;
const GRID_GAP = 4;

// Crop visualization data
const CROP_VISUALS = {
  carrot: {
    stages: ['🌱', '🌿', '🥕'],
    colors: ['#22c55e', '#16a34a', '#ff6b35'],
    shadows: true
  },
  wheat: {
    stages: ['🌱', '🌾', '🌾'],
    colors: ['#22c55e', '#eab308', '#f59e0b'],
    shadows: true
  },
  corn: {
    stages: ['🌱', '🌽', '🌽'],
    colors: ['#22c55e', '#eab308', '#f59e0b'],
    shadows: true
  },
  tomato: {
    stages: ['🌱', '🍃', '🍅'],
    colors: ['#22c55e', '#16a34a', '#dc2626'],
    shadows: true
  },
  potato: {
    stages: ['🌱', '🌿', '🥔'],
    colors: ['#22c55e', '#16a34a', '#a3a3a3'],
    shadows: true
  },
  strawberry: {
    stages: ['🌱', '🌸', '🍓'],
    colors: ['#22c55e', '#f8fafc', '#dc2626'],
    shadows: true
  }
};

// Environmental effects
const WEATHER_EFFECTS = {
  sunny: {
    lighting: 1.2,
    shadows: true,
    particles: [],
    filter: 'brightness(110%) contrast(105%)'
  },
  rain: {
    lighting: 0.8,
    shadows: false,
    particles: 'rain',
    filter: 'brightness(80%) contrast(90%) hue-rotate(200deg)'
  },
  storm: {
    lighting: 0.6,
    shadows: false,
    particles: 'storm',
    filter: 'brightness(60%) contrast(120%) saturate(80%)'
  },
  drought: {
    lighting: 1.4,
    shadows: true,
    particles: [],
    filter: 'brightness(120%) contrast(110%) sepia(20%)'
  },
  frost: {
    lighting: 0.9,
    shadows: false,
    particles: 'snow',
    filter: 'brightness(95%) contrast(105%) hue-rotate(180deg)'
  }
};

class FarmRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animationFrame = null;
    this.time = 0;
    this.weather = 'sunny';
    this.timeOfDay = 'day';
    this.particles = [];
  }

  setWeather(weather) {
    this.weather = weather;
  }

  setTimeOfDay(timeOfDay) {
    this.timeOfDay = timeOfDay;
  }

  createParticles(type, count = 50) {
    this.particles = [];
    
    switch (type) {
      case 'rain':
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height - 100,
            vx: -2 + Math.random() * 4,
            vy: 8 + Math.random() * 4,
            life: 1,
            type: 'rain'
          });
        }
        break;
      case 'snow':
        for (let i = 0; i < count * 0.3; i++) {
          this.particles.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height - 100,
            vx: -1 + Math.random() * 2,
            vy: 1 + Math.random() * 2,
            life: 1,
            type: 'snow',
            size: 2 + Math.random() * 3
          });
        }
        break;
      case 'storm':
        for (let i = 0; i < count * 0.8; i++) {
          this.particles.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height - 100,
            vx: -8 + Math.random() * 16,
            vy: 12 + Math.random() * 8,
            life: 1,
            type: 'storm'
          });
        }
        break;
    }
  }

  updateParticles(deltaTime) {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx * deltaTime * 60;
      particle.y += particle.vy * deltaTime * 60;
      particle.life -= deltaTime * 0.5;
      
      // Reset particle if it goes off screen
      if (particle.y > this.canvas.height + 50) {
        particle.y = -50;
        particle.x = Math.random() * this.canvas.width;
        particle.life = 1;
      }
      
      return particle.life > 0;
    });
  }

  renderParticles() {
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.life * 0.6;
      
      switch (particle.type) {
        case 'rain':
          this.ctx.strokeStyle = '#3b82f6';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(particle.x - particle.vx * 2, particle.y - particle.vy * 2);
          this.ctx.stroke();
          break;
        case 'snow':
          this.ctx.fillStyle = '#f1f5f9';
          this.ctx.beginPath();
          this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          this.ctx.fill();
          break;
        case 'storm':
          this.ctx.strokeStyle = '#1e40af';
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(particle.x - particle.vx * 1.5, particle.y - particle.vy * 1.5);
          this.ctx.stroke();
          break;
      }
      
      this.ctx.restore();
    });
  }

  renderPlot(x, y, plot, index) {
    const plotX = x * (PLOT_SIZE + GRID_GAP);
    const plotY = y * (PLOT_SIZE + GRID_GAP);
    
    // Apply lighting based on weather and time
    const weatherEffect = WEATHER_EFFECTS[this.weather] || WEATHER_EFFECTS.sunny;
    const lighting = weatherEffect.lighting;
    const timeMultiplier = this.timeOfDay === 'night' ? 0.6 : 
                          this.timeOfDay === 'dusk' ? 0.8 : 1.0;
    const finalLighting = lighting * timeMultiplier;
    
    this.ctx.save();
    
    // Apply weather filter
    this.ctx.filter = weatherEffect.filter;
    
    // Draw plot base with depth
    this.renderPlotBase(plotX, plotY, finalLighting);
    
    // Draw crop if present
    if (plot.state !== 'empty') {
      this.renderCrop(plotX, plotY, plot, finalLighting);
    }
    
    // Draw effects (water, fertilizer, etc.)
    this.renderPlotEffects(plotX, plotY, plot);
    
    // Draw shadow if weather supports it
    if (weatherEffect.shadows && this.timeOfDay !== 'night') {
      this.renderShadow(plotX, plotY, plot);
    }
    
    this.ctx.restore();
  }

  renderPlotBase(x, y, lighting) {
    const gradient = this.ctx.createLinearGradient(x, y, x + PLOT_SIZE, y + PLOT_SIZE);
    
    // Soil colors with lighting
    const soilColor1 = this.adjustColorBrightness('#8b4513', lighting);
    const soilColor2 = this.adjustColorBrightness('#a0522d', lighting);
    
    gradient.addColorStop(0, soilColor1);
    gradient.addColorStop(1, soilColor2);
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, PLOT_SIZE, PLOT_SIZE);
    
    // Add texture
    this.ctx.fillStyle = this.adjustColorBrightness('#654321', lighting * 0.8);
    for (let i = 0; i < 5; i++) {
      const dotX = x + Math.random() * PLOT_SIZE;
      const dotY = y + Math.random() * PLOT_SIZE;
      this.ctx.fillRect(dotX, dotY, 2, 2);
    }
    
    // Border with depth
    this.ctx.strokeStyle = this.adjustColorBrightness('#5d4037', lighting);
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, PLOT_SIZE, PLOT_SIZE);
  }

  renderCrop(x, y, plot, lighting) {
    const cropType = plot.seed;
    const cropVisual = CROP_VISUALS[cropType];
    
    if (!cropVisual) return;
    
    // Determine growth stage
    let stage = 0;
    if (plot.state === 'growing') {
      stage = Math.min(1, Math.floor(plot.progress * 2));
    } else if (plot.state === 'ready') {
      stage = 2;
    }
    
    // Animation offset
    const animOffset = Math.sin(this.time * 0.002 + x * 0.01 + y * 0.01) * 2;
    
    // Draw crop emoji
    const emoji = cropVisual.stages[Math.min(stage, cropVisual.stages.length - 1)];
    this.ctx.font = `${32 + animOffset}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Apply lighting to crop
    this.ctx.fillStyle = this.adjustColorBrightness(cropVisual.colors[stage], lighting);
    this.ctx.fillText(emoji, x + PLOT_SIZE / 2, y + PLOT_SIZE / 2 + animOffset);
    
    // Health indicator
    if (plot.disease) {
      this.ctx.font = '16px Arial';
      this.ctx.fillText('🦠', x + PLOT_SIZE - 12, y + 12);
    }
    
    if (plot.infested) {
      this.ctx.font = '16px Arial';
      this.ctx.fillText('🐛', x + PLOT_SIZE - 12, y + PLOT_SIZE - 12);
    }
  }

  renderPlotEffects(x, y, plot) {
    const centerX = x + PLOT_SIZE / 2;
    const centerY = y + PLOT_SIZE / 2;
    
    // Water effect
    if (plot.wateredAt && (Date.now() / 1000 - plot.wateredAt) < 60) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.6;
      this.ctx.fillStyle = '#3b82f6';
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 20 + Math.sin(this.time * 0.01 + i) * 3;
        const dotX = centerX + Math.cos(angle) * radius;
        const dotY = centerY + Math.sin(angle) * radius;
        this.ctx.beginPath();
        this.ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }
    
    // Fertilizer effect
    if (plot.fertilizedAt && (Date.now() / 1000 - plot.fertilizedAt) < 120) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.4;
      this.ctx.fillStyle = '#22c55e';
      const sparkles = 6;
      for (let i = 0; i < sparkles; i++) {
        const angle = (i / sparkles) * Math.PI * 2 + this.time * 0.005;
        const radius = 25;
        const sparkleX = centerX + Math.cos(angle) * radius;
        const sparkleY = centerY + Math.sin(angle) * radius;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('✨', sparkleX, sparkleY);
      }
      this.ctx.restore();
    }
  }

  renderShadow(x, y, plot) {
    if (plot.state === 'empty') return;
    
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = '#000000';
    
    // Simple shadow offset
    const shadowOffset = 4;
    this.ctx.fillRect(x + shadowOffset, y + shadowOffset, PLOT_SIZE * 0.8, PLOT_SIZE * 0.2);
    
    this.ctx.restore();
  }

  adjustColorBrightness(color, factor) {
    // Simple color brightness adjustment
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.max(0, Math.floor(parseInt(hex.substr(0, 2), 16) * factor)));
    const g = Math.min(255, Math.max(0, Math.floor(parseInt(hex.substr(2, 2), 16) * factor)));
    const b = Math.min(255, Math.max(0, Math.floor(parseInt(hex.substr(4, 2), 16) * factor)));
    
    return `rgb(${r}, ${g}, ${b})`;
  }

  render(plots, gridSize) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update time
    this.time = Date.now();
    
    // Update and render particles
    this.updateParticles(0.016); // Assume 60fps
    
    // Render background
    this.renderBackground();
    
    // Render plots
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const index = y * gridSize + x;
        const plot = plots[index];
        if (plot) {
          this.renderPlot(x, y, plot, index);
        }
      }
    }
    
    // Render particles on top
    this.renderParticles();
  }

  renderBackground() {
    // Sky gradient based on time of day
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    
    switch (this.timeOfDay) {
      case 'dawn':
        gradient.addColorStop(0, '#ff9a56');
        gradient.addColorStop(1, '#ffad56');
        break;
      case 'day':
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#98fb98');
        break;
      case 'dusk':
        gradient.addColorStop(0, '#ff6b35');
        gradient.addColorStop(1, '#f7931e');
        break;
      case 'night':
        gradient.addColorStop(0, '#191970');
        gradient.addColorStop(1, '#000080');
        break;
      default:
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#98fb98');
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  startAnimation() {
    const animate = () => {
      this.animationFrame = requestAnimationFrame(animate);
      // Render will be called from parent component
    };
    animate();
  }

  stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}

export function FarmVisualization({ 
  plots, 
  gridSize, 
  weather = 'sunny', 
  timeOfDay = 'day',
  onPlotClick,
  onPlotRightClick,
  className = ""
}) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new FarmRenderer(canvasRef.current);
      setIsInitialized(true);
    }
  }, []);

  // Update weather
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setWeather(weather);
      
      // Create weather particles
      const weatherEffect = WEATHER_EFFECTS[weather];
      if (weatherEffect.particles) {
        rendererRef.current.createParticles(weatherEffect.particles);
      }
    }
  }, [weather]);

  // Update time of day
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setTimeOfDay(timeOfDay);
    }
  }, [timeOfDay]);

  // Render loop
  useEffect(() => {
    if (!isInitialized || !rendererRef.current) return;

    const render = () => {
      rendererRef.current.render(plots, gridSize);
      requestAnimationFrame(render);
    };

    render();
  }, [isInitialized, plots, gridSize]);

  // Handle clicks
  const handleClick = useCallback((event) => {
    if (!onPlotClick) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const plotX = Math.floor(x / (PLOT_SIZE + GRID_GAP));
    const plotY = Math.floor(y / (PLOT_SIZE + GRID_GAP));
    const plotIndex = plotY * gridSize + plotX;
    
    if (plotIndex >= 0 && plotIndex < plots.length) {
      onPlotClick(plotIndex);
    }
  }, [onPlotClick, gridSize, plots]);

  const handleRightClick = useCallback((event) => {
    event.preventDefault();
    if (!onPlotRightClick) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const plotX = Math.floor(x / (PLOT_SIZE + GRID_GAP));
    const plotY = Math.floor(y / (PLOT_SIZE + GRID_GAP));
    const plotIndex = plotY * gridSize + plotX;
    
    if (plotIndex >= 0 && plotIndex < plots.length) {
      onPlotRightClick(plotIndex);
    }
  }, [onPlotRightClick, gridSize, plots]);

  const canvasSize = gridSize * (PLOT_SIZE + GRID_GAP) - GRID_GAP;

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className={`border-2 border-gray-300 rounded-lg cursor-pointer ${className}`}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      style={{
        width: `${canvasSize}px`,
        height: `${canvasSize}px`,
        imageRendering: 'pixelated'
      }}
    />
  );
}

export default FarmVisualization;
