import type { SupabaseClient } from '@supabase/supabase-js'

export function authCallbackDestination(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  if (!params.has('access_token')) return null
  return params.get('type') === 'recovery' ? '/reset-password' : '/dashboard'
}

export function validatePassword(password: string, confirmation: string) {
  if (password.length < 8 || password.length > 128) throw new Error('パスワードは8〜128文字で入力してください。')
  if (password !== confirmation) throw new Error('確認用パスワードが一致しません。')
}

export function passwordAuthError(error: unknown) {
  const value = error && typeof error === 'object' ? error as { code?: string; status?: number } : {}
  switch (value.code) {
    case 'invalid_credentials': return 'メールアドレスまたはパスワードが正しくありません。メールリンクで利用していた方は、先にパスワードを設定してください。'
    case 'email_not_confirmed': return 'メールアドレスの確認が完了していません。登録時の確認メールを開いてください。'
    case 'weak_password': return 'パスワードが安全性の要件を満たしていません。より長く、推測されにくいものを入力してください。'
    case 'same_password': return '現在とは異なるパスワードを入力してください。'
    case 'reauthentication_needed': return '再認証が必要です。一度ログアウトし、再ログインしてからお試しください。'
    case 'session_not_found': case 'refresh_token_not_found': return 'ログインの有効期限が切れました。再度ログインしてください。'
    default: return value.status === 429 ? '試行回数が上限に達しました。時間をおいて再度お試しください。' : '認証処理に失敗しました。入力内容や通信環境を確認してください。'
  }
}

export function createPasswordAuth(getAuth: () => SupabaseClient['auth'], redirectTo: () => string) {
  return {
    async login(email: string, password: string) {
      const { error } = await getAuth().signInWithPassword({ email: email.trim(), password })
      if (error) throw new Error(passwordAuthError(error), { cause: error })
    },
    async register(email: string, password: string, name: string) {
      const { data, error } = await getAuth().signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo(), data: { display_name: name.trim() } } })
      // Leave email rate-limit errors intact for the shared email limiter.
      if (error) throw error
      return Boolean(data.session)
    },
    async requestReset(email: string) {
      const { error } = await getAuth().resetPasswordForEmail(email.trim(), { redirectTo: redirectTo() })
      if (error) throw error
    },
    async updatePassword(password: string) {
      const { error } = await getAuth().updateUser({ password })
      if (error) throw new Error(passwordAuthError(error), { cause: error })
    },
  }
}
