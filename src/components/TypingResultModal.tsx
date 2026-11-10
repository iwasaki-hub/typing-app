import { arrowRightIcon, flagCheckeredIcon, rotateLeftIcon, xmarkIcon } from '../lib/icons'
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { m } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { TypingSession } from '../features/typing/session'
import './TypingResultModal.css'

export default function TypingResultModal({ session, wpm, accuracy, correct, total, loading, onNext, onRetry, onDismiss }: {
  session: TypingSession; wpm: number; accuracy: number; correct: number; total: number; loading: boolean
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
      <dl className="result-modal-stats"><div><dt>入力速度</dt><dd>{wpm}<small> WPM</small></dd></div><div><dt>正確率</dt><dd>{accuracy}<small> %</small></dd></div><div><dt>ミス</dt><dd>{session.mistakes}<small> 回</small></dd></div></dl>
      <div className="result-modal-actions"><button type="button" className="result-modal-next" disabled={loading} onClick={onNext} data-autofocus>次の問題 <FontAwesomeIcon icon={arrowRightIcon} aria-hidden="true" /></button><button type="button" disabled={loading} onClick={onRetry}><FontAwesomeIcon icon={rotateLeftIcon} aria-hidden="true" /> 同じ文でやり直す</button></div>
      <p className="result-modal-hint">Esc キーでも閉じられます。</p>
    </DialogPanel>
    </div></div>
  </Dialog>
}
