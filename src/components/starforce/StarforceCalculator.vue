<script setup>
import { ref, computed } from 'vue'
import { getRates } from '../../data/starforce/serverRates.js'
import { repeatExperiment } from '../../utils/starforce/starforceSimulation.js'
import { calculatePercentiles, formatMesos } from '../../utils/starforce/starforceStats.js'
import BoomChart from './BoomChart.vue'

// Form state
const itemLevel = ref(150)
const itemType = ref('normal')
const starCatch = ref(true)
const safeguard = ref(true)
const currentStars = ref(18)
const targetStars = ref(22)
const mvpDiscount = ref('none')
const server = ref('gms') // Fixed to GMS (30 Stars)
const event30Discount = ref(true)
const event30BoomReduction = ref(true)
const numTrials = ref(1000)

// UI state
const isCalculating = ref(false)
const results = ref(null)

// Options
const itemTypes = [
  { value: 'normal', label: 'Normal Equipment' },
  // { value: 'tyrant', label: 'Tyrant Equipment' } // Commented out as in reference
]

const servers = [
  { value: 'gms', label: 'GMS (30 Stars)' },
  { value: 'kms', label: 'KMS (30 Stars)' },
  { value: 'gmsPre30', label: 'GMS Pre-Savior' },
  { value: 'old', label: 'GMS Before 30 Stars' },
  { value: 'tms', label: 'TMS Regular' },
  { value: 'tmsr', label: 'TMS Reboot' }
]

const mvpOptions = [
  { value: 'none', label: 'None' },
  { value: 'silver', label: 'Silver (3%)' },
  { value: 'gold', label: 'Gold (5%)' },
  { value: 'diamond', label: 'Diamond (10%)' }
]

// Computed max stars
const maxStars = computed(() => {
  if (server.value === 'gms' || server.value === 'kms') {
    return 30
  } else if (itemType.value === 'tyrant') {
    return 15
  } else {
    return 25
  }
})

// Validation
const canCalculate = computed(() => {
  return itemLevel.value >= 0 &&
         currentStars.value >= 0 &&
         targetStars.value > currentStars.value &&
         targetStars.value <= maxStars.value &&
         numTrials.value >= 1
})

async function calculate() {
  if (!canCalculate.value) return

  isCalculating.value = true
  results.value = null

  // Small delay to show loading state
  await new Promise(resolve => setTimeout(resolve, 50))

  try {
    const rates = getRates(server.value, itemType.value, false)

    // MVP discount flags
    const silver = mvpDiscount.value === 'silver' || mvpDiscount.value === 'gold' || mvpDiscount.value === 'diamond'
    const gold = mvpDiscount.value === 'gold' || mvpDiscount.value === 'diamond'
    const diamond = mvpDiscount.value === 'diamond'

    // Run simulation
    const simulationResults = repeatExperiment(
      numTrials.value,
      currentStars.value,
      targetStars.value,
      rates,
      itemLevel.value,
      safeguard.value,
      event30Discount.value,
      starCatch.value,
      false, // five_ten_fifteen (removed)
      false, // sauna (deprecated)
      silver,
      gold,
      diamond,
      itemType.value,
      false, // two_plus (disabled)
      false, // useAEE
      server.value,
      event30BoomReduction.value
    )

    // Calculate percentiles
    const percentiles = calculatePercentiles(
      simulationResults.meso_result_list,
      simulationResults.boom_result_list
    )

    results.value = {
      ...simulationResults,
      ...percentiles
    }
  } catch (error) {
    console.error('Calculation error:', error)
    alert('An error occurred during calculation. Please check your inputs and try again.')
  } finally {
    isCalculating.value = false
  }
}
</script>

