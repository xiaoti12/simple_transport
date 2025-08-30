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

  // 最多的出行城市统计（TOP 5）
  const topDepartureCities = computed(() => {
    if (!isLoaded) loadFromStorage()
    const cityStats: Record<string, number> = {}
    trips.value.forEach(trip => {
      const city = trip.departure.city
      cityStats[city] = (cityStats[city] || 0) + 1
    })
    return Object.entries(cityStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }))
  })

  // 最多的到达城市统计（TOP 5）
  const topArrivalCities = computed(() => {
    if (!isLoaded) loadFromStorage()
    const cityStats: Record<string, number> = {}
    trips.value.forEach(trip => {
      const city = trip.arrival.city
      cityStats[city] = (cityStats[city] || 0) + 1
    })
    return Object.entries(cityStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }))
  })

  // 最多的往返行程统计（TOP 5）
  const topRoundTripRoutes = computed(() => {
    if (!isLoaded) loadFromStorage()
    const routeStats: Record<string, number> = {}
    const { roundTrips: roundTripsList } = roundTrips.value
    
    roundTripsList.forEach(roundTrip => {
      const route = roundTrip.route
      routeStats[route] = (routeStats[route] || 0) + 1
    })
    
    return Object.entries(routeStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([route, count]) => ({ route, count }))
  })

  // 最多的航空公司统计（TOP 5）
  const topAirlines = computed(() => {
    if (!isLoaded) loadFromStorage()
    const airlineStats: Record<string, number> = {}
    trips.value.forEach(trip => {
      if (trip.airline) {
        const airline = trip.airline
        airlineStats[airline] = (airlineStats[airline] || 0) + 1
      }
    })
    return Object.entries(airlineStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([airline, count]) => ({ airline, count }))
  })

  // 检测往返行程
  const roundTrips = computed(() => {
    // 确保数据已加载
    if (!isLoaded) loadFromStorage()
    console.log('开始检测往返行程，总行程数:', trips.value.length)
    const roundTripList = []
    const usedIndexes = new Set<number>()

    // 首先收集已经有缓存关联的往返行程
    const cachedRoundTrips = new Map<string, { outbound?: TripRecord, return?: TripRecord }>()

    trips.value.forEach((trip, index) => {
      if (trip.roundTrip) {
        const linkedTripId = trip.roundTrip.linkedTripId

        // 使用两个行程ID中较小的那个作为key，确保往返行程对使用同一个key
        const pairKey = trip.id < linkedTripId ? `${trip.id}-${linkedTripId}` : `${linkedTripId}-${trip.id}`

        if (!cachedRoundTrips.has(pairKey)) {
          cachedRoundTrips.set(pairKey, {})
        }
        const roundTrip = cachedRoundTrips.get(pairKey)!
        if (trip.roundTrip.type === 'outbound') {
          roundTrip.outbound = trip
        } else {
          roundTrip.return = trip
        }
        usedIndexes.add(index)
      }
    })

    console.log('缓存往返行程组数:', cachedRoundTrips.size)

    // 将完整的缓存往返行程添加到结果中
    cachedRoundTrips.forEach((roundTrip) => {
      if (roundTrip.outbound && roundTrip.return) {
        roundTripList.push({
          outbound: roundTrip.outbound,
          return: roundTrip.return,
          totalPrice: roundTrip.outbound.price + roundTrip.return.price,
          route: `${roundTrip.outbound.departure.city} ⇄ ${roundTrip.outbound.arrival.city}`
        })
      }
    })

    // 对没有缓存关联的行程进行检测
    const uncachedTrips = trips.value.filter((_, index) => !usedIndexes.has(index))
    console.log(`开始检测未缓存的行程，数量: ${uncachedTrips.length}`)

    // 按时间倒序排序，从最新的开始检测
    const sortedTripIndices = uncachedTrips
      .map((trip) => {
        // 找到在原数组中的索引
        const realIndex = trips.value.findIndex(t => t.id === trip.id)
        return { trip, index: realIndex }
      })
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
          // 检查是否被用户手动禁止关联
          if (isManuallyUnlinked(trip1.id, trip2.id)) {
            console.log(`跳过自动关联: ${trip1.id} <-> ${trip2.id}，用户已手动禁止`)
            continue
          }

          // 计算时间间隔（以天为单位）
          const date1 = new Date(trip1.date)
          const date2 = new Date(trip2.date)
          const daysDiff = Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)

          // 只有在合理的时间范围内才认为是往返行程（比如30天内）
          if (daysDiff <= 30) {
            // trip1是较新的（返程），trip2是较早的（去程）
            const outboundTrip = trip2  // 较早的行程作为去程
            const returnTrip = trip1    // 较新的行程作为返程
            console.log(`新检测到往返行程: ${outboundTrip.departure.city} ⇄ ${outboundTrip.arrival.city} (去程:${outboundTrip.date}, 返程:${returnTrip.date}, 间隔${Math.round(daysDiff)}天)`)

            // 更新行程的往返关联信息（批量更新，稍后统一保存）
            updateTripRoundTripLinkBatch(outboundTrip.id, returnTrip.id, 'outbound')
            updateTripRoundTripLinkBatch(returnTrip.id, outboundTrip.id, 'return')

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

    // 如果检测到新的往返关联，保存到localStorage
    if (roundTripList.length > cachedRoundTrips.size) {
      console.log('检测到新的往返关联，保存到localStorage')
      saveToStorage()
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
    const { roundTrips: roundTripsList } = roundTrips.value

    roundTripsList.forEach(roundTrip => {
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

    // 检测新行程是否与现有行程形成往返关系
    const foundRoundTrip = detectRoundTripForNewTrip(newTrip)

    // 如果没有检测到往返关系（detectRoundTripForNewTrip内部没有保存），则这里保存
    if (!foundRoundTrip) {
      saveToStorage()
    }
  }

  // 为新添加的行程检测往返关联，返回是否找到了往返关系
  function detectRoundTripForNewTrip(newTrip: TripRecord): boolean {
    const newDeparture = newTrip.departure.city
    const newArrival = newTrip.arrival.city
    const newDate = new Date(newTrip.date)

    // 查找可能的往返匹配行程（30天内，且没有已有的往返关联）
    for (const existingTrip of trips.value) {
      if (existingTrip.id === newTrip.id || existingTrip.roundTrip) continue

      const existingDeparture = existingTrip.departure.city
      const existingArrival = existingTrip.arrival.city
      const existingDate = new Date(existingTrip.date)

      // 检查是否为往返（A→B 和 B→A）
      if (newDeparture === existingArrival && newArrival === existingDeparture) {
        // 检查是否被用户手动禁止关联
        if (isManuallyUnlinked(newTrip.id, existingTrip.id)) {
          console.log(`跳过新行程自动关联: ${newTrip.id} <-> ${existingTrip.id}，用户已手动禁止`)
          continue
        }

        const daysDiff = Math.abs(newDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60 * 24)

        if (daysDiff <= 30) {
          // 确定去程和返程
          const isNewTripLater = newDate > existingDate
          const outboundTrip = isNewTripLater ? existingTrip : newTrip
          const returnTrip = isNewTripLater ? newTrip : existingTrip

          console.log(`新行程自动关联往返: ${outboundTrip.departure.city} ⇄ ${outboundTrip.arrival.city} (去程:${outboundTrip.date}, 返程:${returnTrip.date}, 间隔${Math.round(daysDiff)}天)`)

          // 建立往返关联
          updateTripRoundTripLinkBatch(outboundTrip.id, returnTrip.id, 'outbound')
          updateTripRoundTripLinkBatch(returnTrip.id, outboundTrip.id, 'return')

          // 立即保存新建立的关联
          saveToStorage()

          return true // 找到一个匹配就停止
        }
      }
    }
    return false // 没有找到匹配的往返行程
  }

  function deleteTrip(id: string) {
    const index = trips.value.findIndex(trip => trip.id === id)
    if (index > -1) {
      // 清除往返关联
      clearTripRoundTripLink(id)
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

  // 更新行程的往返关联信息
  function updateTripRoundTripLink(tripId: string, linkedTripId: string, type: 'outbound' | 'return') {
    const trip = trips.value.find(t => t.id === tripId)
    if (trip) {
      trip.roundTrip = {
        linkedTripId,
        type
      }
      // 立即保存到localStorage
      saveToStorage()
    }
  }

  // 批量更新往返关联信息（不立即保存）
  function updateTripRoundTripLinkBatch(tripId: string, linkedTripId: string, type: 'outbound' | 'return') {
    const trip = trips.value.find(t => t.id === tripId)
    if (trip) {
      trip.roundTrip = {
        linkedTripId,
        type
      }
    }
  }

  // 检查两个行程是否被用户手动禁止关联
  function isManuallyUnlinked(tripId1: string, tripId2: string): boolean {
    const trip1 = trips.value.find(t => t.id === tripId1)
    const trip2 = trips.value.find(t => t.id === tripId2)

    return (trip1?.manuallyUnlinkedFrom?.includes(tripId2) ||
      trip2?.manuallyUnlinkedFrom?.includes(tripId1)) || false
  }

  // 仅清除往返关联信息，不记录禁止关联
  function clearTripRoundTripLinkOnly(tripId: string) {
    const trip = trips.value.find(t => t.id === tripId)
    if (!trip || !trip.roundTrip) {
      console.log(`clearTripRoundTripLinkOnly: 行程 ${tripId} 没有关联信息`)
      return
    }

    const linkedTripId = trip.roundTrip.linkedTripId
    const linkedTrip = trips.value.find(t => t.id === linkedTripId)

    console.log(`clearTripRoundTripLinkOnly: 开始清除 ${tripId} <-> ${linkedTripId} 的关联`)

    // 清除双向关联
    delete trip.roundTrip
    if (linkedTrip && linkedTrip.roundTrip) {
      delete linkedTrip.roundTrip
      console.log(`clearTripRoundTripLinkOnly: 已清除关联行程 ${linkedTripId} 的roundTrip字段`)
    } else {
      console.log(`clearTripRoundTripLinkOnly: 关联行程 ${linkedTripId} 没有roundTrip字段或不存在`)
    }

    console.log(`clearTripRoundTripLinkOnly: 已清除主行程 ${tripId} 的roundTrip字段`)
  }

  // 清除行程的往返关联信息并记录禁止自动关联
  function clearTripRoundTripLink(tripId: string) {
    const trip = trips.value.find(t => t.id === tripId)
    if (!trip || !trip.roundTrip) {
      console.log(`clearTripRoundTripLink: 行程 ${tripId} 没有关联信息`)
      return
    }

    const linkedTripId = trip.roundTrip.linkedTripId
    const linkedTrip = trips.value.find(t => t.id === linkedTripId)

    console.log(`clearTripRoundTripLink: 开始处理用户手动解除关联 ${tripId} <-> ${linkedTripId}`)

    // 1. 先清除双向关联
    delete trip.roundTrip
    if (linkedTrip && linkedTrip.roundTrip) {
      delete linkedTrip.roundTrip
    }
    console.log(`clearTripRoundTripLink: 已清除双向roundTrip字段`)

    // 2. 记录用户手动禁止关联信息
    if (!trip.manuallyUnlinkedFrom) {
      trip.manuallyUnlinkedFrom = []
    }
    if (!trip.manuallyUnlinkedFrom.includes(linkedTripId)) {
      trip.manuallyUnlinkedFrom.push(linkedTripId)
    }

    if (linkedTrip) {
      if (!linkedTrip.manuallyUnlinkedFrom) {
        linkedTrip.manuallyUnlinkedFrom = []
      }
      if (!linkedTrip.manuallyUnlinkedFrom.includes(tripId)) {
        linkedTrip.manuallyUnlinkedFrom.push(tripId)
      }
    }

    console.log(`clearTripRoundTripLink: 已记录禁止自动关联信息`)

    // 3. 验证最终状态
    console.log(`clearTripRoundTripLink: 验证最终状态:`, {
      trip1: {
        id: tripId,
        hasRoundTrip: !!trip.roundTrip,
        manuallyUnlinkedFrom: trip.manuallyUnlinkedFrom || []
      },
      trip2: linkedTrip ? {
        id: linkedTripId,
        hasRoundTrip: !!linkedTrip.roundTrip,
        manuallyUnlinkedFrom: linkedTrip.manuallyUnlinkedFrom || []
      } : '不存在'
    })

    // 4. 立即保存到localStorage
    saveToStorage()
    console.log(`clearTripRoundTripLink: 完成处理并保存`)
  }

  // 获取指定行程在指定天数范围内的可关联行程列表
  function getAvailableTripsForLinking(tripId: string, dayRange: number = 30) {
    const currentTrip = trips.value.find(t => t.id === tripId)
    if (!currentTrip) return []

    const currentDate = new Date(currentTrip.date)
    const currentDeparture = currentTrip.departure.city
    const currentArrival = currentTrip.arrival.city

    const availableTrips = trips.value.filter(trip => {
      // 排除自己
      if (trip.id === tripId) return false

      // 排除已经有关联的行程
      if (trip.roundTrip) return false

      // 检查时间范围（前后30天）
      const tripDate = new Date(trip.date)
      const daysDiff = Math.abs(tripDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysDiff > dayRange) return false

      // 检查是否为往返路线（A→B 和 B→A）
      const tripDeparture = trip.departure.city
      const tripArrival = trip.arrival.city

      return (currentDeparture === tripArrival && currentArrival === tripDeparture)
    }).sort((a, b) => {
      // 按时间排序
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    return availableTrips
  }

  // 建立两个行程之间的往返关联
  function linkTrips(trip1Id: string, trip2Id: string) {
    const trip1 = trips.value.find(t => t.id === trip1Id)
    const trip2 = trips.value.find(t => t.id === trip2Id)

    if (!trip1 || !trip2) {
      console.error('无法找到要关联的行程')
      return false
    }

    // 清除现有关联（不记录禁止信息，因为用户要重新关联）
    if (trip1.roundTrip) clearTripRoundTripLinkOnly(trip1Id)
    if (trip2.roundTrip) clearTripRoundTripLinkOnly(trip2Id)

    // 清除之前的手动禁止关联记录（用户现在手动选择要关联了）
    if (trip1.manuallyUnlinkedFrom) {
      const index1 = trip1.manuallyUnlinkedFrom.indexOf(trip2Id)
      if (index1 > -1) {
        trip1.manuallyUnlinkedFrom.splice(index1, 1)
      }
    }
    if (trip2.manuallyUnlinkedFrom) {
      const index2 = trip2.manuallyUnlinkedFrom.indexOf(trip1Id)
      if (index2 > -1) {
        trip2.manuallyUnlinkedFrom.splice(index2, 1)
      }
    }

    // 确定去程和返程
    const date1 = new Date(trip1.date)
    const date2 = new Date(trip2.date)
    const isTrip1Earlier = date1 <= date2

    const outboundTrip = isTrip1Earlier ? trip1 : trip2
    const returnTrip = isTrip1Earlier ? trip2 : trip1

    // 建立双向关联
    updateTripRoundTripLinkBatch(outboundTrip.id, returnTrip.id, 'outbound')
    updateTripRoundTripLinkBatch(returnTrip.id, outboundTrip.id, 'return')

    // 保存
    saveToStorage()

    console.log(`用户手动建立往返关联: ${outboundTrip.departure.city} ⇄ ${outboundTrip.arrival.city} (去程:${outboundTrip.date}, 返程:${returnTrip.date})`)
    return true
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
    }

    isLoaded = true
  }


  function clearAllTrips() {
    trips.value = []
    saveToStorage()
  }

  // 调试函数：清除localStorage并重新加载示例数据
  function resetAndReloadData() {
    localStorage.removeItem('simple-transport-trips')
    localStorage.removeItem('simple-transport-traveler-config')
    isLoaded = false
    loadFromStorage()
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
    topDepartureCities,
    topArrivalCities,
    topRoundTripRoutes,
    topAirlines,
    addTrip,
    deleteTrip,
    getTripById,
    updateTrip,
    addTraveler,
    removeTraveler,
    updateTravelerList,
    updateTripRoundTripLink,
    clearTripRoundTripLink,
    getAvailableTripsForLinking,
    linkTrips,
    loadFromStorage,
    clearAllTrips,
    saveToStorage,
    fixDuplicateIds,
    resetAndReloadData
  }
})