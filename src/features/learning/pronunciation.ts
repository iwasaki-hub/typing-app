export type PronunciationStatus = '' | 'blocked' | 'error'

// Keep speech ownership in one lesson so old questions cannot speak over new ones.
export function createPronunciation(
  synthesis: SpeechSynthesis,
  Utterance: typeof SpeechSynthesisUtterance,
  onStatus: (status: PronunciationStatus) => void,
) {
  let current: SpeechSynthesisUtterance | undefined
  let retry = false
  function stop() {
    const owned = current
    current = undefined; retry = false
    if (owned) { owned.onstart = null; owned.onerror = null; owned.onend = null; synthesis.cancel() }
  }
  function speak(text: string) {
    stop()
    const utterance = new Utterance(text)
    utterance.lang = 'en-US'
    utterance.rate = .85
    const voices = synthesis.getVoices()
    const voice = voices.find(voice => voice.lang.toLowerCase() === 'en-us') ?? voices.find(voice => /^en\b/i.test(voice.lang))
    if (voice) utterance.voice = voice
    current = utterance
    utterance.onstart = () => { if (current === utterance) { retry = false; onStatus('') } }
    utterance.onend = () => { if (current === utterance) current = undefined }
    utterance.onerror = event => {
      if (current !== utterance || event.error === 'canceled' || event.error === 'interrupted') return
      retry = event.error === 'not-allowed'
      onStatus(retry ? 'blocked' : 'error')
    }
    try { synthesis.speak(utterance) }
    catch { if (current === utterance) onStatus('error') }
  }
  return { speak, stop, needsGesture: () => retry }
}
