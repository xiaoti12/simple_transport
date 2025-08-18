<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        <button @click="goBack" class="text-blue-500 text-lg">← 返回</button>
        <h1 class="text-xl font-bold text-gray-900">出行详情</h1>
        <button @click="saveChanges" class="text-green-500 font-medium" :disabled="saving">
          {{ saving ? '保存中...' : (hasChanges ? '保存' : '已保存') }}
        </button>
      </div>
    </header>

    <!-- 详情内容 -->
    <div class="max-w-md mx-auto px-4 py-6" v-if="trip">
      <!-- 出行卡片 -->
      <div class="trip-card mb-6">
        <div class="flex">
          <!-- 日期区域 -->
          <div class="p-4 bg-gray-50 min-w-[80px] text-center border-r border-gray-200 flex flex-col justify-center">
            <div class="text-2xl font-bold text-gray-800">{{ formatDateShort(trip.date) }}</div>
            <div class="text-sm text-gray-600">{{ formatYear(trip.date) }}</div>
          </div>
          
          <!-- 主要内容 -->
          <div class="flex-1 p-4 relative">
            <!-- 价格 -->
            <div class="absolute top-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-full text-sm font-semibold">
              ¥<span class="editable-field inline-block min-w-[50px]" @click="startEdit('price', $event)">{{ trip.price }}</span>
            </div>
            
            <!-- 航空公司信息 -->
            <div class="flex items-center gap-3 mb-4">
              <div class="airline-logo" :style="{ background: getAirlineColor() }">
                {{ getAirlineShort() }}
              </div>
              <div>
                <div class="font-semibold text-gray-800 editable-field" @click="startEdit('airline', $event)">
                  {{ trip.airline || '航空公司' }}
                </div>
                <div class="text-sm text-gray-600 editable-field" @click="startEdit('flightNumber', $event)">
                  {{ trip.flightNumber || '航班号' }}
                </div>
              </div>
              <div class="ml-auto">
                <div class="status-toggle px-3 py-1 rounded-full text-xs font-medium" 
                     :class="statusClasses" @click="toggleStatus">
                  <span>{{ trip.status === 'used' ? '✓' : '+' }}</span> 
                  {{ trip.status === 'used' ? '已使用' : '未使用' }}
                </div>
              </div>
            </div>
            
            <!-- 航线信息 -->
            <div class="space-y-3">
              <!-- 出发 -->
              <div class="flex items-center gap-3">
                <div class="route-indicator departure"></div>
                <div class="flex items-center gap-4 flex-1">
                  <div class="text-xl font-bold text-gray-800 min-w-[60px] editable-field" 
                       @click="startEdit('departure.time', $event)">
                    {{ formatTime(trip.departure.time) }}
                  </div>
                  <div class="text-gray-800">
                    <span class="font-medium editable-field" @click="startEdit('departure.city', $event)">
                      {{ trip.departure.city }}
                    </span>
                    <span class="text-gray-600 text-sm ml-2 editable-field" 
                          @click="startEdit('departure.station', $event)">
                      {{ getTerminalInfo(trip.departure.station) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- 到达 -->
              <div class="flex items-center gap-3">
                <div class="route-indicator arrival"></div>
                <div class="flex items-center gap-4 flex-1">
                  <div class="text-xl font-bold text-gray-800 min-w-[60px] editable-field" 
                       @click="startEdit('arrival.time', $event)">
                    {{ formatTime(trip.arrival.time) }}
                  </div>
                  <div class="text-gray-800">
                    <span class="font-medium editable-field" @click="startEdit('arrival.city', $event)">
                      {{ trip.arrival.city }}
                    </span>
                    <span class="text-gray-600 text-sm ml-2 editable-field" 
                          @click="startEdit('arrival.station', $event)">
                      {{ getTerminalInfo(trip.arrival.station) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 详细信息 -->
      <div class="space-y-4">
        <!-- 出行日期 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="text-sm text-gray-600 mb-2">出行日期</div>
          <input type="date" v-model="trip.date" @change="markChanged" 
                 class="w-full p-2 border border-gray-300 rounded-lg">
        </div>
        
        <!-- 出行类型 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="text-sm text-gray-600 mb-2">出行方式</div>
          <select v-model="trip.type" @change="markChanged" 
                  class="w-full p-2 border border-gray-300 rounded-lg">
            <option value="flight">飞机</option>
            <option value="train">火车</option>
          </select>
        </div>
        
        <!-- 备注信息 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="text-sm text-gray-600 mb-2">备注</div>
          <textarea v-model="notes" @input="markChanged" 
                    class="w-full p-2 border border-gray-300 rounded-lg resize-none" 
                    rows="3" placeholder="添加备注信息..."></textarea>
        </div>
        
        <!-- 创建时间 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="text-sm text-gray-600 mb-2">创建时间</div>
          <div class="text-sm text-gray-500">
            {{ formatDateTime(trip.createdAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-gray-500">加载中...</div>
    </div>

    <!-- 浮动按钮 -->
    <button class="fab-button" @click="showMoreOptions" title="更多选项">
      ⋯
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTripsStore } from '@/stores/trips'
import type { TripRecord } from '@/types'

const route = useRoute()
const router = useRouter()
const tripsStore = useTripsStore()

const trip = ref<TripRecord | null>(null)
const notes = ref('')
const hasChanges = ref(false)
const saving = ref(false)
const isEditing = ref(false)

const statusClasses = computed(() => {
  if (!trip.value) return ''
  return trip.value.status === 'used' 
    ? 'bg-gray-200 text-gray-700' 
    : 'bg-green-100 text-green-700'
})

onMounted(() => {
  const tripId = route.params.id as string
  if (tripId) {
    const foundTrip = tripsStore.getTripById(tripId)
    if (foundTrip) {
      trip.value = { ...foundTrip }
      notes.value = (foundTrip as any).notes || ''
    } else {
      router.push('/')
    }
  }
})

watch(trip, () => {
  if (trip.value) {
    markChanged()
  }
}, { deep: true })

function formatDateShort(dateStr: string) {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

function formatYear(dateStr: string) {
  const date = new Date(dateStr)
  return String(date.getFullYear())
}

function formatTime(timeStr: string) {
  if (timeStr.includes('T')) {
    const date = new Date(timeStr)
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }
  return timeStr
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

function getAirlineColor() {
  if (!trip.value) return '#667eea'
  if (trip.value.type === 'train') {
    return '#28a745'
  }
  return '#667eea'
}

function getAirlineShort() {
  if (!trip.value) return '✈️'
  if (trip.value.type === 'train') return '🚄'
  
  if (trip.value.airline) {
    const airlineNames: Record<string, string> = {
      '中国国际航空': '国',
      '中国东方航空': '东',
      '中国南方航空': '南',
      '海南航空': '海',
      '深圳航空': '深',
      '四川航空': '川',
      '厦门航空': '厦',
      '春秋航空': '春',
      '吉祥航空': '吉',
      '山东航空': '鲁',
      '天津航空': '津',
      '首都航空': '首',
      '西部航空': '西',
      '祥鹏航空': '祥',
      '九元航空': '九',
      '联合航空': '联'
    }
    
    for (const [airline, shortName] of Object.entries(airlineNames)) {
      if (trip.value.airline.includes(airline.slice(-3))) {
        return shortName
      }
    }
    
    const firstChar = trip.value.airline.charAt(0)
    if (/[\u4e00-\u9fff]/.test(firstChar)) {
      return firstChar
    }
  }
  
  return '✈️'
}

function getTerminalInfo(station: string) {
  const cityPrefixes = ['北京', '上海', '重庆', '广州', '深圳', '成都', '杭州', '西安', '南京', '武汉', '天津', '苏州']
  
  let cleanStation = station
  for (const city of cityPrefixes) {
    if (station.startsWith(city)) {
      cleanStation = station.slice(city.length)
      break
    }
  }
  
  return cleanStation || ''
}

function startEdit(field: string, event: Event) {
  if (isEditing.value) return
  
  const element = event.target as HTMLElement
  const currentValue = element.textContent || ''
  
  isEditing.value = true
  element.classList.add('editing')
  
  const input = document.createElement('input')
  input.type = 'text'
  input.value = currentValue
  input.className = 'edit-input'
  
  element.innerHTML = ''
  element.appendChild(input)
  
  input.focus()
  input.select()
  
  const finishEdit = () => {
    const newValue = input.value.trim()
    if (newValue && newValue !== currentValue) {
      updateTripField(field, newValue)
      markChanged()
    }
    
    element.textContent = newValue || currentValue
    element.classList.remove('editing')
    isEditing.value = false
  }
  
  input.addEventListener('blur', finishEdit)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      finishEdit()
    } else if (e.key === 'Escape') {
      element.textContent = currentValue
      element.classList.remove('editing')
      isEditing.value = false
    }
  })
}

function updateTripField(field: string, value: string) {
  if (!trip.value) return
  
  if (field.includes('.')) {
    const [section, subField] = field.split('.')
    if (section === 'departure' || section === 'arrival') {
      ;(trip.value[section] as any)[subField] = value
    }
  } else {
    if (field === 'price') {
      ;(trip.value as any)[field] = parseInt(value) || 0
    } else {
      ;(trip.value as any)[field] = value
    }
  }
}

function toggleStatus() {
  if (!trip.value) return
  trip.value.status = trip.value.status === 'used' ? 'unused' : 'used'
  markChanged()
}

function markChanged() {
  hasChanges.value = true
}

async function saveChanges() {
  if (!trip.value || !hasChanges.value || saving.value) return
  
  saving.value = true
  
  try {
    // 添加备注字段
    const tripToSave = {
      ...trip.value,
      notes: notes.value
    }
    
    await tripsStore.updateTrip(tripToSave)
    hasChanges.value = false
    
    setTimeout(() => {
      saving.value = false
    }, 500)
  } catch (error) {
    console.error('保存失败:', error)
    saving.value = false
  }
}

function goBack() {
  if (hasChanges.value) {
    if (confirm('有未保存的更改，确定要离开吗？')) {
      router.back()
    }
  } else {
    router.back()
  }
}

function showMoreOptions() {
  const options = [
    '复制出行信息',
    '分享给朋友', 
    '删除这条记录',
    '导出为PDF'
  ]
  
  const choice = prompt('选择操作：\n' + options.map((opt, i) => `${i + 1}. ${opt}`).join('\n'))
  
  if (choice) {
    const index = parseInt(choice) - 1
    if (index === 2 && trip.value) { // 删除
      if (confirm('确定要删除这条记录吗？此操作不可撤销。')) {
        tripsStore.deleteTrip(trip.value.id)
        router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.trip-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.editable-field {
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 4px 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.editable-field:hover {
  background-color: #f8f9fa;
  border-color: #e9ecef;
}

.editable-field.editing {
  background-color: white;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  cursor: text;
}

.edit-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
}

/* 价格编辑时的特殊样式 - 更具体的选择器 */
.bg-blue-500 .editable-field.editing {
  background: white !important;
  color: #1e40af !important;
  border-radius: 4px;
  padding: 2px 4px;
}

.bg-blue-500 .editable-field.editing .edit-input {
  color: #1e40af !important;
  background: transparent !important;
}

.status-toggle {
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-toggle:hover {
  transform: scale(1.05);
}

.airline-logo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.route-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #28a745;
  background: white;
}

.route-indicator.departure {
  background: transparent;
}

.route-indicator.arrival {
  background: #28a745;
}

.fab-button {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.fab-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 123, 255, 0.5);
}
</style>