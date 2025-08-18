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
                <div class="relative">
                  <input
                    v-model="departureCityInput"
                    @input="onDepartureCityInput"
                    @focus="showDepartureCityList = true"
                    @blur="onDepartureCityBlur"
                    placeholder="出发城市"
                    class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
                    required
                  />
                  <div v-if="showDepartureCityList && filteredDepartureCities.length > 0" 
                       class="city-dropdown">
                    <div v-for="city in filteredDepartureCities.slice(0, 8)" 
                         :key="city"
                         @click="selectDepartureCity(city)"
                         class="city-option">
                      {{ city }}
                    </div>
                  </div>
                </div>
                <div class="relative time-input-wrapper">
                  <input
                    v-model="form.departure.time"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm time-input"
                    :class="{'text-gray-400': !form.departure.time}"
                    required
                  />
                  <div class="time-input-hint">
                    <span class="time-icon">🕰️</span>
                    <span class="time-text">点击选择时间</span>
                  </div>
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
                <div class="relative">
                  <input
                    v-model="arrivalCityInput"
                    @input="onArrivalCityInput"
                    @focus="showArrivalCityList = true"
                    @blur="onArrivalCityBlur"
                    placeholder="到达城市"
                    class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
                    required
                  />
                  <div v-if="showArrivalCityList && filteredArrivalCities.length > 0" 
                       class="city-dropdown">
                    <div v-for="city in filteredArrivalCities.slice(0, 8)" 
                         :key="city"
                         @click="selectArrivalCity(city)"
                         class="city-option">
                      {{ city }}
                    </div>
                  </div>
                </div>
                <div class="relative time-input-wrapper">
                  <input
                    v-model="form.arrival.time"
                    type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm time-input"
                    :class="{'text-gray-400': !form.arrival.time}"
                    required
                  />
                  <div class="time-input-hint">
                    <span class="time-icon">🕰️</span>
                    <span class="time-text">点击选择时间</span>
                  </div>
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

          <!-- 航班/车次信息 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ form.type === 'flight' ? '航空公司' : '铁路公司' }}
              </label>
              <input
                v-model="form.airline"
                :placeholder="form.type === 'flight' ? '中国东方航空' : '中国国家铁路'"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ form.type === 'flight' ? '航班号' : '车次号' }}
              </label>
              <input
                v-model="form.flightNumber"
                :placeholder="form.type === 'flight' ? 'MU5138' : 'G1234'"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
          </div>


          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            保存记录
          </button>
        </form>
      </div>

      <!-- AI识别 -->
      <div v-else-if="mode === 'ai'" class="bg-white rounded-lg p-4 shadow-sm">
        <div v-if="!hasAIConfig" class="text-center">
          <div class="text-4xl mb-4">⚙️</div>
          <h3 class="text-lg font-medium mb-2">需要配置AI服务</h3>
          <p class="text-gray-500 mb-4">请先在设置中配置AI API信息</p>
          <div class="space-y-2">
            <button 
              @click="$router.push('/settings')"
              class="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              去设置 →
            </button>
            <button 
              @click="mode = 'manual'"
              class="w-full text-blue-600 font-medium"
            >
              先使用手动录入
            </button>
          </div>
        </div>

        <div v-else>
          <h2 class="text-lg font-medium mb-4">🤖 AI票据识别</h2>
          
          <!-- 图片上传组件 -->
          <ImageUpload 
            :is-recognizing="isRecognizing"
            @recognize="handleImageRecognition"
          />

          <!-- 识别结果 -->
          <div v-if="recognitionResults.length > 0" class="mt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-medium text-green-600">
                ✅ 识别完成 ({{recognitionResults.length}}条记录)
              </h3>
              <button
                @click="clearRecognitionResult"
                class="text-sm text-gray-500 hover:text-gray-700"
              >
                重新识别
              </button>
            </div>

            <!-- 多条记录选择器 -->
            <div v-if="recognitionResults.length > 1" class="mb-4">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-sm font-medium text-gray-700">选择记录：</span>
                <div class="flex space-x-1">
                  <button
                    v-for="(result, index) in recognitionResults"
                    :key="index"
                    @click="selectedResultIndex = index"
                    class="px-3 py-1 text-xs rounded-full border"
                    :class="selectedResultIndex === index 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'"
                  >
                    第{{index + 1}}张票
                  </button>
                </div>
              </div>
              
              <!-- 批量操作 -->
              <div class="flex space-x-2 mb-4">
                <button
                  @click="saveAllResults"
                  class="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  保存全部 ({{recognitionResults.length}}条)
                </button>
              </div>
            </div>

            <!-- 识别结果表单 -->
            <form @submit.prevent="handleAISubmit" class="space-y-4">
              <!-- 交通方式 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">交通方式</label>
                <div class="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    @click="recognitionResults[selectedResultIndex].type = 'train'"
                    class="flex items-center justify-center p-3 rounded-lg border-2"
                    :class="recognitionResults[selectedResultIndex].type === 'train' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
                  >
                    🚄 火车
                  </button>
                  <button 
                    type="button"
                    @click="recognitionResults[selectedResultIndex].type = 'flight'"
                    class="flex items-center justify-center p-3 rounded-lg border-2"
                    :class="recognitionResults[selectedResultIndex].type === 'flight' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
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
                      v-model="recognitionResults[selectedResultIndex].departure.city"
                      placeholder="出发城市"
                      class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                    <input
                      v-model="recognitionResults[selectedResultIndex].departure.time"
                      type="datetime-local"
                      class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>
                  <input
                    v-model="recognitionResults[selectedResultIndex].departure.station"
                    :placeholder="recognitionResults[selectedResultIndex].type === 'flight' ? '出发机场' : '出发车站'"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <!-- 到达信息 -->
              <div class="border rounded-lg p-4">
                <h3 class="font-medium mb-3 text-red-600">🏁 到达</h3>
                <div class="space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                    <input
                      v-model="recognitionResults[selectedResultIndex].arrival.city"
                      placeholder="到达城市"
                      class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                    <input
                      v-model="recognitionResults[selectedResultIndex].arrival.time"
                      type="datetime-local"
                      class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      required
                    />
                  </div>
                  <input
                    v-model="recognitionResults[selectedResultIndex].arrival.station"
                    :placeholder="recognitionResults[selectedResultIndex].type === 'flight' ? '到达机场' : '到达车站'"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <!-- 其他信息 -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ recognitionResults[selectedResultIndex].type === 'flight' ? '航空公司' : '铁路公司' }}
                  </label>
                  <input
                    v-model="recognitionResults[selectedResultIndex].airline"
                    :placeholder="recognitionResults[selectedResultIndex].type === 'flight' ? '中国东方航空' : '中国国家铁路'"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    {{ recognitionResults[selectedResultIndex].type === 'flight' ? '航班号' : '车次号' }}
                  </label>
                  <input
                    v-model="recognitionResults[selectedResultIndex].flightNumber"
                    :placeholder="recognitionResults[selectedResultIndex].type === 'flight' ? 'MU5138' : 'G1234'"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">价格 (元)</label>
                  <input
                    v-model.number="recognitionResults[selectedResultIndex].price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                保存当前记录 
                <span v-if="recognitionResults.length > 1">({{selectedResultIndex + 1}}/{{recognitionResults.length}})</span>
              </button>
            </form>
          </div>

          <!-- 错误提示 -->
          <div v-if="recognitionError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center">
              <span class="mr-2">❌</span>
              <span class="text-sm text-red-800">{{ recognitionError }}</span>
            </div>
            <button
              @click="recognitionError = ''"
              class="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    </div>

    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTripsStore } from '@/stores/trips'
