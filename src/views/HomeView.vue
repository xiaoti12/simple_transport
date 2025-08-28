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
            <button @click="resetData" class="text-red-500 text-sm">重置数据(调试)</button>
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
  // 如果有筛选条件活跃，需要重新处理筛选后的数据
  if (hasActiveFilters.value) {
    const trips = filteredTrips.value
    console.log('筛选模式：处理筛选后的行程数据，筛选后行程数:', trips.length)
    
    // 首先收集已经有缓存关联的往返行程
    const cachedRoundTrips = new Map<string, { outbound?: typeof trips[0], return?: typeof trips[0] }>()
    const usedTripIds = new Set<string>()
    
    trips.forEach(trip => {
      if (trip.roundTrip) {
        const linkedTripId = trip.roundTrip.linkedTripId
        // 检查关联的行程是否也在筛选结果中
        const linkedTrip = trips.find(t => t.id === linkedTripId)
        if (linkedTrip) {
          if (!cachedRoundTrips.has(linkedTripId)) {
            cachedRoundTrips.set(linkedTripId, {})
          }
          const roundTrip = cachedRoundTrips.get(linkedTripId)!
          if (trip.roundTrip.type === 'outbound') {
            roundTrip.outbound = trip
          } else {
            roundTrip.return = trip
          }
          usedTripIds.add(trip.id)
        }
      }
    })

    const roundTripList: Array<{
      outbound: typeof trips[0]
      return: typeof trips[0]
      totalPrice: number
      route: string
    }> = []

    // 处理完整的缓存往返行程
    cachedRoundTrips.forEach((roundTrip) => {
      if (roundTrip.outbound && roundTrip.return) {
        console.log(`筛选模式：使用缓存往返行程: ${roundTrip.outbound.departure.city} ⇄ ${roundTrip.outbound.arrival.city}`)
        roundTripList.push({
          outbound: roundTrip.outbound,
          return: roundTrip.return,
          totalPrice: roundTrip.outbound.price + roundTrip.return.price,
          route: `${roundTrip.outbound.departure.city} ⇄ ${roundTrip.outbound.arrival.city}`
        })
      }
    })
    
    // 处理没有缓存关联的单程行程
    const singleTrips = trips.filter(trip => !usedTripIds.has(trip.id))
    
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
    
    console.log(`筛选模式：处理完成，往返行程${roundTripList.length}个，单程行程${singleTrips.length}个`)
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

function resetData() {
  tripsStore.resetAndReloadData()
}

onMounted(() => {
  tripsStore.loadFromStorage()
})
</script>