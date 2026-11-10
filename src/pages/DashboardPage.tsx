import { useSyncExternalStore } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKeyboard, faTrophy, faUser } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../features/auth/context'
import { typingHistory } from '../features/typing/history'
import TypingHistory from '../components/TypingHistory'
import MotionLink from '../components/MotionLink'
import './DashboardPage.css'

export default function DashboardPage() {
  const { session, ready, error, displayName } = useAuth()
  const { results } = useSyncExternalStore(typingHistory.subscribe, typingHistory.getSnapshot, typingHistory.getServerSnapshot)
  if (!ready) return <main id="main" tabIndex={-1} className="dashboard-page"><p role="status">ログイン状態を確認しています…</p></main>
  if (error) return <main id="main" tabIndex={-1} className="dashboard-page"><p role="alert">{error}</p><Link to="/login">ログインページへ</Link></main>
  if (!session) return <Navigate to="/login" replace />
  const best = results.reduce((max, result) => Math.max(max, result.wpm), 0)
  const latest = results[0]
  return <main id="main" tabIndex={-1} className="dashboard-page">
    <header className="dashboard-intro"><span>YOUR DASHBOARD</span><h1>{displayName ? `${displayName} さん、おかえりなさい。` : 'おかえりなさい。'}</h1><p>今日も、自分のペースで一歩ずつ。</p>{!displayName && <Link to="/profile">まずは表示名を設定する →</Link>}</header>
    <dl className="dashboard-stats" aria-label="このブラウザの練習記録"><div><dt>保存済みの練習</dt><dd>{results.length}<small> 件</small></dd></div><div><dt>履歴内の最高速度</dt><dd>{results.length ? best : '—'}<small> WPM</small></dd></div><div><dt>直近の正確率</dt><dd>{latest ? latest.accuracy : '—'}<small> %</small></dd></div></dl>
    <p className="dashboard-note">このブラウザに保存された最新100件の集計です。別アカウントで練習した履歴も含まれます。</p>
    <div className="dashboard-actions"><MotionLink whileHover={{ y: -5, boxShadow: '0 12px 28px #192c4610' }} whileTap={{ scale: 0.98 }} to="/practice"><FontAwesomeIcon icon={faKeyboard} aria-hidden="true" /><h2>練習をはじめる</h2><p>英文を打って、次の自己ベストへ。</p><span>タイピングへ →</span></MotionLink><MotionLink whileHover={{ y: -5, boxShadow: '0 12px 28px #192c4610' }} whileTap={{ scale: 0.98 }} to="/ranking"><FontAwesomeIcon icon={faTrophy} aria-hidden="true" /><h2>ランキング</h2><p>記録を公開して、みんなと比較。</p><span>ランキングを見る →</span></MotionLink><MotionLink whileHover={{ y: -5, boxShadow: '0 12px 28px #192c4610' }} whileTap={{ scale: 0.98 }} to="/profile"><FontAwesomeIcon icon={faUser} aria-hidden="true" /><h2>プロフィール</h2><p>表示名の変更とログアウト。</p><span>プロフィールを編集 →</span></MotionLink></div>
    <TypingHistory />
  </main>
}
