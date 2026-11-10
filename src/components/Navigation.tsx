import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark, faHouse, faKeyboard, faCircleInfo, faBookOpen, faArrowRight, faTrophy } from '@fortawesome/free-solid-svg-icons'
import './Navigation.css'
import { useAuth } from '../features/auth/context'

const links = [
  { href: '/', label: 'ホーム', icon: faHouse },
  { href: '/practice', label: 'タイピング', icon: faKeyboard },
  { href: '/ranking', label: 'ランキング', icon: faTrophy },
]

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const { session, ready, displayName } = useAuth()
  useEffect(() => {
    if (!open) return
    const closeOnScroll = () => setOpen(false)
    window.addEventListener('scroll', closeOnScroll, { passive: true, once: true })
    return () => window.removeEventListener('scroll', closeOnScroll)
  }, [open])
  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
        toggle.current?.focus()
      }
    }}>
      <div className="site-header-inner">
        <Link className="site-brand" to="/" onClick={() => setOpen(false)} aria-label="Typing ホーム"><span className="site-mark">t.</span>Typing</Link>
        <button ref={toggle} className="site-menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? 'メニューを閉じる' : 'メニューを開く'} onClick={() => setOpen(!open)}><FontAwesomeIcon icon={open ? faXmark : faBars} aria-hidden="true" /></button>
        <nav id="site-navigation" className={`site-navigation${open ? ' is-open' : ''}`} aria-label="メインナビゲーション">
          {links.map((link) => <NavLink end key={link.href} to={link.href} onClick={() => setOpen(false)}><FontAwesomeIcon icon={link.icon} aria-hidden="true" />{link.label}</NavLink>)}
          {session && <NavLink to="/dashboard" onClick={() => setOpen(false)}>ダッシュボード</NavLink>}
          <Link to="/#features" onClick={() => setOpen(false)}><FontAwesomeIcon icon={faCircleInfo} aria-hidden="true" />このアプリについて</Link>
          <Link to="/#how-to" onClick={() => setOpen(false)}><FontAwesomeIcon icon={faBookOpen} aria-hidden="true" />使い方</Link>
          <NavLink className="site-account" to={session ? '/profile' : '/login'} onClick={() => setOpen(false)} title={displayName || undefined}>{!ready ? '確認中…' : session ? displayName || '名前を設定' : 'ログイン'}</NavLink>
        </nav>
        <Link className="site-start" to="/practice" onClick={() => setOpen(false)}>練習をはじめる <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></Link>
      </div>
    </header>
  )
}
