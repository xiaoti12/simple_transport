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
}

export interface AIConfig {
  baseUrl: string
  model: string
  token: string
}