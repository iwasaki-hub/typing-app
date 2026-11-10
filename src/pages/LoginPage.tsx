import { useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faUser } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../features/auth/context'
import { sendLoginLink } from '../api/auth'
import './LoginPage.css'

function ProfileForm({ initialName }: { initialName: string }) {
  const { logout, saveDisplayName } = useAuth()
  const [name, setName] = useState(initialName)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const pending = useRef(false)
  async function perform(action: () => Promise<void>) {
    if (pending.current) return
    pending.current = true; setBusy(true); setNotice(''); setError('')
    try { await action() } catch (error) { setError(error instanceof Error ? error.message : '更新に失敗しました。') }
    finally { pending.current = false; setBusy(false) }
  }
  return <>
    <form onSubmit={(event) => { event.preventDefault(); void perform(async () => { await saveDisplayName(name); setNotice('表示名を保存しました。ナビゲーションにも反映されました。') }) }}>
      <label>表示名<input required maxLength={20} autoComplete="nickname" value={name} disabled={busy} onChange={(event) => setName(event.target.value)} placeholder="あなたの名前" /></label>
      <p className="login-help">1〜20文字。ナビゲーションに表示し、ランキング投稿の初期表示名として使います。</p>
      <button type="submit" disabled={busy}>{busy ? '処理中…' : '表示名を保存する'}</button>
    </form>
    {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    <div className="login-links"><Link to="/dashboard">ダッシュボードへ →</Link><button className="login-secondary" disabled={busy} onClick={() => void perform(logout)}>ログアウト</button></div>
  </>
}

export default function LoginPage({ profile = false }: { profile?: boolean }) {
  const { session, ready, error: authError, displayName } = useAuth()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const pending = useRef(false)
  if (ready && !authError && session && !profile) return <Navigate to="/dashboard" replace />
  if (ready && !authError && !session && profile) return <Navigate to="/login" replace />
  async function login() {
    if (pending.current) return
    pending.current = true; setBusy(true); setNotice(''); setError('')
    try { await sendLoginLink(email); setNotice('ログイン用リンクを送信しました。このブラウザでメールのリンクを開いてください。届かない場合は迷惑メールも確認してください。') }
    catch (error) { setError(error instanceof Error ? error.message : 'ログイン用リンクを送信できませんでした。') }
    finally { pending.current = false; setBusy(false) }
  }
  return <main id="main" tabIndex={-1} className="login-page">
    <div className="login-card">
      <span className="login-icon"><FontAwesomeIcon icon={session ? faUser : faEnvelope} aria-hidden="true" /></span>
      <h1>{session ? 'あなたのプロフィール' : 'Typing にログイン'}</h1>
      <p>{session ? '表示名を設定して、毎日の練習を続けましょう。' : 'メールのリンクから、かんたんにログイン。'}</p>
      {!ready ? <p role="status">ログイン状態を確認しています…</p> : authError ? <p role="alert">{authError}</p> : session ? <ProfileForm key={session.user.id} initialName={displayName} /> : <>
        <form onSubmit={(event) => { event.preventDefault(); void login() }}>
          <label>メールアドレス<input type="email" required maxLength={254} autoComplete="email" value={email} disabled={busy} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
          <button type="submit" disabled={busy}>{busy ? '送信中…' : 'ログインリンクを送る'}</button>
        </form>
        {error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
        <p className="login-help">初めての方はアカウントが作成されます。ログイン後はダッシュボードに移動します。「プロフィール」から表示名を登録してください。</p>
      </>}
      <Link className="login-home" to="/">← ホームに戻る</Link>
    </div>
  </main>
}
