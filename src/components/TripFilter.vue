<template>
  <div class="trip-filter">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-bar-content">
        <div class="filter-items">
          <div 
            class="filter-item" 
            :class="{ active: activeFilter === 'departure' }"
            @click="toggleFilter('departure')"
          >
            <span class="filter-label">出发城市</span>
            <span v-if="selectedDepartureCities.length > 0" class="filter-count">{{ selectedDepartureCities.length }}</span>
            <svg class="filter-arrow" :class="{ rotated: activeFilter === 'departure' }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>

          <div 
            class="filter-item" 
            :class="{ active: activeFilter === 'arrival' }"
            @click="toggleFilter('arrival')"
          >
            <span class="filter-label">到达城市</span>
            <span v-if="selectedArrivalCities.length > 0" class="filter-count">{{ selectedArrivalCities.length }}</span>
            <svg class="filter-arrow" :class="{ rotated: activeFilter === 'arrival' }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>

          <div 
            class="filter-item" 
            :class="{ active: activeFilter === 'travelers' }"
            @click="toggleFilter('travelers')"
          >
            <span class="filter-label">出行人</span>
            <span v-if="selectedTravelers.length > 0" class="filter-count">{{ selectedTravelers.length }}</span>
            <svg class="filter-arrow" :class="{ rotated: activeFilter === 'travelers' }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>

          <div 
            class="filter-item" 
            :class="{ active: activeFilter === 'time' }"
            @click="toggleFilter('time')"
          >
            <span class="filter-label">时间</span>
            <span v-if="selectedYear || selectedMonth" class="filter-count">1</span>
            <svg class="filter-arrow" :class="{ rotated: activeFilter === 'time' }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>

          <div 
            class="filter-item" 
            :class="{ active: activeFilter === 'transport' }"
            @click="toggleFilter('transport')"
          >
            <span class="filter-label">出行工具</span>
            <span v-if="selectedTransports.length > 0" class="filter-count">{{ selectedTransports.length }}</span>
            <svg class="filter-arrow" :class="{ rotated: activeFilter === 'transport' }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
        </div>

        <button 
          v-if="hasActiveFilters" 
          class="reset-button"
          @click="resetFilters"
        >
          重置
        </button>
      </div>
    </div>

    <!-- 筛选选项面板 -->
    <div v-if="activeFilter" class="filter-panel">
      <!-- 出发城市筛选 -->
      <div v-if="activeFilter === 'departure'" class="filter-options">
        <div class="filter-header">选择出发城市</div>
        <div class="options-grid">
          <label 
            v-for="city in availableDepartureCities" 
            :key="city" 
            class="option-item"
          >
            <input 
              type="checkbox" 
              :value="city" 
              v-model="selectedDepartureCities"
            />
            <span class="option-label">{{ city }}</span>
          </label>
        </div>
      </div>

      <!-- 到达城市筛选 -->
      <div v-if="activeFilter === 'arrival'" class="filter-options">
        <div class="filter-header">选择到达城市</div>
        <div class="options-grid">
          <label 
            v-for="city in availableArrivalCities" 
            :key="city" 
            class="option-item"
          >
            <input 
              type="checkbox" 
              :value="city" 
              v-model="selectedArrivalCities"
            />
            <span class="option-label">{{ city }}</span>
          </label>
        </div>
      </div>

      <!-- 出行人筛选 -->
      <div v-if="activeFilter === 'travelers'" class="filter-options">
        <div class="filter-header">选择出行人</div>
        <div class="options-grid">
          <label 
            v-for="traveler in availableTravelers" 
            :key="traveler" 
            class="option-item"
          >
            <input 
              type="checkbox" 
              :value="traveler" 
              v-model="selectedTravelers"
            />
            <span class="option-label">{{ traveler }}</span>
          </label>
        </div>
      </div>

      <!-- 时间筛选 -->
      <div v-if="activeFilter === 'time'" class="filter-options">
        <div class="filter-header">选择时间</div>
        <div class="time-options">
          <div class="time-section">
            <div class="time-section-title">年份</div>
            <div class="options-grid">
              <label class="option-item">
                <input 
                  type="radio" 
                  name="year"
                  value="" 
                  v-model="selectedYear"
                />
                <span class="option-label">全部</span>
              </label>
              <label 
                v-for="year in availableYears" 
                :key="year" 
                class="option-item"
              >
                <input 
                  type="radio" 
                  name="year"
                  :value="year" 
                  v-model="selectedYear"
                />
                <span class="option-label">{{ year }}年</span>
              </label>
            </div>
          </div>
          
          <div v-if="selectedYear" class="time-section">
            <div class="time-section-title">月份</div>
            <div class="options-grid">
              <label class="option-item">
                <input 
                  type="radio" 
                  name="month"
                  value="" 
                  v-model="selectedMonth"
                />
                <span class="option-label">全年</span>
              </label>
              <label 
                v-for="month in availableMonths" 
                :key="month" 
                class="option-item"
              >
                <input 
                  type="radio" 
                  name="month"
                  :value="month" 
                  v-model="selectedMonth"
                />
                <span class="option-label">{{ month }}月</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 出行工具筛选 -->
      <div v-if="activeFilter === 'transport'" class="filter-options">
        <div class="filter-header">选择出行工具</div>
        <div class="options-grid">
          <label 
            v-for="transport in availableTransports" 
            :key="transport.value" 
            class="option-item"
          >
            <input 
              type="checkbox" 
              :value="transport.value" 
              v-model="selectedTransports"
            />
            <span class="option-label">{{ transport.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div v-if="activeFilter" class="filter-overlay" @click="closeFilter"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTripsStore } from '@/stores/trips'
import type { TripRecord } from '@/types'

const tripsStore = useTripsStore()

const activeFilter = ref<string | null>(null)
const selectedDepartureCities = ref<string[]>([])
const selectedArrivalCities = ref<string[]>([])
const selectedTravelers = ref<string[]>([])
const selectedYear = ref<string>('')
const selectedMonth = ref<string>('')
const selectedTransports = ref<string[]>([])

const availableTransports = [
  { value: 'flight', label: '✈️ 飞机' },
  { value: 'train', label: '🚄 火车' }
]

const availableDepartureCities = computed(() => {
  const cities = new Set<string>()
  tripsStore.trips.forEach(trip => {
    cities.add(trip.departure.city)
  })
  return Array.from(cities).sort()
})

const availableArrivalCities = computed(() => {
  const cities = new Set<string>()
  tripsStore.trips.forEach(trip => {
    cities.add(trip.arrival.city)
  })
  return Array.from(cities).sort()
})

const availableTravelers = computed(() => {
  const travelers = new Set<string>()
  tripsStore.trips.forEach(trip => {
    trip.travelers.forEach(traveler => {
      travelers.add(traveler)
    })
  })
  return Array.from(travelers).sort()
})

const availableYears = computed(() => {
  const years = new Set<string>()
  tripsStore.trips.forEach(trip => {
    const year = new Date(trip.date).getFullYear().toString()
    years.add(year)
  })
  return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
})

const availableMonths = computed(() => {
  if (!selectedYear.value) return []
  
  const months = new Set<string>()
  tripsStore.trips.forEach(trip => {
    const date = new Date(trip.date)
    const year = date.getFullYear().toString()
    if (year === selectedYear.value) {
      const month = (date.getMonth() + 1).toString()
      months.add(month)
    }
  })
  return Array.from(months).sort((a, b) => parseInt(a) - parseInt(b))
})

const hasActiveFilters = computed(() => {
  return selectedDepartureCities.value.length > 0 ||
         selectedArrivalCities.value.length > 0 ||
         selectedTravelers.value.length > 0 ||
         selectedYear.value ||
         selectedMonth.value ||
         selectedTransports.value.length > 0
})

const filteredTrips = computed(() => {
  let filtered = [...tripsStore.trips]

  // 出发城市筛选
  if (selectedDepartureCities.value.length > 0) {
    filtered = filtered.filter(trip => 
      selectedDepartureCities.value.includes(trip.departure.city)
    )
  }

  // 到达城市筛选
  if (selectedArrivalCities.value.length > 0) {
    filtered = filtered.filter(trip => 
      selectedArrivalCities.value.includes(trip.arrival.city)
    )
  }

  // 出行人筛选（包含任一选中的出行人）
  if (selectedTravelers.value.length > 0) {
    filtered = filtered.filter(trip => 
      trip.travelers.some(traveler => selectedTravelers.value.includes(traveler))
    )
  }

  // 时间筛选
  if (selectedYear.value) {
    filtered = filtered.filter(trip => {
      const tripYear = new Date(trip.date).getFullYear().toString()
      return tripYear === selectedYear.value
    })
  }

  if (selectedMonth.value) {
    filtered = filtered.filter(trip => {
      const tripMonth = (new Date(trip.date).getMonth() + 1).toString()
      return tripMonth === selectedMonth.value
    })
  }

  // 出行工具筛选
  if (selectedTransports.value.length > 0) {
    filtered = filtered.filter(trip => 
      selectedTransports.value.includes(trip.type)
    )
  }

  return filtered
})

const emit = defineEmits<{
  filtersChanged: [trips: TripRecord[], hasFilters: boolean]
}>()

function toggleFilter(filterType: string) {
  if (activeFilter.value === filterType) {
    activeFilter.value = null
  } else {
    activeFilter.value = filterType
  }
}

function closeFilter() {
  activeFilter.value = null
}

function resetFilters() {
  selectedDepartureCities.value = []
  selectedArrivalCities.value = []
  selectedTravelers.value = []
  selectedYear.value = ''
  selectedMonth.value = ''
  selectedTransports.value = []
  activeFilter.value = null
}

// 当年份变化时重置月份选择
watch(selectedYear, (newYear) => {
  if (!newYear) {
    selectedMonth.value = ''
  }
})

// 监听筛选条件变化，发出事件
watch([filteredTrips, hasActiveFilters], ([newTrips, hasFilters]) => {
  emit('filtersChanged', newTrips, Boolean(hasFilters))
}, { immediate: true })
</script>

<style scoped>
.trip-filter {
  position: relative;
  z-index: 100;
}

.filter-bar {
  background: #f9fafb;
  padding: 10px 16px;
  position: sticky;
  top: 0;
  z-index: 101;
}

.filter-bar-content {
  max-width: 448px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.filter-items {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-items::-webkit-scrollbar {
  display: none;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: #f8f9fa;
  border-radius: 22px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 13px;
  color: #495057;
  transition: all 0.2s ease;
  border: 1px solid #e5e5e5;
  flex-shrink: 0;
  font-weight: 500;
}

.filter-item:hover {
  background: #f0f0f0;
  border-color: #d5d5d5;
}

.filter-item.active {
  background: #e3f2fd;
  color: #1565c0;
  border-color: #2196f3;
  font-weight: 600;
}

.filter-label {
  font-weight: 500;
}

.filter-count {
  background: #ef4444;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  font-weight: 600;
}

.filter-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.filter-arrow.rotated {
  transform: rotate(180deg);
}

.reset-button {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(220, 53, 69, 0.2);
  margin-left: auto;
}

.reset-button:hover {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
}

.filter-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 440px;
  background: white;
  border: 1px solid #e5e7eb;
  max-height: 380px;
  overflow-y: auto;
  z-index: 102;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
}

.filter-options {
  padding: 16px;
}

.filter-header {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 12px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  font-size: 13px;
}

.option-item:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.option-item input {
  margin: 0;
  cursor: pointer;
}

.option-label {
  font-size: 14px;
  color: #374151;
  user-select: none;
}

.time-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.filter-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99;
}

/* PC端优化 */
@media (min-width: 768px) {
  .filter-bar {
    padding: 12px 20px;
  }
  
  .filter-bar-content {
    max-width: 400px;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 14px;
  }
  
  .filter-items {
    gap: 10px;
  }
  
  .filter-item {
    padding: 8px 16px;
    font-size: 13px;
    border-radius: 18px;
    min-height: 34px;
  }
  
  .filter-item.active {
    background: #e3f2fd;
    color: #1565c0;
    border-color: #2196f3;
    font-weight: 600;
  }
  
  .filter-item:hover:not(.active) {
    background: #f5f5f5;
    border-color: #d0d0d0;
  }
  
  .filter-panel {
    max-width: 400px;
    border-radius: 14px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }
  
  .filter-options {
    padding: 20px;
  }
  
  .options-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
  
  .option-item {
    padding: 11px 14px;
    border-radius: 10px;
    font-size: 13px;
    min-height: 38px;
  }
  
  .reset-button {
    padding: 9px 18px;
    font-size: 13px;
    border-radius: 18px;
  }
}

/* 移动端优化 */
@media (max-width: 480px) {
  .filter-bar {
    padding: 8px;
  }
  
  .filter-bar-content {
    padding: 10px 14px;
  }
  
  .filter-items {
    gap: 6px;
  }
  
  .filter-item {
    padding: 5px 10px;
    font-size: 13px;
  }
  
  .options-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 6px;
  }
  
  .option-item {
    padding: 6px 8px;
  }
  
  .option-label {
    font-size: 12px;
  }
  
  .filter-panel {
    max-height: 350px;
  }
}
</style>