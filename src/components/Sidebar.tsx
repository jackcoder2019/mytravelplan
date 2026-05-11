'use client'
import { useState, useEffect, useRef } from 'react'
import { handleSignOut } from '@/lib/auth'
import { useDemo } from '@/lib/demo-context'
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
  isOpen: boolean
  onSelectDay: (id: string) => void
  onAddDay: () => void
  onRemoveDay: (id: string) => void
  onTripNameChange: (name: string) => void
  onImport: (itinerary: Itinerary) => void
  onSharedWithChange: (sw: string[]) => void
  onShareTokenChange: (t: string | null) => void
  onShareLinkEnabledChange: (v: boolean) => void
  onClose: () => void
  onSaveNow: () => void
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
  isOpen, onSelectDay, onAddDay, onRemoveDay, onTripNameChange, onImport,
  onSharedWithChange, onShareTokenChange, onShareLinkEnabledChange, onClose, onSaveNow,
}: Props) {
  const isDemo = useDemo()
  const [showShare, setShowShare] = useState(false)
  const dayListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const active = dayListRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [isOpen, activeDayId])

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
          onImport(data)
        }
      } catch { alert('Invalid JSON file') }
    }
    reader.readAsText(file)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/50 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[9999]
        md:relative md:inset-auto md:z-auto
        w-64 flex-shrink-0 h-[100dvh] bg-navy-mid flex flex-col border-r border-navy-light
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Trip name */}
        <div className="p-4 border-b border-navy-light">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="md:hidden text-gray-400 hover:text-white text-xl leading-none p-1 -ml-1 rounded"
              aria-label="Close menu"
            >✕</button>
            <input
              className="editable text-lg font-bold text-accent-teal flex-1"
              value={itinerary.tripName}
              onChange={e => onTripNameChange(e.target.value)}
              placeholder="Trip Name"
              readOnly={isDemo}
            />
          </div>
          {saveStatus !== 'idle' && (
            <span className={`text-xs mt-1 block ${statusColor[saveStatus]}`}>{statusLabel[saveStatus]}</span>
          )}
        </div>

        {/* Overview */}
        <div
          onClick={() => onSelectDay('overview')}
          className={`flex items-center px-4 py-2 cursor-pointer text-sm border-b border-navy-light hover:bg-navy-light transition-colors ${activeDayId === 'overview' ? 'bg-navy-light text-accent-teal' : 'text-gray-400'}`}
        >
          Overview
        </div>

        {/* Day list */}
        <div ref={dayListRef} className="flex-1 overflow-y-auto py-2">
          {[...itinerary.days]
            .sort((a, b) => {
              if (!a.date && !b.date) return 0
              if (!a.date) return 1
              if (!b.date) return -1
              return a.date.localeCompare(b.date)
            })
            .map((day, i) => (
            <div
              key={day.id}
              data-active={day.id === activeDayId}
              className={`flex items-center px-4 py-2 cursor-pointer group hover:bg-navy-light transition-colors ${day.id === activeDayId ? 'bg-navy-light' : ''}`}
              onClick={() => onSelectDay(day.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">
                  {[
                    day.date ? day.date.slice(5).replace('-', '/') : null,
                    day.city || null,
                  ].filter(Boolean).join(' · ') || '—'}
                </div>
              </div>
              {!isDemo && itinerary.days.length > 1 && (
                <button
                  onClick={e => { e.stopPropagation(); onRemoveDay(day.id) }}
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 md:pointer-events-none md:group-hover:pointer-events-auto text-gray-500 hover:text-accent-red active:text-accent-red ml-2 text-lg leading-none"
                >×</button>
              )}
            </div>
          ))}
        </div>

        {/* Add day */}
        {!isDemo && (
          <button
            onClick={onAddDay}
            className="mx-4 my-2 py-2 rounded-lg border border-dashed border-navy-light text-gray-400 hover:text-accent-teal hover:border-accent-teal text-sm transition-colors"
          >+ Add Day</button>
        )}

        {/* Bottom actions */}
        <div className="p-4 border-t border-navy-light space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {isDemo ? (
            <a href="/" className="block w-full py-1.5 rounded-lg bg-accent-teal/20 hover:bg-accent-teal/30 text-accent-teal text-sm text-center transition-colors">
              Sign in to edit
            </a>
          ) : (
            <>
              <button
                onClick={onSaveNow}
                disabled={saveStatus === 'saving'}
                className="w-full py-1.5 rounded-lg bg-accent-teal text-navy-deep font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved ✓' : 'Save'}
              </button>
              <div className="flex gap-2">
                <button onClick={() => setShowShare(true)} className="flex-1 py-1.5 rounded-lg bg-accent-teal/20 hover:bg-accent-teal/30 text-accent-teal text-sm transition-colors">
                  Share
                </button>
                <button onClick={() => window.open('/feedback', '_blank')} className="flex-1 py-1.5 rounded-lg bg-navy-light hover:bg-opacity-80 text-gray-300 text-sm transition-colors">
                  Feedback
                </button>
              </div>
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
            </>
          )}
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
