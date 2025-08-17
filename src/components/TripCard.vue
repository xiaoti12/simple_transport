<template>
  <div class="bg-white rounded-lg shadow-sm border p-4">
    <!-- 头部信息 -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <div class="text-2xl">{{ trip.type === 'flight' ? '✈️' : '🚄' }}</div>
        <span class="text-sm font-medium text-gray-900">
          {{ trip.type === 'flight' ? '航班' : '火车' }}
        </span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-lg font-bold text-blue-600">¥{{ trip.price.toLocaleString() }}</span>
        <button 
          @click="$emit('delete', trip.id)"
          class="text-red-400 hover:text-red-600 p-1"
        >
          🗑️
        </button>
      </div>
    </div>

    <!-- 行程信息 -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-sm">
        <div class="flex-1">
          <div class="font-medium text-gray-900">{{ trip.departure.city }}</div>
          <div class="text-gray-500">{{ trip.departure.station }}</div>
          <div class="text-blue-600">{{ trip.departure.time }}</div>
        </div>
        
        <div class="px-3">
          <div class="w-8 h-px bg-gray-300 relative">
            <div class="absolute right-0 top-0 w-2 h-2 bg-gray-300 rounded-full transform translate-x-1 -translate-y-0.5"></div>
          </div>
        </div>
        
        <div class="flex-1 text-right">
          <div class="font-medium text-gray-900">{{ trip.arrival.city }}</div>
          <div class="text-gray-500">{{ trip.arrival.station }}</div>
          <div class="text-blue-600">{{ trip.arrival.time }}</div>
        </div>
      </div>
      
      <!-- 日期和状态 -->
      <div class="flex items-center justify-between pt-2 border-t border-gray-100">
        <span class="text-sm text-gray-500">{{ formatDate(trip.date) }}</span>
        <span 
          class="px-2 py-1 rounded-full text-xs"
          :class="trip.status === 'used' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'"
        >
          {{ trip.status === 'used' ? '已使用' : '未使用' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TripRecord } from '@/types'

defineProps<{
  trip: TripRecord
}>()

defineEmits<{
  delete: [id: string]
}>()

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>