<script setup>
import { computed } from 'vue'

const props = defineProps({
  results: {
    type: Object,
    required: true
  }
})

// Format mesos with commas
function formatMesos(amount) {
  return Math.round(amount).toLocaleString('en-US')
}

// Format percentage
function formatPercent(decimal) {
  return (decimal * 100).toFixed(4)
}

// Find the best cube (lowest median cost among cubes that can reach tier)
const bestCube = computed(() => {
  const validCubes = props.results.cubeResults.filter(r => r.canReachTier)
  if (validCubes.length === 0) return null

  return validCubes.reduce((best, current) => {
    return current.costs.median < best.costs.median ? current : best
  })
})

// Check if a cube is the best option
function isBestCube(cubeResult) {
  if (!bestCube.value) return false
  return cubeResult.cubeType === bestCube.value.cubeType && cubeResult.canReachTier
}
</script>

<template>
  <div class="results-container">
    <h2 class="results-title">Results</h2>

    <div class="results-grid">
      <div
        v-for="result in results.cubeResults"
        :key="result.cubeType"
        class="result-card"
        :class="{ 'best-cube': isBestCube(result), 'cannot-reach': !result.canReachTier }"
      >
        <!-- Card Header -->
        <div class="card-header">
          <h3 class="cube-name">{{ result.cubeName }}</h3>
          <div v-if="isBestCube(result)" class="best-badge">
            ⭐ Best Option
          </div>
        </div>

        <!-- Cannot Reach Tier Message -->
        <div v-if="!result.canReachTier" class="cannot-reach-message">
          <p>This cube cannot reach the desired tier.</p>
          <p class="max-tier-info">
            Maximum tier: <strong>{{ ['Rare', 'Epic', 'Unique', 'Legendary'][result.maxTier] }}</strong>
          </p>
        </div>

        <!-- Results Content -->
        <div v-else class="card-content">
          <!-- Probability -->
          <div class="stat-group">
            <div class="stat-label">Probability</div>
            <div class="stat-value probability">{{ formatPercent(result.probability) }}%</div>
          </div>

          <!-- Attempts -->
          <div class="stats-section">
            <h4 class="section-subtitle">Expected Attempts</h4>
            <div class="stats-table">
              <div class="stat-row">
                <span class="stat-name">Mean:</span>
                <span class="stat-number">{{ formatMesos(result.attempts.mean) }}</span>
              </div>
              <div class="stat-row highlight">
                <span class="stat-name">Median (50%):</span>
                <span class="stat-number">{{ formatMesos(result.attempts.median) }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">75th Percentile:</span>
                <span class="stat-number">{{ formatMesos(result.attempts.seventy_fifth) }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">85th Percentile:</span>
                <span class="stat-number">{{ formatMesos(result.attempts.eighty_fifth) }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">95th Percentile:</span>
                <span class="stat-number">{{ formatMesos(result.attempts.ninety_fifth) }}</span>
              </div>
            </div>
          </div>

          <!-- Costs -->
          <div class="stats-section">
            <h4 class="section-subtitle">Expected Cost (Mesos)</h4>
            <div class="stats-table">
              <div class="stat-row">
                <span class="stat-name">Mean:</span>
                <span class="stat-number">{{ formatMesos(result.costs.mean) }}</span>
              </div>
              <div class="stat-row highlight">
                <span class="stat-name">Median (50%):</span>
                <span class="stat-number">{{ formatMesos(result.costs.median) }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">75th Percentile:</span>
                <span class="stat-number">{{ formatMesos(result.costs.seventy_fifth) }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">85th Percentile:</span>
                <span class="stat-number">{{ formatMesos(result.costs.eighty_fifth) }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-name">95th Percentile:</span>
                <span class="stat-number">{{ formatMesos(result.costs.ninety_fifth) }}</span>
              </div>
            </div>
          </div>

          <!-- Tier-up breakdown if included -->
          <div v-if="result.tierUpAttempts" class="stats-section breakdown">
            <h4 class="section-subtitle">Breakdown</h4>
            <div class="breakdown-info">
              <div class="breakdown-item">
                <span class="breakdown-label">Tier-up attempts (median):</span>
                <span class="breakdown-value">{{ formatMesos(result.tierUpAttempts.median) }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Stat attempts (median):</span>
                <span class="breakdown-value">{{ formatMesos(result.statAttempts.median) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.results-container {
  margin-top: 2rem;
}

.results-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.result-card {
  background: var(--card-bg);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform 0.2s, box-shadow 0.2s;
}

.result-card.best-cube {
  border-color: var(--success-color);
  box-shadow: 0 0 0 3px rgba(25, 135, 84, 0.1), var(--shadow-md);
}

.result-card.cannot-reach {
  opacity: 0.7;
  border-color: #dc3545;
}

.card-header {
  background: var(--bg-secondary);
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cube-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.best-badge {
  background: var(--success-color);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.cannot-reach-message {
  padding: 2rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
}

.cannot-reach-message p {
  margin-bottom: 0.5rem;
}

.max-tier-info {
  font-size: 0.95rem;
}

.max-tier-info strong {
  color: var(--text-primary);
}

.card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-value.probability {
  color: var(--accent-color);
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.stats-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: var(--bg-secondary);
  transition: background 0.2s;
}

.stat-row.highlight {
  background: var(--success-bg);
  font-weight: 600;
}

.stat-name {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.stat-row.highlight .stat-name,
.stat-row.highlight .stat-number {
  color: var(--text-primary);
}

.stat-number {
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 600;
}

.breakdown {
  border-top: 1px dashed var(--border-color);
  padding-top: 1rem;
}

.breakdown-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.breakdown-label {
  color: var(--text-secondary);
}

.breakdown-value {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--text-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .results-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .best-badge {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .card-content {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-row {
    padding: 0.4rem 0.6rem;
  }
}
</style>
