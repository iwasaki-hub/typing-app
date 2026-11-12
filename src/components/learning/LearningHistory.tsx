import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { globeIcon, householdIcon, storeIcon, planeIcon } from '../../lib/icons'
import { learningLabels, learningStats, type LearningActivity } from '../../features/learning/history'
import { useHistory } from '../../features/typing/historyContext'
import { useLocale } from '../../features/locale/useLocale'
import { getFormattingLocale } from '../../features/locale/store'
import './LearningHistory.css'

const icons = { countries: globeIcon, household: householdIcon, shops: storeIcon, travel: planeIcon }

export default function LearningHistory() {
  const { t, locale } = useLocale()
  const { learningResults, status, error } = useHistory()
  const [activity, setActivity] = useState<LearningActivity | 'all'>('all')
  const entries = learningResults.filter(result => activity === 'all' || result.learning.activity === activity)
  const learned = entries.reduce((sum, result) => sum + result.learning.items.length, 0)
  const independent = entries.reduce((sum, result) => sum + learningStats(result.learning).independent, 0)
  return <section className="learning-history" aria-labelledby="learning-history-title">
    <header><div><span>YOUR LEARNING</span><h2 id="learning-history-title">{t('学習記録')}</h2></div><Link to="/practice">{t('学習をはじめる →')}</Link></header>
    <p className="learning-history-note">{t('国名・日用品・お店・旅行英会話の学習結果です。文章タイピングと合わせて最新100件を保存します。全履歴の削除は下のボタンから行えます。')}</p>
    <div className="learning-history-filters" role="group" aria-label={t('学習記録の種類')}>
      <button type="button" aria-pressed={activity === 'all'} onClick={() => setActivity('all')}>{t('すべての学習')}</button>
      {(Object.keys(learningLabels) as LearningActivity[]).map(key => <button key={key} type="button" aria-pressed={activity === key} onClick={() => setActivity(key)}><FontAwesomeIcon icon={icons[key]} aria-hidden="true" /> {t(learningLabels[key])}</button>)}
    </div>
    <dl className="learning-history-stats"><div><dt>{t('学習回数')}</dt><dd>{entries.length}</dd></div><div><dt>{t('取り組んだ問題数')}</dt><dd>{learned}</dd></div><div><dt>{t('ヒント・ミスなしの正解数')}</dt><dd>{independent}</dd></div></dl>
    {error && <p role="alert">{t(error)}</p>}
    <p className="learning-history-note" role="status">{t(status)}</p>
    {entries.length === 0 ? <p className="learning-history-empty">{t('まだ学習記録がありません。学習を最後まで終えると保存されます。')}</p> : <ol className="learning-history-list">{entries.map(result => {
      const record = result.learning
      const stats = learningStats(record)
      return <li key={result.id}>
        <div className={`learning-history-kind kind-${record.activity}`}><FontAwesomeIcon icon={icons[record.activity]} aria-hidden="true" /></div>
        <div className="learning-history-entry">
          <div className="learning-history-heading"><h3>{t(learningLabels[record.activity])} <small>{t(record.category)}</small></h3><time dateTime={result.savedAt}>{new Date(result.savedAt).toLocaleString(getFormattingLocale())}</time></div>
          <p className="learning-history-mode">{record.mode === 'guide' ? t('お手本を見て練習') : t('思い出して入力')}</p>
          <div className="learning-history-numbers"><strong>{t('正解 {0} / {1}問', [stats.correct, stats.total])}</strong><span>{t('ヒントなし・ミスなし {0}問', [stats.independent])}</span><span>{t('ヒント {0}問・答え確認 {1}問・ミス {2}回', [stats.hints, stats.skipped, stats.mistakes])}</span></div>
          <details><summary>{t('学習した問題を見る')}</summary><ul>{record.items.map((item, index) => <li key={index}><div><strong>{item[locale]}</strong><span lang="en">{item.english}</span></div><small>{item.skipped ? t('答えを確認') : item.hinted || item.mistakes ? t('復習してみよう') : t('正解')}</small></li>)}</ul></details>
        </div>
      </li>
    })}</ol>}
  </section>
}
