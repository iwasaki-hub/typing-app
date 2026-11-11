import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from '../features/auth/context'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ session: Session | null; ready: boolean; error: string }>({ session: null, ready: false, error: '' })
  const [isPasswordRecovery, setPasswordRecovery] = useState(false)
  useEffect(() => {
    let active = true
    let receivedEvent = false
    let unsubscribe: (() => void) | undefined
    void import('../api/auth').then(async ({ watchAuth, getAuthSession }) => {
      if (!active) return
      // Subscribe first; INITIAL_SESSION and subsequent events are the source of truth.
      unsubscribe = watchAuth((session, event) => {
        receivedEvent = true
        if (active) {
          setState({ session, ready: true, error: '' })
          if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
          else if (event === 'SIGNED_OUT') setPasswordRecovery(false)
        }
      })
      const session = await getAuthSession()
      // Never overwrite a newer sign-in/sign-out event with an earlier read.
      if (active && !receivedEvent) setState({ session, ready: true, error: '' })
    }).catch((error: unknown) => {
      if (active) setState({ session: null, ready: true, error: error instanceof Error ? error.message : 'ログイン状態を確認できませんでした。' })
    })
    return () => { active = false; unsubscribe?.() }
  }, [])
  const logout = useCallback(async () => {
    const { signOut } = await import('../api/auth')
    await signOut()
  }, [])
  const saveDisplayName = useCallback(async (name: string) => {
    const { updateDisplayName } = await import('../api/auth')
    const user = await updateDisplayName(name)
    setState((current) => current.session?.user.id === user.id
      ? { ...current, session: { ...current.session, user } } : current)
  }, [])
  const rawName: unknown = state.session?.user.user_metadata.display_name
  const savePassword = useCallback(async (password: string) => {
    const { updatePassword } = await import('../api/auth')
    await updatePassword(password)
    setPasswordRecovery(false)
  }, [])
  const displayName = typeof rawName === 'string' ? rawName.trim().slice(0, 20) : ''
  const value = useMemo(() => ({
    ...state, user: state.session?.user ?? null, isAuthenticated: Boolean(state.session),
    displayName, logout, saveDisplayName, isPasswordRecovery, savePassword,
  }), [state, displayName, logout, saveDisplayName, isPasswordRecovery, savePassword])
  return <AuthContext value={value}>{children}</AuthContext>
}
