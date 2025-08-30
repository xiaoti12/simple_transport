<template>
  <div class="chart-wrapper" :class="{ 'scrollable': needsScroll }">
    <div class="chart-container" :style="{ width: chartWidth }">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js'

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface MonthData {
  amount: number
  count: number
}

interface Props {
  monthlyStats: Record<string, MonthData>
}

const props = defineProps<Props>()

// 计算是否需要滚动和容器宽度
const entries = computed(() => Object.entries(props.monthlyStats))
const dataPointCount = computed(() => entries.value.length)
const needsScroll = computed(() => dataPointCount.value > 6)
const minBarWidth = 60 // 每个数据点的最小宽度
const chartWidth = computed(() => {
  if (needsScroll.value) {
    return `${Math.max(dataPointCount.value * minBarWidth, 400)}px`
  }
  return '100%'
})

// 处理图表数据
const chartData = computed(() => {
  const labels = entries.value.map(([month]) => {
    // 转换格式：2025年8月 -> 2025.8
    const match = month.match(/(\d{4})年(\d{1,2})月/)
    if (match) {
      const year = match[1]
      const monthNum = parseInt(match[2])
      return `${year}.${monthNum}`
    }
    return month
  })
  const amounts = entries.value.map(([, data]) => data.amount)

  return {
    labels,
    datasets: [
      {
        label: '花费金额',
        data: amounts,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        barThickness: 30, // 设置柱形图宽度
        maxBarThickness: 40 // 最大宽度限制
      }
    ]
  }
})

// 图表配置选项
const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      callbacks: {
        label: function(context) {
          const value = context.parsed.y
          return `花费：¥${value.toLocaleString()}`
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: needsScroll.value ? 0 : 30,
        font: {
          size: 11,
        }
      }
    },
    y: {
      display: true,
      title: {
        display: true,
        text: '花费金额 (¥)',
        font: {
          size: 12,
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        font: {
          size: 10,
        },
        callback: function(value) {
          return '¥' + Number(value).toLocaleString()
        }
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  }
}
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  overflow-x: visible;
}

.chart-wrapper.scrollable {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}

.chart-wrapper.scrollable::-webkit-scrollbar {
  height: 6px;
}

.chart-wrapper.scrollable::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 3px;
}

.chart-wrapper.scrollable::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.chart-wrapper.scrollable::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.chart-container {
  position: relative;
  height: 180px;
  min-width: 100%;
}
</style>