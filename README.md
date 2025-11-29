# MapleCalc - Cubing Probability Calculator

A modern, responsive cubing calculator for MapleStory built with Vue 3 and Vite.

## Features

✨ **Modern UI**
- Clean, minimal design
- Light and dark mode support
- Fully responsive (desktop, tablet, mobile)
- Smooth transitions and animations

🎯 **Comprehensive Calculations**
- Side-by-side comparison of Glowing (Red) and Bright (Black) cubes
- Automatic highlighting of best cube option
- Detailed statistics (mean, median, percentiles)
- Tier-up cost calculations (optional)

📊 **Complete Stat Options**
- All item types (15 categories)
- All stat combinations from reference project
- Special stats (Cooldown for hats, Crit Damage for gloves, Meso/Drop for accessories)
# MapleCalc - Cubing Probability Calculator
[![Pages deploy](https://github.com/dpureco/maple-calc/actions/workflows/deploy.yml/badge.svg)](https://github.com/dpureco/maple-calc/actions/workflows/deploy.yml) [![Build Status](https://github.com/dpureco/maple-calc/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/dpureco/maple-calc/actions)

# MapleCalc - Cubing Probability Calculator
# MapleCalc - Cubing Probability Calculator

A modern, responsive cubing calculator for MapleStory built with Vue 3 and Vite.

## Features

✨ **Modern UI**
- Clean, minimal design
- Light and dark mode support
- Fully responsive (desktop, tablet, mobile)
- Smooth transitions and animations

🎯 **Comprehensive Calculations**
- Side-by-side comparison of Glowing (Red) and Bright (Black) cubes
- Automatic highlighting of best cube option
- Detailed statistics (mean, median, percentiles)
- Tier-up cost calculations (optional)

📊 **Complete Stat Options**
- All item types (15 categories)
- All stat combinations from reference project
- Special stats (Cooldown for hats, Crit Damage for gloves, Meso/Drop for accessories)
- Complex combinations (Attack + Boss, 2L Attack + IED, etc.)
- Demon Avenger HP calculations
- Xenon All Stat calculations

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. Navigate to the project directory:
```bash
cd maple-calc
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to http://localhost:5173/

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### Basic Workflow

1. **Select Item Information**
   - Choose item category (Weapon, Hat, Accessory, etc.)
   - Enter item level (minimum 71)

2. **Configure Tiers**
   - Set current tier (defaults to Legendary)
   - Set desired tier
   - Optionally enable tier-up calculations

3. **Choose Desired Stats**
   - Select stat type (Normal, Max HP for DA, All Stat for Xenon)
   - Choose desired stat from dropdown (options update dynamically)

4. **Calculate**
   - Click "Calculate" button
   - View side-by-side results for both cube types
   - Best option is automatically highlighted

### Understanding Results

Each cube result shows:
- **Probability**: Chance of getting desired stats per cube
- **Expected Attempts**: How many cubes needed (mean, median, percentiles)
- **Expected Cost**: Total mesos cost including reveal potential
- **Breakdown**: Tier-up vs stat attempts (if tier-up enabled)

The **median (50%)** represents the number of cubes where you have a 50% chance of success.
The **95th percentile** shows a worst-case scenario where 95% of players would succeed.

## Project Structure

```
maple-calc/
├── src/
│   ├── components/
│   │   ├── CubingCalculator.vue    # Main calculator with form
│   │   └── ResultsDisplay.vue      # Results display component
│   ├── data/
│   │   ├── cubeRates.js           # Complete cube probability data
│   │   ├── cubeConfig.js          # Cube costs and tier rates
│   │   └── statCategories.js      # Stat category definitions
│   ├── utils/
│   │   ├── probability.js         # Probability calculations
│   │   ├── statistics.js          # Geometric distribution
+│   │   ├── cubeCosts.js          # Cost calculations
│   │   └── statOptions.js        # Dynamic option generation
│   ├── App.vue                    # Main app with theme toggle
│   └── main.js                    # App entry point
├── public/
├── index.html
└── package.json
```

## Technical Details

### Calculation Method

The calculator uses the **geometric distribution** to calculate expected attempts:

- **Probability**: Calculated by iterating through all possible 3-line outcomes
- **Special Lines**: Accounts for restrictions (max 2 IED lines, 1 Decent Skill, etc.)
- **Adjusted Rates**: Second and third lines have adjusted probabilities based on special lines rolled
- **Item Level**: Items level 160+ receive +1% to stat values
- **Tier-up**: Combines tier-up probability with stat probability when enabled

### Data Source

Probability data is sourced from:
- Community research and data collection
- KMS (Korean MapleStory) official rates where available
- GMS (Global MapleStory) community rates where different from KMS

### Theme Persistence

Theme preference is saved to `localStorage` and persists across sessions. The calculator also respects your system's color scheme preference on first visit.

## Differences from Reference Project

1. **Simplified Cube Selection**: Automatically calculates both Glowing and Bright cubes instead of requiring manual selection
2. **No DMT Toggle**: DMT functionality excluded per requirements (but tier-up structure supports it for potential future use)
3. **Modern UI**: Complete redesign with responsive layout and dark mode
4. **Automatic Best Option**: Highlights the most cost-effective cube automatically

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This calculator is based on the work of brendonmay's cubing calculator. All probability calculations maintain parity with the reference implementation.

## License

MIT

## Acknowledgments

- Original calculator logic by brendonmay
- Probability data from MapleStory community research
- Built with Vue 3 and Vite
