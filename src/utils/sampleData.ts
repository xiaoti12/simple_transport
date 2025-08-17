import type { TripRecord } from '@/types'

export const sampleTrips: TripRecord[] = [
  {
    id: '1',
    type: 'flight',
    date: '2025-07-27',
    departure: {
      time: '20:25',
      city: '重庆',
      station: '重庆江北T3'
    },
    arrival: {
      time: '23:15',
      city: '北京',
      station: '北京大兴'
    },
    price: 1280,
    status: 'used',
    createdAt: '2025-07-25T10:00:00Z'
  },
  {
    id: '2',
    type: 'flight',
    date: '2025-07-25',
    departure: {
      time: '21:15',
      city: '北京',
      station: '北京首都T2'
    },
    arrival: {
      time: '00:15+1',
      city: '重庆',
      station: '重庆江北T3'
    },
    price: 956,
    status: 'used',
    createdAt: '2025-07-23T15:30:00Z'
  },
  {
    id: '3',
    type: 'flight',
    date: '2025-07-13',
    departure: {
      time: '17:30',
      city: '上海',
      station: '上海虹桥T2'
    },
    arrival: {
      time: '20:00',
      city: '北京',
      station: '北京首都T3'
    },
    price: 780,
    status: 'used',
    createdAt: '2025-07-11T09:15:00Z'
  },
  {
    id: '4',
    type: 'flight',
    date: '2025-05-20',
    departure: {
      time: '20:00',
      city: '重庆',
      station: '重庆江北T3'
    },
    arrival: {
      time: '22:25',
      city: '北京',
      station: '北京大兴'
    },
    price: 1150,
    status: 'used',
    createdAt: '2025-05-18T14:20:00Z'
  },
  {
    id: '5',
    type: 'flight',
    date: '2025-05-03',
    departure: {
      time: '18:25',
      city: '北京',
      station: '北京大兴'
    },
    arrival: {
      time: '21:10',
      city: '重庆',
      station: '重庆江北T3'
    },
    price: 890,
    status: 'unused',
    createdAt: '2025-05-01T16:45:00Z'
  }
]