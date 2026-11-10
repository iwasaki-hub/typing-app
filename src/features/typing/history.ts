export const HISTORY_KEY = 'typing-app:results:v1'
export const HISTORY_LIMIT = 100

export interface TypingResult {
  id: string
  savedAt: string
  text: string
  duration: number
  elapsed: number
  wpm: number
  accuracy: number
  mistakes: number
  attempts?: number
  language?: 'en' | 'ko'
  cpm?: number
  correct: number
  reason: 'completed' | 'timeout' | 'stopped'
}
function isResult(value: unknown): value is TypingResult {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.id === 'string' && typeof item.savedAt === 'string' && Number.isFinite(Date.parse(item.savedAt))
    && typeof item.text === 'string' && item.text.length <= 1000
    && ['completed', 'timeout', 'stopped'].includes(String(item.reason))
    && ['duration', 'elapsed', 'wpm', 'accuracy', 'mistakes', 'correct'].every((key) => typeof item[key] === 'number' && Number.isFinite(item[key]) && item[key] >= 0)
    && Number(item.accuracy) <= 100 && Number(item.elapsed) <= Number(item.duration)
    && (item.language === undefined || item.language === 'en' || item.language === 'ko')
    && (item.language !== 'ko' || (typeof item.cpm === 'number' && Number.isFinite(item.cpm) && item.cpm >= 0))
}

export function formatResultSpeed(result: TypingResult) {
  return result.language === 'ko' ? `${result.cpm ?? 0} CPM` : `${result.wpm} WPM`
}

export function parseHistory(raw: string | null): TypingResult[] {
  if (!raw) return []
  const data: unknown = JSON.parse(raw)
  if (!Array.isArray(data)) throw new Error('Invalid history')
  return data.filter(isResult).slice(0, HISTORY_LIMIT)
}

type Snapshot = { results: TypingResult[]; error: string }
const empty: Snapshot = { results: [], error: '' }

export function createHistoryStore(getStorage: () => Pick<Storage, 'getItem' | 'setItem'> & Partial<Pick<Storage, 'removeItem'>>, key = HISTORY_KEY) {
  let snapshot = empty
  let initialized = false
  const listeners = new Set<() => void>()
  function publish(next: Snapshot) { snapshot = next; listeners.forEach((listener) => listener()) }
  function read(): Snapshot {
    try { return { results: parseHistory(getStorage().getItem(key)), error: '' } }
    catch { return { results: [], error: '保存済みの履歴を読み込めませんでした。ブラウザの保存設定を確認してください。' } }
  }
  return {
    getSnapshot() {
      if (!initialized) { initialized = true; snapshot = read() }
      return snapshot
    },
    getServerSnapshot: () => empty,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    refresh() { initialized = true; publish(read()) },
    clear() {
      try {
        const storage = getStorage()
        if (storage.removeItem) storage.removeItem(key)
        else storage.setItem(key, '[]')
        initialized = true
        publish({ results: [], error: '' })
      } catch { throw new Error('端末の履歴を削除できませんでした。ブラウザの保存設定を確認してください。') }
    },
    discardBefore(cutoff: string) {
      const results = read().results.filter(item => Date.parse(item.savedAt) > Date.parse(cutoff))
      getStorage().setItem(key, JSON.stringify(results))
      initialized = true
      publish({ results, error: '' })
    },
    merge(incoming: TypingResult[]) {
      const latest = read()
      const results = [...new Map([...incoming, ...latest.results].filter(isResult).map((item) => [item.id, item])).values()]
        .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt) || a.id.localeCompare(b.id)).slice(0, HISTORY_LIMIT)
      if (JSON.stringify(results) === JSON.stringify(snapshot.results)) return
      try {
        getStorage().setItem(key, JSON.stringify(results))
        initialized = true
        publish({ results, error: '' })
      } catch { publish({ results, error: '履歴を端末に保存できません。ブラウザの保存設定や空き容量を確認してください。' }) }
    },
    save(result: TypingResult) {
      const latest = read()
      const results = [result, ...latest.results.filter((entry) => entry.id !== result.id)].slice(0, HISTORY_LIMIT)
      try {
        getStorage().setItem(key, JSON.stringify(results))
        initialized = true
        publish({ results, error: '' })
      } catch {
        publish({ ...snapshot, error: '結果を保存できませんでした。ブラウザの保存設定や空き容量を確認してください。練習は続けられます。' })
      }
    },
  }
}