<template>
  <div class="starforce-calculator">
    <div class="calculator-card">
      <h2 class="section-title">Starforce Settings</h2>

      <form @submit.prevent="calculate" class="starforce-form">
        <!-- Item Settings -->
        <div class="form-section">
          <h3 class="subsection-title">Item Settings</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="itemLevel">Item Level</label>
              <input
                id="itemLevel"
                v-model.number="itemLevel"
                type="number"
                min="0"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="itemType">Item Type</label>
              <select id="itemType" v-model="itemType" class="form-select">
                <option v-for="type in itemTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Star Settings -->
        <div class="form-section">
          <h3 class="subsection-title">Star Settings</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="currentStars">Current Stars</label>
              <input
                id="currentStars"
                v-model.number="currentStars"
                type="number"
                min="0"
                :max="maxStars"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="targetStars">Target Stars</label>
              <input
                id="targetStars"
                v-model.number="targetStars"
                type="number"
                :min="currentStars + 1"
                :max="maxStars"
                class="form-input"
              />
            </div>
          </div>
          <p class="form-help">Max stars: {{ maxStars }}</p>
        </div>

        <!-- Discounts -->
        <div class="form-section">
          <h3 class="subsection-title">MVP Discount</h3>
          <div class="form-group">
            <label for="mvpDiscount">MVP Discount</label>
            <select id="mvpDiscount" v-model="mvpDiscount" class="form-select">
              <option v-for="mvp in mvpOptions" :key="mvp.value" :value="mvp.value">
                {{ mvp.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Options -->
        <div class="form-section">
          <h3 class="subsection-title">Options</h3>
          <div class="toggle-grid">
            <label class="toggle-label">
              <div class="toggle-switch">
                <input v-model="starCatch" type="checkbox" class="toggle-input" />
                <span class="toggle-slider"></span>
              </div>
              <span class="toggle-text">Star Catch (+5%)</span>
            </label>
            <label class="toggle-label">
              <div class="toggle-switch">
                <input v-model="safeguard" type="checkbox" class="toggle-input" />
                <span class="toggle-slider"></span>
              </div>
              <span class="toggle-text">Use Safeguard</span>
            </label>
            <label class="toggle-label">
              <div class="toggle-switch">
                <input v-model="event30Discount" type="checkbox" class="toggle-input" />
                <span class="toggle-slider"></span>
              </div>
              <span class="toggle-text">30% Meso Discount</span>
            </label>
            <label class="toggle-label">
              <div class="toggle-switch">
                <input v-model="event30BoomReduction" type="checkbox" class="toggle-input" />
                <span class="toggle-slider"></span>
              </div>
              <span class="toggle-text">30% Boom Reduction</span>
            </label>
          </div>
        </div>

        <!-- Trials -->
        <div class="form-section">
          <h3 class="subsection-title">Simulation</h3>
          <div class="form-group">
            <label for="numTrials">Number of Trials</label>
            <input
              id="numTrials"
              v-model.number="numTrials"
              type="number"
              min="1"
              max="100000"
              class="form-input"
            />
            <p class="form-help">Recommended: 1000-10000 trials</p>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="calculate-button"
          :disabled="!canCalculate || isCalculating"
        >
          {{ isCalculating ? 'Calculating...' : 'Calculate' }}
        </button>
      </form>
    </div>

    <!-- Results -->
    <div v-if="results" class="results-section">
      <div class="results-grid">
        <!-- Meso Results -->
        <div class="result-card">
          <h3 class="result-title">Meso Cost Statistics</h3>
          <div class="stat-row">
            <span class="stat-label">Average:</span>
            <span class="stat-value">{{ formatMesos(results.average_cost) }}</span>
          </div>
          <div class="stat-row highlight">
            <span class="stat-label">Median:</span>
            <span class="stat-value">{{ formatMesos(results.median_cost) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Min:</span>
            <span class="stat-value">{{ formatMesos(results.min_cost) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Max:</span>
            <span class="stat-value">{{ formatMesos(results.max_cost) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">75th Percentile:</span>
            <span class="stat-value">{{ formatMesos(results.meso_75th) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">85th Percentile:</span>
            <span class="stat-value">{{ formatMesos(results.meso_85th) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">95th Percentile:</span>
            <span class="stat-value">{{ formatMesos(results.meso_95th) }}</span>
          </div>
        </div>

        <!-- Boom Results -->
        <div class="result-card">
          <h3 class="result-title">Boom Statistics</h3>
          <div class="stat-row">
            <span class="stat-label">Average:</span>
            <span class="stat-value">{{ results.average_booms.toFixed(2) }}</span>
          </div>
          <div class="stat-row highlight">
            <span class="stat-label">Median:</span>
            <span class="stat-value">{{ results.median_booms.toFixed(2) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Min:</span>
            <span class="stat-value">{{ results.min_booms }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Max:</span>
            <span class="stat-value">{{ results.max_booms }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">75th Percentile:</span>
            <span class="stat-value">{{ results.boom_75th.toFixed(2) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">85th Percentile:</span>
            <span class="stat-value">{{ results.boom_85th.toFixed(2) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">95th Percentile:</span>
            <span class="stat-value">{{ results.boom_95th.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Boom Chart -->
      <div class="chart-section">
        <BoomChart :boom-data="results.boom_result_list" :boom-percentiles="results" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.starforce-calculator {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .starforce-calculator {
    flex-direction: row;
    align-items: flex-start;
  }

  .calculator-card {
    flex: 0 0 450px;
    position: sticky;
    top: 1rem;
  }

  .results-section {
    flex: 1;
    margin-top: 0;
  }
}

.calculator-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.subsection-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-color);
}

.form-section {
  margin-bottom: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (min-width: 1024px) {
  .form-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent-color);
}

.form-help {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-top: 0.25rem;
}

.toggle-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .toggle-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 26px;
  flex-shrink: 0;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-input:checked + .toggle-slider {
  background-color: var(--accent-color);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-text {
  user-select: none;
}

.calculate-button {
  width: 100%;
  padding: 1rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.calculate-button:hover:not(:disabled) {
  background: var(--accent-hover);
}

.calculate-button:active:not(:disabled) {
  transform: scale(0.98);
}

.calculate-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.results-section {
  margin-top: 2rem;
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .results-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

.result-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.result-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row.highlight {
  background: var(--bg-tertiary);
  margin: 0 -1rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
}

.stat-label {
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 600;
}

.chart-section {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

@media (max-width: 768px) {
  .calculator-card {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .toggle-grid {
    grid-template-columns: 1fr;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }
}
</style>
