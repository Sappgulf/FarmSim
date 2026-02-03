export class PerfectHarvestEngine {
  constructor({ onUpdate, onEnd } = {}) {
    this.onUpdate = onUpdate;
    this.onEnd = onEnd;
    this.active = false;
    this.rafId = null;
    this.state = null;
    this.lastFrameTime = null;
  }

  init({ speed = 0.6, zoneWidth = 0.18, sweetSpot = 0.5 } = {}) {
    this.state = {
      position: 0,
      direction: 1,
      speed,
      zoneWidth,
      sweetSpot,
    };
    return this.state;
  }

  start() {
    if (this.active || !this.state) return;
    this.active = true;
    this.lastFrameTime = null;
    this.rafId = requestAnimationFrame(this.update);
  }

  update = (time) => {
    if (!this.active || !this.state) return;
    if (this.lastFrameTime === null) {
      this.lastFrameTime = time;
    }
    const deltaSeconds = Math.min(0.05, (time - this.lastFrameTime) / 1000);
    this.lastFrameTime = time;

    const nextPosition = this.state.position + (this.state.direction * this.state.speed * deltaSeconds);
    if (nextPosition >= 1) {
      this.state.position = 1;
      this.state.direction = -1;
    } else if (nextPosition <= 0) {
      this.state.position = 0;
      this.state.direction = 1;
    } else {
      this.state.position = nextPosition;
    }

    this.onUpdate?.({ ...this.state });
    this.rafId = requestAnimationFrame(this.update);
  };

  end() {
    if (!this.active) return;
    this.active = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.state) {
      this.onEnd?.({ ...this.state });
    }
  }

  cleanup() {
    this.active = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.state = null;
    this.lastFrameTime = null;
  }
}

export default PerfectHarvestEngine;
