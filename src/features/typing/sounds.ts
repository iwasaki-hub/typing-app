export const soundPresets = {
  classic: { label: 'クラシック', wave: 'sine', frequency: 700, end: 110, duration: 0.055, gain: 0.22, complete: 880 },
  soft: { label: 'ソフト', wave: 'sine', frequency: 440, end: 240, duration: 0.07, gain: 0.16, complete: 523.25 },
  mechanical: { label: 'メカニカル風', wave: 'triangle', frequency: 2400, end: 160, duration: 0.035, gain: 0.2, complete: 659.25 },
  retro: { label: 'レトロ', wave: 'square', frequency: 660, end: 330, duration: 0.045, gain: 0.07, complete: 783.99 },
} as const

export type SoundPreset = keyof typeof soundPresets
export type TypingSoundKind = 'key' | 'error' | 'complete'
export const SOUND_PRESET_KEY = 'typing-app:sound-preset:v1'

export function isSoundPreset(value: unknown): value is SoundPreset {
  return typeof value === 'string' && Object.hasOwn(soundPresets, value)
}

export function playTypingSound(audio: AudioContext, preset: SoundPreset, kind: TypingSoundKind, volume: number) {
  if (!Number.isFinite(volume) || volume <= 0) return
  const config = soundPresets[preset]
  const notes = kind === 'complete' ? [1, 1.25, 1.5] : [1]
  for (const [index, pitch] of notes.entries()) {
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    const start = audio.currentTime + index * 0.07
    const duration = kind === 'complete' ? 0.16 : kind === 'error' ? 0.09 : config.duration
    const frequency = kind === 'complete' ? config.complete * pitch : kind === 'error' ? 150 : config.frequency
    oscillator.type = config.wave
    oscillator.frequency.setValueAtTime(frequency, start)
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'complete' ? frequency : kind === 'error' ? 85 : config.end, start + duration)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(Math.min(1, volume) * config.gain, start + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain)
    gain.connect(audio.destination)
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
    oscillator.start(start)
    oscillator.stop(start + duration + 0.01)
  }
}
