/**
 * Disease Management System - Handles crop diseases and pests
 */

import {
  DISEASE_TYPES,
  CURE_ITEMS,
  calculateDiseaseRisk,
  getAdjacentPlots,
} from '../constants/diseaseData';

export class DiseaseSystem {
  constructor(gameState, actions) {
    this.state = gameState;
    this.actions = actions;
    this.lastDiseaseCheck = Date.now();
    this.diseaseCheckInterval = 25000; // Target cadence between disease checks
    this.diseaseCheckJitter = 10000; // Randomized +0-10s jitter to avoid predictable spikes
    this.nextDiseaseCheckAt = this.lastDiseaseCheck + this.getNextDiseaseCheckDelay();
  }

  /**
   * Main update loop - check for disease spread
   */
  update(currentState) {
    // FIXED: Update internal state reference
    if (!currentState) {
      console.error('[farm] DiseaseSystem: update() called with null/undefined state');
      return;
    }

    this.state = currentState;

    const now = Date.now();
    if (now < this.nextDiseaseCheckAt) {
      return; // Not time yet
    }

    this.lastDiseaseCheck = now;
    this.nextDiseaseCheckAt = now + this.getNextDiseaseCheckDelay();

    // Check for disease spread from existing diseases
    this.spreadDiseases();

    // Check for new random disease occurrences
    this.checkNewDiseases();
  }

  /**
   * Get the next disease-check delay using jitter so timing feels less patterned
   * @returns {number}
   */
  getNextDiseaseCheckDelay() {
    return this.diseaseCheckInterval + Math.floor(Math.random() * this.diseaseCheckJitter);
  }

  /**
   * Spread diseases from infected plots to adjacent plots
   */
  spreadDiseases() {
    // Safety check
    if (!this.state || !this.state.plots) {
      console.warn('[farm] DiseaseSystem: No state or plots available');
      return;
    }

    const updatedPlots = [...this.state.plots];
    const gridSize = this.state.gridSize || 3;
    let spreadOccurred = false;

    this.state.plots.forEach((plot, index) => {
      if (!plot.disease || plot.state === 'empty') return;

      const diseaseType = DISEASE_TYPES[plot.disease];
      if (!diseaseType) return;

      // Get adjacent plots
      const adjacentIndices = getAdjacentPlots(index, gridSize);

      adjacentIndices.forEach((adjIndex) => {
        const adjPlot = updatedPlots[adjIndex];

        // Can only spread to growing/planted crops without disease
        if (!adjPlot || adjPlot.state === 'empty' || adjPlot.state === 'ready' || adjPlot.disease) {
          return;
        }

        // Check for disease protection (from buildings or items)
        if (this.hasProtection(adjPlot)) {
          return;
        }

        // Roll for spread
        if (Math.random() < diseaseType.spreadChance) {
          updatedPlots[adjIndex] = {
            ...adjPlot,
            disease: diseaseType.id,
            diseasedAt: Date.now(),
          };
          spreadOccurred = true;

          // Notification for spread
          if (Math.random() < 0.3 && this.actions.addNotification) {
            // 30% chance to notify (avoid spam)
            this.actions.addNotification({
              message: `${diseaseType.emoji || '🦠'} ${diseaseType.name || 'Disease'} spread to plot #${adjIndex + 1}!`,
              type: 'warning',
            });
          }
        }
      });
    });

    if (spreadOccurred) {
      this.actions.updatePlots(updatedPlots);
    }
  }

  /**
   * Check for new disease occurrences based on conditions
   */
  checkNewDiseases() {
    // Safety check
    if (!this.state || !this.state.plots) {
      console.warn('[farm] DiseaseSystem: No state or plots available');
      return;
    }

    const updatedPlots = [...this.state.plots];
    const gridSize = this.state.gridSize || 3;
    let newDiseaseOccurred = false;

    this.state.plots.forEach((plot, index) => {
      // Only affect growing crops without existing disease
      if (plot.state !== 'growing' && plot.state !== 'planted') return;
      if (plot.disease) return;
      if (this.hasProtection(plot)) return;

      // Count adjacent diseased plots
      const adjacentIndices = getAdjacentPlots(index, gridSize);
      const adjacentDiseased = adjacentIndices.filter(
        (adjIdx) => this.state.plots[adjIdx]?.disease
      ).length;

      // Calculate plot health (based on water, fertility)
      const plotHealth = Math.min((plot.waterLevel || 50) / 100, plot.soilFertility || 1.0);

      // Calculate disease risks
      const risks = calculateDiseaseRisk(this.state.weather, plotHealth, adjacentDiseased);

      // Roll for each disease type
      Object.entries(risks).forEach(([diseaseId, risk]) => {
        if (Math.random() < risk) {
          updatedPlots[index] = {
            ...plot,
            disease: diseaseId,
            diseasedAt: Date.now(),
          };
          newDiseaseOccurred = true;

          // FIXED: Add safety check for disease type
          const diseaseType = DISEASE_TYPES[diseaseId];
          if (diseaseType && this.actions.addNotification) {
            this.actions.addNotification({
              message: `${diseaseType.emoji || '🦠'} ${diseaseType.name || 'Disease'} infected plot #${index + 1}!`,
              type: 'error',
            });
          }
        }
      });
    });

    if (newDiseaseOccurred) {
      this.actions.updatePlots(updatedPlots);
    }
  }

