import { createApiClient } from './client.ts'

export interface PracticeQuote {
  text: string
  author: string | null
  source: 'dummyjson' | 'local'
}

export const fallbackQuotes: PracticeQuote[] = [
  { text: 'Small steps, every day.', author: null, source: 'local' },
  { text: 'Take your time and enjoy the journey.', author: null, source: 'local' },
  { text: 'A little practice makes a big difference.', author: null, source: 'local' },
]

const quotesApi = createApiClient('https://dummyjson.com')

function normalizeText(text: string) {
  return text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-').replace(/…/g, '...').replace(/\s+/g, ' ').trim()
}

// Validate external data and keep sentences manageable for an introductory exercise.
export function selectPracticeQuote(data: unknown, previousText?: string): PracticeQuote {
  const items = Array.isArray(data) ? data : [data]
  for (const item of items) {
    if (!item || typeof item !== 'object' || !('quote' in item) || typeof item.quote !== 'string') continue
    const text = normalizeText(item.quote)
    if (text === previousText || text.length < 20 || text.length > 180 || !/^[\x20-\x7E]+$/.test(text)) continue
    return {
      text,
      author: 'author' in item && typeof item.author === 'string' ? item.author : null,
      source: 'dummyjson',
    }
  }
  throw new Error('練習に適した英文が見つかりませんでした。')
}

export async function getPracticeQuote(previousText?: string, signal?: AbortSignal): Promise<PracticeQuote> {
  const { data } = await quotesApi.get<unknown>('/quotes/random/10', { signal })
  return selectPracticeQuote(data, previousText)
}

export function getFallbackQuote(previousText?: string): PracticeQuote {
  return fallbackQuotes.find((quote) => quote.text !== previousText) ?? fallbackQuotes[0]
}
