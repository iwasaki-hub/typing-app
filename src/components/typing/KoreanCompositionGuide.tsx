import { useLocale } from '../../features/locale/useLocale'
import { koreanDraftFeedback } from '../../features/typing/koreanParts'
import './KoreanCompositionGuide.css'

export default function KoreanCompositionGuide({ text, committed, draft }: { text: string; committed: string; draft: string | null }) {
  const { t } = useLocale()
  const feedback = koreanDraftFeedback(text, draft ?? committed)
  const current = feedback.characters[draft === null ? Math.min(committed.length, text.length - 1) : feedback.activeIndex]
  if (!current) return null
  return <div className="korean-composition-guide">
    <div className="korean-composition-heading"><span>{t('ハングルのパーツを確認')}</span><small>{draft === null ? t('次に入力する文字') : t('組み立て中')}</small></div>
    <div className="korean-composition-parts" lang="ko" aria-label={t('お手本の文字と構成パーツ')}>
      <strong>{current.letter === ' ' ? '␣' : current.letter}</strong><span aria-hidden="true">→</span>
      {current.parts.map(({ part, actual, state }, index) => <span className={`korean-part part-${draft === null ? 'pending' : state}`} key={index}>
        <b>{part === ' ' ? '␣' : part}</b>
        <small>{draft === null || state === 'pending' ? t('未入力') : state === 'correct' ? '✓' : t('入力：{0}', [actual === ' ' ? '␣' : actual])}</small>
      </span>)}
      {feedback.extra.length > 0 && <span className="korean-part part-incorrect"><b>{feedback.extra.join('')}</b><small>{t('余分な入力')}</small></span>}
    </div>
    <p>{t('緑は一致、赤は不一致です。組み立て中はミスに数えず、文字の確定後に記録します。')}</p>
  </div>
}
