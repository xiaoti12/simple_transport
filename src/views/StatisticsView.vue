<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-md mx-auto px-4 py-4">
        <h1 class="text-xl font-bold text-gray-900">出行统计</h1>
      </div>
    </header>

    <div class="max-w-md mx-auto px-4 py-6 space-y-6">
      <!-- 总览统计 -->
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <h2 class="text-lg font-medium mb-4">总体统计</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ tripsStore.trips.length }}</div>
            <div class="text-sm text-gray-500 mt-1">总行程数</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">¥{{ tripsStore.totalSpent.toLocaleString() }}</div>
            <div class="text-sm text-gray-500 mt-1">总花费</div>
          </div>
        </div>
      </div>

      <!-- 交通方式统计 -->
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <h2 class="text-lg font-medium mb-4">交通方式分布</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-2xl mr-3">🚄</span>
              <span class="font-medium">火车</span>
            </div>
            <div class="flex items-center">
              <div class="w-20 bg-gray-200 rounded-full h-2 mr-3">
                <div 
                  class="bg-blue-500 h-2 rounded-full" 
                  :style="{ width: `${trainPercentage}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium w-8">{{ tripsStore.tripsByType.train }}</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-2xl mr-3">✈️</span>
              <span class="font-medium">飞机</span>
            </div>
            <div class="flex items-center">
              <div class="w-20 bg-gray-200 rounded-full h-2 mr-3">
                <div 
                  class="bg-green-500 h-2 rounded-full" 
                  :style="{ width: `${flightPercentage}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium w-8">{{ tripsStore.tripsByType.flight }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 平均统计 -->
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <h2 class="text-lg font-medium mb-4">平均数据</h2>
        <div class="grid grid-cols-2 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-purple-600">¥{{ averagePrice.toFixed(1) }}</div>
            <div class="text-sm text-gray-500 mt-1">平均票价</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-orange-600">{{ tripsPerMonth.toFixed(1) }}</div>
            <div class="text-sm text-gray-500 mt-1">月均出行</div>
          </div>
        </div>
      </div>

      <!-- 热门数据统计 -->
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <h2 class="text-lg font-medium mb-4">热门数据</h2>
        <div class="grid grid-cols-2 gap-4">
          <!-- 最多的出行城市 -->
          <div v-if="tripsStore.mostDepartureCity" class="text-center p-3 bg-indigo-50 rounded-lg">
            <div class="text-2xl mb-1">🏙️</div>
            <div class="text-sm text-gray-500 mb-1">最多出行城市</div>
            <div class="font-medium text-indigo-600">{{ tripsStore.mostDepartureCity.city }}</div>
            <div class="text-xs text-gray-400">{{ tripsStore.mostDepartureCity.count }}次</div>
          </div>

          <!-- 最多的到达城市 -->
          <div v-if="tripsStore.mostArrivalCity" class="text-center p-3 bg-teal-50 rounded-lg">
            <div class="text-2xl mb-1">📍</div>
            <div class="text-sm text-gray-500 mb-1">最多到达城市</div>
            <div class="font-medium text-teal-600">{{ tripsStore.mostArrivalCity.city }}</div>
            <div class="text-xs text-gray-400">{{ tripsStore.mostArrivalCity.count }}次</div>
          </div>

          <!-- 最多的往返行程 -->
          <div v-if="tripsStore.mostRoundTripRoute" class="text-center p-3 bg-pink-50 rounded-lg">
            <div class="text-2xl mb-1">🔄</div>
            <div class="text-sm text-gray-500 mb-1">最多往返行程</div>
            <div class="font-medium text-pink-600 text-sm">{{ tripsStore.mostRoundTripRoute.route }}</div>
            <div class="text-xs text-gray-400">{{ tripsStore.mostRoundTripRoute.count }}次</div>
          </div>

          <!-- 最多的航空公司 -->
          <div v-if="tripsStore.mostAirline" class="text-center p-3 bg-red-50 rounded-lg">
            <div class="text-2xl mb-1">🏢</div>
            <div class="text-sm text-gray-500 mb-1">最多航空公司</div>
            <div class="font-medium text-red-600">{{ tripsStore.mostAirline.airline }}</div>
            <div class="text-xs text-gray-400">{{ tripsStore.mostAirline.count }}次</div>
          </div>
        </div>
      </div>

      <!-- 月度统计 -->
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <h2 class="text-lg font-medium mb-4">月度花费趋势</h2>
        <div class="space-y-2">
          <div v-for="(monthData, month) in displayedMonthlyStats" :key="month" class="flex items-center justify-between py-2">
            <span class="text-sm text-gray-600">{{ month }}</span>
            <div class="flex items-center">
              <div class="w-24 bg-gray-200 rounded-full h-2 mr-3">
                <div 
                  class="bg-blue-500 h-2 rounded-full" 
                  :style="{ width: `${(monthData.amount / maxMonthlyAmount) * 100}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium w-16 text-right">¥{{ monthData.amount.toLocaleString() }}</span>
              <span class="text-xs text-gray-400 w-8 text-right">({{ monthData.count }})</span>
            </div>
          </div>
        </div>
        
        <!-- 展开/收起按钮 -->
        <div v-if="shouldShowToggleButton" class="mt-4 text-center">
          <button 
            @click="showAllMonths = !showAllMonths"
            class="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-blue-50"
          >
            {{ showAllMonths ? '收起' : `查看全部 ${totalMonthsCount} 个月` }}
          </button>
        </div>
      </div>
    </div>

    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTripsStore } from '@/stores/trips'
