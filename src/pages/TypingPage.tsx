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
        <p>制限時間と打鍵音を選んで、最初の一文字からスタート。</p>
      </div>
      <QuotePractice />
      <TypingHistory />
    </main>
  )
}
