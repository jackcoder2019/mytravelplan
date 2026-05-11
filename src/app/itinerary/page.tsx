'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { loadItinerary, saveItinerary, subscribeToItinerary } from '@/lib/api'
import { type Itinerary, type SaveStatus, emptyDay, defaultItinerary } from '@/lib/types'
import { getDemoItinerary } from '@/lib/demo'
import { DemoContext } from '@/lib/demo-context'
import Sidebar from '@/components/Sidebar'
import DayView from '@/components/DayView'
import OverviewView from '@/components/OverviewView'

export default function ItineraryPage() {
  const router = useRouter()
  const [itinerary, setItinerary] = useState<Itinerary>(defaultItinerary())
  const [activeDayId, setActiveDayId] = useState<string>('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [recordId, setRecordId] = useState<string>('')
  const [sharedWith, setSharedWith] = useState<string[]>([])
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [shareLinkEnabled, setShareLinkEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const lastSavedBy = useRef<string>('self')
  const serverBaseRef = useRef<Itinerary>(defaultItinerary())

  useEffect(() => {
    const isDemo = new URLSearchParams(window.location.search).get('demo') === 'true'
    setDemoMode(isDemo)

    if (isDemo) {
      const demo = getDemoItinerary()
      setItinerary(demo)
      setActiveDayId(demo.days[0].id)
      setLoading(false)
      return
    }

    getAuthUser().then(user => {
      if (!user) { router.replace('/'); return }
      loadItinerary().then(({ id, itinerary: data, sharedWith: sw, shareToken: st, shareLinkEnabled: sle }) => {
        setRecordId(id)
        setItinerary(data)
        serverBaseRef.current = data
        setActiveDayId(data.days[0]?.id ?? '')
        setSharedWith(sw)
        setShareToken(st)
        setShareLinkEnabled(sle)
        setLoading(false)

        const unsubscribe = subscribeToItinerary(id, incoming => {
          if (lastSavedBy.current === 'self') return
          setItinerary(incoming)
        })
        return unsubscribe
      })
    })
  }, [router])

  const scheduleSave = useCallback((updated: Itinerary) => {
    clearTimeout(saveTimer.current)
    setSaveStatus('saving')
    saveTimer.current = setTimeout(async () => {
      try {
        // Fetch latest server state before writing
        const { itinerary: serverLatest } = await loadItinerary()

        // Merge: days the user changed (vs the last server base) take priority;
        // days only on the server (added by a collaborator) are preserved.
        const base = serverBaseRef.current
        const baseMap = new Map(base.days.map(d => [d.id, JSON.stringify(d)]))
        const serverMap = new Map(serverLatest.days.map(d => [d.id, d]))
        const localMap = new Map(updated.days.map(d => [d.id, d]))
        const allIds = new Set([...serverMap.keys(), ...localMap.keys()])

        const mergedDays = Array.from(allIds).map(id => {
          const local = localMap.get(id)
          const server = serverMap.get(id)
          if (!local) return server!               // collaborator added a day
          if (!server) return local                // user added a day locally
          const userChanged = JSON.stringify(local) !== baseMap.get(id)
          return userChanged ? local : server      // user edit wins; otherwise take fresh server
        })

        const merged: Itinerary = {
          tripName: JSON.stringify(updated.tripName) !== JSON.stringify(base.tripName)
            ? updated.tripName : serverLatest.tripName,
          days: mergedDays,
        }

        lastSavedBy.current = 'self'
        await saveItinerary(recordId, merged)
        serverBaseRef.current = merged
        setItinerary(merged)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
        lastSavedBy.current = 'other'
      } catch {
        setSaveStatus('error')
      }
    }, 1000)
  }, [recordId])

  const updateItinerary = useCallback((updated: Itinerary) => {
    if (demoMode) return
    setItinerary(updated)
    if (recordId) scheduleSave(updated)
  }, [recordId, scheduleSave, demoMode])

  const addDay = () => {
    const prev = itinerary.days[itinerary.days.length - 1]
    const newDay = emptyDay(itinerary.days.length + 1)
    if (prev) {
      newDay.city = prev.city
      if (prev.date) {
        const next = new Date(prev.date)
        next.setDate(next.getDate() + 1)
        newDay.date = next.toISOString().slice(0, 10)
      }
    }
    const updated = { ...itinerary, days: [...itinerary.days, newDay] }
    updateItinerary(updated)
    setActiveDayId(newDay.id)
  }

  const removeDay = (id: string) => {
    const idx = itinerary.days.findIndex(d => d.id === id)
    const remaining = itinerary.days.filter(d => d.id !== id)
    if (remaining.length === 0) return
    const shifted = remaining.map((d, i) => {
      if (i < idx || !d.date) return d
      const prev = new Date(d.date)
      prev.setDate(prev.getDate() - 1)
      return { ...d, date: prev.toISOString().slice(0, 10) }
    })
    const updated = { ...itinerary, days: shifted }
    updateItinerary(updated)
    if (activeDayId === id) setActiveDayId(remaining[0].id)
  }

  const activeDay = itinerary.days.find(d => d.id === activeDayId)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-accent-teal text-lg animate-pulse">Loading your itinerary...</div>
      </div>
    )
  }

  return (
    <DemoContext.Provider value={demoMode}>
      <div className="flex h-[100dvh] overflow-hidden">
        <Sidebar
          itinerary={itinerary}
          activeDayId={activeDayId}
          saveStatus={saveStatus}
          recordId={recordId}
          sharedWith={sharedWith}
          shareToken={shareToken}
          shareLinkEnabled={shareLinkEnabled}
          isOpen={sidebarOpen}
          onSelectDay={id => { setActiveDayId(id); setSidebarOpen(false) }}
          onAddDay={addDay}
          onRemoveDay={removeDay}
          onTripNameChange={name => updateItinerary({ ...itinerary, tripName: name })}
          onImport={data => { updateItinerary(data); setActiveDayId(data.days[0]?.id ?? '') }}
          onSharedWithChange={setSharedWith}
          onShareTokenChange={setShareToken}
          onShareLinkEnabledChange={setShareLinkEnabled}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto bg-navy-deep p-4 md:p-6">
          {/* Mobile top bar */}
          <div className="flex items-center gap-3 mb-4 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-navy-mid text-gray-300 hover:text-white text-xl leading-none"
              aria-label="Open menu"
            >☰</button>
            <span className="text-accent-teal font-semibold truncate">{itinerary.tripName || 'Travel Plan'}</span>
          </div>
          {/* Demo banner */}
          {demoMode && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-accent-teal/10 border border-accent-teal/30 text-sm flex items-center justify-between">
              <span className="text-accent-teal">Browsing in demo mode — read only</span>
              <a href="/" className="text-accent-teal underline underline-offset-2 hover:opacity-80 ml-4 whitespace-nowrap">Sign in</a>
            </div>
          )}
          {activeDayId === 'overview' ? (
            <OverviewView itinerary={itinerary} />
          ) : activeDay ? (
            <DayView
              day={activeDay}
              itineraryId={recordId}
              onChange={updated => {
                const days = itinerary.days.map(d => d.id === updated.id ? updated : d)
                updateItinerary({ ...itinerary, days })
              }}
            />
          ) : (
            <div className="text-gray-500 text-center mt-20">Select or add a day to get started.</div>
          )}
        </main>
      </div>
    </DemoContext.Provider>
  )
}
