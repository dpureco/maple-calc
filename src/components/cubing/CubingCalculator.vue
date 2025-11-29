<script setup>
import { ref, computed, watch } from 'vue'
import { generateAllStatOptions } from '../../utils/cubing/statOptions.js'
import { translateInputToObject, getProbability } from '../../utils/cubing/probability.js'
import { geoDistrQuantile } from '../../utils/statistics.js'
import { cubingCost, getTierCosts } from '../../utils/cubing/cubeCosts.js'
import { maxCubeTier } from '../../data/cubing/cubeConfig.js'
import ResultsDisplay from './ResultsDisplay.vue'

// Form state
const itemType = ref('weapon')
const currentTier = ref(3) // 0=rare, 1=epic, 2=unique, 3=legendary
const desiredTier = ref(3)
const itemLevel = ref(150)
const statType = ref('normal')
const desiredStat = ref('any')
const includeTierUp = ref(false)

// UI state
const isCalculating = ref(false)
const results = ref(null)
const statOptions = ref([])

// Item type options
const itemTypes = [
  { value: 'weapon', label: 'Weapon' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'emblem', label: 'Emblem' },
  { value: 'hat', label: 'Hat' },
  { value: 'top', label: 'Top' },
  { value: 'overall', label: 'Overall' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'gloves', label: 'Gloves' },
  { value: 'cape', label: 'Cape' },
  { value: 'belt', label: 'Belt' },
  { value: 'shoulder', label: 'Shoulder' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'badge', label: 'Badge' },
  { value: 'heart', label: 'Heart' }
]

// Tier options
const tierOptions = [
  { value: 0, label: 'Rare' },
  { value: 1, label: 'Epic' },
  { value: 2, label: 'Unique' },
  { value: 3, label: 'Legendary' }
]

// Stat type options
const statTypeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'hp', label: 'Max HP (Demon Avenger)' },
  { value: 'allStat', label: 'All Stat (Xenon)' }
]

// Grouped stat options for display
const groupedStatOptions = computed(() => {
  const groups = {}

  statOptions.value.forEach(option => {
    const groupName = option.group || 'General'
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    groups[groupName].push(option)
  })

  return groups
})

// Form validation
const isFormValid = computed(() => {
  return itemLevel.value >= 71 && desiredStat.value !== null
})

// Update stat options when relevant inputs change
function updateStatOptions() {
  const config = {
    itemType: itemType.value,
    itemLevel: itemLevel.value,
    desiredTier: desiredTier.value,
    cubeType: 'red', // We calculate both, but use red for options generation
    statType: statType.value
  }

  statOptions.value = generateAllStatOptions(config)

  // Reset to 'any' if current selection is no longer valid
  const validValues = statOptions.value.map(o => o.value)
  if (!validValues.includes(desiredStat.value)) {
    desiredStat.value = 'any'
  }
}

// Watch for changes that should trigger stat options update
watch([itemType, itemLevel, desiredTier, statType], () => {
  updateStatOptions()
})

// Watch currentTier to ensure desiredTier is not less than currentTier
watch(currentTier, (newVal) => {
  if (desiredTier.value < newVal) {
    desiredTier.value = newVal
  }
})

// Watch desiredTier to ensure currentTier is not greater than desiredTier
watch(desiredTier, (newVal) => {
  if (currentTier.value > newVal) {
    currentTier.value = newVal
  }
})

// Calculate for both Glowing and Bright cubes
async function calculate() {
  if (!isFormValid.value) return

  isCalculating.value = true
  results.value = null

  // Small delay to show loading state
  await new Promise(resolve => setTimeout(resolve, 50))

  try {
    const cubeTypes = [
      { type: 'red', name: 'Glowing (Red)' },
      { type: 'black', name: 'Bright (Black)' }
    ]

    const cubeResults = cubeTypes.map(({ type, name }) => {
      return calculateForCube(type, name)
    })

    results.value = {
      cubeResults,
      config: {
        itemType: itemType.value,
        itemLevel: itemLevel.value,
        currentTier: currentTier.value,
        desiredTier: desiredTier.value,
        statType: statType.value,
        desiredStat: desiredStat.value,
        includeTierUp: includeTierUp.value
      }
    }
  } finally {
    isCalculating.value = false
  }
}

