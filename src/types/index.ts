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