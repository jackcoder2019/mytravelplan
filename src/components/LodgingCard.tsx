'use client'
import { type Lodging } from '@/lib/types'
import { useDemo } from '@/lib/demo-context'

interface Props { lodging: Lodging; onChange: (l: Lodging) => void }

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  const isDemo = useDemo()
  return (
    <div>
      <label className="text-xs text-gray-400">{label}</label>
      <input type={type} className="editable text-sm mt-0.5" value={value} onChange={e => onChange(e.target.value)} readOnly={isDemo} />
    </div>
  )
}

export default function LodgingCard({ lodging, onChange }: Props) {
  const set = (patch: Partial<Lodging>) => onChange({ ...lodging, ...patch })
  return (
    <details className="bg-navy-mid rounded-2xl overflow-hidden" open>
      <summary className="flex items-center px-5 py-3 cursor-pointer font-semibold text-accent-teal hover:bg-navy-light transition-colors">
        Lodging
      </summary>
      <div className="px-5 pb-5 space-y-3">
        <Field label="Hotel / Accommodation" value={lodging.name} onChange={v => set({ name: v })} />
        <Field label="Address" value={lodging.address} onChange={v => set({ address: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Check-in" value={lodging.checkIn} onChange={v => set({ checkIn: v })} type="datetime-local" />
          <Field label="Check-out" value={lodging.checkOut} onChange={v => set({ checkOut: v })} type="datetime-local" />
        </div>
        <Field label="Confirmation #" value={lodging.confirmation} onChange={v => set({ confirmation: v })} />
        <Field label="Notes" value={lodging.notes} onChange={v => set({ notes: v })} />
      </div>
    </details>
  )
}
