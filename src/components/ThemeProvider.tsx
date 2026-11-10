import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { parseTheme, THEME_KEY, ThemeContext, type AppTheme } from '../features/theme/context'

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(() => {
    try { return parseTheme(window.localStorage.getItem(THEME_KEY)) } catch { return 'classic' }
  })
  useLayoutEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  const changeTheme = useCallback((next: AppTheme) => {
    setTheme(next)
    try { window.localStorage.setItem(THEME_KEY, next) } catch { /* Switching works without storage too. */ }
  }, [])
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === THEME_KEY || event.key === null) setTheme(parseTheme(event.newValue)) }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  const value = useMemo(() => ({ theme, changeTheme }), [theme, changeTheme])
  return <ThemeContext value={value}>{children}</ThemeContext>
}
