'use client'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { type Day } from '@/lib/types'
import { parseStartHour } from '@/lib/utils'
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
  const [fetchingWeather, setFetchingWeather] = useState(false)
  const dayRef = useRef(day)
  dayRef.current = day

  const fetchWeather = async () => {
    const d = dayRef.current
    if (!d.city || !d.date || fetchingWeather) return
    setFetchingWeather(true)
    try {
      const r = await fetch(`/api/weather?city=${encodeURIComponent(d.city)}&date=${encodeURIComponent(d.date)}`)
      if (!r.ok) return
      const { tempHigh, tempLow, condition } = await r.json()
      onChange({ ...dayRef.current, weather: { ...dayRef.current.weather, tempHigh, tempLow, condition } })
    } catch { /* ignore */ }
    finally { setFetchingWeather(false) }
  }

  // Auto-fetch when city + date are both set and weather hasn't been filled in yet
  useEffect(() => {
    if (!day.city || !day.date || day.weather.condition || day.weather.tempHigh) return
    const t = setTimeout(fetchWeather, 800)
    return () => clearTimeout(t)
  }, [day.city, day.date]) // eslint-disable-line

  // Rank activities by start time so each map pin gets its chronological number
  const activityRank = new Map(
    [...day.activities]
      .sort((a, b) => parseStartHour(a.hours) - parseStartHour(b.hours))
      .map((a, i) => [a.id, i + 1])
  )

  const addresses = [
    ...day.activities.filter(a => a.address).map(a => ({
      label: a.name || 'Activity',
      address: a.address,
      color: 'blue' as const,
      number: activityRank.get(a.id),
    })),
    ...(day.lodging.address ? [{ label: day.lodging.name || 'Lodging', address: day.lodging.address, color: 'green' as const }] : []),
    ...day.dining.filter(d => d.address).map(d => ({ label: d.name || 'Dining', address: d.address, color: 'orange' as const })),
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      {/* Day header */}
      <div className="bg-navy-mid rounded-2xl p-4 md:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Day Title" value={day.title} onChange={v => set({ title: v })} placeholder="e.g. Arrival Day" />
          <Field label="City" value={day.city} onChange={v => set({ city: v })} placeholder="e.g. Paris" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Field label="Date" value={day.date} onChange={v => set({ date: v })} type="date" />
          <Field label="High Temp" value={day.weather.tempHigh} onChange={v => set({ weather: { ...day.weather, tempHigh: v } })} placeholder="e.g. 75°F" />
          <Field label="Low Temp" value={day.weather.tempLow} onChange={v => set({ weather: { ...day.weather, tempLow: v } })} placeholder="e.g. 58°F" />
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Weather</span>
          <button
            onClick={fetchWeather}
            disabled={fetchingWeather || !day.city || !day.date}
            className="text-xs px-2 py-0.5 rounded bg-navy-light hover:bg-navy-deep text-gray-300 disabled:opacity-40 transition-colors"
          >
            {fetchingWeather ? 'Fetching…' : '↻ Auto-fill'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Condition" value={day.weather.condition} onChange={v => set({ weather: { ...day.weather, condition: v } })} placeholder="e.g. Sunny, Rainy" />
          <Field label="Weather Notes" value={day.weather.notes} onChange={v => set({ weather: { ...day.weather, notes: v } })} placeholder="Bring an umbrella" />
        </div>
      </div>

      {/* Map + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-navy-mid rounded-2xl overflow-hidden" style={{ minHeight: 280 }}>
          <MapView addresses={addresses} city={day.city} dayId={day.id} />
        </div>
        <ActivityList
          activities={day.activities}
          onChange={activities => set({ activities })}
        />
      </div>

      {/* Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <LodgingCard lodging={day.lodging} onChange={lodging => set({ lodging })} />
        <DiningCard dining={day.dining} onChange={dining => set({ dining })} />
        <TransportCard transport={day.transportation} onChange={transportation => set({ transportation })} />
      </div>
    </div>
  )
}
