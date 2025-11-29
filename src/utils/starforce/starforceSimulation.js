// Starforce simulation logic from reference project (main.js)

import { getBaseCost, getSafeguardMultiplierIncrease } from '../../data/starforce/serverCosts.js'

/**
 * Calculate median of an array
 * @param {Array} values - Array of numbers
 * @returns {number} Median value
 */
function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const half = Math.floor(sorted.length / 2)

  if (sorted.length % 2) {
    return sorted[half]
  } else {
    return (sorted[half - 1] + sorted[half]) / 2.0
  }
}

/**
 * Calculate cost of a single starforce attempt
 * @param {number} current_star - Current star level
 * @param {number} item_level - Item level
 * @param {boolean} boom_protect - Using safeguard
 * @param {boolean} thirty_off - 30% meso discount event
 * @param {boolean} sauna - Deprecated parameter (formerly boom reduction)
 * @param {boolean} silver - MVP Silver discount
 * @param {boolean} gold - MVP Gold discount
 * @param {boolean} diamond - MVP Diamond discount
 * @param {boolean} five_ten_fifteen - 5/10/15 guaranteed event
 * @param {boolean} chance_time - Chance time active (non-KMS/GMS)
 * @param {string} item_type - Item type
 * @param {string} server - Server identifier
 * @returns {number} Cost in mesos
 */
export function attemptCost(current_star, item_level, boom_protect, thirty_off, sauna, silver, gold, diamond, five_ten_fifteen, chance_time, item_type, server) {
  let multiplier = 1

  // MVP discounts (only for stars 1-16)
  if (silver && current_star <= 15) {
    multiplier = multiplier - 0.03
  }
  if (gold && current_star <= 15) {
    multiplier = multiplier - 0.05
  }
  if (diamond && current_star <= 15) {
    multiplier = multiplier - 0.1
  }

  // 30% discount event
  if (thirty_off) {
    multiplier = multiplier - 0.3
  }

  // Safeguard cost increase
  if (server === "kms" || server === "gms") {
    if (boom_protect && !(five_ten_fifteen && current_star === 15)) {
      multiplier = multiplier + getSafeguardMultiplierIncrease(current_star, sauna, server)
    }
  } else {
    if (boom_protect && !(five_ten_fifteen && current_star === 15) && !chance_time) {
      multiplier = multiplier + getSafeguardMultiplierIncrease(current_star, sauna, server)
    }
  }

  const attempt_cost = getBaseCost(server, current_star, item_level) * multiplier
  return parseFloat(attempt_cost.toFixed(0))
}

/**
 * Check if chance time is active (auto-success after 2 decreases)
 * @param {number} decrease_count - Current decrease count
 * @returns {boolean} Whether chance time is active
 */
export function checkChanceTime(decrease_count) {
  return decrease_count === 2
}

/**
 * Determine outcome of a starforce attempt
 * @param {number} current_star - Current star level
 * @param {Object} rates - Rate table
 * @param {boolean} star_catch - Star Catch (+5%)
 * @param {boolean} boom_protect - Using safeguard
 * @param {boolean} five_ten_fifteen - 5/10/15 guaranteed event
 * @param {boolean} sauna - Deprecated parameter
 * @param {string} item_type - Item type
 * @param {string} server - Server identifier
 * @param {boolean} boom_event - 30% boom reduction event
 * @returns {string} "Success", "Maintain", "Decrease", or "Boom"
 */
