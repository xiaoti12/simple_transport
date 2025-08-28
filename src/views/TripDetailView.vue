<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        <button @click="goBack" class="text-blue-500 text-lg">← 返回</button>
        <h1 class="text-xl font-bold text-gray-900">出行详情</h1>
        <button 
          v-if="hasChanges || saving || saved" 
          @click="saveChanges" 
          class="text-green-500 font-medium" 
          :disabled="saving || saved"
        >
          {{ saving ? '保存中...' : (saved ? '已保存' : '保存') }}
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

        <!-- 出行人信息 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="text-sm text-gray-600 mb-3">出行人</div>
          <div v-if="trip.travelers && trip.travelers.length > 0" class="space-y-2">
            <!-- 当前出行人显示 -->
            <div class="flex flex-wrap gap-2 mb-3">
              <span 
                v-for="traveler in trip.travelers" 
                :key="traveler"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
              >
                👤 {{ traveler }}
              </span>
            </div>
            
            <!-- 编辑出行人按钮 -->
            <button 
              @click="showTravelersEditor = !showTravelersEditor"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {{ showTravelersEditor ? '取消编辑' : '编辑出行人' }}
            </button>

            <!-- 出行人编辑器 -->
            <div v-if="showTravelersEditor" class="mt-3 p-3 bg-gray-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-2">选择出行人：</div>
              <div class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <label 
                    v-for="traveler in tripsStore.travelerConfig.availableTravelers" 
                    :key="traveler"
                    class="flex items-center cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      v-model="selectedTravelers"
                      :value="traveler"
                      @change="updateTravelers"
                      class="sr-only"
                    />
                    <div 
                      class="px-3 py-2 rounded-lg border-2 text-sm transition-colors"
                      :class="selectedTravelers.includes(traveler) 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'"
                    >
                      <span class="mr-1">{{ selectedTravelers.includes(traveler) ? '✓' : '' }}</span>
                      {{ traveler }}
                    </div>
                  </label>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  请至少选择一个出行人
                </p>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500 text-sm">
            未设置出行人信息
          </div>
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
        
        <!-- 危险操作区域 -->
        <div class="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-400">
          <div class="text-sm text-gray-600 mb-3">危险操作</div>
          <button 
            @click="confirmDeleteTrip" 
            class="delete-trip-btn"
            title="删除这条出行记录"
          >
            🗑️ 删除出行记录
          </button>
          <div class="text-xs text-gray-500 mt-2">删除后无法恢复，请谨慎操作</div>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
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
const saved = ref(false)
const isEditing = ref(false)
const isInitialized = ref(false)
const showTravelersEditor = ref(false)
const selectedTravelers = ref<string[]>([])


onMounted(async () => {
  // 确保页面滚动到顶部
  await nextTick()
  window.scrollTo(0, 0)
  
  const tripId = route.params.id as string
  if (tripId) {
    const foundTrip = tripsStore.getTripById(tripId)
    if (foundTrip) {
      trip.value = { ...foundTrip }
      notes.value = (foundTrip as any).notes || ''
      
      // 初始化出行人选择，兼容旧数据
      if (foundTrip.travelers && Array.isArray(foundTrip.travelers)) {
        selectedTravelers.value = [...foundTrip.travelers]
      } else {
        // 为旧数据设置默认出行人
        selectedTravelers.value = ['我']
        trip.value.travelers = ['我']
      }
      
      // 延迟标记为已初始化，避免初始赋值触发 markChanged
      setTimeout(() => {
        isInitialized.value = true
      }, 0)
    } else {
      router.push('/')
    }
  }
})

watch(trip, () => {
  if (trip.value && isInitialized.value) {
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


function markChanged() {
  hasChanges.value = true
  saved.value = false // 清除已保存状态
}

function updateTravelers() {
  if (!trip.value) return
  
  // 确保至少选择一个出行人
  let travelers = [...selectedTravelers.value]
  if (travelers.length === 0) {
    // 如果没有选择任何人，默认选择"我"
    travelers = ['我']
    selectedTravelers.value = travelers
  }
  
  trip.value.travelers = travelers
  markChanged()
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
    saving.value = false
    saved.value = true
    
    // 1.5秒后隐藏"已保存"按钮
    setTimeout(() => {
      saved.value = false
    }, 1500)
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

function confirmDeleteTrip() {
  if (!trip.value) return
  
  const confirmed = confirm(`确定要删除这条出行记录吗？\n\n出发: ${trip.value.departure.city} → ${trip.value.arrival.city}\n日期: ${trip.value.date}\n\n此操作无法撤销！`)
  
  if (confirmed) {
    tripsStore.deleteTrip(trip.value.id)
    router.push('/')
  }
}

function showMoreOptions() {
  const options = [
    '复制出行信息',
    '分享给朋友', 
    '导出为PDF'
  ]
  
  const choice = prompt('选择操作：\n' + options.map((opt, i) => `${i + 1}. ${opt}`).join('\n'))
  
  if (choice) {
    const index = parseInt(choice) - 1
    // 其他功能可以在这里实现
    console.log('选择了:', options[index])
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

.delete-trip-btn {
  width: 100%;
  padding: 12px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.delete-trip-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.delete-trip-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
}
</style>