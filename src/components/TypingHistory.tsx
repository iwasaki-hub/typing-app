import LanguageBadge from './LanguageBadge'
import { useId, useState } from 'react'
import { m } from 'motion/react'
import PracticeCalendar from './PracticeCalendar'
import { formatResultSpeed } from '../features/typing/history'
import { useHistory } from '../features/typing/historyContext'
import { Link } from 'react-router-dom'
import './TypingHistory.css'

const reasons = { completed: 'クリア', timeout: '時間切れ', stopped: '手動終了' }

export default function TypingHistory() {
  const viewId = useId()
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const { results, error, signedIn, status, sync, importGuest } = useHistory()
  return (
    <section className="typing-history" aria-labelledby="history-title">
      <h2 id="history-title">練習履歴 <small>{results.length}件</small></h2>
      {signedIn ? <div className="history-sync"><p>このアカウントの記録を端末間で同期します。ランキングへの公開は別途選択できます。</p><p role="status">{status}</p><button type="button" onClick={sync}>今すぐ同期</button><button type="button" onClick={importGuest}>この端末のログイン前の記録を取り込む</button></div> : <p>このブラウザに最新100件を保存します。<Link to="/login">ログイン</Link>すると、新しい記録を端末間で同期できます。</p>}
      <div className="history-view" role="group" aria-label="履歴の表示形式">{(['list', 'calendar'] as const).map((mode) => <button key={mode} type="button" aria-pressed={view === mode} onClick={() => setView(mode)}>{view === mode && <m.span aria-hidden="true" className="history-view-highlight" layoutId={viewId} transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}<span className="history-view-label">{mode === 'list' ? '一覧' : 'カレンダー'}</span></button>)}</div>
      {error && <p className="history-error" role="alert">{error}</p>}
      <m.div key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      {view === 'calendar' ? <PracticeCalendar results={results} /> : results.length === 0 ? <p>まだ履歴がありません。練習を終了すると自動で保存されます。</p> : (
        <div className="history-table-scroll" tabIndex={0} role="region" aria-label="練習履歴の表（横にスクロールできます）">
          <table><caption className="history-caption">新しい結果から表示</caption><thead><tr><th scope="col">日時・言語・練習文</th><th scope="col">結果</th><th scope="col">速度</th><th scope="col">正確率</th><th scope="col">ミス</th><th scope="col">経過 / 制限</th></tr></thead><tbody>{results.map((result) => <tr key={result.id}><td><time dateTime={result.savedAt}>{new Date(result.savedAt).toLocaleString('ja-JP')}</time><LanguageBadge language={result.language} compact /><span className="history-text" title={result.text}>{result.text}</span></td><td>{reasons[result.reason]}</td><td>{formatResultSpeed(result)}</td><td>{result.accuracy}%</td><td>{result.mistakes}回</td><td>{result.elapsed.toFixed(1)} / {result.duration}秒</td></tr>)}</tbody></table>
        </div>
      )}
      </m.div>
    </section>
  )
}
