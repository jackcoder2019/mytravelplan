'use client'
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const pinColors = {
  blue:   'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  green:  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  orange: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
}

const pinHex = { blue: '#3b82f6', green: '#10b981', orange: '#f97316' }

function makeIcon(color: 'blue' | 'green' | 'orange') {
  return new L.Icon({
    iconUrl: pinColors[color],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  })
}

function makeNumberIcon(num: number, color: 'blue' | 'green' | 'orange') {
  return L.divIcon({
    html: `<div style="background:${pinHex[color]};color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);line-height:1">${num}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

async function geocode(query: string): Promise<L.LatLng | null> {
  try {
    const resp = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
    if (!resp.ok) { console.warn('Geocode error', resp.status, query); return null }
    const data = await resp.json()
    if (!data[0]) { console.warn('Geocode no results for', query); return null }
    return L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon))
  } catch (e) {
    console.error('Geocode failed', query, e)
    return null
  }
}

interface AddressPin { label: string; address: string; color: 'blue' | 'green' | 'orange'; number?: number }
interface Props { addresses: AddressPin[]; city?: string }

export default function MapView({ addresses, city }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const cityMarkerRef = useRef<L.Marker | null>(null)
  const cityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addressesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stable keys so effects only re-run when values actually change
  const addressesKey = addresses.map(a => a.address).join('|')
  const addressesRef = useRef(addresses)
  addressesRef.current = addresses

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    mapRef.current = L.map(containerRef.current).setView([20, 0], 2)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current)
  }, [])

  // City effect — only re-runs when city string changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !city) return
    if (cityTimerRef.current) clearTimeout(cityTimerRef.current)
    cityTimerRef.current = setTimeout(async () => {
      const latlng = await geocode(city)
      if (!latlng) return
      if (cityMarkerRef.current) cityMarkerRef.current.remove()
      cityMarkerRef.current = L.marker(latlng)
        .addTo(map)
        .bindPopup(`<strong>${city}</strong>`)
      map.flyTo(latlng, 11)
    }, 600)
  }, [city]) // eslint-disable-line react-hooks/exhaustive-deps

  // Addresses effect — only re-runs when the set of addresses changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (addressesTimerRef.current) clearTimeout(addressesTimerRef.current)

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    if (addressesRef.current.length === 0) return

    addressesTimerRef.current = setTimeout(async () => {
      const pins = addressesRef.current
      const bounds: L.LatLng[] = []
      for (const pin of pins) {
        const { label, address, color } = pin
        const latlng = await geocode(address)
        if (!latlng) continue
        const icon = pin.number != null ? makeNumberIcon(pin.number, color) : makeIcon(color)
        const marker = L.marker(latlng, { icon })
          .addTo(map)
          .bindPopup(`<strong>${label}</strong><br/>${address}`)
        markersRef.current.push(marker)
        bounds.push(latlng)
      }
      if (bounds.length === 1) map.setView(bounds[0], 13)
      else if (bounds.length > 1) map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] })
    }, 800)
  }, [addressesKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="w-full h-full" style={{ minHeight: 320 }} />
}
