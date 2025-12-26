<template>
  <div class="min-h-screen bg-gray-50 pb-16">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-md mx-auto px-4 py-4 flex items-center">
        <button @click="$router.back()" class="text-2xl mr-3">←</button>
        <h1 class="text-xl font-bold text-gray-900">设置</h1>
      </div>
    </header>

    <div class="max-w-md mx-auto px-4 py-6">
      <!-- AI配置设置 -->
      <div class="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <h2 class="text-lg font-medium mb-4 flex items-center">
          🤖 AI识别配置
        </h2>

        <form @submit.prevent="saveConfig" class="space-y-4">
          <!-- API基础URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              API 基础地址
            </label>
            <input v-model="aiConfig.baseUrl" type="url" placeholder="https://api.openai.com/v1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required />
            <p class="text-xs text-gray-500 mt-1">
              支持 OpenAI 兼容格式的 API 服务
            </p>
          </div>

          <!-- 模型名称 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              模型名称
            </label>
            <input v-model="aiConfig.model" type="text" list="model-suggestions" placeholder="输入模型名称，如 gpt-4o"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required />
            <datalist id="model-suggestions">
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-5">GPT-5</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            </datalist>
            <p class="text-xs text-gray-500 mt-1">
              支持任意 OpenAI 兼容格式的模型名称
            </p>
          </div>

          <!-- API Token -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              API Token
            </label>
            <div class="relative">
              <input v-model="aiConfig.token" :type="showToken ? 'text' : 'password'" placeholder="sk-..."
                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required />
              <button type="button" @click="showToken = !showToken"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {{ showToken ? '👁️' : '🙈' }}
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Token 将安全存储在本地浏览器中
            </p>
          </div>

          <!-- 保存按钮 -->
          <button type="submit"
            class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            保存配置
          </button>
        </form>

        <!-- 测试连接 -->
        <div class="mt-4 pt-4 border-t">
          <button @click="testConnection" :disabled="!isConfigValid || isTesting"
            class="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {{ isTesting ? '测试中...' : '测试连接' }}
          </button>

          <!-- 测试结果显示 -->
          <div v-if="testResult" class="mt-3 p-3 rounded-lg"
            :class="testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <div class="flex items-center">
              <span class="mr-2">{{ testResult.success ? '✅' : '❌' }}</span>
              <span class="text-sm" :class="testResult.success ? 'text-green-800' : 'text-red-800'">
                {{ testResult.message }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- WebDAV同步配置 -->
      <div class="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <h2 class="text-lg font-medium mb-4 flex items-center">
          ☁️ WebDAV云同步
        </h2>

        <form @submit.prevent="saveWebdavConfig" class="space-y-4">
          <!-- 启用开关 -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">启用WebDAV同步</h3>
              <p class="text-sm text-gray-500">开启后可与WebDAV服务器同步数据</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="webdavConfig.enabled" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
              </div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">使用代理模式</h3>
              <p class="text-sm text-gray-500">解决CORS跨域访问问题（推荐开启）</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="webdavConfig.useProxy" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
              </div>
            </label>
          </div>

          <div v-if="webdavConfig.enabled" class="space-y-4">
            <!-- WebDAV服务器地址 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                WebDAV服务器地址
              </label>
              <input v-model="webdavConfig.url" type="url" placeholder="https://your-webdav-server.com/dav"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required />
              <p class="text-xs text-gray-500 mt-1">
              </p>
            </div>

            <!-- 用户名 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                用户名
              </label>
              <input v-model="webdavConfig.username" type="text" placeholder="username"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                required />
            </div>

            <!-- 密码 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <div class="relative">
                <input v-model="webdavConfig.password" :type="showWebdavPassword ? 'text' : 'password'"
                  placeholder="password"
                  class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required />
                <button type="button" @click="showWebdavPassword = !showWebdavPassword"
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {{ showWebdavPassword ? '👁️' : '🙈' }}
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                建议使用应用专用密码（如果支持）
              </p>
            </div>

            <!-- 保存配置按钮 -->
            <button type="submit"
              class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              保存WebDAV配置
            </button>
          </div>
        </form>

        <!-- 测试连接和同步功能 -->
        <div v-if="webdavConfig.enabled" class="mt-4 pt-4 border-t space-y-3">
          <!-- 测试连接 -->
          <button @click="testWebdavConnection" :disabled="!isWebdavConfigValid || isWebdavTesting"
            class="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            {{ isWebdavTesting ? '测试中...' : '测试连接' }}
          </button>

          <!-- WebDAV测试结果显示 -->
          <div v-if="webdavTestResult" class="p-3 rounded-lg"
            :class="webdavTestResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <div class="flex items-center">
              <span class="mr-2">{{ webdavTestResult.success ? '✅' : '❌' }}</span>
              <span class="text-sm" :class="webdavTestResult.success ? 'text-green-800' : 'text-red-800'">
                {{ webdavTestResult.message }}
              </span>
            </div>
          </div>

          <!-- 同步功能按钮 -->
          <div class="grid grid-cols-2 gap-3">
            <button @click="uploadToWebdav" :disabled="!isWebdavConfigValid || isSyncing"
              class="bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm">
              {{ isSyncing ? '同步中...' : '⬆️ 上传数据' }}
            </button>


            <button @click="downloadFromWebdav" :disabled="!isWebdavConfigValid || isSyncing"
              class="bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm">
              {{ isSyncing ? '同步中...' : '⬇️ 下载数据' }}
            </button>
          </div>

          <!-- 同步结果显示 -->
          <div v-if="syncResult" class="p-3 rounded-lg"
            :class="syncResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
            <div class="flex items-center">
              <span class="mr-2">{{ syncResult.success ? '✅' : '❌' }}</span>
              <span class="text-sm" :class="syncResult.success ? 'text-green-800' : 'text-red-800'">
                {{ syncResult.message }}
              </span>
            </div>
          </div>

        </div>
      </div>

      <!-- 出行人配置 -->
      <div class="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <h2 class="text-lg font-medium mb-4 flex items-center">
          👥 出行人配置
        </h2>

        <div class="space-y-4">
          <!-- 当前出行人列表 -->
          <div>
            <h3 class="font-medium mb-2">出行人列表</h3>
            <div class="flex flex-wrap gap-2">
              <div v-for="traveler in tripsStore.travelerConfig.availableTravelers" :key="traveler"
                class="flex items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <span class="text-sm">{{ traveler }}</span>
                <button v-if="traveler !== '我'" @click="removeTraveler(traveler)"
                  class="ml-2 text-red-500 hover:text-red-700">
                  ×
                </button>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              "我" 是默认出行人，无法删除
            </p>
          </div>

          <!-- 添加新出行人 -->
          <div>
            <h3 class="font-medium mb-2">添加新出行人</h3>
            <div class="flex gap-2">
              <input v-model="newTravelerName" type="text" placeholder="请输入出行人姓名"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                @keyup.enter="addNewTraveler" />
              <button @click="addNewTraveler" :disabled="!newTravelerName.trim()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm">
                添加
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 其他设置 -->
      <div class="bg-white rounded-lg p-4 shadow-sm">
        <h2 class="text-lg font-medium mb-4 flex items-center">
          ⚙️ 其他设置
        </h2>

        <div class="space-y-4">
          <!-- 数据管理 -->
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">数据导出</h3>
              <p class="text-sm text-gray-500">导出所有出行记录</p>
            </div>
            <button @click="exportData"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              导出
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-medium">清空数据</h3>
              <p class="text-sm text-gray-500">删除所有出行记录</p>
            </div>
            <button @click="confirmClearData"
              class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
              清空
            </button>
          </div>
        </div>
      </div>
    </div>

    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useTripsStore } from '@/stores/trips'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { createSyncService } from '@/services/syncService'
