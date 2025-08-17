import type { TripRecord } from '@/types'

export const sampleTrips: TripRecord[] = [
  {
    id: '1',
    type: 'train',
    date: '2024-08-15',
    departure: {
      time: '2024-08-15T08:00',
      city: '北京',
      station: '北京南站'
    },
    arrival: {
      time: '2024-08-15T12:30',
      city: '上海',
      station: '上海虹桥站'
    },
    price: 553,
    status: 'used',
    createdAt: '2024-08-10T10:00:00Z'
  },
  {
    id: '2',
    type: 'flight',
    date: '2024-08-20',
    departure: {
      time: '2024-08-20T14:30',
      city: '上海',
      station: '浦东国际机场T2'
    },
    arrival: {
      time: '2024-08-20T17:45',
      city: '深圳',
      station: '宝安国际机场T3'
    },
    price: 850,
    status: 'used',
    createdAt: '2024-08-18T15:30:00Z'
  },
  {
    id: '3',
    type: 'train',
    date: '2024-08-25',
    departure: {
      time: '2024-08-25T19:20',
      city: '深圳',
      station: '深圳北站'
    },
    arrival: {
      time: '2024-08-26T07:55',
      city: '北京',
      station: '北京西站'
    },
    price: 628,
    status: 'unused',
    createdAt: '2024-08-22T09:15:00Z'
  }
]