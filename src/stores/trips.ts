import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TripRecord } from '@/types'

export const useTripsStore = defineStore('trips', () => {
  const trips = ref<TripRecord[]>([])

  const sortedTrips = computed(() => {
    return [...trips.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  })

  const totalSpent = computed(() => {
    return trips.value.reduce((sum, trip) => sum + trip.price, 0)
  })

  const tripsByType = computed(() => {
    const result = { flight: 0, train: 0 }
    trips.value.forEach(trip => {
      result[trip.type]++
    })
    return result
  })

  // 检测往返行程
  const roundTrips = computed(() => {
    const roundTripList = []
    const usedIndexes = new Set<number>()
    
    for (let i = 0; i < trips.value.length; i++) {
      if (usedIndexes.has(i)) continue
      
      const trip1 = trips.value[i]
      // 提取城市名（去掉机场名）
      const departure1 = trip1.departure.city
      const arrival1 = trip1.arrival.city
      
      for (let j = i + 1; j < trips.value.length; j++) {
        if (usedIndexes.has(j)) continue
        
        const trip2 = trips.value[j]
        const departure2 = trip2.departure.city
        const arrival2 = trip2.arrival.city
        
        // 检查是否为往返（A→B 和 B→A）
        if ((departure1 === arrival2 && arrival1 === departure2)) {
          roundTripList.push({
            outbound: trip1,
            return: trip2,
            totalPrice: trip1.price + trip2.price,
            route: `${departure1} ⇄ ${arrival1}`
          })
          usedIndexes.add(i)
          usedIndexes.add(j)
          break
        }
      }
    }
    
    return { roundTrips: roundTripList, usedIndexes }
  })

  // 单程行程（不在往返行程中的）
  const singleTrips = computed(() => {
    const { usedIndexes } = roundTrips.value
    return trips.value.filter((_, index) => !usedIndexes.has(index))
  })

  function addTrip(trip: Omit<TripRecord, 'id' | 'createdAt'>) {
    const newTrip: TripRecord = {
      ...trip,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
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
    localStorage.setItem('simple-transport-trips', JSON.stringify(trips.value))
  }

  function loadFromStorage() {
    const stored = localStorage.getItem('simple-transport-trips')
    if (stored) {
      trips.value = JSON.parse(stored)
    } else {
      // 如果没有存储数据，自动加载示例数据
      loadSampleData()
    }
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
    addTrip,
    deleteTrip,
    getTripById,
    updateTrip,
    loadFromStorage,
    loadSampleData,
    clearAllTrips,
    saveToStorage
  }
})