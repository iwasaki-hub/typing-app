import { ko } from './ko.ts'
export type UiLocale = 'ja' | 'ko'
export const UI_LOCALE_KEY = 'typing-app:ui-locale:v1'
export const parseUiLocale = (value: unknown): UiLocale => value === 'ko' ? 'ko' : 'ja'
const patterns = Object.entries(ko).filter(([key]) => /\{\d+\}/.test(key)).map(([key, value]) => ({
  expression: new RegExp('^' + key.split(/(\{\d+\})/).map(part => /^\{\d+\}$/.test(part) ? '(.+?)' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('') + '$'), value,
}))
export function translate(locale: UiLocale, text: string, values: readonly unknown[] = []): string {
  let result = locale === 'ko' ? ko[text] : text
  if (result === undefined) {
    for (const pattern of patterns) {
      const match = text.match(pattern.expression)
      if (match) return pattern.value.replace(/\{(\d+)\}/g, (_, index: string) => match[Number(index) + 1] ?? '')
    }
    result = text
  }
  return result.replace(/\{(\d+)\}/g, (token, index: string) => Number(index) < values.length ? String(values[Number(index)]) : token)
}
