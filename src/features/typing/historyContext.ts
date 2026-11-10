import { createContext, useContext, useSyncExternalStore } from 'react'
import type { createHistoryStore } from './history'

export const HistoryContext = createContext<{
  store: ReturnType<typeof createHistoryStore>
  signedIn: boolean
  status: string
  sync: () => void
  importGuest: () => void
  clearHistory: () => Promise<void>
  deleting: boolean
} | undefined>(undefined)

export function useHistory() {
  const context = useContext(HistoryContext)
  if (!context) throw new Error('HistoryProvider が必要です。')
  const snapshot = useSyncExternalStore(context.store.subscribe, context.store.getSnapshot, context.store.getServerSnapshot)
  return { ...context, ...snapshot }
}
