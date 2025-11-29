// Probability calculation functions from reference project (getProbability.js)

import { cubeRates } from '../../data/cubing/cubeRates.js'
import { tierNumberToText } from '../../data/cubing/cubeConfig.js'
import {
  emptyInputObject,
  CATEGORY,
  INPUT_CATEGORY_MAP,
  CALC_TYPE,
  MAX_CATEGORY_COUNT,
  isSpecialLine
} from '../../data/cubing/statCategories.js'

/**
 * Translate web input string to probability input object
 * Format: "stat+value&stat2+value2" becomes { stat: value, stat2: value2 }
 * @param {string} webInput - Input string from UI
 * @returns {Object} Probability input object
 */
export function translateInputToObject(webInput) {
  const vals = webInput.split('&')
  const output = Object.assign({}, emptyInputObject)
  for (const val of vals) {
    const [stat, amount] = val.split('+')
    output[stat] += parseInt(amount)
  }
  return output
}

/**
 * Calculate total number of lines or value for a specific category in an outcome
 * @param {Array} outcome - Array of [category, value, rate] tuples
 * @param {string} desiredCategory - Category to count
 * @param {number} calcType - CALC_TYPE.LINE or CALC_TYPE.VAL
 * @returns {number} Total count or value
 */
function _calculateTotal(outcome, desiredCategory, calcType = CALC_TYPE.LINE) {
  let actualVal = 0
  for (const [category, val, _] of outcome) {
    if (category === desiredCategory) {
      if (calcType === CALC_TYPE.VAL) {
        actualVal += val
      } else if (calcType === CALC_TYPE.LINE) {
        actualVal += 1
      }
    }
  }
  return actualVal
}

/**
 * Check if outcome meets "effective All Stats %" requirement (for Xenon)
 * STR, DEX, or LUK % each count as 1/3 All Stats %
 * @param {Array} outcome - Outcome to check
 * @param {number} requiredVal - Required All Stat % value
 * @returns {boolean} Whether requirement is met
 */
function checkPercAllStat(outcome, requiredVal) {
  let actualVal = 0
  for (const [category, val, _] of outcome) {
    if (category === CATEGORY.ALLSTATS_PERC) {
      actualVal += val
    } else if ([CATEGORY.STR_PERC, CATEGORY.DEX_PERC, CATEGORY.LUK_PERC].includes(category)) {
      actualVal += val / 3
    }
  }
  return actualVal >= requiredVal
}

/**
 * Map of functions to check if an outcome satisfies each input type
 */
const OUTCOME_MATCH_FUNCTION_MAP = {
  percStat: (outcome, requiredVal) =>
    _calculateTotal(outcome, CATEGORY.STR_PERC, CALC_TYPE.VAL) +
    _calculateTotal(outcome, CATEGORY.ALLSTATS_PERC, CALC_TYPE.VAL) >= requiredVal,
  lineStat: (outcome, requiredVal) =>
    _calculateTotal(outcome, CATEGORY.STR_PERC) +
    _calculateTotal(outcome, CATEGORY.ALLSTATS_PERC) >= requiredVal,
  percAllStat: checkPercAllStat,
  lineAllStat: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.ALLSTATS_PERC) >= requiredVal,
  percHp: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.MAXHP_PERC, CALC_TYPE.VAL) >= requiredVal,
  lineHp: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.MAXHP_PERC) >= requiredVal,
  percAtt: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.ATT_PERC, CALC_TYPE.VAL) >= requiredVal,
  lineAtt: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.ATT_PERC) >= requiredVal,
  percBoss: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.BOSSDMG_PERC, CALC_TYPE.VAL) >= requiredVal,
  lineBoss: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.BOSSDMG_PERC) >= requiredVal,
  lineIed: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.IED_PERC) >= requiredVal,
  lineCritDamage: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.CRITDMG_PERC) >= requiredVal,
  lineMeso: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.MESO_PERC) >= requiredVal,
  lineDrop: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.DROP_PERC) >= requiredVal,
  lineMesoOrDrop: (outcome, requiredVal) =>
    _calculateTotal(outcome, CATEGORY.MESO_PERC) +
    _calculateTotal(outcome, CATEGORY.DROP_PERC) >= requiredVal,
  secCooldown: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.CDR_TIME, CALC_TYPE.VAL) >= requiredVal,
  lineAutoSteal: (outcome, requiredVal) => _calculateTotal(outcome, CATEGORY.AUTOSTEAL_PERC) >= requiredVal,
  lineAttOrBoss: (outcome, requiredVal) =>
    _calculateTotal(outcome, CATEGORY.ATT_PERC) +
    _calculateTotal(outcome, CATEGORY.BOSSDMG_PERC) >= requiredVal,
  lineAttOrBossOrIed: (outcome, requiredVal) =>
    _calculateTotal(outcome, CATEGORY.ATT_PERC) +
    _calculateTotal(outcome, CATEGORY.BOSSDMG_PERC) +
    _calculateTotal(outcome, CATEGORY.IED_PERC) >= requiredVal,
  lineBossOrIed: (outcome, requiredVal) =>
    _calculateTotal(outcome, CATEGORY.BOSSDMG_PERC) +
    _calculateTotal(outcome, CATEGORY.IED_PERC) >= requiredVal
}

