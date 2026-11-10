import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { getSupabase } from '../lib/supabase'
import { createEmailRequestLimiter } from '../features/auth/loginLink'
import { createPasswordAuth } from '../features/auth/password'

export function watchAuth(callback: (session: Session | null, event: AuthChangeEvent) => void) {
  const { data } = getSupabase().auth.onAuthStateChange((event, session) => callback(session, event))
  return () => data.subscription.unsubscribe()
}

export async function getAuthSession() {
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  return data.session
}

const emailLimiter = createEmailRequestLimiter({ getStorage: () => window.localStorage })
const passwords = createPasswordAuth(() => getSupabase().auth, () => `${window.location.origin}/ranking`)
export const signInWithPassword = passwords.login
export const updatePassword = passwords.updatePassword
export const getLoginLinkRetryAt = emailLimiter.getRetryAt
export const registerWithPassword = (email: string, password: string, name: string) => emailLimiter.run(() => passwords.register(email, password, name))
export const requestPasswordReset = (email: string) => emailLimiter.run(() => passwords.requestReset(email))

export async function signOut() {
  const { error } = await getSupabase().auth.signOut()
  if (error) throw error
}

export async function updateDisplayName(name: string) {
  const displayName = name.trim()
  if (!displayName || displayName.length > 20 || [...displayName].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) {
    throw new Error('表示名は1〜20文字で入力してください。')
  }
  const { data, error } = await getSupabase().auth.updateUser({ data: { display_name: displayName } })
  if (error) throw error
  return data.user
}