  /**
   * Apply cure to a plot
   * @param {number} plotIndex - Index of plot to cure
   * @param {string} cureItemId - ID of cure item to use
   * @returns {boolean} - Success
   */
  applyCure(plotIndex, cureItemId) {
    const plot = this.state.plots[plotIndex];
    if (!plot || !plot.disease) {
      return false; // No disease to cure
    }

    const cureItem = CURE_ITEMS[cureItemId];
    if (!cureItem) {
      return false; // Invalid cure
    }

    // Check if player can afford
    if (this.state.coins < cureItem.cost) {
      this.actions.addNotification({
        message: `Not enough coins! ${cureItem.name} costs ${cureItem.cost}🪙`,
        type: 'error',
      });
      return false;
    }

    // Check if cure works for this disease
    if (!cureItem.cures.includes(plot.disease)) {
      if (this.actions.addNotification) {
        const diseaseName = DISEASE_TYPES[plot.disease]?.name || 'this disease';
        this.actions.addNotification({
          message: `${cureItem.emoji || '💊'} ${cureItem.name || 'Cure'} doesn't work on ${diseaseName}!`,
          type: 'warning',
        });
      }
      return false;
    }

    // Apply cure
    const updatedPlots = [...this.state.plots];
    updatedPlots[plotIndex] = {
      ...plot,
      disease: null,
      diseasedAt: null,
      curedAt: Date.now(),
      protection: cureItem.preventionDuration ? Date.now() + cureItem.preventionDuration : null,
    };

    this.actions.updatePlots(updatedPlots);
    this.actions.spendMoney(cureItem.cost);
    this.actions.addXP(10, { source: 'milestone', label: 'Disease Managed' }); // Reward for disease management

    // Particle effect
    if (typeof window.triggerParticleEffect === 'function') {
      // Find the plot element and trigger effect
      setTimeout(() => {
        const plotElement = document.querySelector(`[data-plot-index="${plotIndex}"]`);
        if (plotElement) {
          const rect = plotElement.getBoundingClientRect();
          window.triggerParticleEffect(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            'plant'
          );
        }
      }, 50);
    }

    if (this.actions.addNotification) {
      const diseaseName = DISEASE_TYPES[plot.disease]?.name || 'disease';
      this.actions.addNotification({
        message: `${cureItem.emoji || '💊'} Cured ${diseaseName}!`,
        type: 'success',
      });
    }

    return true;
  }

  /**
   * Check if plot has disease protection (from buildings or recent cure)
   * @param {Object} plot - Plot to check
   * @returns {boolean}
   */
  hasProtection(plot) {
    // Check for recent cure with prevention duration
    if (plot.protection && Date.now() < plot.protection) {
      return true;
    }

    // Check for barn (reduces disease risk by 50%)
    const hasBarn = this.state.buildings?.barn?.built;
    if (hasBarn && Math.random() < 0.5) {
      return true; // 50% chance barn blocks disease
    }

    return false;
  }

  /**
   * Calculate harvest penalty from disease
   * @param {Object} plot - Plot being harvested
   * @param {number} baseValue - Base harvest value
   * @returns {number} - Modified value
   */
  applyDiseaseHarvestPenalty(plot, baseValue) {
    if (!plot.disease) return baseValue;

    const diseaseType = DISEASE_TYPES[plot.disease];
    if (!diseaseType) return baseValue;

    const penaltyMultiplier = 1.0 - diseaseType.yieldPenalty;
    return Math.floor(baseValue * penaltyMultiplier);
  }

  /**
   * Get disease statistics for analytics
   * @returns {Object}
   */
  getDiseaseStats() {
    const diseasedPlots = this.state.plots.filter((p) => p.disease);
    const diseaseTypes = {};

    diseasedPlots.forEach((plot) => {
      diseaseTypes[plot.disease] = (diseaseTypes[plot.disease] || 0) + 1;
    });

    return {
      totalDiseased: diseasedPlots.length,
      diseaseTypes,
      healthyPlots: this.state.plots.filter((p) => p.state !== 'empty' && !p.disease).length,
    };
  }
}

export default DiseaseSystem;
