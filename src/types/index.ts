export interface TripRecord {
  id: string
  type: 'flight' | 'train'
  date: string
  departure: {
    time: string
    city: string
    station: string
  }
  arrival: {
    time: string
    city: string
    station: string
  }
  price: number
  createdAt: string
  airline?: string // 航空公司或铁路公司
  flightNumber?: string // 航班号或车次号
  notes?: string // 备注信息
  travelers: string[] // 出行人列表
  // 往返行程关联信息
  roundTrip?: {
    linkedTripId: string // 关联的往返行程ID
    type: 'outbound' | 'return' // 当前行程在往返中的角色：去程或返程
  }
  // 用户手动禁止关联的行程ID列表
  manuallyUnlinkedFrom?: string[]
}

export interface AIConfig {
  baseUrl: string
  model: string
  token: string
}

export interface WebDAVConfig {
  url: string
  username: string
  password: string
  enabled: boolean
  useProxy: boolean
}

export interface TravelerConfig {
  availableTravelers: string[] // 可选的出行人列表
}

export interface SyncData {
  trips: TripRecord[]
  aiConfig: AIConfig | null
  travelerConfig: TravelerConfig | null
  exportDate: string
  version: string
}