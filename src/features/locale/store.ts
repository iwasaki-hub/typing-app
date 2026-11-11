import { parseUiLocale, UI_LOCALE_KEY, type UiLocale } from './translate.ts'
let locale: UiLocale = 'ja'
let initialized = false
const listeners = new Set<() => void>()
export function getUiLocale() {
  if (!initialized) {
    initialized = true
    try { locale = parseUiLocale(window.localStorage.getItem(UI_LOCALE_KEY)) } catch { /* Use Japanese when storage is unavailable. */ }
  }
  return locale
}
export function setUiLocale(next: UiLocale) {
  locale = parseUiLocale(next)
  initialized = true
  try { window.localStorage.setItem(UI_LOCALE_KEY, locale) } catch { /* Switching still works without storage. */ }
  listeners.forEach(listener => listener())
}
export const subscribeLocale = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
export const getFormattingLocale = () => getUiLocale() === 'ko' ? 'ko-KR' : 'ja-JP'
