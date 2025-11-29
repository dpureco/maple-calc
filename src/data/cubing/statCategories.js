// Stat category definitions and mappings from getProbability.js

// All possible input types for the probability calculator
export const emptyInputObject = {
  percStat: 0, // At least this much % stat including % allstat lines
  lineStat: 0, // At least this many lines of % stat including allstat lines
  percAllStat: 0, // At least this much % all stat including 1/3rd of % STR, DEX, and LUK. For Xenons
  lineAllStat: 0, // At least this many lines of % all stat (does not include STR/DEX/INT/LUK)
  percHp: 0, // At least this much % HP. For Demon Avenger
  lineHp: 0, // At least this many lines of % HP. For Demon Avenger
  percAtt: 0, // At least this much % atk
  lineAtt: 0, // At least this many lines of % atk
  percBoss: 0,
  lineBoss: 0,
  lineIed: 0,
  lineCritDamage: 0,
  lineMeso: 0,
  lineDrop: 0,
  lineMesoOrDrop: 0, // At least this many lines of meso OR drop
  secCooldown: 0, // At least this many seconds of cooldown reduction
  lineAutoSteal: 0,
  lineAttOrBoss: 0,
  lineAttOrBossOrIed: 0,
  lineBossOrIed: 0
}

// Category labels used in JSON data and calculations
export const CATEGORY = {
  STR_PERC: 'STR %',
  DEX_PERC: 'DEX %',
  INT_PERC: 'INT %',
  LUK_PERC: 'LUK %',
  MAXHP_PERC: 'Max HP %',
  MAXMP_PERC: 'Max MP %',
  ALLSTATS_PERC: 'All Stats %',
  ATT_PERC: 'ATT %',
  MATT_PERC: 'MATT %',
  BOSSDMG_PERC: 'Boss Damage',
  IED_PERC: 'Ignore Enemy Defense %',
  MESO_PERC: 'Meso Amount %',
  DROP_PERC: 'Item Drop Rate %',
  AUTOSTEAL_PERC: 'Chance to auto steal %',
  CRITDMG_PERC: 'Critical Damage %',
  CDR_TIME: 'Skill Cooldown Reduction',
  JUNK: 'Junk',

  // Only used for special line probability adjustment calculations
  DECENT_SKILL: 'Decent Skill',
  INVINCIBLE_PERC: 'Chance of being invincible for seconds when hit',
  INVINCIBLE_TIME: 'Increase invincibility time after being hit',
  IGNOREDMG_PERC: 'Chance to ignore % damage when hit'
}

// Map inputs to categories that could contribute to a match
// Using STR % to represent all stat % (STR/DEX/INT/LUK) since they have same rates
// Using ATT % to represent both ATT and MATT % for same reason
export const INPUT_CATEGORY_MAP = {
  percStat: [CATEGORY.STR_PERC, CATEGORY.ALLSTATS_PERC],
  lineStat: [CATEGORY.STR_PERC, CATEGORY.ALLSTATS_PERC],
  percAllStat: [CATEGORY.ALLSTATS_PERC, CATEGORY.STR_PERC, CATEGORY.DEX_PERC, CATEGORY.LUK_PERC],
  lineAllStat: [CATEGORY.ALLSTATS_PERC],
  percHp: [CATEGORY.MAXHP_PERC],
  lineHp: [CATEGORY.MAXHP_PERC],
  percAtt: [CATEGORY.ATT_PERC],
  lineAtt: [CATEGORY.ATT_PERC],
  percBoss: [CATEGORY.BOSSDMG_PERC],
  lineBoss: [CATEGORY.BOSSDMG_PERC],
  lineIed: [CATEGORY.IED_PERC],
  lineCritDamage: [CATEGORY.CRITDMG_PERC],
  lineMeso: [CATEGORY.MESO_PERC],
  lineDrop: [CATEGORY.DROP_PERC],
  lineMesoOrDrop: [CATEGORY.DROP_PERC, CATEGORY.MESO_PERC],
  secCooldown: [CATEGORY.CDR_TIME],
  lineAutoSteal: [CATEGORY.AUTOSTEAL_PERC],
  lineAttOrBoss: [CATEGORY.ATT_PERC, CATEGORY.BOSSDMG_PERC],
  lineAttOrBossOrIed: [CATEGORY.ATT_PERC, CATEGORY.BOSSDMG_PERC, CATEGORY.IED_PERC],
  lineBossOrIed: [CATEGORY.BOSSDMG_PERC, CATEGORY.IED_PERC]
}

// Calculation type enum
export const CALC_TYPE = {
  LINE: 0, // Count number of lines
  VAL: 1   // Sum values
}

// Special line restrictions - maximum occurrences per item
export const MAX_CATEGORY_COUNT = {
  [CATEGORY.DECENT_SKILL]: 1,
  [CATEGORY.INVINCIBLE_TIME]: 1,
  [CATEGORY.IED_PERC]: 3,
  [CATEGORY.BOSSDMG_PERC]: 3,
  [CATEGORY.DROP_PERC]: 3,
  [CATEGORY.IGNOREDMG_PERC]: 2,
  [CATEGORY.INVINCIBLE_PERC]: 2
}

// Check if a category is a special line
export function isSpecialLine(category) {
  return Object.keys(MAX_CATEGORY_COUNT).includes(category)
}

// Stat type options
export const STAT_OPTIONS = {
  normal: {
    statValueName: 'Stat',
    displayText: 'Stat'
  },
  hp: {
    statValueName: 'Hp',
    displayText: 'Max HP'
  },
  allStat: {
    statValueName: 'AllStat',
    displayText: 'All Stat'
  }
}
