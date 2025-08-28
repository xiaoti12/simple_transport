import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TripRecord, TravelerConfig } from '@/types'

// 生成唯一ID的函数
function generateUniqueId(existingIds: Set<string>): string {
  let id: string
  do {
    // 使用时间戳 + 随机数确保唯一性
    id = `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  } while (existingIds.has(id))
  return id
}

export const useTripsStore = defineStore('trips', () => {
  const trips = ref<TripRecord[]>([])
  const travelerConfig = ref<TravelerConfig>({ availableTravelers: ['我'] })

  // 自动加载数据的标志
  let isLoaded = false

  const sortedTrips = computed(() => {
    // 确保数据已加载
    if (!isLoaded) loadFromStorage()
    return [...trips.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  const totalSpent = computed(() => {
    // 确保数据已加载
    if (!isLoaded) loadFromStorage()
    return trips.value.reduce((sum, trip) => sum + trip.price, 0)
  })

  const tripsByType = computed(() => {
    // 确保数据已加载
    if (!isLoaded) loadFromStorage()
    const result = { flight: 0, train: 0 }
    trips.value.forEach(trip => {
      result[trip.type]++
    })
    return result
  })

  // 检测往返行程
  const roundTrips = computed(() => {
    // 确保数据已加载
    if (!isLoaded) loadFromStorage()
    console.log('开始检测往返行程，总行程数:', trips.value.length)
    const roundTripList = []
    const usedIndexes = new Set<number>()

    // 按时间倒序排序，从最新的开始检测
    const sortedTripIndices = trips.value
      .map((trip, index) => ({ trip, index }))
      .sort((a, b) => new Date(b.trip.date).getTime() - new Date(a.trip.date).getTime())

    for (let i = 0; i < sortedTripIndices.length; i++) {
      if (usedIndexes.has(sortedTripIndices[i].index)) continue

      const { trip: trip1, index: index1 } = sortedTripIndices[i]
      const departure1 = trip1.departure.city
      const arrival1 = trip1.arrival.city

      // 从当前行程往后检查（时间上更早的行程）
      for (let j = i + 1; j < sortedTripIndices.length; j++) {
        if (usedIndexes.has(sortedTripIndices[j].index)) continue

        const { trip: trip2, index: index2 } = sortedTripIndices[j]
        const departure2 = trip2.departure.city
        const arrival2 = trip2.arrival.city

        // 检查是否为往返（A→B 和 B→A）
        if ((departure1 === arrival2 && arrival1 === departure2)) {
          // 计算时间间隔（以天为单位）
          const date1 = new Date(trip1.date)
          const date2 = new Date(trip2.date)
          const daysDiff = Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)

          // 只有在合理的时间范围内才认为是往返行程（比如30天内）
          if (daysDiff <= 30) {
            // trip1是较新的（返程），trip2是较早的（去程）
            const outboundTrip = trip2  // 较早的行程作为去程
            const returnTrip = trip1    // 较新的行程作为返程
            console.log(`检测到往返行程: ${outboundTrip.departure.city} ⇄ ${outboundTrip.arrival.city} (去程:${outboundTrip.date}, 返程:${returnTrip.date}, 间隔${Math.round(daysDiff)}天)`)
            roundTripList.push({
              outbound: outboundTrip,
              return: returnTrip,
              totalPrice: trip1.price + trip2.price,
              route: `${outboundTrip.departure.city} ⇄ ${outboundTrip.arrival.city}`
            })
            usedIndexes.add(index1)
            usedIndexes.add(index2)
            break
          }
        }
      }
    }

    console.log(`往返行程检测完成，发现${roundTripList.length}个往返行程`)
    return { roundTrips: roundTripList, usedIndexes }
  })

  // 单程行程（不在往返行程中的）
  const singleTrips = computed(() => {
    const { usedIndexes } = roundTrips.value
    return trips.value.filter((_, index) => !usedIndexes.has(index))
  })

  // 统一排序的行程列表（往返行程和单程行程按时间倒序混合）
  const sortedAllTrips = computed(() => {
    const allItems: Array<{
      type: 'round' | 'single'
      data: any
      sortDate: Date
    }> = []

    // 添加往返行程（使用出发时间作为排序依据）
    roundTrips.value.roundTrips.forEach(roundTrip => {
      allItems.push({
        type: 'round',
        data: roundTrip,
        sortDate: new Date(roundTrip.outbound.date)
      })
    })

    // 添加单程行程
    singleTrips.value.forEach(trip => {
      allItems.push({
        type: 'single',
        data: trip,
        sortDate: new Date(trip.date)
      })
    })

    // 按时间倒序排序（最新的在前面）
    return allItems.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
  })

  function addTrip(trip: Omit<TripRecord, 'id' | 'createdAt'>) {
    const existingIds = new Set(trips.value.map(t => t.id))
    const newTrip: TripRecord = {
      ...trip,
      id: generateUniqueId(existingIds),
      createdAt: new Date().toISOString(),
      travelers: trip.travelers && trip.travelers.length > 0 ? trip.travelers : ['我']
    }
    trips.value.push(newTrip)
    saveToStorage()
  }

  function deleteTrip(id: string) {
    const index = trips.value.findIndex(trip => trip.id === id)
    if (index > -1) {
      trips.value.splice(index, 1)
      saveToStorage()
    }
  }

  function getTripById(id: string): TripRecord | undefined {
    return trips.value.find(trip => trip.id === id)
  }

  function updateTrip(tripOrId: TripRecord | string, updates?: Partial<TripRecord>) {
    if (typeof tripOrId === 'string') {
      // 旧的调用方式：updateTrip(id, updates)
      const trip = trips.value.find(t => t.id === tripOrId)
      if (trip && updates) {
        Object.assign(trip, updates)
        saveToStorage()
      }
    } else {
      // 新的调用方式：updateTrip(trip)
      const trip = trips.value.find(t => t.id === tripOrId.id)
      if (trip) {
        Object.assign(trip, tripOrId)
        saveToStorage()
      }
    }
  }

  function saveToStorage() {
    console.log('保存数据到localStorage:', {
      trips: trips.value.length,
      travelers: travelerConfig.value.availableTravelers
    })
    localStorage.setItem('simple-transport-trips', JSON.stringify(trips.value))
    localStorage.setItem('simple-transport-traveler-config', JSON.stringify(travelerConfig.value))
  }

  // 出行人配置的 getter，确保数据已加载
  const getTravelerConfig = computed(() => {
    if (!isLoaded) loadFromStorage()
    return travelerConfig.value
  })

  // 出行人配置管理
  function addTraveler(name: string) {
    // 确保数据已加载
    if (!isLoaded) loadFromStorage()
    if (!travelerConfig.value.availableTravelers.includes(name)) {
      travelerConfig.value.availableTravelers.push(name)
      saveToStorage()
    }
  }

  function removeTraveler(name: string) {
    // 确保数据已加载
    if (!isLoaded) loadFromStorage()
    // 不能删除"我"
    if (name === '我') return

    const index = travelerConfig.value.availableTravelers.indexOf(name)
    if (index > -1) {
      travelerConfig.value.availableTravelers.splice(index, 1)
      saveToStorage()
    }
  }

  function updateTravelerList(travelers: string[]) {
    // 确保数据已加载
    if (!isLoaded) loadFromStorage()
    // 确保"我"始终在列表中
    if (!travelers.includes('我')) {
      travelers.unshift('我')
    }
    travelerConfig.value.availableTravelers = travelers
    saveToStorage()
  }

  // 修复重复ID的函数，返回是否有变化
  function fixDuplicateIds(): boolean {
    const seenIds = new Set<string>()
    const existingIds = new Set(trips.value.map(t => t.id))
    let hasChanges = false

    trips.value.forEach(trip => {
      if (seenIds.has(trip.id)) {
        // 发现重复ID，生成新的唯一ID
        const newId = generateUniqueId(existingIds)
        existingIds.add(newId)
        trip.id = newId
        hasChanges = true
        console.warn(`修复重复ID: 为行程生成新ID ${newId}`)
      } else {
        seenIds.add(trip.id)
      }
    })

    if (hasChanges) {
      console.log('已修复数据中的重复ID问题')
    }

    return hasChanges
  }

  function loadFromStorage() {
    if (isLoaded) return // 防止重复加载

    console.log('开始从localStorage加载数据')

    // 先加载出行人配置
    const storedTravelerConfig = localStorage.getItem('simple-transport-traveler-config')
    if (storedTravelerConfig) {
      console.log('找到存储的出行人配置:', storedTravelerConfig)
      travelerConfig.value = JSON.parse(storedTravelerConfig)
      // 确保"我"在列表中
      if (!travelerConfig.value.availableTravelers.includes('我')) {
        travelerConfig.value.availableTravelers.unshift('我')
      }
      console.log('加载出行人配置完成:', travelerConfig.value.availableTravelers)
    } else {
      console.log('未找到存储的出行人配置，使用默认值')
    }

    // 再加载出行记录
    const stored = localStorage.getItem('simple-transport-trips')
    if (stored) {
      trips.value = JSON.parse(stored)
      // 加载后检查并修复重复ID
      let idFixed = fixDuplicateIds()
      // 兼容旧数据：为没有travelers字段的旅行记录添加默认值
      let needsSave = false
      trips.value.forEach(trip => {
        if (!trip.travelers) {
          trip.travelers = ['我']
          needsSave = true
        }
      })
      // 只有在有变化时才保存
      if (idFixed || needsSave) {
        saveToStorage()
      }
    } else {
      // 如果没有存储数据，自动加载示例数据
      loadSampleData()
    }

    isLoaded = true
  }

  function loadSampleData() {
    import('@/utils/sampleData').then(({ sampleTrips }) => {
      trips.value = sampleTrips
      saveToStorage()
    })
  }

  function clearAllTrips() {
    trips.value = []
    saveToStorage()
  }

  return {
    trips,
    sortedTrips,
    totalSpent,
    tripsByType,
    roundTrips,
    singleTrips,
    sortedAllTrips,
    travelerConfig: getTravelerConfig,
    addTrip,
    deleteTrip,
    getTripById,
    updateTrip,
    addTraveler,
    removeTraveler,
    updateTravelerList,
    loadFromStorage,
    loadSampleData,
    clearAllTrips,
    saveToStorage,
    fixDuplicateIds
  }
})