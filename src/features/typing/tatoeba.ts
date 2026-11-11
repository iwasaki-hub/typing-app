export interface TatoebaCredit { sentenceId: number; author: string; license: 'CC BY 2.0 FR' | 'CC0 1.0' }

export function isTatoebaCredit(value: unknown): value is TatoebaCredit {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return Number.isSafeInteger(item.sentenceId) && Number(item.sentenceId) > 0
    && typeof item.author === 'string' && item.author.length > 0 && item.author.length <= 100
    && (item.license === 'CC BY 2.0 FR' || item.license === 'CC0 1.0')
}

export function isKoreanText(text: unknown): text is string {
  return typeof text === 'string' && text.length >= 10 && text.length <= 180
    && text === text.normalize('NFC') && /[\uAC00-\uD7A3]/.test(text) && /^[\x20-\x7e\uAC00-\uD7A3]+$/.test(text)
}
