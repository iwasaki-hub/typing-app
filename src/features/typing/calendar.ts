import type { TypingResult } from './history'

// Use the browser's local day, matching the dates shown in the history list.
export function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function monthCells(year: number, month: number): (number | null)[] {
  const offset = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1
    return day >= 1 && day <= days ? day : null
  })
}

export function groupResultsByDay(results: TypingResult[]) {
  const grouped = new Map<string, TypingResult[]>()
  for (const result of results) {
    const date = new Date(result.savedAt)
    if (!Number.isFinite(date.getTime())) continue
    const key = localDateKey(date)
    const entries = grouped.get(key) ?? []
    entries.push(result)
    grouped.set(key, entries)
  }
  for (const entries of grouped.values()) entries.sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
  return grouped
}
