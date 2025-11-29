# Starforce Calculator Implementation Plan

## Overview
Port the Starforce Calculator from `/reference/starforceCalculator` to Vue 3 + Vite, matching exact functionality and calculation logic.

## Analysis of Reference Project

### Core Functionality
The starforce calculator runs **Monte Carlo simulations** to estimate starforcing costs and boom probabilities.

**Inputs:**
- Item Level (number, default 200)
- Item Type (normal/tyrant - tyrant commented out)
- Star Catching (none or +5% multiplicative)
- Safeguard (yes/no)
- Current Stars (0-30 depending on server)
- Target Stars (0-30 depending on server)
- MVP Discount (none, silver 3%, gold 5%, diamond 10% for stars 1-16)
- Server (GMS 30 Stars, KMS, TMS, TMS Reboot, GMS Before 30 Stars, GMS Pre-Savior)
- Events:
  - 5/10/15 (guaranteed success at 5/10/15 stars)
  - +2 Stars (up to 10 stars) - disabled
  - 30% Meso Discount
  - 30% Boom Reduction (for KMS/GMS only)
- Number of Trials (default 1000)

**Outputs:**
- Meso Stats (Average, Median, Range)
- Meso Percentiles (75%, 85%, 95%)
- Boom Stats (Average, Median, Range)
- Boom Percentiles (75%, 85%, 95%)
- Frequency Histogram (bar chart showing boom distribution)

### Key Files & Logic

#### 1. `main.js` - Core Simulation Logic

**Key Functions:**
- `attemptCost(current_star, item_level, boom_protect, thirty_off, sauna, silver, gold, diamond, five_ten_fifteen, chance_time, item_type, server)`
  - Calculates cost of single starforce attempt
  - Applies MVP discounts, 30% event discount, safeguard multiplier

- `determineOutcome(current_star, rates, star_catch, boom_protect, five_ten_fifteen, sauna, item_type, server, boom_event)`
  - Returns "Success", "Maintain", "Decrease", or "Boom"
  - Applies all modifiers (events, safeguard, starcatch)
  - Uses probability rates from `serverDiffs.js`

- `getBoomStar(current_stars, server)`
  - Determines which star level item resets to when it booms
  - GMS 30-star system has different boom behavior for 20-25 stars
  - Non-GMS servers always return to 12 stars

- `performExperiment(current_stars, desired_star, rates, item_level, boom_protect, thirty_off, star_catch, five_ten_fifteen, sauna, silver, gold, diamond, item_type, two_plus, useAEE, server, boom_event)`
  - Simulates ONE complete starforcing session
  - Returns `[total_mesos, total_booms]`
  - Implements "Chance Time" mechanic (auto-success after 2 decreases in non-KMS/GMS)

- `repeatExperiment(total_trials, current_star, desired_star, rates, item_level, boom_protect, thirty_off, star_catch, five_ten_fifteen, sauna, silver, gold, diamond, item_type, two_plus, useAEE, server, boom_event)`
  - Runs `performExperiment` N times
  - Collects results and calculates statistics
  - Returns `[average_cost, average_booms, meso_result_list, boom_result_list, median_cost, median_booms, max_cost, min_cost, max_booms, min_booms, meso_std, boom_std, meso_result_list_divided]`

**Statistics Functions:**
- `percentile(arr, p)` - Calculate percentile value
- `median(values)` - Calculate median
- `average(data)` - Calculate mean
- `standardDeviation(values)` - Calculate std dev (not used in display)

**Chart Functions:**
- `buildBoomChart(boom_result_list, boomPercentiles)` - Creates Chart.js bar chart
- `updateBoomChart(boom_result_list, boomPercentiles)` - Updates existing chart
- `grabColumnColors(boomsAmount, boomPercentiles)` - Colors bars based on percentile ranges

#### 2. `serverDiffs.js` - Starforce Rates & Costs

**Rate Tables:**
- `preSaviorRates` - GMS before Savior update
- `kmsRates` - KMS and current GMS (30 stars)
- `saviorRates` - GMS between Savior and 30-star update
- `TMSRates` - Taiwan MapleStory
- `tyrantRates` - Tyrant equipment (deprecated)
- `tyrantAEERates` - Tyrant with AEE (deprecated)

Format: `{ currentStar: [success, maintain, decrease, boom] }`

**Cost Functions:**
- `getBaseCost(server, current_star, item_level)` - Base meso cost per attempt
- Different formulas for each server:
  - `kmsCost(current_star, item_level)` - KMS/GMS 30-star formula
  - `saviorCost(current_star, item_level)` - GMS Savior formula
  - `preSaviorCost(current_star, item_level)` - Old GMS formula
  - `tmsRegCost(current_star, item_level)` - TMS regular
  - `tmsRebootCost(current_star, item_level)` - TMS Reboot

- `getSafeguardMultiplierIncrease(current_star, sauna, server)` - Additional cost when using safeguard
  - KMS/GMS: 2x cost for stars 15-17
  - Other servers: 1x cost for stars 15-16

**Important Notes:**
- Costs vary significantly by server
- Stars 11-14 in KMS/GMS have no decrease/boom (Savior update)
- Stars 15+ can boom
- Stars 20+ in GMS 30-star have higher boom rates
- Safeguard prevents boom but doubles cost (stars 15-17 in KMS/GMS, 15-16 elsewhere)

---

## Implementation Plan

### Phase 1: Project Restructure
- [ ] Reorganize project for multiple features
- [ ] Add navigation system (top nav bar recommended for simplicity)
- [ ] Create route-like structure (single-page with conditional rendering)

