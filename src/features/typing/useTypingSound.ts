import { useEffect, useRef, useState } from 'react'

export function useTypingSound() {
  const context = useRef<AudioContext | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [volume, setVolume] = useState(0.25)
  const [notice, setNotice] = useState('')
  useEffect(() => () => { void context.current?.close().catch(() => {}) }, [])

  async function play(kind: 'key' | 'error' | 'complete', force = false) {
    if ((!enabled && !force) || volume === 0) return
    try {
      const audio = context.current ?? (context.current = new AudioContext())
      if (audio.state === 'suspended') await audio.resume()
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      const start = audio.currentTime
      oscillator.type = kind === 'error' ? 'triangle' : 'sine'
      oscillator.frequency.setValueAtTime(kind === 'error' ? 150 : kind === 'complete' ? 880 : 700, start)
      oscillator.frequency.exponentialRampToValueAtTime(kind === 'complete' ? 1320 : 110, start + 0.045)
      gain.gain.setValueAtTime(volume * 0.22, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + (kind === 'complete' ? 0.2 : 0.055))
      oscillator.connect(gain)
      gain.connect(audio.destination)
      oscillator.start(start)
      oscillator.stop(start + 0.22)
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
    } catch {
      setEnabled(false)
      setNotice('このブラウザでは音声を再生できません。練習はそのまま続けられます。')
    }
  }

  function toggle() {
    setNotice('')
    setEnabled(!enabled)
    if (!enabled) void play('key', true)
  }
  return { enabled, volume, setVolume, notice, toggle, play }
}
