<template>
  <div class="flex flex-col gap-6xl">
    <div class="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in summaryCards"
        :key="card.id"
        class="rounded-lg border bg_secondary_color p-5xl primary_border_color"
      >
        <p class="body_2_medium secondary_text_color">{{ card.title }}</p>
        <p class="mt-md heading_h5_bold primary_text_color">{{ card.value }}</p>
        <p class="mt-sm body_4_regular" :class="card.subtextClass">{{ card.subtext }}</p>
      </div>
    </div>

    <div class="rounded-lg border bg_secondary_color p-6xl primary_border_color">
      <h3 class="heading_h6_semibold primary_text_color">List size over time</h3>
      <p class="mt-xs label_1_regular secondary_text_color">Total members daily</p>
      <div class="mt-6xl h-[280px] w-full">
        <canvas ref="chartRef" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
} from 'chart.js'

const DEMO_SUMMARY = {
  totalMembers: 208,
  totalMembersChange: 340,
  membersGained: 412,
  membersLost: 3,
  growthRate: 84.7,
  growthRateChange: 2
}

const DEMO_CHART_POINTS = [
  { date: 'Apr 12', value: 0 },
  { date: 'Apr 16', value: 2 },
  { date: 'Apr 18', value: 4 },
  { date: 'Apr 24', value: 8 },
  { date: 'Apr 28', value: 12 },
  { date: 'Apr 30', value: 18 },
  { date: 'May 02', value: 28 },
  { date: 'May 04', value: 45 },
  { date: 'May 08', value: 72 },
  { date: 'May 12', value: 110 },
  { date: 'May 18', value: 165 },
  { date: 'May 20', value: 208 }
]

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip
)

const props = defineProps({
  /** Omit to use demo seed data */
  summary: {
    type: Object,
    default: undefined
  },
  chartPoints: {
    type: Array,
    default: undefined
  }
})

const chartRef = ref(null)
let chartInstance = null

const summary = computed(() => props.summary ?? DEMO_SUMMARY)
const chartPoints = computed(() => props.chartPoints ?? DEMO_CHART_POINTS)

const summaryCards = computed(() => {
  const s = summary.value
  return [
    {
      id: 'total',
      title: 'Total members',
      value: String(s.totalMembers),
      subtext: `↑ +${s.totalMembersChange} this month`,
      subtextClass: 'text-success-700'
    },
    {
      id: 'gained',
      title: 'Members gained',
      value: `+${s.membersGained}`,
      subtext: 'Last 30 days',
      subtextClass: 'text-success-700'
    },
    {
      id: 'lost',
      title: 'Members lost',
      value: `-${Math.abs(s.membersLost)}`,
      subtext: 'Unsubscribes & suppressions',
      subtextClass: 'text-error-700'
    },
    {
      id: 'rate',
      title: 'Growth rate',
      value: `${s.growthRate}%`,
      subtext: `↑ ${s.growthRateChange}% vs last month`,
      subtextClass: 'text-success-600'
    }
  ]
})

function buildChart() {
  if (!chartRef.value) return
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  const points = chartPoints.value
  chartInstance = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels: points.map((p) => p.date),
      datasets: [
        {
          data: points.map((p) => p.value),
          borderColor: '#9B8FD9',
          backgroundColor: 'rgba(155, 143, 217, 0.08)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1D2125',
          titleFont: { size: 12 },
          bodyFont: { size: 12 },
          padding: 10,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: '#6B7280',
            font: { size: 11 },
            maxRotation: 0
          }
        },
        y: {
          beginAtZero: true,
          max: 208,
          border: { display: false },
          grid: { color: '#F3F4F6' },
          ticks: {
            color: '#6B7280',
            font: { size: 11 },
            stepSize: 25,
            callback: (value) => {
              const allowed = [0, 25, 50, 100, 208]
              return allowed.includes(Number(value)) ? value : ''
            }
          }
        }
      }
    }
  })
}

onMounted(() => {
  buildChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

watch(chartPoints, () => {
  buildChart()
}, { deep: true })
</script>
