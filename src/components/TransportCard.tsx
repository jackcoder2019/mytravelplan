'use client'
import { useState } from 'react'
import { type Transportation } from '@/lib/types'
import { useDemo } from '@/lib/demo-context'

interface Props { transport: Transportation[]; onChange: (t: Transportation[]) => void }

const MODES = ['Flight', 'Train', 'Car', 'Bus', 'Ferry', 'Walk', 'Other']

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  const isDemo = useDemo()
  return (
    <div>
      <label className="text-xs text-gray-400">{label}</label>
      <input type={type} className="editable text-sm mt-0.5" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} readOnly={isDemo} />
    </div>
  )
}

export default function TransportCard({ transport, onChange }: Props) {
  const isDemo = useDemo()
  const [open, setOpen] = useState(true)
  const add = () => onChange([...transport, { id: crypto.randomUUID(), mode: '', from: '', to: '', departureDate: '', departureTime: '', arrivalDate: '', arrivalTime: '', confirmation: '', notes: '' }])
  const remove = (id: string) => onChange(transport.filter(t => t.id !== id))
  const update = (id: string, patch: Partial<Transportation>) => onChange(transport.map(t => t.id === id ? { ...t, ...patch } : t))

  const previewLines = transport.map(t =>
    [t.mode, [t.from, t.to].filter(Boolean).join(' → ')].filter(Boolean).join(' · ')
  ).filter(Boolean)

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
            Transportation{transport.length > 0 ? ` (${transport.length})` : ''}
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

      {open && <div className="px-5 pb-5 space-y-3">
        {transport.map(t => (
          <div key={t.id} className="border border-navy-light rounded-xl p-3 space-y-3 group relative">
            {!isDemo && (
              <button onClick={() => remove(t.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-accent-red transition">×</button>
            )}
            <div>
              <label className="text-xs text-gray-400">Mode</label>
              <select className="w-full bg-transparent border-b border-gray-600 text-sm mt-0.5 outline-none focus:border-accent-teal"
                value={t.mode} onChange={e => update(t.id, { mode: e.target.value })} disabled={isDemo}>
                <option value="" className="bg-navy-mid">Select mode</option>
                {MODES.map(m => <option key={m} value={m} className="bg-navy-mid">{m}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="From" value={t.from} onChange={v => update(t.id, { from: v })} placeholder="Origin" />
              <Field label="To" value={t.to} onChange={v => update(t.id, { to: v })} placeholder="Destination" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Depart Date" value={t.departureDate ?? ''} onChange={v => update(t.id, { departureDate: v })} type="date" />
              <Field label="Depart Time" value={t.departureTime ?? ''} onChange={v => update(t.id, { departureTime: v })} type="time" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Arrive Date" value={t.arrivalDate ?? ''} onChange={v => update(t.id, { arrivalDate: v })} type="date" />
              <Field label="Arrive Time" value={t.arrivalTime ?? ''} onChange={v => update(t.id, { arrivalTime: v })} type="time" />
            </div>
            <Field label="Confirmation #" value={t.confirmation} onChange={v => update(t.id, { confirmation: v })} />
            <Field label="Notes" value={t.notes} onChange={v => update(t.id, { notes: v })} placeholder="Seat, gate, booking details" />
          </div>
        ))}
      </div>}
    </div>
  )
}