// Calculate results for a single cube type
function calculateForCube(cubeType, cubeName) {
  // Check if cube can reach desired tier
  const maxTier = maxCubeTier[cubeType]
  const canReachTier = desiredTier.value <= maxTier

  if (!canReachTier) {
    return {
      cubeName,
      cubeType,
      canReachTier: false,
      maxTier
    }
  }

  // Parse desired stat input
  const anyStats = desiredStat.value === 'any'
  const probabilityInput = anyStats ? {} : translateInputToObject(desiredStat.value)

  // Calculate probability of getting desired stats
  const statProbability = anyStats ? 1 : getProbability(
    desiredTier.value,
    probabilityInput,
    itemType.value,
    cubeType,
    itemLevel.value
  )

  // Calculate tier-up statistics if needed
  let tierUpAttempts = null
  let combinedProbability = statProbability

  if (includeTierUp.value && currentTier.value < desiredTier.value) {
    tierUpAttempts = getTierCosts(
      currentTier.value,
      desiredTier.value,
      cubeType,
      false // DMT not used per requirements
    )

    if (!tierUpAttempts) {
      return {
        cubeName,
        cubeType,
        canReachTier: false,
        maxTier
      }
    }
  }

  // Calculate attempt statistics using geometric distribution
  const statAttempts = geoDistrQuantile(statProbability)

  // Combine tier-up and stat attempts if tier-up is enabled
  let totalAttempts
  if (tierUpAttempts) {
    totalAttempts = {
      mean: Math.round(tierUpAttempts.mean + statAttempts.mean),
      median: Math.round(tierUpAttempts.median + statAttempts.median),
      seventy_fifth: Math.round(tierUpAttempts.seventy_fifth + statAttempts.seventy_fifth),
      eighty_fifth: Math.round(tierUpAttempts.eighty_fifth + statAttempts.eighty_fifth),
      ninety_fifth: Math.round(tierUpAttempts.ninety_fifth + statAttempts.ninety_fifth)
    }
  } else {
    totalAttempts = {
      mean: Math.round(statAttempts.mean),
      median: Math.round(statAttempts.median),
      seventy_fifth: Math.round(statAttempts.seventy_fifth),
      eighty_fifth: Math.round(statAttempts.eighty_fifth),
      ninety_fifth: Math.round(statAttempts.ninety_fifth)
    }
  }

  // Calculate costs
  const costs = {
    mean: cubingCost(cubeType, itemLevel.value, totalAttempts.mean),
    median: cubingCost(cubeType, itemLevel.value, totalAttempts.median),
    seventy_fifth: cubingCost(cubeType, itemLevel.value, totalAttempts.seventy_fifth),
    eighty_fifth: cubingCost(cubeType, itemLevel.value, totalAttempts.eighty_fifth),
    ninety_fifth: cubingCost(cubeType, itemLevel.value, totalAttempts.ninety_fifth)
  }

  return {
    cubeName,
    cubeType,
    canReachTier: true,
    probability: statProbability,
    attempts: totalAttempts,
    costs,
    tierUpAttempts,
    statAttempts: {
      mean: Math.round(statAttempts.mean),
      median: Math.round(statAttempts.median),
      seventy_fifth: Math.round(statAttempts.seventy_fifth),
      eighty_fifth: Math.round(statAttempts.eighty_fifth),
      ninety_fifth: Math.round(statAttempts.ninety_fifth)
    }
  }
}

// Initialize stat options on mount
updateStatOptions()
</script>

