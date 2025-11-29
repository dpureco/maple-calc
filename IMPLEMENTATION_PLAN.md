# MapleCalc Implementation Plan

## Project Overview
Building a modern Vue 3 + Vite cubing calculator that matches all functionality from the reference project, comparing Glowing (Red) and Bright (Black) cubes side-by-side.

## Core Features
- ✅ Vue 3 + Vite project created
- ✅ Dependencies installed
- [ ] Light/Dark mode toggle
- [ ] Responsive design (desktop & mobile)
- [ ] Side-by-side cube comparison
- [ ] Tier-up toggle (optional, defaults off)
- [ ] All stat options from reference project

---

## Phase 1: Data Layer ✅ STARTED

### 1.1 Cube Data
- [ ] Port cubeRates.js (complete cube rate data)
- [ ] Create cube configuration (costs, tier-up rates, prime line rates)
- [ ] Define max tier per cube type
- [ ] DMT rates (excluded per requirements, but keep structure for potential future use)

### 1.2 Stat Categories
- [ ] Define all stat categories (CATEGORY constants from getProbability.js)
- [ ] Create input-to-category mappings
- [ ] Define special line restrictions (max IED, Boss, etc.)

### 1.3 Item Type Configuration
- [ ] Define all 15 item types (hat, weapon, secondary, etc.)
- [ ] Map item types to available stats per tier

---

## Phase 2: Utility Functions

### 2.1 Statistics Functions (from statistics.js)
- [ ] `geoDistrQuantile(p)` - Calculate percentiles using geometric distribution
- [ ] Helper functions for percentile calculations

### 2.2 Probability Calculations (from getProbability.js)
- [ ] `translateInputToObject(webInput)` - Parse stat input strings
- [ ] `getUsefulCategories(probabilityInput)` - Filter relevant categories
- [ ] `getConsolidatedRates(ratesList, usefulCategories)` - Consolidate rates
- [ ] `satisfiesInput(outcome, probabilityInput)` - Check if outcome matches criteria
- [ ] `getAdjustedRate(currentLine, previousLines, currentPool)` - Adjust for special lines
- [ ] `calculateRate(outcome, filteredRates)` - Calculate outcome probability
- [ ] `convertCubeDataForLevel(cubeData, itemLevel)` - Adjust for lvl 160+ items
- [ ] `getProbability(desiredTier, probabilityInput, itemType, cubeType, itemLevel)` - Main probability calculator

### 2.3 Cube Functions (from cubes.js)
- [ ] `getCubeCost(cubeType)` - Get cube meso cost
- [ ] `getRevealCostConstant(itemLevel)` - Get reveal potential cost multiplier
- [ ] `cubingCost(cubeType, itemLevel, totalCubeCount)` - Calculate total cost
- [ ] `getTierCosts(currentTier, desiredTier, cubeType, DMT)` - Calculate tier-up costs

### 2.4 Stat Options Generator (from updateDesiredStatsOptions.js)
- [ ] `getPrimeLineValue(itemLevel, desiredTier, type)` - Calculate prime line value
- [ ] `get3LAtkOptionAmounts(prime)` - Generate 3-line attack options
- [ ] `get3LStatOptionAmounts(prime)` - Generate 3-line stat options (with all stat)
- [ ] `get2LAtkOptionAmounts(prime)` - Generate 2-line options
- [ ] Stat option builders for each item category:
  - [ ] Normal stat options (STR, DEX, INT, LUK, HP, All Stat)
  - [ ] WSE (Weapon/Secondary/Emblem) attack options
  - [ ] Boss damage options
  - [ ] IED options
  - [ ] Combined options (Att + Boss, Att + IED, etc.)
  - [ ] Accessory options (Meso, Drop)
  - [ ] Hat options (Cooldown Reduction)
  - [ ] Gloves options (Crit Damage)

---

## Phase 3: UI Components

### 3.1 Main App Shell
- [ ] App.vue - Main layout with theme toggle
- [ ] Global CSS variables for light/dark mode
- [ ] Responsive container

