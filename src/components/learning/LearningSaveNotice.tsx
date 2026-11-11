import { Link } from 'react-router-dom'
import { useHistory } from '../../features/typing/historyContext'
import { useLocale } from '../../features/locale/useLocale'

export default function LearningSaveNotice() {
  const { t } = useLocale()
  const { signedIn, status, error } = useHistory()
  return <div className="learning-save-notice">
    {error ? <p role="alert">{t(error)}</p> : <p>{t('学習結果を端末に保存しました。')}</p>}
    {signedIn ? <><p role="status">{t(status)}</p><Link to="/dashboard">{t('ダッシュボードで学習記録を見る →')}</Link></> : <p>{t('ログイン後、ダッシュボードで「ログイン前の記録を取り込む」を選ぶと、この記録も確認・同期できます。')} <Link to="/login">{t('ログイン')}</Link></p>}
  </div>
}
