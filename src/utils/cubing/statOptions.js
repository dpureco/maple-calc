// Stat options generator from reference project (updateDesiredStatsOptions.js)
// Dynamically generates dropdown options based on item type, tier, level, etc.

import { STAT_OPTIONS } from '../../data/cubing/statCategories.js'

/**
 * Calculate prime line value based on item level, tier, and stat type
 * @param {number} itemLevel - Item level
 * @param {number} desiredTier - Desired tier (0-3)
 * @param {string} type - Stat type ('normal', 'hp', 'allStat')
 * @returns {number} Prime line value
 */
export function getPrimeLineValue(itemLevel, desiredTier, type = 'normal') {
  const levelBonus = itemLevel >= 160 ? 1 : 0
  const base = type === 'allStat' ? 0 : 3
  return base + 3 * desiredTier + levelBonus
}

/**
 * Generate 3-line attack option amounts
 * Used for ATT%, MATT%, and similar stats
 * @param {number} prime - Prime line value
 * @returns {Array} Array of possible total % values
 */
export function get3LAtkOptionAmounts(prime) {
  const ppp = prime * 3
  const ppn = ppp - 3
  const pnn = ppp - 6
  return [pnn, ppn, ppp].filter(x => x > 0)
}

/**
 * Generate 3-line stat option amounts
 * Includes all stat combinations (prime + non-prime + all stat lines)
 * @param {number} prime - Prime line value
 * @returns {Array} Array of possible total % values
 */
export function get3LStatOptionAmounts(prime) {
  const ppp = prime * 3
  const pna = ppp - 9  // prime + non-prime + all stat
  const paa = ppp - 12 // prime + all stat + all stat
  const aaa = ppp - 15 // all stat + all stat + all stat
  const idkman = ppp - 18
  const nonAllStatOptions = get3LAtkOptionAmounts(prime)
  return [idkman, aaa, paa, pna, ...nonAllStatOptions].filter(x => x > 0)
}

/**
 * Generate 2-line attack option amounts
 * Used for combinations like 2L Attack + Boss
 * @param {number} prime - Prime line value
 * @returns {Array} Array of possible total % values
 */
export function get2LAtkOptionAmounts(prime) {
  const pp = prime * 2
  const pn = pp - 3
  const nn = pp - 6
  return [nn, pn, pp]
}

/**
 * Generate normal stat options (STR, DEX, INT, LUK, HP, All Stat)
 * @param {number} itemLevel - Item level
 * @param {number} desiredTier - Desired tier (0-3)
 * @param {string} statType - Stat type ('normal', 'hp', 'allStat')
 * @returns {Array} Array of option objects
 */
export function generateNormalStatOptions(itemLevel, desiredTier, statType) {
  const primeLineValue = getPrimeLineValue(itemLevel, desiredTier, statType)
  const needSpecialAmounts = statType === 'allStat' && desiredTier === 1

  const optionAmounts = needSpecialAmounts
    ? [1, 3, 4, 5, 6, 9] // Special case for all stat at epic tier
    : get3LStatOptionAmounts(primeLineValue)

  const { statValueName, displayText } = STAT_OPTIONS[statType]

  const options = optionAmounts.map(val => ({
    value: `perc${statValueName}+${val}`,
    label: `${val}%+ ${displayText}`,
    group: 'Stat'
  }))

  return options
}

/**
 * Generate WSE (Weapon/Secondary/Emblem) attack options
 * @param {number} itemLevel - Item level
 * @param {number} desiredTier - Desired tier (0-3)
 * @param {string} itemType - Item type ('weapon', 'secondary', 'emblem')
 * @returns {Array} Array of option objects
 */
