import type { PracticeQuote } from '../../api/quotes.ts'
import { practiceSamples } from './samples.ts'
import { isKoreanText, isTatoebaCredit } from './tatoeba.ts'

export const KOREAN_QUEUE_KEY = 'typing-app:korean-queue:v1'
const ttl = 24 * 60 * 60 * 1000
const retryDelay = 30000
export function koreanFallback(previousText?: string): PracticeQuote {
  const choices = practiceSamples.ko.filter(text => text !== previousText)
  return { text: choices[Math.floor(Math.random() * choices.length)], source: 'local', author: null, language: 'ko' }
}
function validQuote(value: unknown): value is PracticeQuote {
  if (!value || typeof value !== 'object') return false
  const item = value as PracticeQuote
  return item.source === 'tatoeba' && item.language === 'ko' && isKoreanText(item.text) && isTatoebaCredit(item.credit) && item.author === item.credit.author
}

export function createKoreanQueue({ load, storage, now = Date.now }: {
  load: (signal: AbortSignal) => Promise<PracticeQuote[]>
  storage: () => Pick<Storage, 'getItem' | 'setItem'>
  now?: () => number
}) {
  let queue: PracticeQuote[] = []
  let seen: string[] = []
  let pending: Promise<void> | null = null
  let retryAt = 0
  let disposed = false
  const controller = new AbortController()
  try {
    const saved = JSON.parse(storage().getItem(KOREAN_QUEUE_KEY) ?? 'null')
    if (saved?.version === 1 && typeof saved.expiresAt === 'number' && saved.expiresAt > now() && saved.expiresAt <= now() + ttl && Array.isArray(saved.queue) && Array.isArray(saved.seen)) {
      seen = saved.seen.filter(isKoreanText).slice(-200)
      queue = saved.queue.filter(validQuote).filter((quote: PracticeQuote, index: number, all: PracticeQuote[]) => !seen.includes(quote.text) && all.findIndex(item => item.text === quote.text) === index).slice(0, 40)
    }
  } catch { /* Practice remains available without cached data. */ }
  function persist() {
    try { storage().setItem(KOREAN_QUEUE_KEY, JSON.stringify({ version: 1, expiresAt: now() + ttl, queue, seen })) }
    catch { /* An in-memory queue still works when storage is unavailable. */ }
  }
  function refill() {
    if (pending) return pending
    if (disposed || now() < retryAt || queue.length > 3) return Promise.resolve()
    pending = (async () => {
      try {
        const batch = await load(controller.signal)
        if (disposed) return
        const before = queue.length
        for (const quote of batch) {
          if (validQuote(quote) && !seen.includes(quote.text) && !queue.some(item => item.text === quote.text)) queue.push(quote)
          if (queue.length >= 40) break
        }
        if (before === queue.length) retryAt = now() + retryDelay
        persist()
      } catch { if (!disposed) retryAt = now() + retryDelay }
    })().finally(() => { pending = null })
    return pending
  }
  return {
    async next(previousText?: string): Promise<PracticeQuote> {
      if (!queue.length) await refill()
      if (disposed) throw new Error('韓国語の読み込みを中断しました。')
      let quote = queue.shift()
      while (quote && (quote.text === previousText || seen.includes(quote.text))) quote = queue.shift()
      if (quote) { seen = [...seen, quote.text].slice(-200); persist() }
      void refill()
      return quote ?? koreanFallback(previousText)
    },
    dispose() { disposed = true; controller.abort() },
  }
}
