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
    <div class="max-w-md mx-auto px-4 py-6">
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="text-2xl font-bold text-blue-600">{{ tripsStore.trips.length }}</div>
          <div class="text-sm text-gray-500">总行程</div>
        </div>
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="text-2xl font-bold text-green-600">¥{{ tripsStore.totalSpent.toLocaleString() }}</div>
          <div class="text-sm text-gray-500">总花费</div>
        </div>
      </div>

      <!-- 出行记录列表 -->
      <div class="space-y-3 pb-20">
        <!-- 按时间倒序显示往返行程和单程行程 -->
        <template v-for="item in displayedTrips" :key="item.type === 'round' ? `round-${item.data.outbound.id}` : item.data.id">
          <!-- 往返行程 -->
          <RoundTripCard
            v-if="item.type === 'round'"
            :outbound="item.data.outbound"
            :return-trip="item.data.return"
          />
          
          <!-- 单程行程 -->
          <TripCard 
            v-else
            :trip="item.data"
          />
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
  // 如果有筛选条件活跃，使用筛选结果，否则使用所有行程
  const trips = hasActiveFilters.value ? filteredTrips.value : tripsStore.trips

  // 检测往返行程的逻辑（从trips store复制过来）
  const roundTripList = []
  const usedIndexes = new Set<number>()
  
  for (let i = 0; i < trips.length; i++) {
    if (usedIndexes.has(i)) continue
    
    const trip1 = trips[i]
    const departure1 = trip1.departure.city
    const arrival1 = trip1.arrival.city
    
    for (let j = i + 1; j < trips.length; j++) {
      if (usedIndexes.has(j)) continue
      
      const trip2 = trips[j]
      const departure2 = trip2.departure.city
      const arrival2 = trip2.arrival.city
      
      // 检查是否为往返（A→B 和 B→A）
      if ((departure1 === arrival2 && arrival1 === departure2)) {
        // 按时间排序，确定去程和返程
        const earlierTrip = new Date(trip1.date) <= new Date(trip2.date) ? trip1 : trip2
        const laterTrip = new Date(trip1.date) <= new Date(trip2.date) ? trip2 : trip1
        
        roundTripList.push({
          outbound: earlierTrip,
          return: laterTrip,
          totalPrice: trip1.price + trip2.price,
          route: `${earlierTrip.departure.city} ⇄ ${earlierTrip.arrival.city}`
        })
        usedIndexes.add(i)
        usedIndexes.add(j)
        break
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
  
  // 按时间倒序排序（最新的在前面）
  return allItems.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
})

// 用于跟踪是否有筛选条件
const hasFilters = ref(false)

// 检查是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return hasFilters.value
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