export function generateWSEOptions(itemLevel, desiredTier, itemType) {
  const prime = getPrimeLineValue(itemLevel, desiredTier)
  const threeLineOptionAmounts = get3LAtkOptionAmounts(prime)
  const twoLineOptionAmounts = get2LAtkOptionAmounts(prime)
  const attackOptionsAmounts = [...twoLineOptionAmounts, ...threeLineOptionAmounts]

  const options = []

  // Attack % options
  attackOptionsAmounts.forEach(val => {
    options.push({
      value: `percAtt+${val}`,
      label: `${val}%+ Attack`,
      group: 'Attack'
    })
  })

  // Attack + IED options
  twoLineOptionAmounts.forEach(val => {
    options.push({
      value: `lineIed+1&percAtt+${val}`,
      label: `${val}%+ Attack and IED`,
      group: 'Attack With 1 Line of IED'
    })
  })

  // Any useful lines (Attack/Boss/IED)
  const showBoss = itemType !== 'emblem' && desiredTier >= 2
  const shortAnyText = `(Attack${showBoss ? '/Boss' : ''}/IED)`
  const longAnyText = `Attack% ${showBoss ? 'or Boss% ' : ''}or IED`

  for (let i = 1; i <= 3; i++) {
    options.push({
      value: `lineAttOrBossOrIed+${i}`,
      label: `${i} Line ${longAnyText}`,
      group: `Any Useful Lines ${shortAnyText}`
    })
  }

  // Attack + Any useful lines
  options.push({
    value: 'lineAtt+1&lineAttOrBossOrIed+2',
    label: `1 Line attack with 1 Line ${longAnyText}`,
    group: 'Attack + Any Useful Lines'
  })
  options.push({
    value: 'lineAtt+1&lineAttOrBossOrIed+3',
    label: `1 Line attack with 2 Line ${longAnyText}`,
    group: 'Attack + Any Useful Lines'
  })
  options.push({
    value: 'lineAtt+2&lineAttOrBossOrIed+3',
    label: `2 Line attack with 1 Line ${longAnyText}`,
    group: 'Attack + Any Useful Lines'
  })

  return options
}

/**
 * Generate Secondary/Weapon (not Emblem) boss damage options
 * @param {number} itemLevel - Item level
 * @param {number} desiredTier - Desired tier (0-3)
 * @returns {Array} Array of option objects
 */
export function generateBossOptions(itemLevel, desiredTier) {
  if (desiredTier === 1) return [] // No boss damage in epic

  const prime = getPrimeLineValue(itemLevel, desiredTier)
  const [_, pn, pp] = get2LAtkOptionAmounts(prime)

  const options = [
    // Line combinations
    { value: 'lineAtt+1&lineBoss+1', label: '1 Line Attack% + 1 Line Boss%', group: 'Attack and Boss Damage' },
    { value: 'lineAtt+1&lineBoss+2', label: '1 Line Attack% + 2 Line Boss%', group: 'Attack and Boss Damage' },
    { value: 'lineAtt+2&lineBoss+1', label: '2 Line Attack% + 1 Line Boss%', group: 'Attack and Boss Damage' },

    // % combinations
    { value: `percAtt+${pn}&percBoss+30`, label: `${pn}%+ Attack and 30%+ Boss`, group: 'Attack and Boss Damage' }
  ]

  // Legendary-specific boss damage values
  if (desiredTier === 3) {
    options.push(
      { value: `percAtt+${pn}&percBoss+35`, label: `${pn}%+ Attack and 35%+ Boss`, group: 'Attack and Boss Damage' },
      { value: `percAtt+${pn}&percBoss+40`, label: `${pn}%+ Attack and 40%+ Boss`, group: 'Attack and Boss Damage' }
    )
  }

  options.push({ value: `percAtt+${pp}&percBoss+30`, label: `${pp}%+ Attack and 30%+ Boss`, group: 'Attack and Boss Damage' })

  // Attack or Boss options
  for (let i = 1; i <= 3; i++) {
    options.push({
      value: `lineAttOrBoss+${i}`,
      label: `${i} Line Attack% or Boss%`,
      group: 'Attack or Boss Damage'
    })
  }

  return options
}

/**
 * Generate gloves crit damage options (legendary only)
 * @param {number} desiredTier - Desired tier (0-3)
 * @param {string} statType - Stat type for combination options
 * @returns {Array} Array of option objects
 */
