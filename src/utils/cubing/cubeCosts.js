// Cube cost calculation functions from reference project (cubes.js)

import { getCubeCost, getRevealCostConstant, tierRates } from '../../data/cubing/cubeConfig.js'
import { geoDistrQuantile } from '../statistics.js'

/**
 * Calculate total cost of cubing including cube cost and reveal potential cost
 * @param {string} cubeType - Type of cube ('red', 'black', 'master', etc.)
 * @param {number} itemLevel - Level of the item being cubed
 * @param {number} totalCubeCount - Number of cubes used
 * @returns {number} Total cost in mesos
 */
export function cubingCost(cubeType, itemLevel, totalCubeCount) {
  const cubeCost = getCubeCost(cubeType)
  const revealCostConst = getRevealCostConstant(itemLevel)
  const revealPotentialCost = revealCostConst * itemLevel ** 2
  return cubeCost * totalCubeCount + totalCubeCount * revealPotentialCost
}

/**
 * Calculate expected tier-up costs from current tier to desired tier
 * @param {number} currentTier - Current tier (0=rare, 1=epic, 2=unique, 3=legendary)
 * @param {number} desiredTier - Desired tier (same scale)
 * @param {string} cubeType - Type of cube being used
 * @param {boolean} DMT - Whether Double Miracle Time is active (NOT USED but keeping parameter)
 * @returns {Object} Object with mean, median, and percentile attempt counts for tiering up
 */
export function getTierCosts(currentTier, desiredTier, cubeType, DMT = false) {
  // Note: DMT parameter kept for compatibility but not used per requirements
  const tierUpRates = tierRates

  let mean = 0
  let median = 0
  let seventyFifth = 0
  let eightyFifth = 0
  let ninetyFifth = 0

  // Sum up the attempts needed for each tier transition
  for (let i = currentTier; i < desiredTier; i++) {
    const p = tierUpRates[cubeType][i]
    if (!p) {
      // Cube cannot reach this tier
      return null
    }
    const stats = geoDistrQuantile(p)
    mean += Math.round(stats.mean)
    median += Math.round(stats.median)
    seventyFifth += Math.round(stats.seventy_fifth)
    eightyFifth += Math.round(stats.eighty_fifth)
    ninetyFifth += Math.round(stats.ninety_fifth)
  }

  return {
    mean,
    median,
    seventy_fifth: seventyFifth,
    eighty_fifth: eightyFifth,
    ninety_fifth: ninetyFifth
  }
}
