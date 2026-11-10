import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return <main id="main" tabIndex={-1} className="not-found-page"><p>404</p><h1>ページが見つかりません</h1><p>URL を確認するか、ホームからお進みください。</p><Link to="/">ホームに戻る</Link><Link to="/practice">タイピングを練習する</Link></main>
}
