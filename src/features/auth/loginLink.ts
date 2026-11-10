export const LOGIN_RESEND_KEY = 'typing-app:login-resend-after:v1'
export const LOGIN_RESEND_DELAY = 60_000

export function loginLinkFailure(error: unknown) {
  const value = error && typeof error === 'object' ? error as { code?: string; status?: number } : {}
  if (value.code === 'over_email_send_rate_limit') {
    return { limited: true, message: '認証メールの送信上限に達しています。時間をおいて再度お試しください。再送待機が終わっても、サーバー側の制限が続く場合があります。' }
  }
  if (value.status === 429 || value.code === 'over_request_rate_limit') {
    return { limited: true, message: 'リクエストが集中しています。しばらく待ってから再度お試しください。' }
  }
  if (value.code === 'email_address_not_authorized') {
    return { limited: false, message: '現在、このメールアドレスには送信できません。サイト管理者にお問い合わせください。' }
  }
  if (value.code === 'email_address_invalid') {
    return { limited: false, message: 'メールアドレスの形式を確認してください。' }
  }
  if (value.code === 'weak_password') return { limited: false, message: 'パスワードが安全性の要件を満たしていません。より長く、推測されにくいものを入力してください。' }
  if (value.code === 'user_already_exists') return { limited: false, message: '登録できませんでした。登録済みの方はログインまたはパスワード再設定をご利用ください。' }
  if (value.code === 'signup_disabled') return { limited: false, message: '現在、新規登録を受け付けていません。' }
  return { limited: false, message: '認証メールを送信できませんでした。入力内容や通信環境を確認し、時間をおいて再度お試しください。' }
}

// The deadline contains no email address or token. Storage is best-effort;
// the server's rate limit remains authoritative across browsers and origins.
export function createEmailRequestLimiter({ getStorage, now = Date.now }: {
  getStorage: () => Pick<Storage, 'getItem' | 'setItem'>
  now?: () => number
}) {
  let memoryDeadline = 0
  let pending = false
  function getRetryAt() {
    let stored = 0
    try { stored = Number(getStorage().getItem(LOGIN_RESEND_KEY)) } catch { /* Storage may be disabled. */ }
    const current = now()
    const valid = Number.isFinite(stored) && stored > current && stored <= current + LOGIN_RESEND_DELAY
    return Math.max(memoryDeadline > current ? memoryDeadline : 0, valid ? stored : 0)
  }
  function waitBeforeRetry() {
    memoryDeadline = now() + LOGIN_RESEND_DELAY
    try { getStorage().setItem(LOGIN_RESEND_KEY, String(memoryDeadline)) } catch { /* Keep the in-memory deadline. */ }
  }
  return {
    getRetryAt,
    async run<T>(request: () => Promise<T>): Promise<T> {
      if (pending) throw new Error('認証メールを送信中です。しばらくお待ちください。')
      if (getRetryAt() > now()) throw new Error('再送待機時間が終わってからお試しください。')
      pending = true
      try { const result = await request(); waitBeforeRetry(); return result }
      catch (error) {
        const failure = loginLinkFailure(error)
        if (failure.limited) waitBeforeRetry()
        throw new Error(failure.message, { cause: error })
      } finally { pending = false }
    },
  }
}

export function createLoginLinkSender({ send, ...options }: {
  send: (email: string) => Promise<void>
  getStorage: () => Pick<Storage, 'getItem' | 'setItem'>
  now?: () => number
}) {
  const limiter = createEmailRequestLimiter(options)
  return { getRetryAt: limiter.getRetryAt, send: (email: string) => limiter.run(() => send(email.trim())) }
}
