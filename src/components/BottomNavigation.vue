<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
    <div class="max-w-md mx-auto grid grid-cols-4">
      <RouterLink 
        to="/" 
        class="flex flex-col items-center py-2 px-4 text-center"
        :class="$route.name === 'home' ? 'text-blue-600' : 'text-gray-500'"
      >
        <div class="text-2xl mb-1">🏠</div>
        <span class="text-xs">首页</span>
      </RouterLink>
      
      <RouterLink 
        to="/add" 
        class="flex flex-col items-center py-2 px-4 text-center"
        :class="$route.name === 'add' ? 'text-blue-600' : 'text-gray-500'"
      >
        <div class="text-2xl mb-1">➕</div>
        <span class="text-xs">添加</span>
      </RouterLink>
      
      <RouterLink 
        to="/statistics" 
        class="flex flex-col items-center py-2 px-4 text-center"
        :class="$route.name === 'statistics' ? 'text-blue-600' : 'text-gray-500'"
      >
        <div class="text-2xl mb-1">📊</div>
        <span class="text-xs">统计</span>
      </RouterLink>
      
      <RouterLink 
        to="/settings" 
        class="flex flex-col items-center py-2 px-4 text-center"
        :class="$route.name === 'settings' ? 'text-blue-600' : 'text-gray-500'"
      >
        <div class="text-2xl mb-1">⚙️</div>
        <span class="text-xs">设置</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>