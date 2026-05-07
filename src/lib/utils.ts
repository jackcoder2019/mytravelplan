export function parseStartHour(hours: string): number {
  if (!hours.trim()) return Infinity
  const start = hours.split(/[–\-]/)[0].trim()
  const m = start.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (!m) return Infinity
  let h = parseInt(m[1], 10)
  const min = m[2] ? parseInt(m[2], 10) : 0
  const period = m[3]?.toLowerCase()
  if (period === 'pm' && h !== 12) h += 12
  if (period === 'am' && h === 12) h = 0
  return h + min / 60
}