export function determineOutcome(current_star, rates, star_catch, boom_protect, five_ten_fifteen, sauna, item_type, server, boom_event) {
  // 5/10/15 guaranteed success
  if (five_ten_fifteen) {
    if (current_star === 5 || current_star === 10 || current_star === 15) {
      return "Success"
    }
  }

  const outcome = Math.random()

  let probability_success = rates[current_star][0]
  let probability_maintain = rates[current_star][1]
  let probability_decrease = rates[current_star][2]
  let probability_boom = rates[current_star][3]

  // Sauna event (stars 12-14 for normal, 5-7 for tyrant - deprecated)
  if (sauna) {
    if ((current_star >= 12 && current_star <= 14) || (item_type === 'tyrant' && (current_star >= 5 && current_star <= 7))) {
      probability_decrease = probability_decrease + probability_boom
      probability_boom = 0
    }
  }

  // 30% boom reduction event (stars 0-21)
  if (boom_event && current_star <= 21) {
    probability_maintain = probability_maintain + probability_boom * 0.3
    probability_boom = probability_boom * 0.7
  }

  // Safeguard for non-KMS/GMS servers (stars 0-16)
  if (boom_protect && current_star <= 16 && server !== 'kms' && server !== 'gms') {
    if (probability_decrease > 0) {
      probability_decrease = probability_decrease + probability_boom
    } else {
      probability_maintain = probability_maintain + probability_boom
    }
    probability_boom = 0
  }

  // Safeguard for KMS/GMS (stars 0-17)
  if (boom_protect && current_star <= 17 && (server === 'kms' || server === 'gms')) {
    probability_maintain = probability_maintain + probability_boom
    probability_boom = 0
  }

  // Star catch adjustment (+5% multiplicative)
  if (star_catch) {
    probability_success = probability_success * 1.05
    const left_over = 1 - probability_success

    if (probability_decrease === 0) {
      probability_maintain = probability_maintain * (left_over) / (probability_maintain + probability_boom)
      probability_boom = left_over - probability_maintain
    } else {
      probability_decrease = probability_decrease * (left_over) / (probability_decrease + probability_boom)
      probability_boom = left_over - probability_decrease
    }
  }

  // Determine outcome
  if (outcome <= probability_success) {
    return "Success"
  } else if (probability_success < outcome && outcome < probability_success + probability_maintain) {
    return "Maintain"
  } else if (probability_success + probability_maintain < outcome && outcome < probability_success + probability_maintain + probability_decrease) {
    return "Decrease"
  } else if (probability_success + probability_maintain + probability_decrease < outcome && outcome < probability_success + probability_maintain + probability_decrease + probability_boom) {
    return "Boom"
  } else {
    return "Success"
  }
}

/**
 * Get star level item returns to after boom
 * @param {number} current_stars - Current star level
 * @param {string} server - Server identifier
 * @returns {number} Star level after boom
 */
export function getBoomStar(current_stars, server) {
  if (server !== "gms") {
    return 12
  }
  if (current_stars < 20) {
    return 12
  } else if (current_stars === 20) {
    return 15
  } else if (current_stars < 23) {
    return 17
  } else if (current_stars < 26) {
    return 19
  }
  return 20
}

/**
 * Perform a single starforce experiment (one complete session)
 * @param {number} current_stars - Starting star level
 * @param {number} desired_star - Target star level
 * @param {Object} rates - Rate table
 * @param {number} item_level - Item level
 * @param {boolean} boom_protect - Using safeguard
 * @param {boolean} thirty_off - 30% meso discount event
 * @param {boolean} star_catch - Star Catch (+5%)
 * @param {boolean} five_ten_fifteen - 5/10/15 guaranteed event
 * @param {boolean} sauna - Deprecated parameter
 * @param {boolean} silver - MVP Silver discount
 * @param {boolean} gold - MVP Gold discount
 * @param {boolean} diamond - MVP Diamond discount
 * @param {string} item_type - Item type
 * @param {boolean} two_plus - +2 stars event (disabled)
 * @param {boolean} useAEE - Using AEE (tyrant only)
 * @param {string} server - Server identifier
 * @param {boolean} boom_event - 30% boom reduction event
 * @returns {Array} [total_mesos, total_booms]
 */
