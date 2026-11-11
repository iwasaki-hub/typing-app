import { useCallback, useEffect, useRef, useState } from 'react'
import { isEnabled, readSetting, writeSetting } from '../typing/settings'
import { createPronunciation, type PronunciationStatus } from './pronunciation'

const settingKey = 'typing-app:word-pronunciation:v1'

export function usePronunciation(text: string, round: object, finished: boolean) {
  const [enabled, setEnabled] = useState(() => readSetting(settingKey, true, isEnabled))
  const [status, setStatus] = useState<PronunciationStatus>('')
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const controls = useRef<{ replay: () => void; stop: () => void } | null>(null)
  useEffect(() => {
    if (!supported || !enabled || finished) return
    const speech = createPronunciation(window.speechSynthesis, window.SpeechSynthesisUtterance, setStatus)
    const timer = window.setTimeout(() => { if (!document.hidden) speech.speak(text) }, 120)
    controls.current = { replay: () => { window.clearTimeout(timer); speech.speak(text) }, stop: speech.stop }
    function gesture() {
      if (speech.needsGesture()) speech.speak(text)
    }
    function visibility() { if (document.hidden) { window.clearTimeout(timer); speech.stop() } }
    document.addEventListener('pointerdown', gesture)
    document.addEventListener('keydown', gesture)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.clearTimeout(timer); speech.stop(); controls.current = null
      document.removeEventListener('pointerdown', gesture)
      document.removeEventListener('keydown', gesture)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [supported, enabled, text, round, finished])
  const toggle = useCallback(() => {
    controls.current?.stop()
    setStatus('')
    const next = !enabled
    writeSetting(settingKey, next); setEnabled(next)
  }, [enabled])
  const replay = useCallback(() => { setStatus(''); controls.current?.replay() }, [])
  return { enabled, supported, status, toggle, replay }
}
