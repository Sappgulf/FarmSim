/**
 * @typedef {Object} CropType
 * @property {string} id
 * @property {string} name
 * @property {string} emoji
 * @property {number} stages
 * @property {number} secondsPerStage
 * @property {number} baseValue
 * @property {number} shopPrice
 * @property {string} season
 * @property {string} family
 */

/**
 * @typedef {Object} CropInstance
 * @property {string} state
 * @property {string|null} seed
 * @property {number} growth
 * @property {boolean} watered
 * @property {number} fertilized
 * @property {number|null} plantedAt
 * @property {number|null} lastWateredAt
 * @property {boolean} infested
 * @property {boolean} boosted
 * @property {number} quality
 */

/**
 * @typedef {Object} InventoryItem
 * @property {string} id
 * @property {number} count
 */

/**
 * @typedef {Object} PlayerState
 * @property {string} name
 * @property {number} coins
 * @property {number} score
 * @property {Object.<string, number>} inventory
 * @property {string} selectedSeed
 */

/**
 * @typedef {Object} WorldState
 * @property {number} gridSize
 * @property {CropInstance[]} plots
 * @property {string} currentSeason
 * @property {Object} weather
 */

/**
 * @typedef {Object} SaveData
 * @property {number} version
 * @property {number} savedAt
 * @property {PlayerState} player
 * @property {WorldState} world
 */

export {};