### Phase 2: Data Layer
- [ ] Port `serverDiffs.js` completely
  - [ ] All rate tables
  - [ ] All cost functions
  - [ ] Safeguard multiplier function
- [ ] Create constants file for server options, event options, etc.

### Phase 3: Utility Functions
- [ ] Port statistics functions (percentile, median, average, stdDev)
- [ ] Port starforce simulation logic
  - [ ] `attemptCost()`
  - [ ] `determineOutcome()`
  - [ ] `getBoomStar()`
  - [ ] `performExperiment()`
  - [ ] `repeatExperiment()`

### Phase 4: UI Components
- [ ] Create `StarforceCalculator.vue` main component
- [ ] Create `StarforceForm.vue` for inputs
- [ ] Create `StarforceResults.vue` for statistics display
- [ ] Create `BoomChart.vue` for Chart.js histogram

### Phase 5: Chart Integration
- [ ] Install Chart.js dependency (`npm install chart.js`)
- [ ] Implement boom frequency histogram
- [ ] Color-code bars by percentile ranges

### Phase 6: Navigation
- [ ] Create `Navigation.vue` component (top nav bar)
- [ ] Add navigation links for Cubing and Starforce
- [ ] Implement active state styling
- [ ] Handle route switching (show/hide components)

### Phase 7: Testing
- [ ] Test all server types
- [ ] Test all event combinations
- [ ] Verify calculations match reference project
- [ ] Test chart rendering and updates

---

## File Structure

```
maple-calc/
├── src/
│   ├── components/
│   │   ├── Navigation.vue              # NEW - Top navigation
│   │   ├── cubing/                     # NEW - Organized cubing
│   │   │   ├── CubingCalculator.vue   # MOVED from ../
│   │   │   └── ResultsDisplay.vue     # MOVED from ../
│   │   └── starforce/                  # NEW - Starforce components
│   │       ├── StarforceCalculator.vue
│   │       ├── StarforceForm.vue
│   │       ├── StarforceResults.vue
│   │       └── BoomChart.vue
│   ├── data/
│   │   ├── cubing/                     # NEW - Organized cubing
│   │   │   ├── cubeRates.js           # MOVED from ../
│   │   │   ├── cubeConfig.js          # MOVED from ../
│   │   │   └── statCategories.js      # MOVED from ../
│   │   └── starforce/                  # NEW - Starforce data
│   │       ├── serverRates.js          # Port of serverDiffs.js rates
│   │       └── serverCosts.js          # Port of serverDiffs.js costs
│   ├── utils/
│   │   ├── cubing/                     # NEW - Organized cubing
│   │   │   ├── probability.js         # MOVED from ../
│   │   │   ├── cubeCosts.js          # MOVED from ../
│   │   │   └── statOptions.js        # MOVED from ../
│   │   ├── starforce/                  # NEW - Starforce utils
│   │   │   ├── starforceSimulation.js  # Core simulation logic
│   │   │   └── starforceStats.js       # Statistics calculations
│   │   └── statistics.js               # SHARED - Used by both features
│   ├── App.vue                         # UPDATE - Add navigation & routing
│   └── main.js
└── package.json                        # UPDATE - Add chart.js
```

---

## Navigation Design

### Option 1: Top Navigation Bar (RECOMMENDED)
```
┌─────────────────────────────────────────────────────┐
│  MapleCalc            [Cubing] [Starforce]     [🌙] │
├─────────────────────────────────────────────────────┤
│                                                     │
│            [Active Calculator Content]              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Pros:**
- Simple, clean design
- No layout shift
- Easy to implement
- Familiar pattern

**Cons:**
- Slightly less space for content

### Option 2: Side Navigation
```
┌────────┬──────────────────────────────────────────┐
│ Maple  │  MapleCalc                         [🌙]  │
│ Calc   ├──────────────────────────────────────────┤
│        │                                          │
│ Cubing │         [Active Calculator Content]      │
│        │                                          │
│ Star-  │                                          │
│ force  │                                          │
│        │                                          │
└────────┴──────────────────────────────────────────┘
```

**Pros:**
- More vertical space
- Can add more features easily

**Cons:**
- More complex layout
- Less space for content width
- Awkward on mobile

**RECOMMENDATION: Use Top Navigation Bar (Option 1)**

---

## Implementation Notes

### DO NOT CHANGE:
- ✅ All probability/rate formulas from `serverDiffs.js`
- ✅ Simulation logic (deterministic outcome, chance time, boom stars)
- ✅ Cost calculation formulas
- ✅ Statistics calculations (percentile, median, average)
- ✅ Event mechanics (5/10/15, boom reduction, safeguard)
- ✅ Server-specific behaviors

### CAN MODERNIZE:
- ✅ UI/UX design (make it match cubing calculator style)
- ✅ Form layout and styling
- ✅ Chart presentation
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design

---

## Dependencies to Add

```json
{
  "dependencies": {
    "chart.js": "^4.4.0"
  }
}
```

---

## Validation Rules

- Item Level: >= 0
- Current Stars: >= 0, <= max for server
- Target Stars: > Current Stars, <= max for server
- Number of Trials: >= 1, recommend 1000-10000
- Max stars by server:
  - GMS/KMS: 30
  - Others: 25
  - Tyrant: 15 (deprecated)

---

## Next Steps

1. Review and approve this plan
2. Create detailed task breakdown
3. Begin implementation
