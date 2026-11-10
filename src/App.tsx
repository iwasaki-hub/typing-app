import HomePage from './pages/HomePage'
import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navigation from './components/Navigation'
import TypingPage from './pages/TypingPage'
import NotFoundPage from './pages/NotFoundPage'
const RankingPage = lazy(() => import('./pages/RankingPage'))

export default function App() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    document.title = pathname === '/' ? 'Typing — ことばを打つ。毎日が、少し軽くなる。'
      : pathname === '/practice' ? 'タイピング練習 | Typing' : pathname === '/ranking' ? 'ランキング | Typing' : 'ページが見つかりません | Typing'
    const frame = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : null
      if (target) target.scrollIntoView({ block: 'start' })
      else window.scrollTo(0, 0)
      document.getElementById('main')?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])
  return (
    <div id="top">
      <a className="app-skip" href="#main">本文へスキップ</a>
      <Navigation key={pathname} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/practice" element={<TypingPage />} />
        <Route path="/ranking" element={<Suspense fallback={<main id="main" tabIndex={-1}><p role="status">ランキングを読み込んでいます…</p></main>}><RankingPage /></Suspense>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

