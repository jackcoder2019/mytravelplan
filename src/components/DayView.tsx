'use client'
import dynamic from 'next/dynamic'
import { type Day } from '@/lib/types'
import ActivityList from './ActivityList'
import LodgingCard from './LodgingCard'
import DiningCard from './DiningCard'
import TransportCard from './TransportCard'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

interface Props {
  day: Day
  onChange: (day: Day) => void
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs text-gray-400 block mb-0.5">{label}</label>
      <input
        type={type}
        className="editable text-sm"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

export default function DayView({ day, onChange }: Props) {
  const set = (patch: Partial<Day>) => onChange({ ...day, ...patch })

  // Collect all geocodable addresses for the map
  const addresses = [
    ...day.activities.filter(a => a.address).map(a => ({ label: a.name || 'Activity', address: a.address, color: 'blue' as const })),
    ...(day.lodging.address ? [{ label: day.lodging.name || 'Lodging', address: day.lodging.address, color: 'green' as const }] : []),
    ...day.dining.filter(d => d.address).map(d => ({ label: d.name || 'Dining', address: d.address, color: 'orange' as const })),
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Day header */}
      <div className="bg-navy-mid rounded-2xl p-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Day Title" value={day.title} onChange={v => set({ title: v })} placeholder="e.g. Arrival Day" />
          <Field label="City" value={day.city} onChange={v => set({ city: v })} placeholder="e.g. Paris" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Field label="Date" value={day.date} onChange={v => set({ date: v })} type="date" />
          <Field label="High Temp" value={day.weather.tempHigh} onChange={v => set({ weather: { ...day.weather, tempHigh: v } })} placeholder="e.g. 75°F" />
          <Field label="Low Temp" value={day.weather.tempLow} onChange={v => set({ weather: { ...day.weather, tempLow: v } })} placeholder="e.g. 58°F" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Condition" value={day.weather.condition} onChange={v => set({ weather: { ...day.weather, condition: v } })} placeholder="e.g. Sunny, Rainy" />
          <Field label="Weather Notes" value={day.weather.notes} onChange={v => set({ weather: { ...day.weather, notes: v } })} placeholder="Bring an umbrella" />
        </div>
      </div>

      {/* Map + Activities */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-navy-mid rounded-2xl overflow-hidden" style={{ minHeight: 320 }}>
          <MapView addresses={addresses} city={day.city} />
        </div>
        <ActivityList
          activities={day.activities}
          onChange={activities => set({ activities })}
        />
      </div>

      {/* Cards row */}
      <div className="grid grid-cols-3 gap-6">
        <LodgingCard lodging={day.lodging} onChange={lodging => set({ lodging })} />
        <DiningCard dining={day.dining} onChange={dining => set({ dining })} />
        <TransportCard transport={day.transportation} onChange={transportation => set({ transportation })} />
      </div>
    </div>
  )
}
