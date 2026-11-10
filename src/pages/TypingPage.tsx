import { Link } from 'react-router-dom'
import QuotePractice from '../components/QuotePractice'
import TypingHistory from '../components/TypingHistory'
import './TypingPage.css'

export default function TypingPage() {
  return (
    <main id="main" tabIndex={-1} className="typing-page">
      <div className="typing-page-intro">
        <Link to="/">← ホームに戻る</Link>
        <h1>自分のペースで、タイピング。</h1>
        <p>英語・韓国語の例文を選んで練習。制限時間と打鍵音も変更できます。</p>
      </div>
      <QuotePractice />
      <TypingHistory />
      <p><Link to="/ranking">練習結果をランキングに公開する →</Link></p>
    </main>
  )
}
