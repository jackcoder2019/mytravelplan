'use client'
import dynamic from 'next/dynamic'
import { type Itinerary } from '@/lib/types'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

export default function OverviewView({ itinerary }: { itinerary: Itinerary }) {
  // Group days by city so duplicate cities share one pin
  const cityMap = new Map<string, { city: string; numbers: number[] }>()
  itinerary.days.forEach((d, i) => {
    if (!d.city) return
    const key = d.city.toLowerCase().trim()
    if (cityMap.has(key)) {
      cityMap.get(key)!.numbers.push(i + 1)
    } else {
      cityMap.set(key, { city: d.city, numbers: [i + 1] })
    }
  })

  const pins = Array.from(cityMap.values()).map(({ city, numbers }) => ({
    label: `Day ${numbers.join(', ')} · ${city}`,
    address: city,
    color: 'blue' as const,
    number: numbers[0],
  }))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-navy-mid rounded-2xl overflow-hidden" style={{ minHeight: 'calc(100vh - 7rem)' }}>
        <MapView addresses={pins} dayId="__overview__" />
      </div>
    </div>
  )
}
