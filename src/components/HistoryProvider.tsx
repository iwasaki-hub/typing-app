import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../features/auth/context'
import { createHistoryStore, HISTORY_KEY, parseHistory } from '../features/typing/history'
import { HistoryContext } from '../features/typing/historyContext'

function AccountHistory({ userId, children }: { userId: string | null; children: ReactNode }) {
  const key = userId ? `${HISTORY_KEY}:user:${userId}` : HISTORY_KEY
  const [store] = useState(() => createHistoryStore(() => window.localStorage, key))
  const [status, setStatus] = useState(userId ? '同期を準備しています…' : '')
  const retry = useRef<() => void>(() => {})
  useEffect(() => {
    let disposed = false
    let running = false
    let dirty = false
    let merging = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()
    async function run() {
      if (!userId || disposed) return
      if (running) { dirty = true; return }
      running = true
      dirty = false
      setStatus('記録を同期しています…')
      try {
        const { syncHistory } = await import('../api/history')
        if (disposed) return
        const records = await syncHistory(userId, store.getSnapshot().results, controller.signal)
        if (disposed) return
        merging = true
        store.merge(records)
        merging = false
        setStatus('同期済み：最新100件を表示しています。')
      } catch {
        if (!disposed) setStatus('同期できませんでした。端末の記録を保持し、再接続時に再試行します。')
      } finally {
        running = false
        if (dirty && !disposed) schedule()
      }
    }
    function schedule() { clearTimeout(timer); timer = setTimeout(() => { void run() }, 300) }
    retry.current = () => { void run() }
    const unsubscribe = store.subscribe(() => { if (!merging) schedule() })
    const refresh = (event: StorageEvent) => { if (event.key === key || event.key === null) store.refresh() }
    const visible = () => { if (document.visibilityState === 'visible') void run() }
    window.addEventListener('storage', refresh)
    window.addEventListener('online', schedule)
    document.addEventListener('visibilitychange', visible)
    const interval = userId ? window.setInterval(() => { if (document.visibilityState === 'visible') void run() }, 60000) : undefined
    void run()
    return () => {
      disposed = true
      controller.abort()
      clearTimeout(timer)
      window.clearInterval(interval)
      unsubscribe()
      window.removeEventListener('storage', refresh)
      window.removeEventListener('online', schedule)
      document.removeEventListener('visibilitychange', visible)
    }
  }, [key, store, userId])
  function importGuest() {
    if (!userId) return
    try { store.merge(parseHistory(window.localStorage.getItem(HISTORY_KEY))); retry.current() }
    catch { setStatus('端末のログイン前の記録を読み込めませんでした。') }
  }
  return <HistoryContext value={{ store, signedIn: !!userId, status, sync: () => retry.current(), importGuest }}>{children}</HistoryContext>
}

export default function HistoryProvider({ children }: { children: ReactNode }) {
  const { ready, user } = useAuth()
  if (!ready) return <p role="status">ログイン状態を確認しています…</p>
  return <AccountHistory key={user?.id ?? 'guest'} userId={user?.id ?? null}>{children}</AccountHistory>
}
