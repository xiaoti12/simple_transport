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
  status: 'used' | 'unused'
  createdAt: string
  airline?: string // 航空公司或铁路公司
  flightNumber?: string // 航班号或车次号
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

export interface SyncData {
  trips: TripRecord[]
  aiConfig: AIConfig | null
  exportDate: string
  version: string
}