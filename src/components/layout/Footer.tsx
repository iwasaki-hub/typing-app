import { useLocale } from '../../features/locale/useLocale'
import { arrowUpIcon, blueskyIcon, discordIcon, instagramIcon, youtubeIcon } from '../../lib/icons';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Footer.css';
const socialLinks = [
    { name: 'Bluesky', href: 'https://bsky.app/', icon: blueskyIcon, className: 'footer-bluesky' },
    { name: 'Instagram', href: 'https://www.instagram.com/', icon: instagramIcon, className: 'footer-instagram' },
    { name: 'YouTube', href: 'https://www.youtube.com/', icon: youtubeIcon, className: 'footer-youtube' },
    { name: 'Discord', href: 'https://discord.com/', icon: discordIcon, className: 'footer-discord' },
];
export default function Footer() {
    const { t } = useLocale();
    return <footer className="site-footer">
    <div className="site-footer-inner">
      <div><Link className="footer-brand" to="/" aria-label={t("Typing ホーム")}><span className="footer-mark">t.</span>Typing</Link><p>{t("ひとつずつ、自分のペースで。")}</p></div>
      <div className="footer-social"><span>{t("SNS（デモ）")}</span><nav aria-label={t("SNS リンク")}>{socialLinks.map((social) => <a key={social.name} className={social.className} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={t("{0}（デモ・新しいタブで開く）", [social.name])} title={t("{0}（デモ）", [social.name])}><FontAwesomeIcon icon={social.icon} aria-hidden="true"/></a>)}</nav></div>
      <small>© {new Date().getFullYear()} Typing. All rights reserved.</small>
      <a className="footer-top" href="#top">{t("ページの先頭へ")}<FontAwesomeIcon icon={arrowUpIcon} aria-hidden="true"/></a>
    </div>
  </footer>;
}
