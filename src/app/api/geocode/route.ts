import { NextRequest, NextResponse } from 'next/server'

// Bypass corporate proxy certificate for server-side fetch
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json([], { status: 400 })

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'MyTravelPlan/1.0 (travel planning app; jackcoder2019@gmail.com)',
      'Accept-Language': 'en',
      'Accept': 'application/json',
    },
  })
  const data = await resp.json()
  return NextResponse.json(data)
}
