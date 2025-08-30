<template>
  <div class="trip-card" @click="goToDetail">
    <div class="date-section">
      <div class="date-info">
        <div class="date">{{ formatDateShort(trip.date) }}</div>
        <div class="year">{{ formatYear(trip.date) }}</div>
      </div>
      <div class="trip-content">
        <div class="price">¥{{ trip.price.toLocaleString() }}</div>
        <div class="trip-header">
          <div class="airline-info">
            <div class="airline-logo" :class="{ 'has-icon': getAirlineIconUrl() }" :style="getAirlineIconUrl() ? {} : { background: getAirlineColor() }">
              <img v-if="getAirlineIconUrl()" :src="getAirlineIconUrl()!" :alt="getAirlineName()" class="airline-icon" />
              <span v-else class="airline-text">{{ getAirlineShort() }}</span>
            </div>
            <div class="airline-details">
              <span class="airline-name">{{ getAirlineName() }}</span>
              <span class="flight-number">{{ getFlightNumber() }}</span>
            </div>
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
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { TripRecord } from '@/types'
import { getAirlineIcon, getAirlineShort as getAirlineShortName, getAirlineColor as getAirlineThemeColor } from '@/utils/airlineUtils'

const router = useRouter()

const props = defineProps<{
  trip: TripRecord
  isInRoundTrip?: boolean
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
  return getAirlineThemeColor(props.trip.airline)
}

function getAirlineShort() {
  if (props.trip.type === 'train') return '🚄'
  
  return getAirlineShortName(props.trip.airline || '')
}

function getAirlineIconUrl() {
  if (props.trip.type === 'train') return null
  
  return getAirlineIcon(props.trip.airline || '')
}

function getAirlineName() {
  if (props.trip.airline) {
    return props.trip.airline
  }
  if (props.trip.type === 'train') {
    return '高速铁路'
  }
  return '航空公司'
}

function getFlightNumber() {
  if (props.trip.flightNumber) {
    return props.trip.flightNumber
  }
  if (props.trip.type === 'train') {
    return 'G1234'
  }
  return 'MU1234'
}


function getTerminalInfo(station: string) {
  // 去掉城市名前缀，返回完整的机场/车站名称
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

function goToDetail() {
  router.push(`/trip/${props.trip.id}`)
}
</script>

<style scoped>
.trip-card {
  background: white;
  border-radius: 16px;
  margin-bottom: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid #e3f2fd;
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease;
}

.trip-card:hover {
  border-color: #2196f3;
  box-shadow: 0 4px 20px rgba(33, 150, 243, 0.12);
}

.trip-card:active {
  transform: scale(0.98);
  border-color: #1976d2;
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
  overflow: hidden;
  position: relative;
}

.airline-logo.has-icon {
  background: transparent !important;
  border: 1px solid #e0e0e0;
}

.airline-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.airline-logo.has-icon .airline-icon {
  filter: none; /* 有图标时显示原色 */
}

.airline-logo:not(.has-icon) .airline-icon {
  filter: brightness(0) invert(1); /* 无图标时将图标变为白色 */
}

.airline-text {
  color: white;
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
  
  .airline-icon {
    width: 18px;
    height: 18px;
  }
  
  .airline-logo.has-icon {
    border-width: 1px;
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