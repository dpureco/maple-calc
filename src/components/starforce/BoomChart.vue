<script setup>
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { grabColumnColors } from '../../utils/starforce/starforceStats.js'

// Register Chart.js components
Chart.register(...registerables)

const props = defineProps({
  boomData: {
    type: Array,
    required: true
  },
  boomPercentiles: {
    type: Object,
    required: true
  }
})

const chartCanvas = ref(null)
let chartInstance = null

function createChart() {
  if (!chartCanvas.value) return

  // Create boom frequency map
  const boomMap = props.boomData.reduce((acc, e) => {
    acc.set(e, (acc.get(e) || 0) + 1)
    return acc
  }, new Map())

  // Sort keys in ascending order
  const sortedKeys = Array.from(boomMap.keys()).sort((a, b) => a - b)

  // Get colors for each column
  const colorMatrix = sortedKeys.map(key => {
    return grabColumnColors(key, props.boomPercentiles)
  })

  const backgroundArray = colorMatrix.map(el => el.background)
  const borderArray = colorMatrix.map(el => el.border)

  const chartData = {
    labels: sortedKeys,
    datasets: [{
      data: sortedKeys.map(key => boomMap.get(key)),
      backgroundColor: backgroundArray,
      borderColor: borderArray,
      borderWidth: 1
    }]
  }

  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Create new chart
  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Boom Frequency Histogram',
          padding: {
            top: 20,
            bottom: 20
          },
          font: { size: 18 }
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: function (context) {
              const label = context[0].label
              if (label === '0') return 'No Boom'
              return label === '1' ? '1 Boom' : `${label} Booms`
            },
            label: function (context) {
              const trialsAmount = context.dataset.data.reduce((partialSum, a) => partialSum + a, 0)
              const percentage = ((context.raw * 100) / trialsAmount).toFixed(2)
              return `${context.raw} occurrences (${percentage}%)`
            },
          }
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Boom Amount',
            font: { size: 14 },
          }
        },
        y: {
          title: {
            display: true,
            text: 'Frequency',
            font: { size: 14 },
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    }
  })
}

onMounted(() => {
  createChart()
})

watch(() => props.boomData, () => {
  createChart()
}, { deep: true })
</script>

<template>
  <div class="boom-chart">
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<style scoped>
.boom-chart {
  width: 100%;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
}
</style>