/**
 * Generate list of relevant categories based on probability input
 * @param {Object} probabilityInput - Input object with stat requirements
 * @returns {Array} Array of category strings
 */
export function getUsefulCategories(probabilityInput) {
  let usefulCategories = []
  for (const field in INPUT_CATEGORY_MAP) {
    if (probabilityInput[field] > 0) {
      usefulCategories = usefulCategories.concat(INPUT_CATEGORY_MAP[field])
    }
  }
  return Array.from(new Set(usefulCategories))
}

/**
 * Consolidate rate list to only include useful categories
 * All other categories are lumped into a single "Junk" entry
 * @param {Array} ratesList - List of [category, value, rate] tuples
 * @param {Array} usefulCategories - Categories to keep separate
 * @returns {Array} Consolidated rates list
 */
export function getConsolidatedRates(ratesList, usefulCategories) {
  const consolidatedRates = []
  let junkRate = 0.0
  let junkCategories = []

  for (const item of ratesList) {
    const [category, val, rate] = item

    if (usefulCategories.includes(category) || isSpecialLine(category)) {
      consolidatedRates.push(item)
    } else if (category === CATEGORY.JUNK) {
      junkRate += rate
      junkCategories = junkCategories.concat(val)
    } else {
      junkRate += rate
      junkCategories.push(`${category} (${val})`)
    }
  }

  consolidatedRates.push([CATEGORY.JUNK, junkCategories, junkRate])
  return consolidatedRates
}

/**
 * Check if an outcome satisfies all input requirements
 * @param {Array} outcome - Array of [category, value, rate] for each line
 * @param {Object} probabilityInput - Input requirements
 * @returns {boolean} Whether outcome meets all requirements
 */
export function satisfiesInput(outcome, probabilityInput) {
  for (const field in probabilityInput) {
    if (probabilityInput[field] > 0) {
      if (!OUTCOME_MATCH_FUNCTION_MAP[field](outcome, probabilityInput[field])) {
        return false
      }
    }
  }
  return true
}

/**
 * Calculate adjusted rate for a line based on previous special lines
 * Special lines can be excluded from subsequent lines if max count is reached
 * @param {Array} currentLine - [category, value, rate] for current line
 * @param {Array} previousLines - Array of previous lines
 * @param {Array} currentPool - Available options for current line
 * @returns {number} Adjusted probability rate
 */
export function getAdjustedRate(currentLine, previousLines, currentPool) {
  const currentCategory = currentLine[0]
  const currentRate = currentLine[2]

  // First line never has adjusted rates
  if (previousLines.length === 0) {
    return currentRate
  }

  // Count special lines in previous lines
  let prevSpecialLinesCount = {}
  for (const [cat, val, rate] of previousLines) {
    if (isSpecialLine(cat)) {
      if (!Object.keys(prevSpecialLinesCount).includes(cat)) {
        prevSpecialLinesCount[cat] = 0
      }
      prevSpecialLinesCount[cat] += 1
    }
  }

  // Determine which special categories to remove from current pool
  let toBeRemoved = []
  for (const [spCat, count] of Object.entries(prevSpecialLinesCount)) {
    // Check if this outcome is invalid (exceeds max count)
    if (
      count > MAX_CATEGORY_COUNT[spCat] ||
      (spCat === currentCategory && count + 1 > MAX_CATEGORY_COUNT[spCat])
    ) {
      return 0
    } else if (count === MAX_CATEGORY_COUNT[spCat]) {
      toBeRemoved.push(spCat)
    }
  }

  // Calculate adjusted total by removing excluded categories
  let adjustedTotal = 100
  let adjustedFlag = false
  for (const [cat, val, rate] of currentPool) {
    if (toBeRemoved.includes(cat)) {
      adjustedTotal -= rate
      adjustedFlag = true
    }
  }

  return adjustedFlag ? (currentRate / adjustedTotal) * 100 : currentRate
}