### 3.2 Input Form Component
- [ ] Item Category dropdown (15 item types)
- [ ] Current Tier dropdown (Rare/Epic/Unique/Legendary)
- [ ] Desired Tier dropdown (same options)
- [ ] Item Level input (number, default 150, min 71)
- [ ] Stat Type selector (Normal, HP for DA, All Stat for Xenon)
- [ ] Desired Stat dropdown (dynamically populated based on above selections)
- [ ] Tier-up toggle checkbox (default: OFF)
- [ ] Form validation
- [ ] Calculate button

### 3.3 Results Display Component
- [ ] Side-by-side cards for Glowing and Bright cubes
- [ ] Highlight best option (lowest median cost)
- [ ] Display for each cube:
  - [ ] Cube name
  - [ ] Probability percentage
  - [ ] Mean attempts
  - [ ] Median attempts
  - [ ] 75th percentile attempts
  - [ ] 85th percentile attempts
  - [ ] 95th percentile attempts
  - [ ] Costs for each percentile
- [ ] Handle "cannot reach tier" message
- [ ] Responsive grid layout

---

## Phase 4: Integration & Logic

### 4.1 Calculator Logic
- [ ] Wire up form inputs to reactive state
- [ ] Dynamic stat option generation based on:
  - Item type
  - Cube type (for special restrictions)
  - Current tier
  - Desired tier
  - Item level
  - Stat type
- [ ] Run calculations for both Glowing and Bright cubes
- [ ] Combine tier-up probability with stat probability (if tier-up enabled)
- [ ] Format results for display

### 4.2 State Management
- [ ] Form state (reactive refs)
- [ ] Computed properties for derived state
- [ ] Results state
- [ ] Loading state
- [ ] Theme state (light/dark)

---

## Phase 5: Polish & Testing

### 5.1 Styling
- [ ] Clean, minimal design
- [ ] Accessible color contrast (WCAG AA)
- [ ] Smooth transitions
- [ ] Form input styling
- [ ] Card styling
- [ ] Button states (hover, active, disabled)
- [ ] Mobile responsive breakpoints

### 5.2 Testing
- [ ] Test calculations against reference project
- [ ] Test all item types
- [ ] Test all stat combinations
- [ ] Test tier-up scenarios
- [ ] Test item level adjustments (160+)
- [ ] Test edge cases (epic tier, special lines)
- [ ] Cross-browser testing
- [ ] Mobile device testing

### 5.3 Documentation
- [ ] Add comments to complex functions
- [ ] README with setup instructions
- [ ] Usage guide

---

## File Structure Plan

```
maple-calc/
├── src/
│   ├── components/
│   │   ├── CubingCalculator.vue      # Main calculator container
│   │   ├── CalculatorForm.vue        # Input form
│   │   ├── ResultsDisplay.vue        # Side-by-side results
│   │   └── ResultCard.vue            # Individual cube result card
│   ├── data/
│   │   ├── cubeRates.js             # Full cube rates data from reference
│   │   ├── cubeConfig.js            # Cube costs, tier rates, prime rates
│   │   └── statCategories.js        # Stat category definitions
│   ├── utils/
│   │   ├── probability.js           # Probability calculation functions
│   │   ├── statistics.js            # Geometric distribution functions
│   │   ├── cubeCosts.js            # Cost calculation functions
│   │   └── statOptions.js          # Dynamic stat option generation
│   ├── App.vue                      # Main app with theme toggle
│   └── main.js
├── IMPLEMENTATION_PLAN.md           # This file
├── PROGRESS.md                      # Detailed progress tracking
└── package.json
```

---

## Current Status
- ✅ Phase 1 Started: Project scaffolded, dependencies installed
- 🔄 Next: Begin data layer implementation (cubeRates.js port)

## Notes
- Focus on exact feature parity with reference project
- No DMT toggle (excluded per requirements)
- Default to legendary tier, tier-up optional
- Both Glowing and Bright cubes calculated automatically
