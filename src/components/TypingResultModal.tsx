import { arrowRightIcon, flagCheckeredIcon, rotateLeftIcon, xmarkIcon, speedIcon, accuracyIcon, circleExclamationIcon } from '../lib/icons'
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { m } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { TypingSession } from '../features/typing/session'
import type { PracticeLanguage } from '../features/typing/samples'
import LanguageBadge from './LanguageBadge'
import './TypingResultModal.css'

export default function TypingResultModal({ session, language = 'en', wpm, speedUnit = 'WPM', accuracy, correct, total, loading, onNext, onRetry, onDismiss }: {
  session: TypingSession; wpm: number; accuracy: number; correct: number; total: number; loading: boolean
  speedUnit?: 'WPM' | 'CPM'
  language?: PracticeLanguage
  onNext: () => void; onRetry: () => void; onDismiss: () => void
}) {
  return <Dialog open onClose={onDismiss} className="typing-result-modal">
    <DialogBackdrop className="result-modal-backdrop" />
    <div className="result-modal-viewport"><div className="result-modal-center">
    <DialogPanel as={m.div} className="result-modal-panel" initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
      <button type="button" className="result-modal-close" aria-label="結果を閉じる" onClick={onDismiss}><FontAwesomeIcon icon={xmarkIcon} aria-hidden="true" /></button>
      <span className="result-modal-icon"><FontAwesomeIcon icon={flagCheckeredIcon} aria-hidden="true" /></span>
      <DialogTitle>{session.reason === 'completed' ? 'クリア！ おつかれさまでした。' : session.reason === 'timeout' ? '時間になりました。' : '練習を終了しました。'}</DialogTitle>
      <Description>{session.elapsed.toFixed(1)}秒で、{correct} / {total}文字を正しく入力しました。</Description>
      <LanguageBadge language={language} />
      <dl className="result-modal-stats"><div><dt><FontAwesomeIcon icon={speedIcon} className="result-speed-icon" aria-hidden="true" /> 入力速度</dt><dd>{wpm}<small> {speedUnit}</small></dd></div><div><dt><FontAwesomeIcon icon={accuracyIcon} className="result-accuracy-icon" aria-hidden="true" /> 正確率</dt><dd>{accuracy}<small> %</small></dd></div><div><dt><FontAwesomeIcon icon={circleExclamationIcon} className="result-mistakes-icon" aria-hidden="true" /> ミス</dt><dd>{session.mistakes}<small> 回</small></dd></div></dl>
      <div className="result-modal-actions"><button type="button" className="result-modal-next" disabled={loading} onClick={onNext} data-autofocus>次の問題 <FontAwesomeIcon icon={arrowRightIcon} aria-hidden="true" /></button><button type="button" disabled={loading} onClick={onRetry}><FontAwesomeIcon icon={rotateLeftIcon} aria-hidden="true" /> 同じ文でやり直す</button></div>
      <p className="result-modal-hint">Esc キーでも閉じられます。</p>
    </DialogPanel>
    </div></div>
  </Dialog>
}
