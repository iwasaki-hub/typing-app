import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrophy } from '@fortawesome/free-solid-svg-icons'
import { getAuthSession, watchAuth, sendLoginLink, signOut } from '../api/auth'
import { getRanking, publishResult, rankingError, type RankingEntry } from '../api/ranking'
import { HISTORY_KEY, typingHistory } from '../features/typing/history'
import { isRankingEligible } from '../features/typing/ranking'
import './RankingPage.css'

export default function RankingPage() {
  const [duration, setDuration] = useState(60)
  const [rows, setRows] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [version, setVersion] = useState(0)
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const inFlight = useRef(false)
  const { results, error: historyError } = useSyncExternalStore(typingHistory.subscribe, typingHistory.getSnapshot, typingHistory.getServerSnapshot)
  const eligible = results.filter(isRankingEligible)
  const selected = eligible.find((result) => result.id === selectedId) ?? eligible[0]

  useEffect(() => {
    const controller = new AbortController()
    getRanking(duration, controller.signal).then((data) => {
      if (!controller.signal.aborted) { setRows(data); setLoadError(''); setLoading(false) }
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) { setLoadError(rankingError(error)); setLoading(false) }
    })
    return () => controller.abort()
  }, [duration, version])

  useEffect(() => {
    let active = true
    try {
      const unsubscribe = watchAuth((next) => { if (active) { setSession(next); setAuthReady(true) } })
      void getAuthSession().catch((error: unknown) => { if (active) { setActionError(rankingError(error)); setAuthReady(true) } })
      return () => { active = false; unsubscribe() }
    } catch (error) {
      // Missing environment variables must not prevent the rest of the app from rendering.
      queueMicrotask(() => { if (active) { setActionError(rankingError(error)); setAuthReady(true) } })
      return () => { active = false }
    }
  }, [])

  useEffect(() => {
    const refresh = (event: StorageEvent) => { if (event.key === HISTORY_KEY || event.key === null) typingHistory.refresh() }
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])

  async function perform(action: () => Promise<void>) {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true); setMessage(''); setActionError('')
    try { await action() } catch (error) { setActionError(rankingError(error)) }
    finally { inFlight.current = false; setBusy(false) }
  }

  function refreshRanking() { setLoading(true); setLoadError(''); setVersion((value) => value + 1) }

  return <main id="main" tabIndex={-1} className="ranking-page">
    <header className="ranking-intro"><span><FontAwesomeIcon icon={faTrophy} aria-hidden="true" /> LEADERBOARD</span><h1>毎日の練習を、記録に。</h1><p>全ユーザーのベスト記録。次は、あなたの番です。</p></header>
    <section className="ranking-board" aria-labelledby="ranking-title">
      <div className="ranking-heading"><h2 id="ranking-title">全ユーザーランキング</h2><label>制限時間 <select value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setRows([]); setLoading(true); setLoadError('') }}>{[30, 60, 120].map((value) => <option key={value} value={value}>{value}秒</option>)}</select></label><button onClick={refreshRanking} disabled={loading}>更新</button></div>
      <p>各ユーザーの最高 WPM を掲載（上位100人）。同じ WPM は正確率、記録日時の順に並びます。</p>
      {loading ? <p role="status">ランキングを読み込んでいます…</p> : loadError ? <p role="alert">{loadError}</p> : rows.length === 0 ? <div className="ranking-empty">まだ記録がありません。<Link to="/practice">練習して最初の記録を作る →</Link></div> : <div className="ranking-scroll" role="region" aria-label="ランキング一覧" tabIndex={0}><table><thead><tr><th>順位</th><th>ユーザー</th><th>WPM</th><th>正確率</th><th>記録日</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id} className={row.user_id === session?.user.id ? 'ranking-mine' : ''}><td>{index + 1}</td><td>{row.display_name}{row.user_id === session?.user.id && <small> あなた</small>}</td><td><strong>{row.wpm}</strong></td><td>{row.accuracy}%</td><td><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleDateString('ja-JP')}</time></td></tr>)}</tbody></table></div>}
    </section>
    <section className="ranking-publish" aria-labelledby="publish-title"><h2 id="publish-title">自分の記録を公開する</h2><p>表示名・スコア・記録日は誰でも閲覧できます。メールアドレスは公開されません。</p>
      {!authReady ? <p role="status">ログイン状態を確認しています…</p> : session ? <div className="ranking-account"><span>ログイン済み</span><button disabled={busy} onClick={() => void perform(async () => { await signOut(); setMessage('ログアウトしました。') })}>ログアウト</button></div> : <form className="ranking-form" onSubmit={(event) => { event.preventDefault(); void perform(async () => {
        await sendLoginLink(email)
        setMessage('ログイン用リンクを送信しました。メールを開き、このブラウザでログインしてください。届かない場合は迷惑メールも確認してください。')
      }) }}><label>メールアドレス<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><button disabled={busy} type="submit">メールでログイン</button><small>初めての場合はアカウントが作成されます。</small></form>}
      {historyError && <p role="alert">{historyError}</p>}
      {selected ? <form className="ranking-form" onSubmit={(event) => { event.preventDefault(); void perform(async () => { await publishResult(selected, name); setMessage('記録を公開しました。同じユーザー・制限時間ではベスト記録が掲載されます。'); setDuration(selected.duration); setRows([]); refreshRanking() }) }}>
        <label>公開する練習結果<select value={selected.id} disabled={busy} onChange={(event) => setSelectedId(event.target.value)}>{eligible.map((result) => <option key={result.id} value={result.id}>{new Date(result.savedAt).toLocaleString('ja-JP')} · {result.duration}秒 · {result.wpm} WPM</option>)}</select></label>
        <label>公開する表示名<input required maxLength={20} value={name} disabled={busy} onChange={(event) => setName(event.target.value)} placeholder="1〜20文字" /></label><button type="submit" disabled={!session || busy}>{busy ? '処理中…' : 'この記録を公開する'}</button>
      </form> : <p>公開できる結果がありません。<Link to="/practice">タイピング練習へ →</Link></p>}
      {actionError && <p role="alert">{actionError}</p>}{message && <p role="status">{message}</p>}
      <p className="ranking-note">入力完了または時間切れ、計測5秒以上・1〜300 WPM の結果が対象です。過去の履歴に必要な計測情報がない場合は、もう一度練習してください。練習文は毎回異なります。ブラウザで計測するカジュアルなランキングです。</p>
    </section>
  </main>
}
