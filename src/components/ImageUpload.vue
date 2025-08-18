<template>
  <div class="space-y-4">
    <!-- 上传区域 -->
    <div 
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
      class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
      :class="{ 'border-blue-500 bg-blue-50': isDragging }"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        class="hidden"
      />
      
      <div class="space-y-2">
        <div class="text-4xl">📸</div>
        <p class="text-gray-600">点击上传票据图片</p>
        <p class="text-sm text-gray-400">支持JPG、PNG格式</p>
      </div>
    </div>

    <!-- 图片预览 -->
    <div v-if="previewUrl" class="relative">
      <img 
        :src="previewUrl" 
        alt="票据预览"
        class="w-full max-h-64 object-contain border rounded-lg"
      />
      <button
        @click="clearImage"
        class="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600"
      >
        ✕
      </button>
    </div>

    <!-- AI识别按钮 -->
    <button
      v-if="previewUrl && !isRecognizing && selectedFile"
      @click="selectedFile && $emit('recognize', selectedFile)"
      class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
    >
      🤖 AI识别票据信息
    </button>

    <!-- 识别中状态 -->
    <div v-if="isRecognizing" class="text-center py-4">
      <div class="inline-flex items-center space-x-2">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="text-gray-600">AI正在识别中...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isRecognizing?: boolean
}

interface Emits {
  (e: 'recognize', file: File): void
}

defineProps<Props>()
defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const previewUrl = ref<string>('')
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    processFile(file)
  }
}

function processFile(file: File) {
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  selectedFile.value = file
  
  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  previewUrl.value = ''
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>