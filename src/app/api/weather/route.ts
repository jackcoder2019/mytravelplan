import { NextRequest, NextResponse } from 'next/server'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const WMO: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Freezing fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  56: 'Light freezing drizzle', 57: 'Freezing drizzle',
  61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
  66: 'Light freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
  85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm',
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city')
  const date = req.nextUrl.searchParams.get('date') // YYYY-MM-DD
  if (!city || !date) return NextResponse.json({ error: 'Missing city or date' }, { status: 400 })

  // Geocode city to lat/lon
  const geoResp = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`,
    { headers: { 'User-Agent': 'MyTravelPlan/1.0 (jackcoder2019@gmail.com)', 'Accept': 'application/json' } }
  )
  const geo = await geoResp.json()
  if (!geo[0]) return NextResponse.json({ error: 'City not found' }, { status: 404 })
  const { lat, lon } = geo[0]

  // Past dates → archive API; today/future → forecast API
  const today = new Date().toISOString().slice(0, 10)
  const base = date < today
    ? 'https://archive-api.open-meteo.com/v1/archive'
    : 'https://api.open-meteo.com/v1/forecast'

  const weatherResp = await fetch(
    `${base}?latitude=${lat}&longitude=${lon}` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
    `&timezone=auto&start_date=${date}&end_date=${date}&temperature_unit=fahrenheit`
  )
  const weather = await weatherResp.json()

  const daily = weather.daily
  if (!daily?.time?.length) return NextResponse.json({ error: 'No data for this date' }, { status: 404 })

  const hi = Math.round(daily.temperature_2m_max[0])
  const lo = Math.round(daily.temperature_2m_min[0])
  const code = daily.weathercode[0] as number

  return NextResponse.json({
    tempHigh: `${hi}°F`,
    tempLow: `${lo}°F`,
    condition: WMO[code] ?? 'Unknown',
  })
}
