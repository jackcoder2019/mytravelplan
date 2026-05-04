'use client'
import { useState } from 'react'
import { handleSignOut } from '@/lib/auth'
import { type Itinerary, type SaveStatus } from '@/lib/types'
import ShareModal from './ShareModal'

interface Props {
  itinerary: Itinerary
  activeDayId: string
  saveStatus: SaveStatus
  recordId: string
  sharedWith: string[]
  shareToken: string | null
  shareLinkEnabled: boolean
  onSelectDay: (id: string) => void
  onAddDay: () => void
  onRemoveDay: (id: string) => void
  onTripNameChange: (name: string) => void
  onSharedWithChange: (sw: string[]) => void
  onShareTokenChange: (t: string | null) => void
  onShareLinkEnabledChange: (v: boolean) => void
}

const statusLabel: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved ✓',
  error: 'Save failed',
}
const statusColor: Record<SaveStatus, string> = {
  idle: '',
  saving: 'text-gray-400',
  saved: 'text-accent-teal',
  error: 'text-accent-red',
}

export default function Sidebar({
  itinerary, activeDayId, saveStatus, recordId,
  sharedWith, shareToken, shareLinkEnabled,
  onSelectDay, onAddDay, onRemoveDay, onTripNameChange,
  onSharedWithChange, onShareTokenChange, onShareLinkEnabledChange,
}: Props) {
  const [showShare, setShowShare] = useState(false)

  const exportData = () => {
    const blob = new Blob([JSON.stringify(itinerary, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'itinerary.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.tripName && Array.isArray(data.days)) {
          onTripNameChange(data.tripName)
          // Full itinerary replacement triggers via parent
          window.dispatchEvent(new CustomEvent('import-itinerary', { detail: data }))
        }
      } catch { alert('Invalid JSON file') }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <aside className="w-64 h-screen bg-navy-mid flex flex-col border-r border-navy-light">
        {/* Trip name */}
        <div className="p-4 border-b border-navy-light">
          <input
            className="editable text-lg font-bold text-accent-teal w-full"
            value={itinerary.tripName}
            onChange={e => onTripNameChange(e.target.value)}
            placeholder="Trip Name"
          />
          {saveStatus !== 'idle' && (
            <span className={`text-xs mt-1 block ${statusColor[saveStatus]}`}>{statusLabel[saveStatus]}</span>
          )}
        </div>

        {/* Day list */}
        <div className="flex-1 overflow-y-auto py-2">
          {itinerary.days.map((day, i) => (
            <div
              key={day.id}
              className={`flex items-center px-4 py-2 cursor-pointer group hover:bg-navy-light transition-colors ${day.id === activeDayId ? 'bg-navy-light' : ''}`}
              onClick={() => onSelectDay(day.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400">Day {i + 1}{day.date ? ` · ${day.date}` : ''}</div>
                <div className="text-sm font-medium truncate">{day.title || `Day ${i + 1}`}</div>
                {day.city && <div className="text-xs text-accent-teal truncate">{day.city}</div>}
              </div>
              {itinerary.days.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); onRemoveDay(day.id) }}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-accent-red ml-2 text-lg leading-none"
                >×</button>
              )}
            </div>
          ))}
        </div>

        {/* Add day */}
        <button
          onClick={onAddDay}
          className="mx-4 my-2 py-2 rounded-lg border border-dashed border-navy-light text-gray-400 hover:text-accent-teal hover:border-accent-teal text-sm transition-colors"
        >+ Add Day</button>

        {/* Bottom actions */}
        <div className="p-4 border-t border-navy-light space-y-2">
          <button onClick={() => setShowShare(true)} className="w-full py-1.5 rounded-lg bg-accent-teal/20 hover:bg-accent-teal/30 text-accent-teal text-sm transition-colors">
            Share
          </button>
          <div className="flex gap-2">
            <button onClick={exportData} className="flex-1 py-1.5 rounded-lg bg-navy-light hover:bg-opacity-80 text-gray-300 text-sm transition-colors">Export</button>
            <label className="flex-1 py-1.5 rounded-lg bg-navy-light hover:bg-opacity-80 text-gray-300 text-sm text-center cursor-pointer transition-colors">
              Import
              <input type="file" accept=".json" className="hidden" onChange={importData} />
            </label>
          </div>
          <button onClick={handleSignOut} className="w-full py-1.5 rounded-lg text-gray-500 hover:text-accent-red text-sm transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {showShare && (
        <ShareModal
          recordId={recordId}
          sharedWith={sharedWith}
          shareToken={shareToken}
          shareLinkEnabled={shareLinkEnabled}
          onClose={() => setShowShare(false)}
          onSharedWithChange={onSharedWithChange}
          onShareTokenChange={onShareTokenChange}
          onShareLinkEnabledChange={onShareLinkEnabledChange}
        />
      )}
    </>
  )
}