import BottomNavigation from '@/components/BottomNavigation.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import { createAIService, getAIConfig } from '@/services/aiService'
import type { TripRecord } from '@/types'

const router = useRouter()
const tripsStore = useTripsStore()

const mode = ref<'manual' | 'ai'>('manual')

// AI识别相关状态
const hasAIConfig = ref(false)
const isRecognizing = ref(false)

// 定义识别结果的完整类型
interface RecognitionResult {
  type: 'flight' | 'train'
  date: string
  departure: {
    time: string
    city: string
    station: string
  }
  arrival: {
    time: string
    city: string
    station: string
  }
  price: number
  airline: string
  flightNumber: string
}

const recognitionResults = ref<RecognitionResult[]>([])
const selectedResultIndex = ref(0)
const recognitionError = ref('')

// 常用城市列表
const commonCities = [
  '北京', '上海', '广州', '深圳', '成都', '重庆', 
  '杭州', '西安', '南京', '武汉', '天津', '苏州',
  '长沙', '郑州', '青岛', '大连', '宁波', '厦门'
]

// 从已有行程中提取城市
const existingCities = computed(() => {
  const cities = new Set<string>()
  tripsStore.trips.forEach(trip => {
    cities.add(trip.departure.city)
    cities.add(trip.arrival.city)
  })
  return Array.from(cities).sort()
})

// 合并并去重的城市列表
const allCities = computed(() => {
  const combined = [...commonCities, ...existingCities.value.filter(city => !commonCities.includes(city))]
  return combined
})

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
  airline: '',
  flightNumber: ''
})

// 城市输入相关状态
const showDepartureCityList = ref(false)
const showArrivalCityList = ref(false)
const departureCityInput = ref(form.departure.city)
const arrivalCityInput = ref(form.arrival.city)

// 城市选择相关函数
function selectDepartureCity(city: string) {
  form.departure.city = city
  departureCityInput.value = city
  showDepartureCityList.value = false
}

function selectArrivalCity(city: string) {
  form.arrival.city = city
  arrivalCityInput.value = city
  showArrivalCityList.value = false
}

function onDepartureCityInput() {
  form.departure.city = departureCityInput.value
  showDepartureCityList.value = departureCityInput.value.length > 0
}

function onArrivalCityInput() {
  form.arrival.city = arrivalCityInput.value
  showArrivalCityList.value = arrivalCityInput.value.length > 0
}

