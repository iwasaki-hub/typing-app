import { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark, faHouse, faKeyboard, faCircleInfo, faBookOpen, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import './Navigation.css'

const links = [
  { href: '#top', label: 'ホーム', icon: faHouse },
  { href: '#practice', label: 'タイピング', icon: faKeyboard },
  { href: '#features', label: 'このアプリについて', icon: faCircleInfo },
  { href: '#how-to', label: '使い方', icon: faBookOpen },
]

export default function Navigation({ onStart }: { onStart: () => void }) {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === 'Escape' && open) {
        setOpen(false)
        toggle.current?.focus()
      }
    }}>
      <div className="site-header-inner">
        <a className="site-brand" href="#top" onClick={() => setOpen(false)} aria-label="Typing ホーム"><span className="site-mark">t.</span>Typing</a>
        <button ref={toggle} className="site-menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? 'メニューを閉じる' : 'メニューを開く'} onClick={() => setOpen(!open)}><FontAwesomeIcon icon={open ? faXmark : faBars} aria-hidden="true" /></button>
        <nav id="site-navigation" className={`site-navigation${open ? ' is-open' : ''}`} aria-label="メインナビゲーション">
          {links.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}><FontAwesomeIcon icon={link.icon} aria-hidden="true" />{link.label}</a>)}
        </nav>
        <button className="site-start" type="button" onClick={() => { setOpen(false); onStart() }}>練習をはじめる <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></button>
      </div>
    </header>
  )
}
