import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLocale } from '../../features/locale/useLocale'
import { practiceActivities } from '../../features/practice/activities'
import { arrowRightIcon } from '../../lib/icons'
import './PracticeMenuPage.css'

export default function PracticeMenuPage() {
  const { t } = useLocale()
  return <main id="main" tabIndex={-1} className="practice-menu-page">
    <header className="practice-menu-intro">
      <Link to="/">{t('← ホームに戻る')}</Link>
      <p className="practice-menu-eyebrow">TYPE & LEARN</p>
      <h1>{t('今日は、何を練習しますか？')}</h1>
      <p>{t('文章でタイピングを磨く。国名を入力して、世界を知る。目的に合わせて練習を選んでみましょう。')}</p>
    </header>
    <section className="practice-menu-grid" aria-label={t('練習メニュー')}>
      {practiceActivities.map(activity => <Link key={activity.id} to={activity.path} className="practice-menu-card" data-activity={activity.id}>
        <span className="practice-menu-icon"><FontAwesomeIcon icon={activity.icon} aria-hidden="true" /></span>
        <span className="practice-menu-category">{t(activity.category)}</span>
        <h2>{t(activity.title)}</h2>
        <p>{t(activity.description)}</p>
        <span className="practice-menu-start">{t('この練習をはじめる')} <FontAwesomeIcon icon={arrowRightIcon} aria-hidden="true" /></span>
      </Link>)}
    </section>
    <p className="practice-menu-note">{t('どの練習もログインなしで始められます。画面の表示言語はナビゲーションから変更できます。')}</p>
  </main>
}
