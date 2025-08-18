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
    createdAt: '2025-07-25T10:00:00Z',
    airline: '中国南方航空',
    flightNumber: 'CZ3114'
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
    createdAt: '2025-07-23T15:30:00Z',
    airline: '中国国际航空',
    flightNumber: 'CA1405'
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
    createdAt: '2025-07-11T09:15:00Z',
    airline: '中国东方航空',
    flightNumber: 'MU5138'
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
    createdAt: '2025-05-18T14:20:00Z',
    airline: '海南航空',
    flightNumber: 'HU7148'
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
    createdAt: '2025-05-01T16:45:00Z',
    airline: '春秋航空',
    flightNumber: '9C8813'
  },
  {
    id: '6',
    type: 'train',
    date: '2025-06-15',
    departure: {
      time: '08:30',
      city: '北京',
      station: '北京西站'
    },
    arrival: {
      time: '14:15',
      city: '上海',
      station: '上海虹桥站'
    },
    price: 553,
    createdAt: '2025-06-13T11:20:00Z',
    airline: '中国国家铁路',
    flightNumber: 'G101'
  },
  {
    id: '7',
    type: 'train',
    date: '2025-06-18',
    departure: {
      time: '16:05',
      city: '上海',
      station: '上海虹桥站'
    },
    arrival: {
      time: '21:33',
      city: '北京',
      station: '北京南站'
    },
    price: 553,
    createdAt: '2025-06-16T14:30:00Z',
    airline: '中国国家铁路',
    flightNumber: 'G150'
  }
]