export function performExperiment(current_stars, desired_star, rates, item_level, boom_protect, thirty_off, star_catch, five_ten_fifteen, sauna, silver, gold, diamond, item_type, two_plus, useAEE, server, boom_event) {
  let current_star = current_stars
  let total_mesos = 0
  let total_booms = 0
  let decrease_count = 0

  while (current_star < desired_star) {
    let chanceTime = false

    if (useAEE) {
      total_mesos++
    } else {
      if (server !== 'kms' && server !== 'gms') {
        chanceTime = checkChanceTime(decrease_count)
      }
      total_mesos = total_mesos + attemptCost(current_star, item_level, boom_protect, thirty_off, sauna, silver, gold, diamond, five_ten_fifteen, chanceTime, item_type, server)
    }

    if (chanceTime) {
      decrease_count = 0
      if (two_plus && current_star <= 10) {
        current_star = current_star + 2
      } else {
        current_star++
      }
    } else {
      const outcome = determineOutcome(current_star, rates, star_catch, boom_protect, five_ten_fifteen, sauna, item_type, server, boom_event)

      if (outcome === "Success") {
        decrease_count = 0
        if (two_plus && current_star <= 10) {
          current_star = current_star + 2
        } else {
          current_star++
        }
      } else if (outcome === "Decrease") {
        decrease_count++
        current_star--
      } else if (outcome === "Maintain") {
        decrease_count = 0
      } else if (outcome === "Boom" && item_type === 'normal') {
        decrease_count = 0
        current_star = getBoomStar(current_star, server)
        total_booms++
      } else if (outcome === "Boom" && item_type === 'tyrant') {
        decrease_count = 0
        current_star = 0
        total_booms++
      }
    }
  }

  return [total_mesos, total_booms]
}

/**
 * Run multiple starforce experiments and collect statistics
 * @param {number} total_trials - Number of trials to run
 * @param {number} current_star - Starting star level
 * @param {number} desired_star - Target star level
 * @param {Object} rates - Rate table
 * @param {number} item_level - Item level
 * @param {boolean} boom_protect - Using safeguard
 * @param {boolean} thirty_off - 30% meso discount event
 * @param {boolean} star_catch - Star Catch (+5%)
 * @param {boolean} five_ten_fifteen - 5/10/15 guaranteed event
 * @param {boolean} sauna - Deprecated parameter
 * @param {boolean} silver - MVP Silver discount
 * @param {boolean} gold - MVP Gold discount
 * @param {boolean} diamond - MVP Diamond discount
 * @param {string} item_type - Item type
 * @param {boolean} two_plus - +2 stars event (disabled)
 * @param {boolean} useAEE - Using AEE (tyrant only)
 * @param {string} server - Server identifier
 * @param {boolean} boom_event - 30% boom reduction event
 * @returns {Object} Statistics object
 */
export function repeatExperiment(total_trials, current_star, desired_star, rates, item_level, boom_protect, thirty_off, star_catch, five_ten_fifteen, sauna, silver, gold, diamond, item_type, two_plus, useAEE, server, boom_event) {
  let total_mesos = 0
  let total_booms = 0
  let current_trial = 0
  const meso_result_list = []
  const boom_result_list = []
  const meso_result_list_divided = []

  while (current_trial < total_trials) {
    const [trial_mesos, trial_booms] = performExperiment(current_star, desired_star, rates, item_level, boom_protect, thirty_off, star_catch, five_ten_fifteen, sauna, silver, gold, diamond, item_type, two_plus, useAEE, server, boom_event)

    meso_result_list.push(trial_mesos)
    meso_result_list_divided.push(trial_mesos / 1000000000)
    boom_result_list.push(trial_booms)

    total_mesos = total_mesos + trial_mesos
    total_booms = total_booms + trial_booms
    current_trial++
  }

  const average_cost = parseFloat((total_mesos / total_trials).toFixed(0))
  const average_booms = parseFloat((total_booms / total_trials).toFixed(2))

  // Calculate median
  const median_cost = median([...meso_result_list])
  const median_booms = median([...boom_result_list])

  const max_cost = Math.max(...meso_result_list)
  const max_booms = Math.max(...boom_result_list)

  const min_cost = Math.min(...meso_result_list)
  const min_booms = Math.min(...boom_result_list)

  return {
    average_cost,
    average_booms,
    meso_result_list,
    boom_result_list,
    median_cost,
    median_booms,
    max_cost,
    min_cost,
    max_booms,
    min_booms,
    meso_result_list_divided
  }
}
