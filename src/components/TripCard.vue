<template>
  <div class="trip-card">
    <div class="date-section">
      <div class="date-info">
        <div class="date">{{ formatDateShort(trip.date) }}</div>
        <div class="year">{{ formatYear(trip.date) }}</div>
      </div>
      <div class="trip-content">
        <div class="price">¥{{ trip.price.toLocaleString() }}</div>
        <div class="trip-header">
          <div class="airline-info">
            <div class="airline-logo" :style="{ background: getAirlineColor() }">
              {{ getAirlineShort() }}
            </div>
            <div class="airline-details">
              <span class="airline-name">{{ getAirlineName() }}</span>
              <span class="flight-number">{{ getFlightNumber() }}</span>
            </div>
          </div>
          <div v-if="!props.isInRoundTrip" class="status" :style="getStatusStyle()">
            <span>{{ trip.status === 'used' ? '✓' : '+' }}</span> 
            {{ trip.status === 'used' ? '已使用' : '未使用' }}
          </div>
        </div>
        <div class="route-info">
          <div class="route-item">
            <div class="route-indicator departure"></div>
            <div class="route-details">
              <div class="time">{{ formatTime(trip.departure.time) }}</div>
              <div class="location">
                {{ trip.departure.city }}
                <span v-if="getTerminalInfo(trip.departure.station)" class="terminal">
                  {{ getTerminalInfo(trip.departure.station) }}
                </span>
              </div>
            </div>
          </div>
          <div class="route-item">
            <div class="route-indicator arrival"></div>
            <div class="route-details">
              <div class="time">{{ formatTime(trip.arrival.time) }}</div>
              <div class="location">
                {{ trip.arrival.city }}
                <span v-if="getTerminalInfo(trip.arrival.station)" class="terminal">
                  {{ getTerminalInfo(trip.arrival.station) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 删除按钮 -->
        <button 
          @click="$emit('delete', trip.id)"
          class="delete-btn"
          title="删除记录"
        >
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TripRecord } from '@/types'

const props = defineProps<{
  trip: TripRecord
  isInRoundTrip?: boolean
}>()

defineEmits<{
  delete: [id: string]
}>()

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

function getAirlineColor() {
  if (props.trip.type === 'train') {
    return '#28a745'
  }
  return '#667eea'
}

function getAirlineShort() {
  if (props.trip.type === 'train') return '🚄'
  if (props.trip.type === 'flight') return '✈️'
  return '🚇'
}

function getAirlineName() {
  if (props.trip.type === 'train') {
    return '高速铁路'
  }
  return '航空公司'
}

function getFlightNumber() {
  if (props.trip.type === 'train') {
    return 'G1234'
  }
  return 'MU1234'
}

function getStatusStyle() {
  if (props.trip.status === 'used') {
    return { 
      background: '#e9ecef', 
      color: '#6c757d' 
    }
  }
  return {
    background: '#e8f5e8',
    color: '#28a745'
  }
}

function getTerminalInfo(station: string) {
  // 提取T+数字格式的航站楼信息
  const terminalMatch = station.match(/[T]\d+/i)
  if (terminalMatch) {
    return terminalMatch[0].toUpperCase()
  }
  
  // 提取火车站站名
  if (station.includes('南站')) return '南站'
  if (station.includes('北站')) return '北站' 
  if (station.includes('东站')) return '东站'
  if (station.includes('西站')) return '西站'
  
  return ''
}
</script>

<style scoped>
.trip-card {
  background: white;
  border-radius: 16px;
  margin-bottom: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  transition: transform 0.2s ease;
}

.trip-card:active {
  transform: scale(0.98);
}

.date-section {
  display: flex;
  align-items: stretch;
}

.date-info {
  padding: 16px 12px;
  background-color: #f8f9fa;
  min-width: 70px;
  text-align: center;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.date {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.year {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.trip-content {
  flex: 1;
  padding: 16px 15px;
  position: relative;
}

.trip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.airline-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.airline-logo {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.airline-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.airline-name {
  font-weight: 600;
  color: #333;
  font-size: 15px;
  line-height: 1.2;
}

.flight-number {
  color: #666;
  font-size: 13px;
  margin-top: 1px;
}

.status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.route-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.route-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.route-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #28a745;
  background: white;
  flex-shrink: 0;
}

.route-indicator.departure {
  background: transparent;
}

.route-indicator.arrival {
  background: #28a745;
}

.route-details {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  flex: 1;
}

.time {
  font-size: 20px;
  font-weight: 700;
  color: #333;
  min-width: 60px;
  flex-shrink: 0;
}

.location {
  color: #333;
  font-weight: 500;
  font-size: 16px;
}

.terminal {
  color: #666;
  font-size: 14px;
  margin-left: 6px;
}

.price {
  position: absolute;
  top: 16px;
  right: 15px;
  background: #007bff;
  color: white;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
}

.delete-btn {
  position: absolute;
  top: 50px;
  right: 15px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
  padding: 4px;
}

.delete-btn:hover {
  opacity: 1;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .trip-card {
    margin-bottom: 12px;
    border-radius: 12px;
  }
  
  .date-info {
    padding: 14px 10px;
    min-width: 65px;
  }
  
  .date {
    font-size: 18px;
  }
  
  .trip-content {
    padding: 14px 12px;
  }
  
  .trip-header {
    margin-bottom: 14px;
  }
  
  .airline-logo {
    width: 26px;
    height: 26px;
    font-size: 13px;
  }
  
  .airline-name {
    font-size: 14px;
  }
  
  .flight-number {
    font-size: 12px;
  }
  
  .time {
    font-size: 18px;
    min-width: 55px;
  }
  
  .location {
    font-size: 15px;
  }
  
  .price {
    top: 14px;
    right: 12px;
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .delete-btn {
    top: 44px;
    right: 12px;
    font-size: 14px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .route-details {
    gap: 12px;
  }
  
  .time {
    min-width: 50px;
    font-size: 17px;
  }
  
  .location {
    font-size: 14px;
  }
  
  .terminal {
    font-size: 13px;
  }
}
</style>