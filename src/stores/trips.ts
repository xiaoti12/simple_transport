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

  function updateTrip(id: string, updates: Partial<TripRecord>) {
    const trip = trips.value.find(t => t.id === id)
    if (trip) {
      Object.assign(trip, updates)
      saveToStorage()
    }
  }

  function saveToStorage() {
    localStorage.setItem('simple-transport-trips', JSON.stringify(trips.value))
  }

  function loadFromStorage() {
    const stored = localStorage.getItem('simple-transport-trips')
    if (stored) {
      trips.value = JSON.parse(stored)
    }
  }

  function loadSampleData() {
    import('@/utils/sampleData').then(({ sampleTrips }) => {
      trips.value = sampleTrips
      saveToStorage()
    })
  }

  return {
    trips,
    sortedTrips,
    totalSpent,
    tripsByType,
    addTrip,
    deleteTrip,
    updateTrip,
    loadFromStorage,
    loadSampleData
  }
})