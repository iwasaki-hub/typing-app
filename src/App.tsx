import HomePage from './pages/HomePage'
import { lazy, Suspense, useEffect, useRef } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './features/auth/context'
import Navigation from './components/Navigation'
import TypingPage from './pages/TypingPage'
import NotFoundPage from './pages/NotFoundPage'
const RankingPage = lazy(() => import('./pages/RankingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))

export default function App() {
  const { pathname, hash } = useLocation()
  const navigate = useNavigate()
  const { session, ready } = useAuth()
  // Capture the callback before the SDK consumes and clears its URL fragment.
  const loginCallback = useRef(pathname === '/ranking' && new URLSearchParams(hash.slice(1)).has('access_token'))
  useEffect(() => {
    if (ready && session && loginCallback.current) {
      loginCallback.current = false
      void navigate('/dashboard', { replace: true })
    }
  }, [ready, session, navigate])
  useEffect(() => {
    document.title = pathname === '/' ? 'Typing — ことばを打つ。毎日が、少し軽くなる。'
      : pathname === '/practice' ? 'タイピング練習 | Typing' : pathname === '/ranking' ? 'ランキング | Typing' : pathname === '/dashboard' ? 'ダッシュボード | Typing' : pathname === '/profile' ? 'プロフィール | Typing' : pathname === '/login' ? 'ログイン | Typing' : 'ページが見つかりません | Typing'
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
        <Route path="/dashboard" element={<Suspense fallback={<main id="main" tabIndex={-1}><p role="status">読み込んでいます…</p></main>}><DashboardPage /></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<main id="main" tabIndex={-1}><p role="status">読み込んでいます…</p></main>}><LoginPage profile /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={<main id="main" tabIndex={-1}><p role="status">読み込んでいます…</p></main>}><LoginPage /></Suspense>} />
        <Route path="/ranking" element={<Suspense fallback={<main id="main" tabIndex={-1}><p role="status">ランキングを読み込んでいます…</p></main>}><RankingPage /></Suspense>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

