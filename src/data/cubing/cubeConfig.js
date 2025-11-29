// Cube configuration data from reference project (cubes.js)

// Cube costs in mesos
export function getCubeCost(cubeType) {
  switch (cubeType) {
    case 'red':
      return 12000000
    case 'black':
      return 22000000
    case 'master':
      return 7500000
    default:
      return 0
  }
}

// Reveal potential cost constant based on item level
export function getRevealCostConstant(itemLevel) {
  if (itemLevel < 30) return 0
  if (itemLevel <= 70) return 0.5
  if (itemLevel <= 120) return 2.5
  return 20
}

// Calculate total cubing cost
export function cubingCost(cubeType, itemLevel, totalCubeCount) {
  const cubeCost = getCubeCost(cubeType)
  const revealCostConst = getRevealCostConstant(itemLevel)
  const revealPotentialCost = revealCostConst * itemLevel ** 2
  return cubeCost * totalCubeCount + totalCubeCount * revealPotentialCost
}

// Tier-up rates from reference project
// Community rates used where they differ from Nexon rates
export const tierRates = {
  occult: {
    0: 0.009901
  },
  master: {
    0: 0.1184,
    1: 0.0381
  },
  meister: {
    0: 0.1163,
    1: 0.0879,
    2: 0.0459
  },
  red: {
    0: 0.14,
    1: 0.06,
    2: 0.025
  },
  black: {
    0: 0.17,
    1: 0.11,
    2: 0.05
  }
}

// DMT (Double Miracle Time) rates - NOT USED but keeping structure
export const tierRatesDMT = {
  occult: tierRates.occult,
  master: tierRates.master,
  meister: tierRates.meister,
  red: {
    0: 0.14 * 2,
    1: 0.06 * 2,
    2: 0.025 * 2
  },
  black: {
    0: 0.17 * 2,
    1: 0.11 * 2,
    2: 0.05 * 2
  }
}

// Prime line rates for each cube type
// [first_line, second_line, third_line]
export const primeLineRates = {
  occult: [1, 0.009901, 0.009901],
  master: [1, 0.01858, 0.01858],
  meister: [1, 0.001996, 0.001996],
  red: [1, 0.1, 0.01],
  black: [1, 0.2, 0.05]
}

// Maximum tier each cube can reach
// 0 = rare, 1 = epic, 2 = unique, 3 = legendary
export const maxCubeTier = {
  occult: 1,
  master: 2,
  meister: 3,
  red: 3,
  black: 3
}

// Tier number to text mapping
export const tierNumberToText = {
  3: 'legendary',
  2: 'unique',
  1: 'epic',
  0: 'rare'
}

// Tier text to number mapping
export const tierTextToNumber = {
  legendary: 3,
  unique: 2,
  epic: 1,
  rare: 0
}