export function generateCritDamageOptions(desiredTier, statType) {
  if (desiredTier !== 3) return []

  const { statValueName, displayText } = STAT_OPTIONS[statType]

  const options = []

  // Pure crit damage lines
  for (let i = 1; i <= 3; i++) {
    options.push({
      value: `lineCritDamage+${i}`,
      label: `${i} Line Crit Dmg%`,
      group: 'Crit Damage'
    })
  }

  // Crit damage + stat combinations
  options.push(
    { value: `lineCritDamage+1&line${statValueName}+1`, label: `1 Line Crit Dmg% and 1 line ${displayText}`, group: 'Crit Damage' },
    { value: `lineCritDamage+1&line${statValueName}+2`, label: `1 Line Crit Dmg% and 2 line ${displayText}`, group: 'Crit Damage' },
    { value: `lineCritDamage+2&line${statValueName}+1`, label: `2 Line Crit Dmg% and 1 line ${displayText}`, group: 'Crit Damage' }
  )

  return options
}

/**
 * Generate gloves auto steal options (unique+ for master/meister cubes only)
 * @param {number} desiredTier - Desired tier (0-3)
 * @param {string} statType - Stat type for combination options
 * @param {string} cubeType - Cube type
 * @returns {Array} Array of option objects
 */
export function generateAutoStealOptions(desiredTier, statType, cubeType) {
  const validCubeType = cubeType === 'master' || cubeType === 'meister'
  if (desiredTier < 2 || !validCubeType) return []

  const { statValueName, displayText } = STAT_OPTIONS[statType]

  const options = []

  // Pure auto steal lines
  for (let i = 1; i <= 3; i++) {
    options.push({
      value: `lineAutoSteal+${i}`,
      label: `${i} Line Auto Steal%`,
      group: 'Auto Steal'
    })
  }

  // Auto steal + stat combinations
  options.push(
    { value: `lineAutoSteal+1&line${statValueName}+1`, label: `1 Line Auto Steal% and 1 line ${displayText}`, group: 'Auto Steal' },
    { value: `lineAutoSteal+1&line${statValueName}+2`, label: `1 Line Auto Steal% and 2 line ${displayText}`, group: 'Auto Steal' },
    { value: `lineAutoSteal+2&line${statValueName}+1`, label: `2 Line Auto Steal% and 1 line ${displayText}`, group: 'Auto Steal' }
  )

  return options
}

/**
 * Generate gloves wombo combo options (crit damage + auto steal, legendary meister only)
 * @param {number} desiredTier - Desired tier (0-3)
 * @param {string} cubeType - Cube type
 * @returns {Array} Array of option objects
 */
export function generateWomboComboOptions(desiredTier, cubeType) {
  const validCubeType = cubeType === 'meister'
  if (desiredTier !== 3 || !validCubeType) return []

  const options = []

  for (let i = 1; i <= 2; i++) {
    for (let j = 1; j <= 2; j++) {
      if (i + j > 3) continue
      options.push({
        value: `lineAutoSteal+${i}&lineCritDamage+${j}`,
        label: `${i} Line Auto Steal% and ${j} Line Crit Dmg%`,
        group: 'Wombo Combo'
      })
    }
  }

  return options
}

/**
 * Generate accessory drop/meso options (legendary only)
 * @param {number} desiredTier - Desired tier (0-3)
 * @param {string} statType - Stat type for combination options
 * @returns {Array} Array of option objects
 */
