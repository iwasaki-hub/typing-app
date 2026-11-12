import type { TypingResult } from '../typing/history.ts'
import type { LearningItem, LearningSession } from './session.ts'

export const learningLabels = { countries: '国名タイピング', household: '日用品の英単語', shops: 'お店の英単語', travel: '旅行の英会話' } as const
export type LearningActivity = keyof typeof learningLabels
interface NamedItem extends LearningItem { ja: string; ko: string }
export interface LearningRecord {
  version: 1
  activity: LearningActivity
  category: string
  mode: 'guide' | 'quiz'
  items: { english: string; ja: string; ko: string; skipped: boolean; hinted: boolean; mistakes: number }[]
}
export type LearningHistoryResult = TypingResult & { learning: LearningRecord }

export function isLearningRecord(value: unknown): value is LearningRecord {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return record.version === 1 && Object.hasOwn(learningLabels, String(record.activity))
    && typeof record.category === 'string' && record.category.length <= 100
    && (record.mode === 'guide' || record.mode === 'quiz')
    && Array.isArray(record.items) && record.items.length > 0 && record.items.length <= 40
    && record.items.every(item => item && typeof item === 'object'
      && ['english', 'ja', 'ko'].every(key => typeof item[key] === 'string' && item[key].length > 0 && item[key].length <= 100)
      && typeof item.skipped === 'boolean' && typeof item.hinted === 'boolean'
      && Number.isSafeInteger(item.mistakes) && item.mistakes >= 0)
}

export function learningStats(record: LearningRecord) {
  return {
    total: record.items.length,
    correct: record.items.filter(item => !item.skipped).length,
    independent: record.items.filter(item => !item.skipped && !item.hinted && item.mistakes === 0).length,
    hints: record.items.filter(item => item.hinted).length,
    skipped: record.items.filter(item => item.skipped).length,
    mistakes: record.items.reduce((sum, item) => sum + item.mistakes, 0),
  }
}

export function createLearningHistory<T extends NamedItem>(state: LearningSession<T>, activity: LearningActivity, category: string, id: string, savedAt: string): LearningHistoryResult | null {
  if (!state.finished || !state.answers.length || state.answers.length !== state.order.length) return null
  const learning: LearningRecord = {
    version: 1, activity, category, mode: state.mode,
    items: state.answers.map(({ item, skipped, hinted, mistakes }) => ({ english: item.english, ja: item.ja, ko: item.ko, skipped, hinted, mistakes })),
  }
  const stats = learningStats(learning)
  // Preserve the existing private sync envelope. Speed/time are unused for lessons.
  return { id, savedAt, text: learning.items.map(item => item.english).join(', '), language: 'en', reason: 'completed',
    duration: 0, elapsed: 0, wpm: 0, accuracy: Math.round(stats.correct / stats.total * 100),
    mistakes: stats.mistakes, correct: stats.correct, learning }
}

export function splitPracticeResults(results: TypingResult[]) {
  return {
    typing: results.filter(result => !result.learning),
    learning: results.filter((result): result is LearningHistoryResult => !!result.learning),
  }
}

export function createLearningRecorder(save: (result: TypingResult) => void) {
  const recorded = new WeakSet<object>()
  return <T extends NamedItem>(state: LearningSession<T>, activity: LearningActivity, category: string) => {
    if (!state.finished || recorded.has(state.order)) return
    const result = createLearningHistory(state, activity, category, crypto.randomUUID(), new Date().toISOString())
    if (!result) return
    recorded.add(state.order)
    save(result)
  }
}
