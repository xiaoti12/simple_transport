<template>
  <div class="space-y-4">
    <!-- 文字输入区域 -->
    <div class="border-2 border-gray-300 rounded-lg p-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        输入票据文字内容
      </label>
      <textarea
        v-model="textContent"
        @input="onTextInput"
        placeholder="请输入或粘贴票据上的文字信息，如：&#10;&#10;G1234 北京南 → 上海虹桥&#10;2024-01-15 08:00 → 13:30&#10;二等座 ¥553.5&#10;&#10;支持多张票据信息，请分别输入..."
        rows="8"
        class="w-full px-3 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        :class="{'border-red-300': textContent.length > 2000}"
      />
      <div class="flex justify-between items-center mt-2 text-xs">
        <span class="text-gray-500">
          支持车票、机票等交通票据文字信息
        </span>
        <span 
          class="text-gray-400"
          :class="{'text-red-500': textContent.length > 2000}"
        >
          {{ textContent.length }}/2000
        </span>
      </div>
    </div>

    <!-- 识别示例 -->
    <div v-if="!textContent.trim() && !isRecognizing" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 class="text-sm font-medium text-blue-800 mb-2">📝 输入示例</h4>
      <div class="text-xs text-blue-700 space-y-1">
        <p><strong>火车票：</strong>G1234 北京南→上海虹桥 2024-01-15 08:00→13:30 二等座 ¥553.5</p>
        <p><strong>飞机票：</strong>MU5138 北京首都T2→上海浦东T1 2024-01-15 14:20→16:30 经济舱 ¥890</p>
        <p class="text-blue-600 mt-2">💡 可以同时输入多张票的信息，AI会自动识别分离</p>
      </div>
    </div>

    <!-- AI识别按钮 -->
    <button
      v-if="textContent.trim() && !isRecognizing"
      @click="handleRecognize"
      :disabled="textContent.length > 2000"
      class="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      🤖 AI识别文字内容
    </button>

    <!-- 识别中状态 -->
    <div v-if="isRecognizing" class="text-center py-4">
      <div class="inline-flex items-center space-x-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        <span class="text-gray-600">AI正在分析文字内容...</span>
      </div>
    </div>

    <!-- 快速填入按钮 -->
    <div v-if="!textContent.trim() && !isRecognizing" class="flex flex-wrap gap-2">
      <button
        v-for="example in quickExamples"
        :key="example.name"
        @click="fillExample(example.content)"
        class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
      >
        {{ example.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isRecognizing?: boolean
}

interface Emits {
  (e: 'recognize', text: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const textContent = ref('')

// 快速示例
const quickExamples = [
  {
    name: '火车票示例',
    content: 'G1234 北京南 → 上海虹桥\n2024-01-15 08:00 → 13:30\n二等座 ¥553.5\n中国国家铁路'
  },
  {
    name: '飞机票示例', 
    content: 'MU5138 北京首都T2 → 上海浦东T1\n2024-01-15 14:20 → 16:30\n经济舱 ¥890\n中国东方航空'
  },
  {
    name: '多张票示例',
    content: 'G1234 北京南 → 上海虹桥 2024-01-15 08:00 → 13:30 二等座 ¥553.5\n\nMU5138 上海浦东T1 → 广州白云T1 2024-01-16 09:30 → 12:15 经济舱 ¥720'
  }
]

function onTextInput() {
  // 限制文字长度
  if (textContent.value.length > 2000) {
    textContent.value = textContent.value.substring(0, 2000)
  }
}

function handleRecognize() {
  if (textContent.value.trim() && textContent.value.length <= 2000) {
    emit('recognize', textContent.value.trim())
  }
}

function fillExample(content: string) {
  textContent.value = content
}

// 清空内容
function clearText() {
  textContent.value = ''
}

// 导出清空方法供父组件使用
defineExpose({
  clearText
})
</script>

<style scoped>
/* 文本域样式优化 */
textarea {
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}

textarea::placeholder {
  color: #9ca3af;
  font-size: 13px;
  line-height: 1.4;
}

/* 移动端优化 */
@media (max-width: 480px) {
  textarea {
    font-size: 16px !important; /* 防止iOS缩放 */
    min-height: 120px;
  }
  
  /* 确保触摸目标足够大 */
  button {
    min-height: 44px;
    font-size: 14px;
  }
}

/* 聚焦时的样式 */
textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* 字符计数器样式 */
.text-red-500 {
  font-weight: 600;
}
</style>