/**
 * Calculate probability for a specific outcome (3 lines)
 * @param {Array} outcome - Array of 3 lines, each [category, value, rate]
 * @param {Object} filteredRates - Object with first_line, second_line, third_line rate arrays
 * @returns {number} Probability percentage (0-100)
 */
export function calculateRate(outcome, filteredRates) {
  const adjustedRates = [
    getAdjustedRate(outcome[0], [], filteredRates.first_line),
    getAdjustedRate(outcome[1], [outcome[0]], filteredRates.second_line),
    getAdjustedRate(outcome[2], [outcome[0], outcome[1]], filteredRates.third_line)
  ]

  let chance = 100
  for (const rate of adjustedRates) {
    chance = chance * (rate / 100)
  }

  return chance
}

/**
 * Convert item type for cube data lookup
 * @param {string} itemType - Item type from UI
 * @returns {string} Item type key for cubeRates data
 */
function convertItemType(itemType) {
  if (itemType === 'accessory') return 'ring'
  if (itemType === 'badge') return 'heart' // KMS doesn't have badge data
  return itemType
}

/**
 * Adjust cube data for items level 160+
 * Stat % values are increased by 1% for high level items
 * @param {Object} cubeData - Raw cube data
 * @param {number} itemLevel - Item level
 * @returns {Object} Adjusted cube data
 */
export function convertCubeDataForLevel(cubeData, itemLevel) {
  if (itemLevel < 160) return cubeData

  const affectedCategories = [
    CATEGORY.STR_PERC,
    CATEGORY.LUK_PERC,
    CATEGORY.DEX_PERC,
    CATEGORY.INT_PERC,
    CATEGORY.ALLSTATS_PERC,
    CATEGORY.ATT_PERC,
    CATEGORY.MATT_PERC,
    CATEGORY.MAXHP_PERC
  ]

  let adjustedCubeData = {}
  for (const line in cubeData) {
    adjustedCubeData[line] = []
    for (const [cat, val, rate] of cubeData[line]) {
      let adjustedVal = val
      for (const affectedCategory of affectedCategories) {
        if (affectedCategory === cat) {
          adjustedVal += 1
          break
        }
      }
      adjustedCubeData[line].push([cat, adjustedVal, rate])
    }
  }
  return adjustedCubeData
}

/**
 * Main probability calculation function
 * Calculates the probability of achieving desired stats
 * @param {number} desiredTier - Desired tier (0-3)
 * @param {Object} probabilityInput - Input requirements object
 * @param {string} itemType - Type of item
 * @param {string} cubeType - Type of cube
 * @param {number} itemLevel - Item level
 * @returns {number} Probability as decimal (0-1)
 */
export function getProbability(desiredTier, probabilityInput, itemType, cubeType, itemLevel) {
  const tier = tierNumberToText[desiredTier]
  const itemLabel = convertItemType(itemType)

  // Get cube data for this configuration
  const rawCubeData = {
    first_line: cubeRates.lvl120to200[itemLabel][cubeType][tier].first_line,
    second_line: cubeRates.lvl120to200[itemLabel][cubeType][tier].second_line,
    third_line: cubeRates.lvl120to200[itemLabel][cubeType][tier].third_line
  }

  // Adjust for item level if needed
  const cubeData = convertCubeDataForLevel(rawCubeData, itemLevel)

  // Consolidate cube data to reduce computation
  const usefulCategories = getUsefulCategories(probabilityInput)
  const consolidatedCubeData = {
    first_line: getConsolidatedRates(cubeData.first_line, usefulCategories),
    second_line: getConsolidatedRates(cubeData.second_line, usefulCategories),
    third_line: getConsolidatedRates(cubeData.third_line, usefulCategories)
  }

  // Iterate through all possible outcomes
  let totalChance = 0
  for (const line1 of consolidatedCubeData.first_line) {
    for (const line2 of consolidatedCubeData.second_line) {
      for (const line3 of consolidatedCubeData.third_line) {
        const outcome = [line1, line2, line3]
        if (satisfiesInput(outcome, probabilityInput)) {
          const result = calculateRate(outcome, consolidatedCubeData)
          totalChance += result
        }
      }
    }
  }

  return totalChance / 100
}
