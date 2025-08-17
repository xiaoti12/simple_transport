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
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
                <div class="relative">
                  <input
                    v-model="form.departure.time"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    :class="{'text-gray-400': !form.departure.time}"
                    required
                  />
                  <label v-if="!form.departure.time" class="absolute left-3 top-2 text-gray-400 text-sm pointer-events-none">出发时间</label>
                </div>
              </div>
              <input
                v-model="form.departure.station"
                :placeholder="form.type === 'flight' ? '出发机场' : '出发车站'"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                  class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
                <div class="relative">
                  <input
                    v-model="form.arrival.time"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    :class="{'text-gray-400': !form.arrival.time}"
                    required
                  />
                  <label v-if="!form.arrival.time" class="absolute left-3 top-2 text-gray-400 text-sm pointer-events-none">到达时间</label>
                </div>
              </div>
              <input
                v-model="form.arrival.station"
                :placeholder="form.type === 'flight' ? '到达机场' : '到达车站'"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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

<style scoped>
/* 移动端输入框优化 */
@media (max-width: 480px) {
  .grid {
    gap: 8px;
  }
  
  input, select {
    font-size: 16px !important; /* 防止iOS缩放 */
    min-height: 44px; /* 确保触摸目标足够大 */
  }
  
  input[type="datetime-local"] {
    -webkit-appearance: none;
    appearance: none;
  }
  
  /* 日期时间选择器样式优化 */
  input[type="datetime-local"]::-webkit-datetime-edit {
    color: #374151;
    padding: 0;
  }
  
  input[type="datetime-local"]::-webkit-datetime-edit-text {
    color: #6b7280;
  }
  
  input[type="datetime-local"]::-webkit-datetime-edit-month-field,
  input[type="datetime-local"]::-webkit-datetime-edit-day-field,
  input[type="datetime-local"]::-webkit-datetime-edit-year-field,
  input[type="datetime-local"]::-webkit-datetime-edit-hour-field,
  input[type="datetime-local"]::-webkit-datetime-edit-minute-field {
    background: transparent;
    border: none;
    outline: none;
    color: #374151;
  }
  
  input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    background: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3e%3crect x='3' y='4' width='18' height='18' rx='2' ry='2'/%3e%3cline x1='16' y1='2' x2='16' y2='6'/%3e%3cline x1='8' y1='2' x2='8' y2='6'/%3e%3cline x1='3' y1='10' x2='21' y2='10'/%3e%3c/svg%3e") no-repeat;
    background-size: 16px 16px;
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  /* 输入框聚焦时的样式 */
  input:focus, select:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  /* 边框容器优化 */
  .border.rounded-lg {
    border: 2px solid #e5e7eb;
    box-shadow: none;
  }
  
  /* 确保容器不会溢出 */
  .max-w-md {
    max-width: 100%;
    padding-left: 12px;
    padding-right: 12px;
  }
}

/* 时间输入框占位符样式 */
.relative label {
  transition: all 0.2s ease;
}

input[type="datetime-local"]:focus + label,
input[type="datetime-local"]:not(:placeholder-shown) + label {
  opacity: 0;
  transform: translateY(-100%);
}

/* Chrome日期时间输入框兼容性优化 */
input[type="datetime-local"] {
  position: relative;
}

input[type="datetime-local"]::-webkit-inner-spin-button,
input[type="datetime-local"]::-webkit-clear-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 确保日期时间选择器在所有浏览器中都有合理的样式 */
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  opacity: 0.6;
  cursor: pointer;
}

input[type="date"]:hover::-webkit-calendar-picker-indicator,
input[type="datetime-local"]:hover::-webkit-calendar-picker-indicator {
  opacity: 1;
}
</style>