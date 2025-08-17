<template>
  <div class="round-trip-container">
    <div class="round-trip-header">
      <div class="round-trip-title">
        <span class="round-trip-icon">✈️</span>
        往返行程 · {{ route }}
      </div>
      <div class="round-trip-total">总计 ¥{{ totalPrice.toLocaleString() }}</div>
    </div>
    <div class="round-trip-content">
      <TripCard :trip="outbound" :is-in-round-trip="true" @delete="$emit('delete', outbound.id)" />
      <div class="round-trip-connector">
        <div class="connector-icon">⇅</div>
      </div>
      <TripCard :trip="returnTrip" :is-in-round-trip="true" @delete="$emit('delete', returnTrip.id)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TripRecord } from '@/types'
import TripCard from './TripCard.vue'

const props = defineProps<{
  outbound: TripRecord
  returnTrip: TripRecord
}>()

defineEmits<{
  delete: [id: string]
}>()

const route = computed(() => {
  return `${props.outbound.departure.city} ⇄ ${props.outbound.arrival.city}`
})

const totalPrice = computed(() => {
  return props.outbound.price + props.returnTrip.price
})
</script>

<style scoped>
.round-trip-container {
  background: white;
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
}

.round-trip-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.round-trip-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.round-trip-icon {
  font-size: 18px;
}

.round-trip-total {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.round-trip-content {
  background: white;
}

.round-trip-content :deep(.trip-card) {
  margin-bottom: 0;
  box-shadow: none;
  border-radius: 0;
  border-bottom: 1px solid #f0f0f0;
}

.round-trip-content :deep(.trip-card:last-child) {
  border-bottom: none;
}

.round-trip-content :deep(.status) {
  display: none;
}

.round-trip-connector {
  position: relative;
  padding: 8px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
}

.round-trip-connector::before {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, #667eea, #764ba2);
}

.connector-icon {
  background: white;
  border: 2px solid #667eea;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #667eea;
  z-index: 1;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .round-trip-container {
    margin-bottom: 15px;
    border-radius: 12px;
  }
  
  .round-trip-header {
    padding: 10px 14px;
  }
  
  .round-trip-title {
    font-size: 15px;
  }
  
  .round-trip-total {
    font-size: 13px;
    padding: 5px 10px;
  }
  
  .connector-icon {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }
}
</style>