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
            <select v-model="aiConfig.model"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required>
              <option value="">请选择模型</option>
              <optgroup label="OpenAI GPT-4o 系列">
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
              </optgroup>
              <optgroup label="Google Gemini 2.5 系列">
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              </optgroup>
              <optgroup label="其他模型">
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
              </optgroup>
            </select>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useTripsStore } from '@/stores/trips'
import BottomNavigation from '@/components/BottomNavigation.vue'
import type { AIConfig } from '@/types'

const tripsStore = useTripsStore()

const showToken = ref(false)
const isTesting = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)

const aiConfig = reactive<AIConfig>({
  baseUrl: '',
  model: '',
  token: ''
})

// 检查配置是否有效
const isConfigValid = computed(() => {
  return aiConfig.baseUrl && aiConfig.model && aiConfig.token
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

onMounted(() => {
  loadConfig()
})
</script>