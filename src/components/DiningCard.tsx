'use client'
import { type Dining } from '@/lib/types'
import { useDemo } from '@/lib/demo-context'

interface Props { dining: Dining[]; onChange: (d: Dining[]) => void }

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

export default function DiningCard({ dining, onChange }: Props) {
  const isDemo = useDemo()
  const add = () => onChange([...dining, { id: crypto.randomUUID(), name: '', meal: 'Lunch', address: '', hours: '', notes: '' }])
  const remove = (id: string) => onChange(dining.filter(d => d.id !== id))
  const update = (id: string, patch: Partial<Dining>) => onChange(dining.map(d => d.id === id ? { ...d, ...patch } : d))

  return (
    <details className="bg-navy-mid rounded-2xl overflow-hidden" open>
      <summary className="flex items-center px-5 py-3 cursor-pointer font-semibold text-accent-teal hover:bg-navy-light transition-colors">
        Dining
      </summary>
      <div className="px-5 pb-5 space-y-3">
        {dining.map(d => (
          <div key={d.id} className="border border-navy-light rounded-xl p-3 space-y-2 group relative">
            {!isDemo && <button onClick={() => remove(d.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-accent-red transition">×</button>}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400">Restaurant</label>
                <input className="editable text-sm mt-0.5" value={d.name} onChange={e => update(d.id, { name: e.target.value })} placeholder="Name" readOnly={isDemo} />
              </div>
              <div>
                <label className="text-xs text-gray-400">Meal</label>
                <select className="w-full bg-transparent border-b border-gray-600 text-sm mt-0.5 outline-none focus:border-accent-teal"
                  value={d.meal} onChange={e => update(d.id, { meal: e.target.value })} disabled={isDemo}>
                  {MEALS.map(m => <option key={m} value={m} className="bg-navy-mid">{m}</option>)}
                </select>
              </div>
            </div>
            <input className="editable text-sm" value={d.address} onChange={e => update(d.id, { address: e.target.value })} placeholder="Address" readOnly={isDemo} />
            <div className="grid grid-cols-2 gap-2">
              <input className="editable text-sm" value={d.hours} onChange={e => update(d.id, { hours: e.target.value })} placeholder="Hours" readOnly={isDemo} />
              <input className="editable text-sm" value={d.notes} onChange={e => update(d.id, { notes: e.target.value })} placeholder="Notes / reservation" readOnly={isDemo} />
            </div>
          </div>
        ))}
        {!isDemo && (
          <button onClick={add} className="w-full py-1.5 border border-dashed border-navy-light rounded-lg text-gray-400 hover:text-accent-teal hover:border-accent-teal text-sm transition-colors">
            + Add Dining
          </button>
        )}
      </div>
    </details>
  )
}
