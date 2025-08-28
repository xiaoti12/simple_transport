<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-md mx-auto px-4 py-4">
        <h1 class="text-xl font-bold text-gray-900">出行记录</h1>
      </div>
    </header>

    <!-- 筛选器 -->
    <TripFilter @filters-changed="handleFiltersChanged" />

    <!-- 统计卡片 -->
    <div class="max-w-md mx-auto px-4 py-2">
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="text-2xl font-bold text-blue-600">{{ currentTripCount }}</div>
          <div class="text-sm text-gray-500">总行程</div>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="text-2xl font-bold text-green-600">¥{{ currentTotalSpent.toLocaleString() }}</div>
          <div class="text-sm text-gray-500">总花费</div>
        </div>
      </div>

      <!-- 出行记录列表 -->
      <div class="space-y-3 pb-20">
        <!-- 按时间倒序显示往返行程和单程行程 -->
        <template v-for="item in displayedTrips"
          :key="item.type === 'round' ? `round-${item.data.outbound.id}` : item.data.id">
          <!-- 往返行程 -->
          <RoundTripCard v-if="item.type === 'round'" :outbound="item.data.outbound" :return-trip="item.data.return" />

          <!-- 单程行程 -->
          <TripCard v-else :trip="item.data" />
        </template>

        <div v-if="tripsStore.trips.length === 0" class="text-center py-12">
          <div class="text-gray-400 text-lg mb-2">📱</div>
          <p class="text-gray-500 mb-4">还没有出行记录</p>
          <div class="space-y-2">
            <RouterLink to="/add" class="block text-blue-500 text-sm">添加第一条记录</RouterLink>
            <button @click="loadSampleData" class="text-green-500 text-sm">加载示例数据</button>
          </div>
        </div>

        <div v-else-if="displayedTrips.length === 0" class="text-center py-12">
          <div class="text-gray-400 text-lg mb-2">🔍</div>
          <p class="text-gray-500 mb-4">没有符合筛选条件的记录</p>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useTripsStore } from '@/stores/trips'
import TripCard from '@/components/TripCard.vue'
import RoundTripCard from '@/components/RoundTripCard.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'
import TripFilter from '@/components/TripFilter.vue'
import type { TripRecord } from '@/types'

const tripsStore = useTripsStore()
const filteredTrips = ref<TripRecord[]>([])

// 根据筛选结果生成显示的行程列表
const displayedTrips = computed(() => {
  // 如果有筛选条件活跃，使用筛选结果，否则使用store中的sortedAllTrips
  if (hasActiveFilters.value) {
    // 对筛选结果应用相同的往返行程检测逻辑
    const trips = filteredTrips.value
    console.log('筛选模式：检测往返行程，筛选后行程数:', trips.length)
    
    // 使用与store相同的算法
    const roundTripList = []
    const usedIndexes = new Set<number>()
    
    // 按时间倒序排序，从最新的开始检测
    const sortedTripIndices = trips
      .map((trip, index) => ({ trip, index }))
      .sort((a, b) => new Date(b.trip.date).getTime() - new Date(a.trip.date).getTime())
    
    for (let i = 0; i < sortedTripIndices.length; i++) {
      if (usedIndexes.has(sortedTripIndices[i].index)) continue
      
      const { trip: trip1, index: index1 } = sortedTripIndices[i]
      const departure1 = trip1.departure.city
      const arrival1 = trip1.arrival.city
      
      // 从当前行程往后检查（时间上更早的行程）
      for (let j = i + 1; j < sortedTripIndices.length; j++) {
        if (usedIndexes.has(sortedTripIndices[j].index)) continue
        
        const { trip: trip2, index: index2 } = sortedTripIndices[j]
        const departure2 = trip2.departure.city
        const arrival2 = trip2.arrival.city
        
        // 检查是否为往返（A→B 和 B→A）
        if ((departure1 === arrival2 && arrival1 === departure2)) {
          // 计算时间间隔（以天为单位）
          const date1 = new Date(trip1.date)
          const date2 = new Date(trip2.date)
          const daysDiff = Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)
          
          // 只有在合理的时间范围内才认为是往返行程（比如30天内）
          if (daysDiff <= 30) {
            // trip1是较新的（返程），trip2是较早的（去程）
            const outboundTrip = trip2  // 较早的行程作为去程
            const returnTrip = trip1    // 较新的行程作为返程
            console.log(`筛选模式：检测到往返行程: ${outboundTrip.departure.city} ⇄ ${outboundTrip.arrival.city} (去程:${outboundTrip.date}, 返程:${returnTrip.date}, 间隔${Math.round(daysDiff)}天)`)
            roundTripList.push({
              outbound: outboundTrip,
              return: returnTrip,
              totalPrice: trip1.price + trip2.price,
              route: `${outboundTrip.departure.city} ⇄ ${outboundTrip.arrival.city}`
            })
            usedIndexes.add(index1)
            usedIndexes.add(index2)
            break
          }
        }
      }
    }
    
    // 单程行程（不在往返行程中的）
    const singleTrips = trips.filter((_, index) => !usedIndexes.has(index))
    
    // 统一排序的行程列表
    const allItems: Array<{
      type: 'round' | 'single'
      data: any
      sortDate: Date
    }> = []
    
    // 添加往返行程
    roundTripList.forEach(roundTrip => {
      allItems.push({
        type: 'round',
        data: roundTrip,
        sortDate: new Date(roundTrip.outbound.date)
      })
    })
    
    // 添加单程行程
    singleTrips.forEach(trip => {
      allItems.push({
        type: 'single',
        data: trip,
        sortDate: new Date(trip.date)
      })
    })
    
    console.log(`筛选模式：往返行程检测完成，发现${roundTripList.length}个往返行程`)
    // 按时间倒序排序（最新的在前面）
    return allItems.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
  } else {
    // 无筛选条件时，直接使用store中已优化的sortedAllTrips
    console.log('无筛选：使用store中的sortedAllTrips')
    return tripsStore.sortedAllTrips
  }
})

// 用于跟踪是否有筛选条件
const hasFilters = ref(false)

// 检查是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return hasFilters.value
})

// 计算当前显示的行程数量
const currentTripCount = computed(() => {
  const trips = hasActiveFilters.value ? filteredTrips.value : tripsStore.trips
  return trips.length
})

// 计算当前显示的总花费
const currentTotalSpent = computed(() => {
  const trips = hasActiveFilters.value ? filteredTrips.value : tripsStore.trips
  return trips.reduce((total, trip) => total + trip.price, 0)
})

function handleFiltersChanged(trips: TripRecord[], hasActiveFilters: boolean) {
  filteredTrips.value = trips
  hasFilters.value = hasActiveFilters
}

function loadSampleData() {
  tripsStore.loadSampleData()
}

onMounted(() => {
  tripsStore.loadFromStorage()
})
</script>