import { getWebDAVConfig, saveWebDAVConfig } from '@/services/webdavService'
import type { AIConfig, WebDAVConfig } from '@/types'

const tripsStore = useTripsStore()
const syncService = createSyncService()

const showToken = ref(false)
const newTravelerName = ref('')
const showWebdavPassword = ref(false)
const isTesting = ref(false)
const isWebdavTesting = ref(false)
const isSyncing = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)
const webdavTestResult = ref<{ success: boolean; message: string } | null>(null)
const syncResult = ref<{ success: boolean; message: string } | null>(null)

const aiConfig = reactive<AIConfig>({
  baseUrl: '',
  model: '',
  token: ''
})

const webdavConfig = reactive<WebDAVConfig>({
  url: '',
  username: '',
  password: '',
  enabled: false,
  useProxy: true
})

// 检查配置是否有效
const isConfigValid = computed(() => {
  return aiConfig.baseUrl && aiConfig.model && aiConfig.token
})

const isWebdavConfigValid = computed(() => {
  return webdavConfig.url && webdavConfig.username && webdavConfig.password
})

// 加载保存的配置
function loadConfig() {
  const saved = localStorage.getItem('ai_config')
  if (saved) {
    try {
      const config = JSON.parse(saved)
      Object.assign(aiConfig, config)
    } catch (error) {
      console.error('加载AI配置失败:', error)
    }
  }

  const webdavSaved = getWebDAVConfig()
  if (webdavSaved) {
    Object.assign(webdavConfig, webdavSaved)
  }
}

