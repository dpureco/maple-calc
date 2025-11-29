// Statistics functions for starforce calculator

/**
 * Calculate percentile value in a sorted numeric array
 * Uses linear interpolation between closest ranks
 * @param {Array} arr - Sorted array of numbers
 * @param {number} p - Percentile (0-1)
 * @returns {number} Percentile value
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
 * Calculate all percentile statistics for results
 * @param {Array} meso_list - List of meso costs (sorted)
 * @param {Array} boom_list - List of boom counts (sorted)
 * @returns {Object} Percentile statistics
 */
export function calculatePercentiles(meso_list, boom_list) {
  // Sort arrays
  const sorted_mesos = [...meso_list].sort((a, b) => a - b)
  const sorted_booms = [...boom_list].sort((a, b) => a - b)

  return {
    // Meso percentiles
    meso_75th: percentile(sorted_mesos, 0.75),
    meso_85th: percentile(sorted_mesos, 0.85),
    meso_95th: percentile(sorted_mesos, 0.95),

    // Boom percentiles
    boom_75th: percentile(sorted_booms, 0.75),
    boom_85th: percentile(sorted_booms, 0.85),
    boom_95th: percentile(sorted_booms, 0.95),
  }
}

/**
 * Format meso amount for display
 * @param {number} mesos - Meso amount
 * @returns {string} Formatted string
 */
export function formatMesos(mesos) {
  if (mesos >= 1000000000) {
    return (mesos / 1000000000).toFixed(2) + 'B'
  } else if (mesos >= 1000000) {
    return (mesos / 1000000).toFixed(2) + 'M'
  } else if (mesos >= 1000) {
    return (mesos / 1000).toFixed(2) + 'K'
  }
  return mesos.toFixed(0)
}

/**
 * Get color for boom chart column based on percentile
 * @param {number} boomsAmount - Number of booms
 * @param {Object} boomPercentiles - Boom percentile values
 * @returns {Object} Background and border colors
 */
export function grabColumnColors(boomsAmount, boomPercentiles) {
  const backgroundColors = [
    'rgba(75, 192, 192, 0.2)',  // green
    'rgba(54, 162, 235, 0.2)',  // blue
    'rgba(255, 205, 86, 0.2)',  // yellow
    'rgba(255, 159, 64, 0.2)',  // orange
    'rgba(255, 99, 132, 0.2)',  // red
    'rgba(192, 192, 192, 0.2)', // gray
  ]
  const borderColors = [
    'rgb(75, 192, 192)',
    'rgb(54, 162, 235)',
    'rgb(255, 205, 86)',
    'rgb(255, 159, 64)',
    'rgb(255, 99, 132)',
    'rgb(192, 192, 192)',
  ]

  switch (true) {
    case boomsAmount === 0:
      return {
        background: backgroundColors[0],
        border: borderColors[0]
      }
    case boomsAmount <= boomPercentiles.median_booms:
      return {
        background: backgroundColors[1],
        border: borderColors[1]
      }
    case boomsAmount <= boomPercentiles.boom_75th:
      return {
        background: backgroundColors[2],
        border: borderColors[2]
      }
    case boomsAmount <= boomPercentiles.boom_85th:
      return {
        background: backgroundColors[3],
        border: borderColors[3]
      }
    case boomsAmount <= boomPercentiles.boom_95th:
      return {
        background: backgroundColors[4],
        border: borderColors[4]
      }
    default:
      return {
        background: backgroundColors[5],
        border: borderColors[5]
      }
  }
}
