'use client'
import { type Transportation } from '@/lib/types'

interface Props { transport: Transportation; onChange: (t: Transportation) => void }

const MODES = ['Flight', 'Train', 'Car', 'Bus', 'Ferry', 'Walk', 'Other']

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs text-gray-400">{label}</label>
      <input type={type} className="editable text-sm mt-0.5" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

export default function TransportCard({ transport, onChange }: Props) {
  const set = (patch: Partial<Transportation>) => onChange({ ...transport, ...patch })
  return (
    <details className="bg-navy-mid rounded-2xl overflow-hidden" open>
      <summary className="flex items-center px-5 py-3 cursor-pointer font-semibold text-accent-teal hover:bg-navy-light transition-colors">
        Transportation
      </summary>
      <div className="px-5 pb-5 space-y-3">
        <div>
          <label className="text-xs text-gray-400">Mode</label>
          <select className="w-full bg-transparent border-b border-gray-600 text-sm mt-0.5 outline-none focus:border-accent-teal"
            value={transport.mode} onChange={e => set({ mode: e.target.value })}>
            <option value="" className="bg-navy-mid">Select mode</option>
            {MODES.map(m => <option key={m} value={m} className="bg-navy-mid">{m}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From" value={transport.from} onChange={v => set({ from: v })} placeholder="Origin" />
          <Field label="To" value={transport.to} onChange={v => set({ to: v })} placeholder="Destination" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Departure" value={transport.departure} onChange={v => set({ departure: v })} type="datetime-local" />
          <Field label="Arrival" value={transport.arrival} onChange={v => set({ arrival: v })} type="datetime-local" />
        </div>
        <Field label="Confirmation #" value={transport.confirmation} onChange={v => set({ confirmation: v })} />
        <Field label="Notes" value={transport.notes} onChange={v => set({ notes: v })} placeholder="Seat, gate, booking details" />
      </div>
    </details>
  )
}
