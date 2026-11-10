import { createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthContextValue {
  session: Session | null
  user: User | null
  isAuthenticated: boolean
  ready: boolean
  error: string
  displayName: string
  logout: () => Promise<void>
  saveDisplayName: (name: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth は AuthProvider の内側で使用してください。')
  return context
}
