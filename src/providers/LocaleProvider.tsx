import { useEffect, useLayoutEffect, type ReactNode } from 'react'
import { useLocale } from '../features/locale/useLocale'
import { parseUiLocale, UI_LOCALE_KEY } from '../features/locale/translate'
export default function LocaleProvider({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useLocale()
  useLayoutEffect(() => { document.documentElement.lang = locale }, [locale])
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === UI_LOCALE_KEY || event.key === null) setLocale(parseUiLocale(event.newValue)) }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [setLocale])
  return children
}
