# MapleCalc Development Progress

## Session Log

### Initial Setup - [Current Session]

**Completed:**
- ✅ Analyzed reference project thoroughly
- ✅ Identified cube types: Glowing (red) = 12M mesos, Bright (black) = 22M mesos
- ✅ Created Vue 3 + Vite project structure
- ✅ Installed dependencies
- ✅ Created IMPLEMENTATION_PLAN.md

**In Progress:**
- 🔄 Setting up data layer

**Next Steps:**
1. Copy cubeRates.js from reference to new project
2. Create cube configuration files
3. Implement utility functions
4. Build UI components

---

## Detailed Task Tracking

### Phase 1: Data Layer

#### Task: Port cubeRates.js
- Status: NOT STARTED
- Files: `src/data/cubeRates.js`
- Notes: Large JSON data file with all cube probabilities

#### Task: Create cube configuration
- Status: NOT STARTED
- Files: `src/data/cubeConfig.js`
- Includes:
  - Cube costs (red: 12M, black: 22M)
  - Tier-up rates
  - Prime line rates
  - Max tier per cube

#### Task: Define stat categories
- Status: NOT STARTED
- Files: `src/data/statCategories.js`
- Includes all CATEGORY constants and mappings

---

### Phase 2: Utility Functions

#### Task: Statistics functions
- Status: NOT STARTED
- Files: `src/utils/statistics.js`
- Key function: `geoDistrQuantile(p)`

#### Task: Probability calculations
- Status: NOT STARTED
- Files: `src/utils/probability.js`
- Most complex part - handles all probability logic

#### Task: Cube cost functions
- Status: NOT STARTED
- Files: `src/utils/cubeCosts.js`

#### Task: Stat options generator
- Status: NOT STARTED
- Files: `src/utils/statOptions.js`
- Dynamically generates dropdown options

---

### Phase 3: UI Components

#### Task: App shell with theme toggle
- Status: NOT STARTED
- Files: `src/App.vue`

#### Task: Calculator form
- Status: NOT STARTED
- Files: `src/components/CalculatorForm.vue`

#### Task: Results display
- Status: NOT STARTED
- Files: `src/components/ResultsDisplay.vue`

---

## Blockers & Questions
None currently

## Testing Notes
Will test against reference project once calculations are implemented

## Performance Considerations
- Cube rate data is large (~40K lines) - may need optimization
- Probability calculations iterate through all possible outcomes - performance critical
- Consider memoization for repeated calculations
