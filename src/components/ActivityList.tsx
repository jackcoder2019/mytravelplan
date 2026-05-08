'use client'
import { useState } from 'react'
import { type Activity } from '@/lib/types'
import { parseStartHour } from '@/lib/utils'
import { useDemo } from '@/lib/demo-context'

interface Props {
  activities: Activity[]
  onChange: (activities: Activity[]) => void
}


function Field({ value, onChange, placeholder, className = '', readOnly = false }: {
  value: string; onChange: (v: string) => void; placeholder: string; className?: string; readOnly?: boolean
}) {
  return (
    <input
      className={`editable text-sm ${className}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
    />
  )
}

export default function ActivityList({ activities, onChange }: Props) {
  const isDemo = useDemo()
  const add = () => {
    onChange([...activities, { id: crypto.randomUUID(), name: '', highlight: '', hours: '', address: '', notes: '' }])
  }
  const remove = (id: string) => onChange(activities.filter(a => a.id !== id))
  const update = (id: string, patch: Partial<Activity>) =>
    onChange(activities.map(a => a.id === id ? { ...a, ...patch } : a))

  const [open, setOpen] = useState(true)
  const sorted = [...activities].sort((a, b) => parseStartHour(a.hours) - parseStartHour(b.hours))

  const previewLines = sorted
    .map(a => [a.hours, a.name].filter(Boolean).join(' '))
    .filter(Boolean)

  return (
    <div className="bg-navy-mid rounded-2xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-navy-light transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span
          className="text-gray-400 text-xs transition-transform duration-200 select-none"
          style={{ transform: open ? 'rotate(90deg)' : 'none' }}
        >▸</span>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-accent-teal">
            Activities{activities.length > 0 ? ` (${activities.length})` : ''}
          </span>
          {!open && previewLines.length > 0 && (
            <div className="mt-0.5">
              {previewLines.map((line, i) => (
                <p key={i} className="text-xs text-gray-400 truncate">{line}</p>
              ))}
            </div>
          )}
        </div>
        {!isDemo && (
          <button
            onClick={e => { e.stopPropagation(); add() }}
            className="text-xs px-3 py-1 bg-accent-red hover:bg-red-700 rounded-lg transition-colors"
          >+ Add</button>
        )}
      </div>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: 400 }}>
          {activities.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No activities yet. Add one!</p>
          )}
          {sorted.map(a => (
            <div key={a.id} className="border border-navy-light rounded-xl p-3 space-y-2 group relative">
              {!isDemo && (
                <button
                  onClick={() => remove(a.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-accent-red transition"
                >×</button>
              )}
              <Field value={a.name} onChange={v => update(a.id, { name: v })} placeholder="Activity name" className="font-medium" readOnly={isDemo} />
              <Field value={a.highlight} onChange={v => update(a.id, { highlight: v })} placeholder="Highlight / description" readOnly={isDemo} />
              <Field value={a.hours} onChange={v => update(a.id, { hours: v })} placeholder="Hours (e.g. 9am–12pm)" readOnly={isDemo} />
              <Field value={a.address} onChange={v => update(a.id, { address: v })} placeholder="Address (for map pin)" readOnly={isDemo} />
              <Field value={a.notes} onChange={v => update(a.id, { notes: v })} placeholder="Notes" readOnly={isDemo} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