// 保存配置
function saveConfig() {
  try {
    localStorage.setItem('ai_config', JSON.stringify(aiConfig))
    testResult.value = { success: true, message: '配置保存成功!' }
    setTimeout(() => {
      testResult.value = null
    }, 3000)
  } catch (error) {
    console.error('保存AI配置失败:', error)
    testResult.value = { success: false, message: '保存失败，请重试' }
  }
}

// 测试连接
async function testConnection() {
  if (!isConfigValid.value) return

  isTesting.value = true
  testResult.value = null

  try {
    const response = await fetch(`${aiConfig.baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${aiConfig.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      testResult.value = { success: true, message: 'API连接测试成功!' }
    } else {
      testResult.value = { success: false, message: `连接失败: ${response.status} ${response.statusText}` }
    }
  } catch (error) {
    console.error('API连接测试失败:', error)
    testResult.value = { success: false, message: '连接测试失败，请检查网络和配置' }
  } finally {
    isTesting.value = false
  }
}

// 导出数据
function exportData() {
  try {
    const data = {
      trips: tripsStore.trips,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `travel_records_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出数据失败:', error)
    alert('导出失败，请重试')
  }
}

// 确认清空数据
function confirmClearData() {
  if (confirm('确定要清空所有出行记录吗？此操作无法恢复！')) {
    try {
      tripsStore.clearAllTrips()
      alert('数据已清空')
    } catch (error) {
      console.error('清空数据失败:', error)
      alert('清空失败，请重试')
    }
  }
}

// 保存WebDAV配置
function saveWebdavConfig() {
  try {
    saveWebDAVConfig(webdavConfig)
    webdavTestResult.value = { success: true, message: 'WebDAV配置保存成功!' }
    setTimeout(() => {
      webdavTestResult.value = null
    }, 3000)
  } catch (error) {
    console.error('保存WebDAV配置失败:', error)
    webdavTestResult.value = { success: false, message: '保存失败，请重试' }
  }
}

// 测试WebDAV连接
async function testWebdavConnection() {
  if (!isWebdavConfigValid.value) return

  isWebdavTesting.value = true
  webdavTestResult.value = null

  try {
    const success = await syncService.testWebDAVConnection()

    if (success) {
      webdavTestResult.value = { success: true, message: 'WebDAV连接测试成功!' }
    } else {
      webdavTestResult.value = { success: false, message: 'WebDAV连接测试失败' }
    }
  } catch (error) {
    console.error('WebDAV连接测试失败:', error)
    webdavTestResult.value = { success: false, message: `连接失败: ${error instanceof Error ? error.message : '未知错误'}` }
  } finally {
    isWebdavTesting.value = false
  }
}

// 上传数据到WebDAV
async function uploadToWebdav() {
  isSyncing.value = true
  syncResult.value = null

  try {
    await syncService.uploadToWebDAV()
    syncResult.value = { success: true, message: '数据上传成功!' }
  } catch (error) {
    console.error('数据上传失败:', error)
    syncResult.value = { success: false, message: `上传失败: ${error instanceof Error ? error.message : '未知错误'}` }
  } finally {
    isSyncing.value = false
  }
}

// 从WebDAV下载数据
async function downloadFromWebdav() {
  if (!confirm('下载数据将覆盖当前所有本地数据，确定要继续吗？')) {
    return
  }

  isSyncing.value = true
  syncResult.value = null

  try {
    await syncService.downloadFromWebDAV()
    syncResult.value = { success: true, message: '数据下载成功！页面将刷新以应用新数据' }

    setTimeout(() => {
      window.location.reload()
    }, 2000)
  } catch (error) {
    console.error('数据下载失败:', error)
    syncResult.value = { success: false, message: `下载失败: ${error instanceof Error ? error.message : '未知错误'}` }
  } finally {
    isSyncing.value = false
  }
}

// 添加新出行人
function addNewTraveler() {
  const name = newTravelerName.value.trim()
  if (!name) return

  if (tripsStore.travelerConfig.availableTravelers.includes(name)) {
    alert('该出行人已存在')
    return
  }

  tripsStore.addTraveler(name)
  newTravelerName.value = ''
}

// 删除出行人
function removeTraveler(name: string) {
  if (name === '我') return

  if (confirm(`确定要删除出行人"${name}"吗？`)) {
    tripsStore.removeTraveler(name)
  }
}

// 监听WebDAV启用状态变化，自动保存
watch(() => webdavConfig.enabled, (newValue) => {
  try {
    saveWebDAVConfig(webdavConfig)
    console.log('WebDAV启用状态已保存:', newValue)
  } catch (error) {
    console.error('自动保存WebDAV状态失败:', error)
  }
})

onMounted(() => {
  loadConfig()
})
</script>