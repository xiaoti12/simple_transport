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
          :key="item.type === 'round' ? `round-${item.data.pairKey || item.data.outbound.id}` : item.data.id">
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
  if (hasActiveFilters.value) {
    const trips = filteredTrips.value
    console.log('筛选模式：保持往返关联，筛选后行程数:', trips.length)
    
    // 创建筛选后行程的ID集合，用于快速查找
    const filteredTripIds = new Set(trips.map(trip => trip.id))
    
    const allItems: Array<{
      type: 'round' | 'single'
      data: any
      sortDate: Date
    }> = []
    
    // 用于跟踪已处理的行程ID
    const processedTripIds = new Set<string>()
    
    // 处理往返行程：只有当往返行程的两段都在筛选结果中时，才作为往返行程显示
    const { roundTrips: roundTripsList } = tripsStore.roundTrips
    roundTripsList.forEach(roundTrip => {
      const outboundInFiltered = filteredTripIds.has(roundTrip.outbound.id)
      const returnInFiltered = filteredTripIds.has(roundTrip.return.id)
      
      if (outboundInFiltered && returnInFiltered) {
        // 往返行程的两段都在筛选结果中，作为往返行程显示
        allItems.push({
          type: 'round',
          data: roundTrip,
          sortDate: new Date(roundTrip.outbound.date)
        })
        processedTripIds.add(roundTrip.outbound.id)
        processedTripIds.add(roundTrip.return.id)
        console.log(`筛选模式：保留往返行程 ${roundTrip.outbound.departure.city} ⇄ ${roundTrip.outbound.arrival.city}`)
      } else {
        // 只有其中一段在筛选结果中，将在筛选结果中的行程作为单程显示
        if (outboundInFiltered && !processedTripIds.has(roundTrip.outbound.id)) {
          allItems.push({
            type: 'single',
            data: roundTrip.outbound,
            sortDate: new Date(roundTrip.outbound.date)
          })
          processedTripIds.add(roundTrip.outbound.id)
          console.log(`筛选模式：往返行程的去程作为单程显示 ${roundTrip.outbound.departure.city} → ${roundTrip.outbound.arrival.city}`)
        }
        if (returnInFiltered && !processedTripIds.has(roundTrip.return.id)) {
          allItems.push({
            type: 'single',
            data: roundTrip.return,
            sortDate: new Date(roundTrip.return.date)
          })
          processedTripIds.add(roundTrip.return.id)
          console.log(`筛选模式：往返行程的返程作为单程显示 ${roundTrip.return.departure.city} → ${roundTrip.return.arrival.city}`)
        }
      }
    })
    
    // 处理剩余的单程行程
    trips.forEach(trip => {
      if (!processedTripIds.has(trip.id)) {
        allItems.push({
          type: 'single',
          data: trip,
          sortDate: new Date(trip.date)
        })
        console.log(`筛选模式：添加单程行程 ${trip.departure.city} → ${trip.arrival.city}`)
      }
    })
    
    console.log(`筛选模式：处理完成，${allItems.filter(item => item.type === 'round').length}个往返行程，${allItems.filter(item => item.type === 'single').length}个单程行程`)
    // 按时间倒序排序（最新的在前面）
    return allItems.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
  } else {
    // 无筛选条件时，直接使用store中已优化的sortedAllTrips（包含往返行程组合）
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

function resetData() {
  tripsStore.resetAndReloadData()
}

onMounted(() => {
  tripsStore.loadFromStorage()
})
</script>