function onDepartureCityBlur() {
  setTimeout(() => showDepartureCityList.value = false, 200)
}

function onArrivalCityBlur() {
  setTimeout(() => showArrivalCityList.value = false, 200)
}

// 过滤城市列表
const filteredDepartureCities = computed(() => {
  if (!departureCityInput.value) return allCities.value
  return allCities.value.filter(city => 
    city.includes(departureCityInput.value)
  )
})

const filteredArrivalCities = computed(() => {
  if (!arrivalCityInput.value) return allCities.value
  return allCities.value.filter(city => 
    city.includes(arrivalCityInput.value)
  )
})

function handleSubmit() {
  // 从出发时间自动提取日期
  if (form.departure.time) {
    form.date = form.departure.time.split('T')[0]
  }
  
  tripsStore.addTrip(form)
  router.push('/')
}

// AI识别处理函数（支持多条数据）
async function handleImageRecognition(file: File) {
  console.log('🖼️ 开始处理图片:', file.name, file.size)
  
  isRecognizing.value = true
  recognitionError.value = ''
  
  try {
    const aiService = createAIService()
    if (!aiService) {
      throw new Error('AI服务配置无效')
    }

    // 转换图片为base64
    const base64 = await fileToBase64(file)
    console.log('📸 图片转换完成，大小:', base64.length)

    // 调用AI识别（多条数据）
    const results = await aiService.recognizeTickets(base64)
    console.log('🎯 AI识别结果:', results)

    // 转换为UI需要的格式
    recognitionResults.value = results.map((result) => ({
      type: result.type || 'train',
      date: result.departure?.time ? result.departure.time.split('T')[0] : new Date().toISOString().split('T')[0],
      departure: {
        time: result.departure?.time || '',
        city: result.departure?.city || '',
        station: result.departure?.station || ''
      },
      arrival: {
        time: result.arrival?.time || '',
        city: result.arrival?.city || '',
        station: result.arrival?.station || ''
      },
      price: result.price || 0,
      airline: result.airline || '',
      flightNumber: result.flightNumber || ''
    }))

    // 默认选择第一条
    selectedResultIndex.value = 0
    
    console.log(`✅ 识别完成，共${recognitionResults.value.length}条记录`)

  } catch (error) {
    console.error('❌ AI识别失败:', error)
    recognitionError.value = error instanceof Error ? error.message : '识别失败，请重试'
  } finally {
    isRecognizing.value = false
  }
}

// 将文件转换为base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // 移除 data:image/...;base64, 前缀
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 保存单条AI识别结果
function handleAISubmit() {
  const currentResult = recognitionResults.value[selectedResultIndex.value]
  if (!currentResult) return
  
  // 从出发时间自动提取日期
  if (currentResult.departure?.time) {
    currentResult.date = currentResult.departure.time.split('T')[0]
  }
  
  tripsStore.addTrip(currentResult as Omit<TripRecord, 'id' | 'createdAt'>)
  
  // 移除已保存的记录
  recognitionResults.value.splice(selectedResultIndex.value, 1)
  
  // 如果还有其他记录，调整选中索引
  if (recognitionResults.value.length > 0) {
    selectedResultIndex.value = Math.min(selectedResultIndex.value, recognitionResults.value.length - 1)
  } else {
    // 所有记录都已保存，返回首页
    router.push('/')
  }
}

// 保存所有AI识别结果
function saveAllResults() {
  recognitionResults.value.forEach(result => {
    // 从出发时间自动提取日期
    if (result.departure?.time) {
      result.date = result.departure.time.split('T')[0]
    }
    tripsStore.addTrip(result as Omit<TripRecord, 'id' | 'createdAt'>)
  })
  
  router.push('/')
}

// 清空识别结果
function clearRecognitionResult() {
  recognitionResults.value = []
  selectedResultIndex.value = 0
  recognitionError.value = ''
}

// 检查AI配置
function checkAIConfig() {
  const config = getAIConfig()
  hasAIConfig.value = !!(config && config.baseUrl && config.model && config.token)
  console.log('🔧 AI配置检查:', hasAIConfig.value ? '已配置' : '未配置')
}

// 组件挂载时检查AI配置
onMounted(() => {
  checkAIConfig()
})
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

/* 时间输入框样式优化 */
.time-input-wrapper {
  position: relative;
}

.time-input-hint {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  pointer-events: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.time-input:focus + .time-input-hint,
.time-input:not(:placeholder-shown) + .time-input-hint {
  opacity: 0;
  transform: translateY(-50%) scale(0.8);
}

.time-input:valid + .time-input-hint {
  opacity: 0;
}

.time-icon {
  font-size: 10px;
}

.time-text {
  font-size: 10px;
  white-space: nowrap;
}

/* 城市选择下拉框样式 */
.city-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.city-option {
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  border-bottom: 1px solid #f3f4f6;
}

.city-option:last-child {
  border-bottom: none;
}

.city-option:hover {
  background-color: #f8fafc;
}

.city-option:active {
  background-color: #e2e8f0;
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