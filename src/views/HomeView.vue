<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-md mx-auto px-4 py-4">
        <h1 class="text-xl font-bold text-gray-900">出行记录</h1>
      </div>
    </header>

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
      <div class="space-y-3">
        <!-- 往返行程 -->
        <RoundTripCard
          v-for="(roundTrip, index) in tripsStore.roundTrips.roundTrips"
          :key="`round-${index}`"
          :outbound="roundTrip.outbound"
          :return-trip="roundTrip.return"
          @delete="handleDeleteTrip"
        />
        
        <!-- 单程行程 -->
        <TripCard 
          v-for="trip in tripsStore.singleTrips" 
          :key="trip.id" 
          :trip="trip"
          @delete="handleDeleteTrip"
        />
        
        <div v-if="tripsStore.trips.length === 0" class="text-center py-12">
          <div class="text-gray-400 text-lg mb-2">📱</div>
          <p class="text-gray-500 mb-4">还没有出行记录</p>
          <div class="space-y-2">
            <RouterLink to="/add" class="block text-blue-500 text-sm">添加第一条记录</RouterLink>
            <button @click="loadSampleData" class="text-green-500 text-sm">加载示例数据</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTripsStore } from '@/stores/trips'
import TripCard from '@/components/TripCard.vue'
import RoundTripCard from '@/components/RoundTripCard.vue'
import BottomNavigation from '@/components/BottomNavigation.vue'

const tripsStore = useTripsStore()

function handleDeleteTrip(id: string) {
  if (confirm('确定删除这条记录吗？')) {
    tripsStore.deleteTrip(id)
  }
}

function loadSampleData() {
  tripsStore.loadSampleData()
}

onMounted(() => {
  tripsStore.loadFromStorage()
})
</script>