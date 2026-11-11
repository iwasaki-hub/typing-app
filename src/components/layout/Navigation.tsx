import { useLocale } from '../../features/locale/useLocale'
import { barsIcon, xmarkIcon, houseIcon, keyboardIcon, circleInfoIcon, bookOpenIcon, arrowRightIcon, trophyIcon, chartLineIcon } from '../../lib/icons';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Navigation.css';
import { useAuth } from '../../features/auth/context';
import ThemeSwitcher from '../settings/ThemeSwitcher';
import LocaleSwitcher from '../settings/LocaleSwitcher';
const links = [
    { href: '/', label: 'ホーム', icon: houseIcon },
    { href: '/practice', label: 'タイピング', icon: keyboardIcon },
    { href: '/ranking', label: 'ランキング', icon: trophyIcon },
];
export default function Navigation() {
    const { t } = useLocale();
    const [open, setOpen] = useState(false);
    const toggle = useRef<HTMLButtonElement>(null);
    const { session, ready, displayName } = useAuth();
    useEffect(() => {
        const mobile = window.matchMedia('(max-width: 768px)');
        const closeOnDesktop = () => { if (!mobile.matches)
            setOpen(false); };
        mobile.addEventListener('change', closeOnDesktop);
        return () => mobile.removeEventListener('change', closeOnDesktop);
    }, []);
    useEffect(() => {
        if (!open)
            return;
        const closeOnScroll = () => setOpen(false);
        window.addEventListener('scroll', closeOnScroll, { passive: true, once: true });
        return () => window.removeEventListener('scroll', closeOnScroll);
    }, [open]);
    return (<header className="site-header" onKeyDown={(event) => {
            if (event.key === 'Escape' && open) {
                setOpen(false);
                toggle.current?.focus();
            }
        }}>
      <div className="site-header-inner">
        <Link className="site-brand" to="/" onClick={() => setOpen(false)} aria-label={t("Typing ホーム")}><span className="site-mark">t.</span>Typing</Link>
        <button ref={toggle} className="site-menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? t("メニューを閉じる") : t("メニューを開く")} onClick={() => setOpen(!open)}><FontAwesomeIcon icon={open ? xmarkIcon : barsIcon} aria-hidden="true"/></button>
        <nav id="site-navigation" className={`site-navigation${open ? ' is-open' : ''}`} aria-label={t("メインナビゲーション")}>
          {links.map((link) => <NavLink end key={link.href} to={link.href} onClick={() => setOpen(false)}><FontAwesomeIcon icon={link.icon} aria-hidden="true"/>{t(link.label)}</NavLink>)}
          {session && <NavLink to="/dashboard" onClick={() => setOpen(false)}><FontAwesomeIcon icon={chartLineIcon} aria-hidden="true"/>{t("ダッシュボード")}</NavLink>}
          <Link to="/#features" onClick={() => setOpen(false)}><FontAwesomeIcon icon={circleInfoIcon} aria-hidden="true"/>{t("このアプリについて")}</Link>
          <Link to="/#how-to" onClick={() => setOpen(false)}><FontAwesomeIcon icon={bookOpenIcon} aria-hidden="true"/>{t("使い方")}</Link>
          <NavLink className="site-account" to={session ? '/profile' : '/login'} onClick={() => setOpen(false)} title={displayName || undefined}>{!ready ? t("確認中…") : session ? displayName || t("名前を設定") : t("ログイン")}</NavLink>
          <ThemeSwitcher /><LocaleSwitcher />
        </nav>
        <Link className="site-start" to="/practice" onClick={() => setOpen(false)}>{t("練習をはじめる")}<FontAwesomeIcon icon={arrowRightIcon} aria-hidden="true"/></Link>
      </div>
    </header>);
}
