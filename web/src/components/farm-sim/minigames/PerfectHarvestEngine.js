const createRng = (seed) => {
  let value = Number.isFinite(seed) ? Math.floor(seed) : Math.floor(Date.now() % 100000);
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

class PerfectHarvestGame {
  constructor({
    onUpdate,
    onEnd,
    speed,
    zoneWidth,
    sweetSpot,
    reducedMotion,
    deterministicSeed,
  } = {}) {
    this.onUpdate = onUpdate;
    this.onEnd = onEnd;
    this.active = false;
    this.rafId = null;
    this.state = null;
    this.lastFrameTime = null;
    this.result = null;
    this.rng = createRng(deterministicSeed);
    this.config = {
      speed: reducedMotion ? speed * 0.6 : speed,
      zoneWidth: reducedMotion ? Math.min(0.28, zoneWidth * 1.2) : zoneWidth,
      sweetSpot: sweetSpot,
    };
  }

  init() {
    const sweetSpot = Number.isFinite(this.config.sweetSpot)
      ? this.config.sweetSpot
      : 0.35 + this.rng() * 0.3;
    this.state = {
      position: 0,
      direction: 1,
      speed: this.config.speed ?? 0.6,
      zoneWidth: this.config.zoneWidth ?? 0.18,
      sweetSpot,
    };
    this.result = null;
    return this.state;
  }

  start() {
    if (this.active) return;
    if (!this.state) this.init();
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

    const nextPosition =
      this.state.position + this.state.direction * this.state.speed * deltaSeconds;
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

  stop() {
    if (!this.active) return this.result;
    this.active = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.state) {
      const distance = Math.abs(this.state.position - this.state.sweetSpot);
      const accuracy = Math.max(0, 1 - distance / 0.5);
      this.result = {
        position: this.state.position,
        sweetSpot: this.state.sweetSpot,
        zoneWidth: this.state.zoneWidth,
        distance,
        accuracy,
      };
      this.onEnd?.({ ...this.result });
    }
    return this.result;
  }

  getResult() {
    return this.result;
  }

  destroy() {
    this.active = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.state = null;
    this.lastFrameTime = null;
    this.result = null;
  }

  cleanup() {
    this.destroy();
  }
}

export const createGame = (config) => {
  const game = new PerfectHarvestGame(config);
  game.init();
  return game;
};

// Legacy export kept for compatibility
export class PerfectHarvestEngine extends PerfectHarvestGame {}

export default createGame;
