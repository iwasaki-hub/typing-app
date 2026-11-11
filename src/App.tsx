import { useLocale } from './features/locale/useLocale'
import HomePage from './pages/home/HomePage';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { practiceActivities } from './features/practice/activities';
import { useAuth } from './features/auth/context';
import { authCallbackDestination } from './features/auth/password';
import { m } from 'motion/react';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import PracticeMenuPage from './pages/practice/PracticeMenuPage';
import NotFoundPage from './pages/errors/NotFoundPage';
const RankingPage = lazy(() => import('./pages/ranking/RankingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
export default function App() {
    const { t } = useLocale();
    const { pathname, hash } = useLocation();
    const navigate = useNavigate();
    const { session, ready, isPasswordRecovery } = useAuth();
    // Capture the callback before the SDK consumes and clears its URL fragment.
    const loginCallback = useRef(pathname === '/ranking' ? authCallbackDestination(hash) : null);
    useEffect(() => {
        if (ready && session && loginCallback.current) {
            const destination = loginCallback.current;
            loginCallback.current = null;
            void navigate(isPasswordRecovery ? '/reset-password' : destination, { replace: true });
        }
        else if (ready && session && isPasswordRecovery && pathname !== '/reset-password') {
            void navigate('/reset-password', { replace: true });
        }
    }, [ready, session, navigate, isPasswordRecovery, pathname]);
    useEffect(() => {
        const activity = practiceActivities.find(item => item.path === pathname);
        document.title = activity ? `${t(activity.title)} | Typing` : t(pathname === '/' ? 'Typing — ことばを打つ。毎日が、少し軽くなる。'
            : pathname === '/practice' ? 'タイピングメニュー | Typing' : pathname === '/ranking' ? 'ランキング | Typing' : pathname === '/dashboard' ? 'ダッシュボード | Typing' : pathname === '/profile' ? 'プロフィール | Typing' : pathname === '/login' ? 'ログイン | Typing' : pathname === '/reset-password' ? 'パスワードの設定 | Typing' : 'ページが見つかりません | Typing');
    }, [pathname, t]);
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            const target = hash ? document.getElementById(hash.slice(1)) : null;
            if (target)
                target.scrollIntoView({ block: 'start' });
            else
                window.scrollTo(0, 0);
            document.getElementById('main')?.focus({ preventScroll: true });
        });
        return () => cancelAnimationFrame(frame);
    }, [pathname, hash]);
    return (<div id="top" className="app-shell">
      <a className="app-skip" href="#main">{t("本文へスキップ")}</a>
      <Navigation key={`navigation:${pathname}`}/>
      <m.div className="app-content" key={`page:${pathname}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/practice" element={<PracticeMenuPage />}/>
        {practiceActivities.map(activity => <Route key={activity.id} path={activity.path} element={<Suspense fallback={<main id="main" tabIndex={-1}><p role="status">{t('読み込んでいます…')}</p></main>}><activity.Page /></Suspense>} />)}
        <Route path="/learn/countries" element={<Navigate to="/practice/countries" replace />} />
        <Route path="/dashboard" element={<Suspense fallback={<main id="main" tabIndex={-1}><p role="status">{t("読み込んでいます…")}</p></main>}><DashboardPage /></Suspense>}/>
        <Route path="/profile" element={<Suspense fallback={<main id="main" tabIndex={-1}><p role="status">{t("読み込んでいます…")}</p></main>}><LoginPage profile/></Suspense>}/>
        <Route path="/login" element={<Suspense fallback={<main id="main" tabIndex={-1}><p role="status">{t("読み込んでいます…")}</p></main>}><LoginPage /></Suspense>}/>
        <Route path="/reset-password" element={<Suspense fallback={<main id="main" tabIndex={-1}><p role="status">{t("読み込んでいます…")}</p></main>}><LoginPage reset/></Suspense>}/>
        <Route path="/ranking" element={<Suspense fallback={<main id="main" tabIndex={-1}><p role="status">{t("ランキングを読み込んでいます…")}</p></main>}><RankingPage /></Suspense>}/>
        <Route path="*" element={<NotFoundPage />}/>
      </Routes>
      </m.div>
      <Footer />
    </div>);
}
