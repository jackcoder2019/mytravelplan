'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { loadItinerary, saveItinerary, subscribeToItinerary } from '@/lib/api'
import { type Itinerary, type SaveStatus, emptyDay, defaultItinerary } from '@/lib/types'
import Sidebar from '@/components/Sidebar'
import DayView from '@/components/DayView'

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

  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const lastSavedBy = useRef<string>('self')

  useEffect(() => {
    getAuthUser().then(user => {
      if (!user) { router.replace('/'); return }
      loadItinerary().then(({ id, itinerary: data, sharedWith: sw, shareToken: st, shareLinkEnabled: sle }) => {
        setRecordId(id)
        setItinerary(data)
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
        lastSavedBy.current = 'self'
        await saveItinerary(recordId, updated)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
        lastSavedBy.current = 'other'
      } catch {
        setSaveStatus('error')
      }
    }, 1000)
  }, [recordId])

  const updateItinerary = useCallback((updated: Itinerary) => {
    setItinerary(updated)
    if (recordId) scheduleSave(updated)
  }, [recordId, scheduleSave])

  const addDay = () => {
    const newDay = emptyDay(itinerary.days.length + 1)
    const updated = { ...itinerary, days: [...itinerary.days, newDay] }
    updateItinerary(updated)
    setActiveDayId(newDay.id)
  }

  const removeDay = (id: string) => {
    const remaining = itinerary.days.filter(d => d.id !== id)
    if (remaining.length === 0) return
    const updated = { ...itinerary, days: remaining }
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        itinerary={itinerary}
        activeDayId={activeDayId}
        saveStatus={saveStatus}
        recordId={recordId}
        sharedWith={sharedWith}
        shareToken={shareToken}
        shareLinkEnabled={shareLinkEnabled}
        onSelectDay={setActiveDayId}
        onAddDay={addDay}
        onRemoveDay={removeDay}
        onTripNameChange={name => updateItinerary({ ...itinerary, tripName: name })}
        onSharedWithChange={setSharedWith}
        onShareTokenChange={setShareToken}
        onShareLinkEnabledChange={setShareLinkEnabled}
      />
      <main className="flex-1 overflow-y-auto bg-navy-deep p-6">
        {activeDay ? (
          <DayView
            day={activeDay}
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
  )
}
