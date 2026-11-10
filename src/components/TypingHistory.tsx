import { useEffect, useState, useSyncExternalStore } from 'react'
import PracticeCalendar from './PracticeCalendar'
import { HISTORY_KEY, typingHistory } from '../features/typing/history'
import './TypingHistory.css'

const reasons = { completed: 'クリア', timeout: '時間切れ', stopped: '手動終了' }

export default function TypingHistory() {
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const { results, error } = useSyncExternalStore(typingHistory.subscribe, typingHistory.getSnapshot, typingHistory.getServerSnapshot)
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === HISTORY_KEY || event.key === null) typingHistory.refresh() }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  return (
    <section className="typing-history" aria-labelledby="history-title">
      <h2 id="history-title">練習履歴 <small>{results.length}件</small></h2>
      <p>このブラウザに最新100件を保存します。別の端末やブラウザとは共有されません。</p>
      <div className="history-view" role="group" aria-label="履歴の表示形式"><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>一覧</button><button type="button" aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}>カレンダー</button></div>
      {error && <p className="history-error" role="alert">{error}</p>}
      {view === 'calendar' ? <PracticeCalendar results={results} /> : results.length === 0 ? <p>まだ履歴がありません。練習を終了すると自動で保存されます。</p> : (
        <div className="history-table-scroll" tabIndex={0} role="region" aria-label="練習履歴の表（横にスクロールできます）">
          <table><caption className="history-caption">新しい結果から表示</caption><thead><tr><th scope="col">日時・英文</th><th scope="col">結果</th><th scope="col">WPM</th><th scope="col">正確率</th><th scope="col">ミス</th><th scope="col">経過 / 制限</th></tr></thead><tbody>{results.map((result) => <tr key={result.id}><td><time dateTime={result.savedAt}>{new Date(result.savedAt).toLocaleString('ja-JP')}</time><span className="history-text" title={result.text}>{result.text}</span></td><td>{reasons[result.reason]}</td><td>{result.wpm}</td><td>{result.accuracy}%</td><td>{result.mistakes}回</td><td>{result.elapsed.toFixed(1)} / {result.duration}秒</td></tr>)}</tbody></table>
        </div>
      )}
    </section>
  )
}