import BottomNavigation from '@/components/BottomNavigation.vue'

const tripsStore = useTripsStore()

// 控制月度显示数量
const showAllMonths = ref(false)
const defaultDisplayCount = 6

const trainPercentage = computed(() => {
  const total = tripsStore.trips.length
  return total > 0 ? (tripsStore.tripsByType.train / total) * 100 : 0
})

const flightPercentage = computed(() => {
  const total = tripsStore.trips.length
  return total > 0 ? (tripsStore.tripsByType.flight / total) * 100 : 0
})

const monthlyStats = computed(() => {
  const stats: Record<string, { amount: number; count: number; year: number; month: number }> = {}
  
  tripsStore.trips.forEach(trip => {
    const date = new Date(trip.date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthKey = `${year}年${month}月`
    
    if (!stats[monthKey]) {
      stats[monthKey] = { amount: 0, count: 0, year, month }
    }
    
    stats[monthKey].amount += trip.price
    stats[monthKey].count += 1
  })
  
  // 按年份和月份降序排序
  const sortedStats = Object.fromEntries(
    Object.entries(stats).sort(([, a], [, b]) => {
      if (a.year !== b.year) {
        return b.year - a.year // 年份降序
      }
      return b.month - a.month // 月份降序
    })
  )
  
  return sortedStats
})

const displayedMonthlyStats = computed(() => {
  const entries = Object.entries(monthlyStats.value)
  if (!showAllMonths.value && entries.length > defaultDisplayCount) {
    return Object.fromEntries(entries.slice(0, defaultDisplayCount))
  }
  return monthlyStats.value
})

const maxMonthlyAmount = computed(() => {
  const amounts = Object.values(monthlyStats.value).map(data => data.amount)
  return amounts.length > 0 ? Math.max(...amounts) : 0
})

const totalMonthsCount = computed(() => Object.keys(monthlyStats.value).length)
const shouldShowToggleButton = computed(() => totalMonthsCount.value > defaultDisplayCount)

const averagePrice = computed(() => {
  if (tripsStore.trips.length === 0) return 0
  return tripsStore.totalSpent / tripsStore.trips.length
})

const tripsPerMonth = computed(() => {
  if (tripsStore.trips.length === 0) return 0
  
  const dates = tripsStore.trips.map(trip => new Date(trip.date))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  
  const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + 
                    (maxDate.getMonth() - minDate.getMonth()) + 1
  
  return tripsStore.trips.length / monthsDiff
})

onMounted(() => {
  tripsStore.loadFromStorage()
})
</script>