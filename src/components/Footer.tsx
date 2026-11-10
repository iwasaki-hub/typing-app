import { arrowUpIcon, blueskyIcon, discordIcon, instagramIcon, youtubeIcon } from '../lib/icons'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Footer.css'

const socialLinks = [
  { name: 'Bluesky', href: 'https://bsky.app/', icon: blueskyIcon, className: 'footer-bluesky' },
  { name: 'Instagram', href: 'https://www.instagram.com/', icon: instagramIcon, className: 'footer-instagram' },
  { name: 'YouTube', href: 'https://www.youtube.com/', icon: youtubeIcon, className: 'footer-youtube' },
  { name: 'Discord', href: 'https://discord.com/', icon: discordIcon, className: 'footer-discord' },
]

export default function Footer() {
  return <footer className="site-footer">
    <div className="site-footer-inner">
      <div><Link className="footer-brand" to="/" aria-label="Typing ホーム"><span className="footer-mark">t.</span>Typing</Link><p>ひとつずつ、自分のペースで。</p></div>
      <div className="footer-social"><span>SNS（デモ）</span><nav aria-label="SNS リンク">{socialLinks.map((social) => <a key={social.name} className={social.className} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`${social.name}（デモ・新しいタブで開く）`} title={`${social.name}（デモ）`}><FontAwesomeIcon icon={social.icon} aria-hidden="true" /></a>)}</nav></div>
      <small>© {new Date().getFullYear()} Typing. All rights reserved.</small>
      <a className="footer-top" href="#top">ページの先頭へ <FontAwesomeIcon icon={arrowUpIcon} aria-hidden="true" /></a>
    </div>
  </footer>
}
