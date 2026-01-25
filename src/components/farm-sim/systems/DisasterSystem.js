/**
 * Disaster Management System - Handles random farm disasters
 */

import { DISASTER_TYPES, DISASTER_PROTECTIONS, calculateDisasterRisk, calculateProtection, estimateDisasterDamage } from '../constants/disasterData';

export class DisasterSystem {
  constructor(gameState, actions) {
    this.state = gameState;
    this.actions = actions;
    this.lastDisasterCheck = Date.now();
    this.disasterCheckInterval = 30000; // Check every 30 seconds
    this.activeDisaster = null;
    this.disasterWarning = null;
  }

  /**
   * Main update loop - check for disasters and manage active ones
   */
  update(currentState) {
    // FIXED: Update internal state reference
    if (!currentState) {
      console.error('[farm] DisasterSystem: update() called with null/undefined state');
      return;
    }

    this.state = currentState;

    const now = Date.now();

    // Handle active disaster
    if (this.activeDisaster) {
      this.manageActiveDisaster(now);
      return;
    }

    // Handle disaster warning
    if (this.disasterWarning) {
      this.manageDisasterWarning(now);
      return;
    }

    // Check for new disasters
    if (now - this.lastDisasterCheck >= this.disasterCheckInterval) {
      this.lastDisasterCheck = now;
      this.checkForDisasters();
    }
  }

  /**
   * Check if a disaster should occur
   */
  checkForDisasters() {
    // Safety check
    if (!this.state) {
      console.warn('[farm] DisasterSystem: No state available for disaster checks');
      return;
    }

    // Don't spawn disasters if already one active or warned
    if (this.activeDisaster || this.disasterWarning) return;

    // Get farm protections - use safe fallback
    const protections = this.state.disasterProtections || {};
    const hasAnyProtection = Object.keys(protections).length > 0;

    // Calculate disaster risks
    const risks = calculateDisasterRisk(
      this.state.weather || 'sunny',
      this.state.level || 1,
      hasAnyProtection
    );

    // Roll for each disaster type
    Object.entries(risks).forEach(([disasterId, risk]) => {
      if (Math.random() < risk) {
        this.triggerDisasterWarning(disasterId);
      }
    });
  }

  /**
   * Trigger a disaster warning
   * @param {string} disasterId - Disaster type ID
   */
  triggerDisasterWarning(disasterId) {
    const disaster = DISASTER_TYPES[disasterId];
    if (!disaster) return;

    this.disasterWarning = {
      disasterId,
      disaster,
      startTime: Date.now(),
      endTime: Date.now() + disaster.warningTime,
    };

    // Notification
    this.actions.addNotification({
      message: `⚠️ ${disaster.emoji} ${disaster.name} WARNING! ${Math.floor(disaster.warningTime / 1000)}s to prepare!`,
      type: 'error',
    });

    // Screen shake for impact
    if (typeof window.triggerScreenShake === 'function') {
      window.triggerScreenShake(2);
    }

    // Sound
    if (typeof window.soundSystem !== 'undefined') {
      window.soundSystem.playHarvestSound(); // Alarm sound
    }
  }

  /**
   * Manage active disaster warning
   * @param {number} now - Current time
   */
  manageDisasterWarning(now) {
    if (!this.disasterWarning) return;

    // Check if warning time expired
    if (now >= this.disasterWarning.endTime) {
      // Trigger the actual disaster
      this.triggerDisaster(this.disasterWarning.disasterId);
      this.disasterWarning = null;
    }
  }

  /**
   * Trigger the actual disaster
   * @param {string} disasterId - Disaster type ID
   */
  triggerDisaster(disasterId) {
    const disaster = DISASTER_TYPES[disasterId];
    if (!disaster) return;

    this.activeDisaster = {
      disasterId,
      disaster,
      startTime: Date.now(),
      endTime: Date.now() + disaster.duration,
    };

    // Apply disaster effects
    this.applyDisasterEffects(disaster);

    // Notification
    this.actions.addNotification({
      message: `💥 ${disaster.emoji} ${disaster.name} HIT THE FARM!`,
      type: 'error',
    });

    // Screen shake
    if (typeof window.triggerScreenShake === 'function') {
      window.triggerScreenShake(4);
    }
  }

