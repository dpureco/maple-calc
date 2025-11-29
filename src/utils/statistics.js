// Statistical helper functions from reference project (statistics.js)

/**
 * Calculate quantiles for a geometric distribution
 * Used to determine how many cube attempts are needed at various confidence levels
 * @param {number} p - Probability of success (0 to 1)
 * @returns {Object} Object containing mean and various percentiles
 */
export function geoDistrQuantile(p) {
  const mean = 1 / p

  const median = Math.log(1 - 0.5) / Math.log(1 - p)
  const seventyFifth = Math.log(1 - 0.75) / Math.log(1 - p)
  const eightyFifth = Math.log(1 - 0.85) / Math.log(1 - p)
  const ninetyFifth = Math.log(1 - 0.95) / Math.log(1 - p)

  return {
    mean,
    median,
    seventy_fifth: seventyFifth,
    eighty_fifth: eightyFifth,
    ninety_fifth: ninetyFifth
  }
}

/**
 * Calculate a specific percentile from an array of values
 * @param {Array} arr - Sorted array of numbers
 * @param {number} p - Percentile (0 to 1)
 * @returns {number} The value at the specified percentile
 */
export function percentile(arr, p) {
  if (arr.length === 0) return 0
  if (typeof p !== 'number') throw new TypeError('p must be a number')
  if (p <= 0) return arr[0]
  if (p >= 1) return arr[arr.length - 1]

  const index = (arr.length - 1) * p
  const lower = Math.floor(index)
  const upper = lower + 1
  const weight = index % 1

  if (upper >= arr.length) return arr[lower]
  return arr[lower] * (1 - weight) + arr[upper] * weight
}

/**
 * Returns the percentile rank of a given value in a sorted array
 * @param {Array} arr - Sorted array of numbers
 * @param {number} v - Value to find the rank of
 * @returns {number} Percentile rank (0 to 1)
 */
export function percentRank(arr, v) {
  if (typeof v !== 'number') throw new TypeError('v must be a number')
  for (let i = 0, l = arr.length; i < l; i++) {
    if (v <= arr[i]) {
      while (i < l && v === arr[i]) i++
      if (i === 0) return 0
      if (v !== arr[i - 1]) {
        i += (v - arr[i - 1]) / (arr[i] - arr[i - 1])
      }
      return i / l
    }
  }
  return 1
}

/**
 * Calculate standard deviation of an array of values
 * @param {Array} values - Array of numbers
 * @returns {number} Standard deviation
 */
export function standardDeviation(values) {
  const avg = average(values)

  const squareDiffs = values.map(function (value) {
    const diff = value - avg
    const sqrDiff = diff * diff
    return sqrDiff
  })

  const avgSquareDiff = average(squareDiffs)
  const stdDev = Math.sqrt(avgSquareDiff)
  return stdDev
}

/**
 * Calculate average (mean) of an array of values
 * @param {Array} data - Array of numbers
 * @returns {number} Average value
 */
export function average(data) {
  const sum = data.reduce(function (sum, value) {
    return sum + value
  }, 0)

  const avg = sum / data.length
  return avg
}

/**
 * Calculate median of an array of values
 * @param {Array} values - Array of numbers (will be sorted)
 * @returns {number} Median value
 */
export function median(values) {
  values.sort(function (a, b) {
    return a - b
  })

  const half = Math.floor(values.length / 2)

  if (values.length % 2) {
    return values[half]
  } else {
    return (values[half - 1] + values[half]) / 2.0
  }
}
