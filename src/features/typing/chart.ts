import type { TypingResult } from './history.ts'
import type { PracticeLanguage } from './samples.ts'

export function chartResults(results: TypingResult[], language: PracticeLanguage, limit: number) {
  return results.filter(item => (item.language ?? 'en') === language)
    .sort((a, b) => Date.parse(a.savedAt) - Date.parse(b.savedAt) || a.id.localeCompare(b.id))
    .slice(-limit)
}

export function chartSpeed(result: TypingResult) {
  return result.language === 'ko' ? result.cpm ?? 0 : result.wpm
}

export function speedCeiling(results: TypingResult[]) {
  return Math.max(10, Math.ceil(Math.max(0, ...results.map(chartSpeed)) / 10) * 10)
}
