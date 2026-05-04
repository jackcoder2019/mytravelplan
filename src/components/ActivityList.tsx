'use client'
import { type Activity } from '@/lib/types'

interface Props {
  activities: Activity[]
  onChange: (activities: Activity[]) => void
}

function Field({ value, onChange, placeholder, className = '' }: {
  value: string; onChange: (v: string) => void; placeholder: string; className?: string
}) {
  return (
    <input
      className={`editable text-sm ${className}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

export default function ActivityList({ activities, onChange }: Props) {
  const add = () => {
    onChange([...activities, { id: crypto.randomUUID(), name: '', highlight: '', hours: '', address: '', notes: '' }])
  }
  const remove = (id: string) => onChange(activities.filter(a => a.id !== id))
  const update = (id: string, patch: Partial<Activity>) =>
    onChange(activities.map(a => a.id === id ? { ...a, ...patch } : a))

  return (
    <div className="bg-navy-mid rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: 400 }}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-accent-teal">Activities</h3>
        <button onClick={add} className="text-xs px-3 py-1 bg-accent-red hover:bg-red-700 rounded-lg transition-colors">+ Add</button>
      </div>

      {activities.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">No activities yet. Add one!</p>
      )}

      {activities.map(a => (
        <div key={a.id} className="border border-navy-light rounded-xl p-3 space-y-2 group relative">
          <button
            onClick={() => remove(a.id)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-accent-red transition"
          >×</button>
          <Field value={a.name} onChange={v => update(a.id, { name: v })} placeholder="Activity name" className="font-medium" />
          <Field value={a.highlight} onChange={v => update(a.id, { highlight: v })} placeholder="Highlight / description" />
          <Field value={a.hours} onChange={v => update(a.id, { hours: v })} placeholder="Hours (e.g. 9am–12pm)" />
          <Field value={a.address} onChange={v => update(a.id, { address: v })} placeholder="Address (for map pin)" />
          <Field value={a.notes} onChange={v => update(a.id, { notes: v })} placeholder="Notes" />
        </div>
      ))}
    </div>
  )
}
