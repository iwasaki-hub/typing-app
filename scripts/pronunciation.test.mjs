import test from 'node:test'
import assert from 'node:assert/strict'
import { createPronunciation } from '../src/features/learning/pronunciation.ts'

function setup(voices = [{ lang: 'ja-JP' }, { lang: 'en-US' }]) {
  const spoken = [], statuses = []
  let canceled = 0
  const synthesis = { getVoices: () => voices, speak: value => spoken.push(value), cancel: () => canceled++ }
  class Utterance { constructor(text) { this.text = text } }
  const speech = createPronunciation(synthesis, Utterance, status => statuses.push(status))
  return { speech, spoken, statuses, canceled: () => canceled }
}

test('English pronunciation chooses an English voice and replaces the previous word', () => {
  const state = setup()
  state.speech.speak('spoon')
  const first = state.spoken[0]
  assert.equal(first.text, 'spoon')
  assert.equal(first.lang, 'en-US')
  assert.equal(first.voice.lang, 'en-US')
  assert.equal(first.rate, .85)
  const staleError = first.onerror
  state.speech.speak('fork')
  assert.equal(state.canceled(), 1)
  staleError({ error: 'not-allowed' })
  assert.deepEqual(state.statuses, [])
  assert.equal(state.spoken[1].text, 'fork')
  state.speech.stop()
  assert.equal(state.canceled(), 2)
  assert.equal(state.spoken[1].onerror, null)
})

test('blocked playback can retry on interaction and cancellation does not report an error', () => {
  const state = setup([])
  state.speech.speak('toothbrush')
  assert.equal(state.spoken[0].voice, undefined)
  state.spoken[0].onerror({ error: 'not-allowed' })
  assert.equal(state.speech.needsGesture(), true)
  assert.equal(state.statuses.at(-1), 'blocked')
  state.speech.speak('toothbrush')
  state.spoken[1].onstart()
  assert.equal(state.speech.needsGesture(), false)
  assert.equal(state.statuses.at(-1), '')
  state.spoken[1].onerror({ error: 'interrupted' })
  assert.equal(state.statuses.at(-1), '')
  state.spoken[1].onerror({ error: 'language-unavailable' })
  assert.equal(state.statuses.at(-1), 'error')
  state.speech.stop()
  assert.equal(state.speech.needsGesture(), false)
})
