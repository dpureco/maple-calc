# Next Steps for MapleCalc

## Current Progress ✅

### Completed:
1. ✅ All data files created (cubeRates.js, cubeConfig.js, statCategories.js)
2. ✅ All utility functions implemented:
   - statistics.js (geometric distribution)
   - probability.js (complete probability calculations)
   - cubeCosts.js (cost calculations)
   - statOptions.js (dynamic stat option generation)
3. ✅ App.vue created with theme toggle and responsive design

## Remaining Tasks

### 1. Create Main Calculator Component (`src/components/CubingCalculator.vue`)

This is the main component that orchestrates everything. It needs to:
- Import all utility functions
- Manage form state (reactive refs for all inputs)
- Handle form changes and update stat options dynamically
- Run calculations for both Glowing and Bright cubes
- Display results side-by-side

**Key State Variables:**
```javascript
const itemType = ref('weapon')
const currentTier = ref(3) // Default to legendary
const desiredTier = ref(3)
const itemLevel = ref(150)
const statType = ref('normal')
const desiredStat = ref('any')
const includeTierUp = ref(false) // Default OFF per requirements
const statOptions = ref([])
const results = ref(null)
```

**Key Functions:**
- `updateStatOptions()` - Regenerate dropdown when inputs change
- `calculate()` - Run calculations for both cube types
- Watch handlers for form inputs

### 2. Create Results Display Component (`src/components/ResultsDisplay.vue`)

Displays the side-by-side comparison of Glowing vs Bright cubes.

**Props:**
```javascript
const props = defineProps({
  results: Object // Contains glowing and bright results
})
```

**Features:**
- Two cards side-by-side (responsive - stack on mobile)
- Highlight the better option (lowest median cost)
- Show all statistics (mean, median, percentiles)
- Show costs in formatted mesos
- Handle "cannot reach tier" cases

### 3. Test the Application

**Test Cases:**
1. Test all item types
2. Test tier-up toggle
3. Test item level 160+ (should add +1% to stats)
4. Test special stat options (hat cooldown, gloves crit damage, accessories meso/drop)
5. Test complex combinations (ATT + Boss, 2L ATT + IED, etc.)
6. Test theme toggle persistence
7. Test responsive design
8. Compare results with reference project

### 4. Final Polish

- Add loading states during calculations
- Add form validation
- Add helpful tooltips
- Optimize performance (memoization if needed)
- Clean up console logging
- Test browser compatibility

## File Structure Status

```
✅ src/data/
   ✅ cubeRates.js
   ✅ cubeConfig.js
   ✅ statCategories.js

✅ src/utils/
   ✅ statistics.js
   ✅ probability.js
   ✅ cubeCosts.js
   ✅ statOptions.js

✅ src/App.vue

⏳ src/components/
   ⏳ CubingCalculator.vue (NEXT - Main component)
   ⏳ ResultsDisplay.vue (After CubingCalculator)

✅ IMPLEMENTATION_PLAN.md
✅ PROGRESS.md
✅ THIS FILE (NEXT_STEPS.md)
```

## Implementation Notes

### CubingCalculator.vue Structure:
1. **Template Section**: Form with all inputs + Results display
2. **Script Section**: All reactive state and logic
3. **Style Section**: Form-specific styling

### Key Logic Flow:
1. User changes any input → `updateStatOptions()` fires
2. `updateStatOptions()` → calls `generateAllStatOptions()` from statOptions.js
3. User clicks Calculate → `calculate()` fires
4. `calculate()` → runs for both 'red' and 'black' cubes
5. For each cube:
   - Parse `desiredStat` using `translateInputToObject()`
   - Call `getProbability()` with parsed input
   - Call `geoDistrQuantile()` to get attempt statistics
   - If tier-up enabled: call `getTierCosts()` and combine
   - Calculate costs using `cubingCost()`
6. Store results → triggers ResultsDisplay update

### Responsive Grid for Results:
```css
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

This ensures side-by-side on desktop, stacked on mobile.

## Time Estimate

- CubingCalculator.vue: ~1-2 hours (complex integration)
- ResultsDisplay.vue: ~30 minutes
- Testing & debugging: ~1 hour
- Polish & optimization: ~30 minutes

**Total: ~3-4 hours of focused work**

## Ready to Continue?

The next step is to create `CubingCalculator.vue`. This is the most complex component as it integrates everything together.

Would you like me to:
A) Create the complete CubingCalculator.vue component now
B) Create it in smaller chunks (template, then script, then style)
C) Something else
