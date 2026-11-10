import { trophyIcon } from '../lib/icons'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuth } from '../features/auth/context'
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
  const { session, ready: authReady, error: authError, displayName } = useAuth()
  const [name, setName] = useState<string | null>(null)
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
    <header className="ranking-intro"><span><FontAwesomeIcon icon={trophyIcon} aria-hidden="true" /> LEADERBOARD</span><h1>毎日の練習を、記録に。</h1><p>全ユーザーのベスト記録。次は、あなたの番です。</p></header>
    <section className="ranking-board" aria-labelledby="ranking-title">
      <div className="ranking-heading"><h2 id="ranking-title">全ユーザーランキング</h2><label>制限時間 <select value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setRows([]); setLoading(true); setLoadError('') }}>{[30, 60, 120].map((value) => <option key={value} value={value}>{value}秒</option>)}</select></label><button onClick={refreshRanking} disabled={loading}>更新</button></div>
      <p>英語の練習結果から各ユーザーの最高 WPM を掲載（上位100人）。同じ WPM は正確率、記録日時の順に並びます。</p>
      {loading ? <p role="status">ランキングを読み込んでいます…</p> : loadError ? <p role="alert">{loadError}</p> : rows.length === 0 ? <div className="ranking-empty">まだ記録がありません。<Link to="/practice">練習して最初の記録を作る →</Link></div> : <div className="ranking-scroll" role="region" aria-label="ランキング一覧" tabIndex={0}><table><thead><tr><th>順位</th><th>ユーザー</th><th>WPM</th><th>正確率</th><th>記録日</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id} className={row.user_id === session?.user.id ? 'ranking-mine' : ''}><td>{index + 1}</td><td>{row.display_name}{row.user_id === session?.user.id && <small> あなた</small>}</td><td><strong>{row.wpm}</strong></td><td>{row.accuracy}%</td><td><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleDateString('ja-JP')}</time></td></tr>)}</tbody></table></div>}
    </section>
    <section className="ranking-publish" aria-labelledby="publish-title"><h2 id="publish-title">自分の記録を公開する</h2><p>表示名・スコア・記録日は誰でも閲覧できます。メールアドレスは公開されません。</p>
      {!authReady ? <p role="status">ログイン状態を確認しています…</p> : session ? <div className="ranking-account"><span>{displayName ? `${displayName} さんでログイン中` : 'ログイン済み'}</span><Link to="/profile">{displayName ? 'プロフィールを編集' : '名前を設定する →'}</Link></div> : <p><Link to="/login">ログインして記録を公開する →</Link></p>}
      {authError && <p role="alert">{authError}</p>}
      {historyError && <p role="alert">{historyError}</p>}
      {selected ? <form className="ranking-form" onSubmit={(event) => { event.preventDefault(); void perform(async () => { await publishResult(selected, name ?? displayName); setMessage('記録を公開しました。同じユーザー・制限時間ではベスト記録が掲載されます。'); setDuration(selected.duration); setRows([]); refreshRanking() }) }}>
        <label>公開する練習結果<select value={selected.id} disabled={busy} onChange={(event) => setSelectedId(event.target.value)}>{eligible.map((result) => <option key={result.id} value={result.id}>{new Date(result.savedAt).toLocaleString('ja-JP')} · {result.duration}秒 · {result.wpm} WPM</option>)}</select></label>
        <label>公開する表示名<input required maxLength={20} value={name ?? displayName} disabled={busy} onChange={(event) => setName(event.target.value)} placeholder="1〜20文字" /></label><button type="submit" disabled={!session || busy}>{busy ? '処理中…' : 'この記録を公開する'}</button>
      </form> : <p>公開できる英語の結果がありません。<Link to="/practice">タイピング練習へ →</Link></p>}
      {actionError && <p role="alert">{actionError}</p>}{message && <p role="status">{message}</p>}
      <p className="ranking-note">英語の結果のみ対象です。韓国語の結果は履歴で確認できます。入力完了または時間切れ、計測5秒以上・1〜300 WPM の結果が対象です。過去の履歴に必要な計測情報がない場合は、もう一度練習してください。練習文は毎回異なります。ブラウザで計測するカジュアルなランキングです。</p>
    </section>
  </main>
}
