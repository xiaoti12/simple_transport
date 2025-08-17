<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-md mx-auto px-4 py-4 flex items-center">
        <button @click="$router.back()" class="text-2xl mr-3">←</button>
        <h1 class="text-xl font-bold text-gray-900">添加出行记录</h1>
      </div>
    </header>

    <div class="max-w-md mx-auto px-4 py-6">
      <!-- 添加方式选择 -->
      <div class="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <h2 class="text-lg font-medium mb-4">选择添加方式</h2>
        <div class="grid grid-cols-2 gap-3">
          <button 
            @click="mode = 'manual'"
            class="flex flex-col items-center p-4 rounded-lg border-2"
            :class="mode === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
          >
            <div class="text-2xl mb-2">✏️</div>
            <span class="text-sm">手动录入</span>
          </button>
          <button 
            @click="mode = 'ai'"
            class="flex flex-col items-center p-4 rounded-lg border-2"
            :class="mode === 'ai' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
          >
            <div class="text-2xl mb-2">🤖</div>
            <span class="text-sm">AI识别</span>
          </button>
        </div>
      </div>

      <!-- 手动录入表单 -->
      <div v-if="mode === 'manual'" class="bg-white rounded-lg p-4 shadow-sm">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- 交通方式 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">交通方式</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button"
                @click="form.type = 'train'"
                class="flex items-center justify-center p-3 rounded-lg border-2"
                :class="form.type === 'train' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
              >
                🚄 火车
              </button>
              <button 
                type="button"
                @click="form.type = 'flight'"
                class="flex items-center justify-center p-3 rounded-lg border-2"
                :class="form.type === 'flight' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
              >
                ✈️ 飞机
              </button>
            </div>
          </div>

          <!-- 出发信息 -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium mb-3 text-green-600">🚀 出发</h3>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <input
                  v-model="form.departure.city"
                  placeholder="出发城市"
                  class="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  v-model="form.departure.time"
                  type="datetime-local"
                  class="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <input
                v-model="form.departure.station"
                :placeholder="form.type === 'flight' ? '出发机场' : '出发车站'"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <!-- 到达信息 -->
          <div class="border rounded-lg p-4">
            <h3 class="font-medium mb-3 text-red-600">🏁 到达</h3>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <input
                  v-model="form.arrival.city"
                  placeholder="到达城市"
                  class="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <input
                  v-model="form.arrival.time"
                  type="datetime-local"
                  class="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <input
                v-model="form.arrival.station"
                :placeholder="form.type === 'flight' ? '到达机场' : '到达车站'"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <!-- 其他信息 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">价格 (元)</label>
              <input
                v-model.number="form.price"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="unused">未使用</option>
                <option value="used">已使用</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">出行日期</label>
            <input
              v-model="form.date"
              type="date"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            保存记录
          </button>
        </form>
      </div>

      <!-- AI识别 (占位符) -->
      <div v-else-if="mode === 'ai'" class="bg-white rounded-lg p-4 shadow-sm text-center">
        <div class="text-6xl mb-4">🚧</div>
        <h3 class="text-lg font-medium mb-2">AI识别功能</h3>
        <p class="text-gray-500 mb-4">即将推出，敬请期待</p>
        <button 
          @click="mode = 'manual'"
          class="text-blue-600 font-medium"
        >
          先使用手动录入 →
        </button>
      </div>
    </div>

    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useTripsStore } from '@/stores/trips'
import BottomNavigation from '@/components/BottomNavigation.vue'
import type { TripRecord } from '@/types'

const router = useRouter()
const tripsStore = useTripsStore()

const mode = ref<'manual' | 'ai'>('manual')

const form = reactive<Omit<TripRecord, 'id' | 'createdAt'>>({
  type: 'train',
  date: new Date().toISOString().split('T')[0],
  departure: {
    time: '',
    city: '',
    station: ''
  },
  arrival: {
    time: '',
    city: '',
    station: ''
  },
  price: 0,
  status: 'unused'
})

function handleSubmit() {
  tripsStore.addTrip(form)
  router.push('/')
}
</script>