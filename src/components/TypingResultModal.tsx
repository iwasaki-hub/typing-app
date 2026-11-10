import { useEffect, useId, useRef, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { m } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faFlagCheckered, faRotateLeft, faXmark } from '@fortawesome/free-solid-svg-icons'
import type { TypingSession } from '../features/typing/session'
import './TypingResultModal.css'

export default function TypingResultModal({ session, wpm, accuracy, correct, total, loading, onNext, onRetry, onDismiss, returnFocus }: {
  session: TypingSession; wpm: number; accuracy: number; correct: number; total: number; loading: boolean
  onNext: () => void; onRetry: () => void; onDismiss: () => void
  returnFocus: RefObject<HTMLButtonElement | null>
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    const element = dialog.current
    const previous = document.activeElement
    const opener = returnFocus.current
    const overflow = document.body.style.overflow
    element?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = overflow
      const target = opener?.isConnected ? opener : previous instanceof HTMLElement && previous.isConnected ? previous : null
      target?.focus({ preventScroll: true })
    }
  }, [returnFocus])
  return createPortal(<dialog ref={dialog} className="typing-result-modal" aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); onDismiss() }} onClick={(event) => { if (event.target === event.currentTarget) onDismiss() }}>
    <m.div className="result-modal-panel" initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
      <button type="button" className="result-modal-close" aria-label="結果を閉じる" onClick={onDismiss}><FontAwesomeIcon icon={faXmark} aria-hidden="true" /></button>
      <span className="result-modal-icon"><FontAwesomeIcon icon={faFlagCheckered} aria-hidden="true" /></span>
      <h2 id={titleId}>{session.reason === 'completed' ? 'クリア！ おつかれさまでした。' : session.reason === 'timeout' ? '時間になりました。' : '練習を終了しました。'}</h2>
      <p id={descriptionId}>{session.elapsed.toFixed(1)}秒で、{correct} / {total}文字を正しく入力しました。</p>
      <dl className="result-modal-stats"><div><dt>入力速度</dt><dd>{wpm}<small> WPM</small></dd></div><div><dt>正確率</dt><dd>{accuracy}<small> %</small></dd></div><div><dt>ミス</dt><dd>{session.mistakes}<small> 回</small></dd></div></dl>
      <div className="result-modal-actions"><button type="button" className="result-modal-next" disabled={loading} onClick={onNext} autoFocus>次の問題 <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></button><button type="button" disabled={loading} onClick={onRetry}><FontAwesomeIcon icon={faRotateLeft} aria-hidden="true" /> 同じ文でやり直す</button></div>
      <p className="result-modal-hint">Esc キーでも閉じられます。</p>
    </m.div>
  </dialog>, document.body)
}