export function generateDropMesoOptions(desiredTier, statType) {
  if (desiredTier !== 3) return []

  const { statValueName, displayText } = STAT_OPTIONS[statType]

  const options = [
    // Pure meso/drop lines
    { value: 'lineMeso+1', label: '1 Line Mesos Obtained%', group: 'Drop/Meso' },
    { value: 'lineDrop+1', label: '1 Line Item Drop%', group: 'Drop/Meso' },
    { value: 'lineMesoOrDrop+1', label: '1 Line of Item Drop% or Mesos Obtained%', group: 'Drop/Meso' },

    { value: 'lineMeso+2', label: '2 Line Mesos Obtained%', group: 'Drop/Meso' },
    { value: 'lineDrop+2', label: '2 Line Item Drop%', group: 'Drop/Meso' },
    { value: 'lineMesoOrDrop+2', label: '2 Lines Involving Item Drop% or Mesos Obtained%', group: 'Drop/Meso' },

    { value: 'lineMeso+3', label: '3 Line Mesos Obtained%', group: 'Drop/Meso' },
    { value: 'lineDrop+3', label: '3 Line Drop%', group: 'Drop/Meso' },

    // Meso/drop + stat combinations
    { value: `lineMeso+1&line${statValueName}+1`, label: `1 Line Mesos Obtained% and 1 line ${displayText}`, group: 'Drop/Meso' },
    { value: `lineDrop+1&line${statValueName}+1`, label: `1 Line Item Drop% and 1 line ${displayText}`, group: 'Drop/Meso' },
    { value: `lineMesoOrDrop+1&line${statValueName}+1`, label: `1 Line of (Item Drop% or Mesos Obtained%) with 1 line ${displayText}`, group: 'Drop/Meso' }
  ]

  return options
}

/**
 * Generate hat cooldown reduction options (legendary only)
 * @param {number} desiredTier - Desired tier (0-3)
 * @param {string} statType - Stat type for combination options
 * @returns {Array} Array of option objects
 */
export function generateCooldownOptions(desiredTier, statType) {
  if (desiredTier !== 3) return []

  const { statValueName, displayText } = STAT_OPTIONS[statType]

  const options = [
    // Pure cooldown options
    { value: 'secCooldown+2', label: '-2sec+ CD Reduction', group: 'Cooldown' },
    { value: 'secCooldown+3', label: '-3sec+ CD Reduction', group: 'Cooldown' },
    { value: 'secCooldown+4', label: '-4sec+ CD Reduction', group: 'Cooldown' },
    { value: 'secCooldown+5', label: '-5sec+ CD Reduction', group: 'Cooldown' },
    { value: 'secCooldown+6', label: '-6sec+ CD Reduction', group: 'Cooldown' },

    // Cooldown + stat combinations
    { value: `secCooldown+2&line${statValueName}+1`, label: `-2sec+ CD Reduction and 1 Line ${displayText}`, group: 'Cooldown' },
    { value: `secCooldown+2&line${statValueName}+2`, label: `-2sec+ CD Reduction and 2 Line ${displayText}`, group: 'Cooldown' },
    { value: `secCooldown+3&line${statValueName}+1`, label: `-3sec+ CD Reduction and 1 Line ${displayText}`, group: 'Cooldown' },
    { value: `secCooldown+4&line${statValueName}+1`, label: `-4sec+ CD Reduction and 1 Line ${displayText}`, group: 'Cooldown' }
  ]

  return options
}

/**
 * Main function to generate all stat options based on current configuration
 * @param {Object} config - Configuration object
 * @returns {Array} Array of all available option objects
 */
export function generateAllStatOptions(config) {
  const { itemType, itemLevel, desiredTier, cubeType, statType } = config

  let options = [
    { value: 'any', label: 'Any', group: null }
  ]

  // WSE items (Weapon, Secondary, Emblem)
  if (['weapon', 'secondary', 'emblem'].includes(itemType)) {
    options = options.concat(generateWSEOptions(itemLevel, desiredTier, itemType))

    // Boss damage for weapon and secondary (not emblem)
    if (itemType !== 'emblem') {
      options = options.concat(generateBossOptions(itemLevel, desiredTier))
    }
  } else {
    // Normal items - add stat options
    options = options.concat(generateNormalStatOptions(itemLevel, desiredTier, statType))
  }

  // Item-specific options
  if (itemType === 'gloves') {
    options = options.concat(generateCritDamageOptions(desiredTier, statType))
    options = options.concat(generateAutoStealOptions(desiredTier, statType, cubeType))
    options = options.concat(generateWomboComboOptions(desiredTier, cubeType))
  }

  if (itemType === 'accessory') {
    options = options.concat(generateDropMesoOptions(desiredTier, statType))
  }

  if (itemType === 'hat') {
    options = options.concat(generateCooldownOptions(desiredTier, statType))
  }

  return options
}
