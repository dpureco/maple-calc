// Starforce cost calculation functions by server
// Values taken from https://strategywiki.org/wiki/MapleStory/Spell_Trace_and_Star_Force#Meso_Cost

/**
 * Creates a meso cost function
 * @param {number} divisor - Divisor for cost calculation
 * @param {number} currentStarExp - Exponent for current star
 * @param {number} extraMult - Extra multiplier
 * @returns {Function} Cost calculation function
 */
function makeMesoFn(divisor, currentStarExp = 2.7, extraMult = 1) {
  return (currentStar, itemLevel) =>
    100 * Math.round(extraMult * (Math.floor(itemLevel / 10) * 10) ** 3 * ((currentStar + 1) ** currentStarExp) / divisor + 10)
}

/**
 * Get meso function for pre-Savior GMS
 * @param {number} current_star - Current star level
 * @returns {Function} Cost function
 */
function preSaviorMesoFn(current_star) {
  if (current_star >= 15) {
    return makeMesoFn(20000)
  }
  if (current_star >= 10) {
    return makeMesoFn(40000)
  }
  return makeMesoFn(2500, 1)
}

/**
 * Calculate cost for pre-Savior GMS
 * @param {number} current_star - Current star level
 * @param {number} item_level - Item level
 * @returns {number} Meso cost
 */
export function preSaviorCost(current_star, item_level) {
  const mesoFn = preSaviorMesoFn(current_star)
  return mesoFn(current_star, item_level)
}

/**
 * Get meso function for Savior GMS
 * @param {number} current_star - Current star level
 * @returns {Function} Cost function
 */
function saviorMesoFn(current_star) {
  switch (current_star) {
    case 11:
      return makeMesoFn(22000)
    case 12:
      return makeMesoFn(15000)
    case 13:
      return makeMesoFn(11000)
    case 14:
      return makeMesoFn(7500)
    default:
      return preSaviorMesoFn(current_star)
  }
}

/**
 * Calculate cost for Savior GMS
 * @param {number} current_star - Current star level
 * @param {number} item_level - Item level
 * @returns {number} Meso cost
 */
export function saviorCost(current_star, item_level) {
  const mesoFn = saviorMesoFn(current_star)
  return mesoFn(current_star, item_level)
}

/**
 * Get meso function for KMS/current GMS (30 stars)
 * @param {number} current_star - Current star level
 * @returns {Function} Cost function
 */
function kmsMesoFn(current_star) {
  switch (current_star) {
    case 11:
      return makeMesoFn(22000)
    case 12:
      return makeMesoFn(15000)
    case 13:
      return makeMesoFn(11000)
    case 14:
      return makeMesoFn(7500)
    case 17:
      return makeMesoFn(20000, 2.7, 4/3)
    case 18:
      return makeMesoFn(20000, 2.7, 20/7)
    case 19:
      return makeMesoFn(20000, 2.7, 40/9)
    case 21:
      return makeMesoFn(20000, 2.7, 8/5)
    default:
      return preSaviorMesoFn(current_star)
  }
}

/**
 * Calculate cost for KMS/current GMS (30 stars)
 * @param {number} current_star - Current star level
 * @param {number} item_level - Item level
 * @returns {number} Meso cost
 */
export function kmsCost(current_star, item_level) {
  const mesoFn = kmsMesoFn(current_star)
  return mesoFn(current_star, item_level)
}

/**
 * Get meso function for TMS Regular
 * @param {number} current_star - Current star level
 * @returns {Function} Cost function
 */
function tmsRegMesoFn(current_star) {
  if (current_star >= 20) {
    return makeMesoFn(4000)
  }
  if (current_star >= 15) {
    return makeMesoFn(5000)
  }
  if (current_star >= 11) {
    return makeMesoFn(20000, 2.7, 3)
  }
  if (current_star >= 10) {
    return makeMesoFn(20000)
  }
  return makeMesoFn(2500, 1)
}

/**
 * Calculate cost for TMS Regular
 * @param {number} current_star - Current star level
 * @param {number} item_level - Item level
 * @returns {number} Meso cost
 */
export function tmsRegCost(current_star, item_level) {
  const mesoFn = tmsRegMesoFn(current_star)
  return mesoFn(current_star, item_level)
}

/**
 * Calculate cost for TMS Reboot
 * @param {number} current_star - Current star level
 * @param {number} item_level - Item level
 * @returns {number} Meso cost
 */
export function tmsRebootCost(current_star, item_level) {
  const adjusted_level = item_level > 150 ? 150 : item_level
  return saviorCost(current_star, adjusted_level)
}

// Map from server input value to the associated cost function.
// As of the ignition update GMS uses KMS starforce prices.
// The Savior update increases cost for 11-15 but removes downgrading/booming.
const SERVER_COST_FUNCTIONS = {
  "gms": kmsCost,
  "old": preSaviorCost,
  "gmsPre30": saviorCost,
  "tms": tmsRegCost,
  "tmsr": tmsRebootCost,
  "kms": kmsCost
}

/**
 * Get base cost for a starforce attempt
 * @param {string} server - Server identifier
 * @param {number} current_star - Current star level
 * @param {number} item_level - Item level
 * @returns {number} Base meso cost
 */
export function getBaseCost(server, current_star, item_level) {
  const costFn = SERVER_COST_FUNCTIONS[server]
  return costFn(current_star, item_level)
}

/**
 * Get safeguard cost multiplier increase
 * @param {number} current_star - Current star level
 * @param {boolean} sauna - Whether Savior update is active (deprecated param)
 * @param {string} server - Server identifier
 * @returns {number} Multiplier increase (0, 1, or 2)
 */
export function getSafeguardMultiplierIncrease(current_star, sauna, server) {
  if ((server === 'kms' || server === 'gms') && current_star >= 15 && current_star <= 17) {
    return 2
  }

  if (server === "old" && !sauna && current_star >= 12 && current_star <= 16) {
    return 1
  }

  if (server !== 'kms' && server !== 'gms' && current_star >= 15 && current_star <= 16) {
    return 1
  }

  return 0
}
