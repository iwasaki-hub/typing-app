import { useEffect, useReducer, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faRotateLeft, faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons'
import type { PracticeQuote } from '../api/quotes'
import TypingResultModal from './TypingResultModal'
import { newSession, sessionMetrics, sessionReducer } from '../features/typing/session'
import { useTypingSound } from '../features/typing/useTypingSound'
import { typingHistory } from '../features/typing/history'
import './TypingPractice.css'

export default function TypingPractice({ quote, loading, notice, onNext }: {
  quote: PracticeQuote; loading: boolean; notice: string; onNext: () => void
}) {
  const [session, dispatch] = useReducer(sessionReducer, undefined, newSession)
  const [duration, setDuration] = useState(60)
  const [inputNotice, setInputNotice] = useState('')
  const field = useRef<HTMLInputElement>(null)
  const resultButton = useRef<HTMLButtonElement>(null)
  const focusAfterLoad = useRef(false)
  const [dismissedResult, setDismissedResult] = useState<typeof session | null>(null)
  const sound = useTypingSound()
  const text = quote.text
  const running = session.status === 'running'
  const finished = session.status === 'finished'
  const metrics = sessionMetrics(session, text)
  const savedSession = useRef<typeof session | null>(null)

  useEffect(() => {
    if (session.status !== 'finished' || !session.reason || savedSession.current === session) return
    savedSession.current = session
    const result = sessionMetrics(session, text)
    typingHistory.save({
      id: crypto.randomUUID(), savedAt: new Date().toISOString(), text, duration,
      elapsed: session.elapsed, wpm: result.wpm, accuracy: result.accuracy,
      mistakes: session.mistakes, attempts: session.attempts, correct: result.correct, reason: session.reason,
    })
  }, [session, text, duration])

  useEffect(() => {
    if (!running) return
    const tick = () => dispatch({ type: 'tick', now: performance.now(), duration })
    const timer = window.setInterval(tick, 100)
    document.addEventListener('visibilitychange', tick)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', tick) }
  }, [running, duration])

  function reset() {
    focusAfterLoad.current = true
    field.current?.focus()
    dispatch({ type: 'reset' })
    setInputNotice('')
  }

  function nextQuestion() {
    if (loading || running) return
    focusAfterLoad.current = true
    dispatch({ type: 'reset' })
    setInputNotice('')
    onNext()
  }

  function dismissResult() {
    setDismissedResult(session)
    // The completed input is disabled; restore focus to the result trigger instead.
    requestAnimationFrame(() => resultButton.current?.focus({ preventScroll: true }))
  }

  useEffect(() => {
    if (!loading && session.status === 'ready' && focusAfterLoad.current) {
      focusAfterLoad.current = false
      field.current?.focus()
    }
  }, [loading, session.status, text])

  function handleInput(value: string, composing: boolean) {
    if (composing) { setInputNotice('英字入力に切り替えてください。'); return }
    const now = performance.now()
    const action = { type: 'input' as const, value, text, now, duration }
    const next = sessionReducer(session, action)
    if (next === session) return
    dispatch(action)
    setInputNotice('')
    if (next.reason === 'completed') void sound.play('complete')
    else if (next.attempts > session.attempts) void sound.play(next.mistakes > session.mistakes ? 'error' : 'key')
  }

  return (
    <section className="typing-practice" id="practice" aria-labelledby="practice-title">
      <div className="typing-heading"><h2 id="practice-title">タイピング練習</h2><span>{text.length} 文字 · 英文</span></div>
      <div className="typing-settings">
        <label>制限時間 <select value={duration} disabled={running || loading} onChange={(event) => { setDuration(Number(event.target.value)); dispatch({ type: 'reset' }) }}><option value={30}>30秒</option><option value={60}>60秒</option><option value={120}>120秒</option></select></label>
        <button type="button" className="typing-sound" aria-pressed={sound.enabled} onClick={sound.toggle}><FontAwesomeIcon icon={sound.enabled ? faVolumeHigh : faVolumeXmark} aria-hidden="true" /> 打鍵音 {sound.enabled ? 'オン' : 'オフ'}</button>
        <label>音の種類 <select value={sound.preset} onChange={(event) => sound.selectPreset(event.target.value)}>{Object.entries(sound.presets).map(([value, preset]) => <option key={value} value={value}>{preset.label}</option>)}</select></label>
        <button type="button" onClick={sound.preview} disabled={sound.volume === 0} aria-label="選択中のタイピング音を試聴する"><FontAwesomeIcon icon={faVolumeHigh} aria-hidden="true" /> 試聴</button>
        <label className="typing-volume">音量 <input type="range" min="0" max="100" value={Math.round(sound.volume * 100)} onChange={(event) => sound.setVolume(Number(event.target.value) / 100)} aria-label="タイピング音の音量" /><span>{Math.round(sound.volume * 100)}%</span></label>
      </div>
      {sound.notice && <p className="typing-notice" role="status">{sound.notice}</p>}
      <dl className="typing-stats" aria-label="練習状況">
        <div><dt>残り時間</dt><dd className={duration - session.elapsed < 10 ? 'typing-urgent' : ''}>{Math.ceil(duration - session.elapsed)}<small> 秒</small></dd></div>
        <div><dt>入力速度</dt><dd>{metrics.wpm}<small> WPM</small></dd></div>
        <div><dt>正確率</dt><dd>{metrics.accuracy}<small> %</small></dd></div>
        <div><dt>ミス</dt><dd>{session.mistakes}<small> 回</small></dd></div>
      </dl>
      <div className="typing-body">
        <p className="typing-notice" role="status">{notice}</p>
        <p className="typing-text" aria-label={text}>{[...text].map((letter, index) => <span key={index} aria-hidden="true" className={`${index < session.input.length ? session.input[index] === letter ? 'typing-correct' : 'typing-incorrect' : ''} ${index === session.input.length && !finished ? 'typing-cursor' : ''}`}>{letter}</span>)}</p>
        <p className="typing-credit">{quote.source === 'dummyjson' ? <>出典: <a href="https://dummyjson.com/docs/quotes" target="_blank" rel="noopener noreferrer">DummyJSON</a>{quote.author && ` / ${quote.author}`}</> : 'オリジナル練習文'}</p>
        <label htmlFor="typing-input" className="typing-input-label">{finished ? '練習が終了しました' : '英文を入力（最初の一文字で計測開始）'}</label>
        <input ref={field} id="typing-input" className="typing-input" value={session.input} disabled={loading || finished} onChange={(event) => handleInput(event.target.value, (event.nativeEvent as InputEvent).isComposing)} onSelect={(event) => { const target = event.currentTarget; target.setSelectionRange(target.value.length, target.value.length) }} onPaste={(event) => { event.preventDefault(); setInputNotice('練習中は貼り付けできません。一文字ずつ入力してください。') }} onDrop={(event) => event.preventDefault()} onCompositionEnd={() => setInputNotice('英字入力に切り替え、一文字ずつ入力してください。')} autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={text.length} aria-describedby="typing-help" placeholder={loading ? '英文を読み込んでいます…' : 'ここに英文を入力してください'} />
        <p className="typing-notice" id="typing-help" role="status">{inputNotice || (running ? 'Backspace で修正できます。修正前のミスも正確率に含まれます。' : '英字入力で練習してください。貼り付けは無効です。')}</p>
        <label className="typing-progress-label">進み具合 {metrics.progress}%<progress max="100" value={metrics.progress} /></label>
        {finished && <button ref={resultButton} type="button" className="typing-result-open" onClick={() => setDismissedResult(null)}>結果を表示する</button>}
        {finished && dismissedResult !== session && <TypingResultModal session={session} wpm={metrics.wpm} accuracy={metrics.accuracy} correct={metrics.correct} total={text.length} loading={loading} onNext={nextQuestion} onRetry={reset} onDismiss={dismissResult} />}
        <div className="typing-actions">
          <button type="button" disabled={loading} onClick={reset}><FontAwesomeIcon icon={faRotateLeft} aria-hidden="true" /> 同じ文でやり直す</button>
          {running && <button type="button" onClick={() => dispatch({ type: 'stop', now: performance.now(), duration })}>ここで終了</button>}
          <button type="button" className="typing-next" onClick={nextQuestion} disabled={loading || running}>{loading ? '読み込み中…' : '次の問題'} <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" /></button>
        </div>
        <p className="typing-footnote">WPM は正しく入力した5文字を1語として換算。1文の入力完了、または制限時間で終了します。</p>
      </div>
    </section>
  )
}
