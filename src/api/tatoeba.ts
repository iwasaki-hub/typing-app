import { createApiClient } from './client.ts'
import type { PracticeQuote } from './quotes.ts'
import { isKoreanText, isTatoebaCredit } from '../features/typing/tatoeba.ts'

const api = createApiClient('https://api.tatoeba.org')
export function selectKoreanBatch(data: unknown): PracticeQuote[] {
  if (!data || typeof data !== 'object' || !('data' in data) || !Array.isArray(data.data)) throw new Error('韓国語の応答形式が異なります。')
  const quotes: PracticeQuote[] = []
  for (const item of data.data) {
    if (!item || item.lang !== 'kor' || item.is_unapproved !== false || typeof item.text !== 'string') continue
    const text = item.text.normalize('NFC').trim()
    const credit = { sentenceId: item.id, author: item.owner, license: item.license }
    if (!isKoreanText(text) || !isTatoebaCredit(credit) || quotes.some(quote => quote.text === text)) continue
    quotes.push({ text, author: credit.author, source: 'tatoeba', language: 'ko', credit })
    if (quotes.length === 20) break
  }
  return quotes
}
export async function getKoreanBatch(signal: AbortSignal) {
  const { data } = await api.get<unknown>('/v1/sentences', { signal, params: { lang: 'kor', sort: 'random', limit: 20, is_unapproved: 'no', is_orphan: 'no' } })
  return selectKoreanBatch(data)
}