  /**
   * Apply disaster effects to farm
   * @param {Object} disaster - Disaster data
   */
  applyDisasterEffects(disaster) {
    // Safety check
    if (!this.state) {
      console.warn('[farm] DisasterSystem: No state available for disaster effects');
      return;
    }

    const protections = this.state.disasterProtections || {};
    const protectionFactor = 1.0 - calculateProtection(disaster.id, protections);

    let totalDamage = 0;

    // Crop destruction
    if (disaster.effects.cropDestruction) {
      const plots = this.state.plots || [];
      const updatedPlots = plots.map(plot => {
        if (plot.state === 'empty' || plot.state === 'withered') return plot;

        // Roll for damage
        if (Math.random() < disaster.damageChance * protectionFactor) {
          totalDamage += (plot.crop?.baseValue || 10) * disaster.effects.cropDestruction;
          return {
            ...plot,
            state: 'withered',
            witheredAt: Date.now(),
            disasterDamage: disaster.id,
          };
        }
        return plot;
      });

      this.actions.updatePlots(updatedPlots);
    }

    // Water level changes (flood)
    if (disaster.effects.waterLevel !== undefined) {
      const plots = this.state.plots || [];
      const updatedPlots = plots.map(plot => ({
        ...plot,
        waterLevel: disaster.effects.waterLevel,
      }));
      this.actions.updatePlots(updatedPlots);
    }

    // Soil fertility reduction
    if (disaster.effects.soilFertility) {
      const plots = this.state.plots || [];
      const updatedPlots = plots.map(plot => ({
        ...plot,
        soilFertility: Math.max(0.1, (plot.soilFertility || 1.0) + disaster.effects.soilFertility),
      }));
      this.actions.updatePlots(updatedPlots);
    }

    // Water drain (drought)
    if (disaster.effects.waterDrain) {
      const plots = this.state.plots || [];
      const updatedPlots = plots.map(plot => ({
        ...plot,
        waterLevel: Math.max(0, (plot.waterLevel || 50) - disaster.effects.waterDrain * protectionFactor),
      }));
      this.actions.updatePlots(updatedPlots);
    }

    // Direct coin loss
    if (disaster.effects.coinLoss) {
      const coinLoss = Math.floor((this.state.coins || 0) * disaster.effects.coinLoss * protectionFactor);
      this.actions.setCoins(Math.max(0, (this.state.coins || 0) - coinLoss));
      totalDamage += coinLoss;
    }

    // Inventory loss
    if (disaster.effects.inventoryLoss) {
      const inventory = this.state.inventory || {};
      const updatedInventory = { ...inventory };
      Object.keys(updatedInventory).forEach(cropId => {
        const loss = Math.floor(updatedInventory[cropId] * disaster.effects.inventoryLoss * protectionFactor);
        updatedInventory[cropId] = Math.max(0, updatedInventory[cropId] - loss);
      });
      this.actions.updateInventory(updatedInventory);
    }

    // Disease spread (locust swarm)
    if (disaster.effects.disease) {
      const plots = this.state.plots || [];
      const updatedPlots = plots.map(plot => {
        if ((plot.state === 'growing' || plot.state === 'planted') && Math.random() < 0.5) {
          return {
            ...plot,
            disease: disaster.effects.disease,
            diseasedAt: Date.now(),
          };
        }
        return plot;
      });
      this.actions.updatePlots(updatedPlots);
    }

    // Apply insurance if available
    if (protections.insurance && totalDamage > 0) {
      const coverage = DISASTER_PROTECTIONS.insurance.coverage;
      const reimbursement = Math.floor(totalDamage * coverage);
      this.actions.setCoins((this.state.coins || 0) + reimbursement);
      this.actions.addNotification({
        message: `🛡️ Insurance covered ${reimbursement}🪙 of damage!`,
        type: 'success',
      });
    }
  }

  /**
   * Manage active disaster
   * @param {number} now - Current time
   */
  manageActiveDisaster(now) {
    if (!this.activeDisaster) return;

    // Check if disaster ended
    if (now >= this.activeDisaster.endTime) {
      this.endDisaster();
    }
  }

  /**
   * End the active disaster
   */
  endDisaster() {
    if (!this.activeDisaster) return;

    const disaster = this.activeDisaster.disaster;

    // Notification
    this.actions.addNotification({
      message: `✅ ${disaster.emoji} ${disaster.name} has passed.`,
      type: 'success',
    });

    this.activeDisaster = null;
  }

  /**
   * Purchase disaster protection
   * @param {string} protectionId - Protection item ID
   * @returns {boolean} - Success
   */
  purchaseProtection(protectionId) {
    const protection = DISASTER_PROTECTIONS[protectionId];
    if (!protection) return false;

    // Check if already owned
    if (this.state && this.state.disasterProtections && this.state.disasterProtections[protectionId]) {
      this.actions.addNotification({
        message: `You already have ${protection.name}!`,
        type: 'warning',
      });
      return false;
    }

    // Check if can afford
    if (!this.state || (this.state.coins || 0) < protection.cost) {
      this.actions.addNotification({
        message: `Not enough coins! ${protection.name} costs ${protection.cost}🪙`,
        type: 'error',
      });
      return false;
    }

    // Purchase
    const currentProtections = this.state?.disasterProtections || {};
    const updatedProtections = {
      ...currentProtections,
      [protectionId]: {
        purchased: true,
        purchasedAt: Date.now(),
        expiresAt: protection.permanent ? null : Date.now() + protection.duration,
      },
    };

    this.actions.updateDisasterProtections(updatedProtections);
    this.actions.setCoins((this.state.coins || 0) - protection.cost);
    this.actions.grantXP(30, 'disaster_protection', { protectionId });

    this.actions.addNotification({
      message: `${protection.emoji} Purchased ${protection.name}!`,
      type: 'success',
    });

    return true;
  }

  /**
   * Get disaster statistics
   * @returns {Object}
   */
  getDisasterStats() {
    // Safety check
    if (!this.state) {
      return {
        activeProtections: 0,
        hasInsurance: false,
        disasterResistance: 0
      };
    }

    const protections = this.state.disasterProtections || {};
    const activeProtections = Object.keys(protections).length;

    return {
      activeProtections,
      hasInsurance: !!protections.insurance,
      activeDisaster: this.activeDisaster,
      disasterWarning: this.disasterWarning,
    };
  }
}

export default DisasterSystem;

