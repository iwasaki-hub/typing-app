import type { Session } from '@supabase/supabase-js'
import { getSupabase } from '../lib/supabase'

export function watchAuth(callback: (session: Session | null) => void) {
  const { data } = getSupabase().auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

export async function getAuthSession() {
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  return data.session
}

export async function sendLoginLink(email: string) {
  const { error } = await getSupabase().auth.signInWithOtp({
    email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/ranking` },
  })
  if (error) throw error
}

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
