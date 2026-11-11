import { useLocale } from '../features/locale/useLocale'
import './LocaleSwitcher.css'
export default function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale()
  return <label className="locale-switcher"><span>{t('表示言語')}</span><select value={locale} onChange={event => setLocale(event.target.value === 'ko' ? 'ko' : 'ja')}><option value="ja" lang="ja">日本語</option><option value="ko" lang="ko">한국어</option></select></label>
}
