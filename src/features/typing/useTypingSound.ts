import { useEffect, useRef, useState } from 'react'
import { isSoundPreset, playTypingSound, SOUND_PRESET_KEY, soundPresets, type SoundPreset, type TypingSoundKind } from './sounds'

export function useTypingSound() {
  const context = useRef<AudioContext | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [volume, setVolume] = useState(0.25)
  const [notice, setNotice] = useState('')
  const [preset, setPreset] = useState<SoundPreset>(() => {
    try { const saved = window.localStorage.getItem(SOUND_PRESET_KEY); return isSoundPreset(saved) ? saved : 'classic' }
    catch { return 'classic' }
  })
  useEffect(() => () => { void context.current?.close().catch(() => {}) }, [])

  async function play(kind: TypingSoundKind, force = false, selected = preset) {
    if ((!enabled && !force) || volume === 0) return
    try {
      const audio = context.current ?? (context.current = new AudioContext())
      if (audio.state === 'suspended') await audio.resume()
      if (audio.state === 'closed') return
      playTypingSound(audio, selected, kind, volume)
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
  function selectPreset(value: string) {
    if (!isSoundPreset(value)) return
    setPreset(value)
    setNotice('')
    try { window.localStorage.setItem(SOUND_PRESET_KEY, value) } catch { /* Selection still works without storage. */ }
    if (enabled) void play('key', false, value)
  }
  function preview() { setNotice(''); void play('key', true) }
  return { enabled, volume, setVolume, notice, toggle, play, preset, selectPreset, presets: soundPresets, preview }
}
