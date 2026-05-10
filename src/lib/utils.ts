function parseHourFromString(s: string): number {
  const m = s.trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (!m) return Infinity
  let h = parseInt(m[1], 10)
  const min = m[2] ? parseInt(m[2], 10) : 0
  const period = m[3]?.toLowerCase()
  if (period === 'pm' && h !== 12) h += 12
  if (period === 'am' && h === 12) h = 0
  return h + min / 60
}

export function parseStartHour(hours: string): number {
  if (!hours.trim()) return Infinity
  return parseHourFromString(hours.split(/[–\-]/)[0])
}

export function parseEndHour(hours: string): number {
  if (!hours.trim()) return Infinity
  const parts = hours.split(/[–\-]/)
  return parseHourFromString(parts[parts.length - 1])
}

export function formatHour(h: number): string {
  const totalMin = Math.round(h * 60) % (24 * 60)
  const hr = Math.floor(totalMin / 60)
  const min = totalMin % 60
  const period = hr < 12 ? 'am' : 'pm'
  const display = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
  return min === 0 ? `${display}${period}` : `${display}:${String(min).padStart(2, '0')}${period}`
}
