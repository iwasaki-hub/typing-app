import { useCallback, useSyncExternalStore } from 'react'
import { getUiLocale, setUiLocale, subscribeLocale } from './store'
import { translate } from './translate'
export function useLocale() {
  const locale = useSyncExternalStore(subscribeLocale, getUiLocale, () => 'ja' as const)
  const t = useCallback((text: string, values?: readonly unknown[]) => translate(locale, text, values), [locale])
  return { locale, setLocale: setUiLocale, t, dateLocale: locale === 'ko' ? 'ko-KR' : 'ja-JP' }
}
