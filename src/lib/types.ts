export interface Weather {
  condition: string
  tempHigh: string
  tempLow: string
  notes: string
}

export interface Activity {
  id: string
  name: string
  highlight: string
  hours: string
  address: string
  notes: string
}

export interface Lodging {
  name: string
  address: string
  checkIn: string
  checkOut: string
  confirmation: string
  notes: string
}

export interface Dining {
  id: string
  name: string
  meal: string
  address: string
  hours: string
  notes: string
}

export interface TransportReminder {
  scheduledAt: string  // ISO datetime (UTC)
  email: string
  status: 'pending' | 'sent' | 'failed'
}

export interface Transportation {
  id: string
  mode: string
  from: string
  to: string
  departureDate: string
  departureTime: string
  arrivalDate: string
  arrivalTime: string
  confirmation: string
  notes: string
  reminder?: TransportReminder
}

export interface Day {
  id: string
  date: string
  title: string
  city: string
  weather: Weather
  activities: Activity[]
  lodging: Lodging
  dining: Dining[]
  transportation: Transportation[]
}

export interface Itinerary {
  tripName: string
  days: Day[]
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function emptyDay(index: number): Day {
  return {
    id: crypto.randomUUID(),
    date: '',
    title: `Day ${index}`,
    city: '',
    weather: { condition: '', tempHigh: '', tempLow: '', notes: '' },
    activities: [],
    lodging: { name: '', address: '', checkIn: '', checkOut: '', confirmation: '', notes: '' },
    dining: [],
    transportation: [],
  }
}

export function defaultItinerary(): Itinerary {
  return { tripName: 'My Trip', days: [emptyDay(1)] }
}