<template>
  <div class="calculator-container">
    <div class="form-card">
      <h2 class="section-title">Calculator Settings</h2>

      <form @submit.prevent="calculate" class="calculator-form">
        <!-- Item Information Section -->
        <div class="form-section">
          <h3 class="subsection-title">Item Information</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="itemType">Item Category</label>
              <select id="itemType" v-model="itemType" class="form-control">
                <option v-for="item in itemTypes" :key="item.value" :value="item.value">
                  {{ item.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="itemLevel">Item Level</label>
              <input
                id="itemLevel"
                v-model.number="itemLevel"
                type="number"
                min="71"
                max="300"
                class="form-control"
              />
              <small v-if="itemLevel < 71" class="form-text error">
                Item level must be at least 71
              </small>
            </div>
          </div>
        </div>

        <!-- Tier Information Section -->
        <div class="form-section">
          <h3 class="subsection-title">Tier Settings</h3>

          <div class="form-row">
            <div class="form-group toggle-group">
              <label class="toggle-label">
                <div class="toggle-switch">
                  <input
                    id="includeTierUp"
                    v-model="includeTierUp"
                    type="checkbox"
                    class="toggle-input"
                  />
                  <span class="toggle-slider"></span>
                </div>
                <span class="toggle-text">Include tier-up cost in calculations</span>
              </label>
              <small class="form-text">
                Enable this if you're starting below legendary tier
              </small>
            </div>
          </div>

          <div v-if="includeTierUp" class="form-row tier-inputs">
            <div class="form-group">
              <label for="currentTier">Current Tier</label>
              <select id="currentTier" v-model.number="currentTier" class="form-control">
                <option v-for="tier in tierOptions" :key="tier.value" :value="tier.value">
                  {{ tier.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="desiredTier">Desired Tier</label>
              <select id="desiredTier" v-model.number="desiredTier" class="form-control">
                <option
                  v-for="tier in tierOptions"
                  :key="tier.value"
                  :value="tier.value"
                  :disabled="tier.value < currentTier"
                >
                  {{ tier.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Desired Stats Section -->
        <div class="form-section">
          <h3 class="subsection-title">Desired Stats</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="statType">Stat Type</label>
              <select id="statType" v-model="statType" class="form-control">
                <option v-for="type in statTypeOptions" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label for="desiredStat">Desired Stat</label>
              <select id="desiredStat" v-model="desiredStat" class="form-control">
                <optgroup
                  v-for="(options, groupName) in groupedStatOptions"
                  :key="groupName"
                  :label="groupName"
                >
                  <option v-for="option in options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </optgroup>
              </select>
            </div>
          </div>
        </div>

        <!-- Calculate Button -->
        <div class="form-actions">
          <button
            type="submit"
            class="btn-primary"
            :disabled="!isFormValid || isCalculating"
          >
            <span v-if="isCalculating">Calculating...</span>
            <span v-else>Calculate</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Results Display -->
    <ResultsDisplay v-if="results" :results="results" />
  </div>
</template>

<style scoped>
.calculator-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .calculator-container {
    flex-direction: row;
    align-items: flex-start;
  }

  .form-card {
    flex: 0 0 450px;
    position: sticky;
    top: 1rem;
  }

  .calculator-container > :last-child {
    flex: 1;
  }
}

.form-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-md);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.calculator-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.form-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.subsection-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-control {
  padding: 0.625rem 0.75rem;
  font-size: 0.95rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg);
  color: var(--text-primary);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.form-control:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-group {
  gap: 0.75rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.toggle-text {
  font-weight: 500;
  user-select: none;
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
  position: absolute;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-slider {
  background-color: var(--accent-color);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.toggle-input:focus + .toggle-slider {
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
}

.tier-inputs {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--border-color);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-text {
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

.form-text.error {
  color: #dc3545;
}

.form-actions {
  padding-top: 0.5rem;
}

.btn-primary {
  width: 100%;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: var(--accent-color);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .form-card {
    padding: 1.5rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .form-card {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.125rem;
  }
}
</style>
