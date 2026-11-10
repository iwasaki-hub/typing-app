import { createContext, useContext } from 'react'

export type AppTheme = 'classic' | 'calm'
export const THEME_KEY = 'typing-app:theme:v1'
export function parseTheme(value: unknown): AppTheme { return value === 'calm' ? 'calm' : 'classic' }
export const ThemeContext = createContext<{ theme: AppTheme; changeTheme: (theme: AppTheme) => void } | undefined>(undefined)
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme は ThemeProvider の内側で使用してください。')
  return context
}
