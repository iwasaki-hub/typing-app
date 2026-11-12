import test from 'node:test'
import assert from 'node:assert/strict'
import { koreanParts, koreanDraftFeedback } from '../src/features/typing/koreanParts.ts'
import { newSession, sessionReducer, sessionMetrics } from '../src/features/typing/session.ts'

test('decomposes all modern syllables identically in NFC and canonical jamo forms', () => {
  assert.deepEqual(koreanParts('한'), ['ㅎ', 'ㅏ', 'ㄴ'])
  assert.deepEqual(koreanParts('과'), ['ㄱ', 'ㅗ', 'ㅏ'])
  assert.deepEqual(koreanParts('값'), ['ㄱ', 'ㅏ', 'ㅂ', 'ㅅ'])
  assert.deepEqual(koreanParts('있'), ['ㅇ', 'ㅣ', 'ㅅ', 'ㅅ'])
  assert.deepEqual(koreanParts('Hi 123!'), [...'Hi 123!'])
  for (let code = 0xac00; code <= 0xd7a3; code++) {
    const letter = String.fromCodePoint(code)
    assert.deepEqual(koreanParts(letter), koreanParts(letter.normalize('NFD')))
  }
})

test('matches each composing part, supports corrections and leaves future parts pending', () => {
  for (const [draft, states] of [
    ['', ['pending', 'pending', 'pending']],
    ['ㅎ', ['correct', 'pending', 'pending']],
    ['하', ['correct', 'correct', 'pending']],
    ['한', ['correct', 'correct', 'correct']],
    ['허', ['correct', 'incorrect', 'pending']],
    ['하', ['correct', 'correct', 'pending']],
  ]) assert.deepEqual(koreanDraftFeedback('한국', draft).characters[0].parts.map(part => part.state), states)
  assert.equal(koreanDraftFeedback('한국', '하').characters[0].state, 'partial')
  assert.equal(koreanDraftFeedback('한국', '허').characters[0].state, 'incorrect')
  assert.equal(koreanDraftFeedback('한국', '한국').characters[1].state, 'correct')
  assert.deepEqual(koreanDraftFeedback('한', '한ㄱ').extra, ['ㄱ'])
})

test('compound vowels, compound finals and syllable resplitting remain valid prefixes', () => {
  for (const [text, draft] of [['과', '고'], ['값', '갑'], ['있', '잇'], ['하나', '한'], ['한국', '한ㄱ']]) {
    const result = koreanDraftFeedback(text, draft)
    assert.ok(result.characters.every(character => character.state !== 'incorrect'), `${text}: ${draft}`)
    assert.deepEqual(result.extra, [])
  }
  const next = koreanDraftFeedback('하나', '한')
  assert.equal(next.activeIndex, 1)
  assert.deepEqual(next.characters[1].parts.map(part => part.state), ['correct', 'pending'])
  assert.deepEqual(koreanDraftFeedback('한 글.', '한 ').characters[1].parts.map(part => part.state), ['correct'])
})

test('composition previews never change scoring or finish a session; committed input still does', () => {
  let session = sessionReducer(newSession(), { type: 'start', now: 1000, duration: 30 })
  const before = structuredClone(session)
  for (const draft of ['ㅎ', '허', '하', '한']) koreanDraftFeedback('한', draft)
  assert.deepEqual(session, before)
  assert.equal(session.attempts, 0)
  assert.equal(session.mistakes, 0)
  assert.equal(sessionMetrics(session, '한').cpm, 0)
  assert.equal(session.status, 'running')
  session = sessionReducer(session, { type: 'input', value: '한', text: '한', now: 2000, duration: 30, language: 'ko', composed: true })
  assert.equal(session.attempts, 1)
  assert.equal(session.mistakes, 0)
  assert.equal(session.reason, 'completed')
})

test('each composing addition plays once, while commit repeats, deletion and regrouping stay silent', async () => {
  const { createKoreanPartSoundTracker } = await import('../src/features/typing/koreanPartSound.ts')
  const tracker = createKoreanPartSoundTracker()
  assert.equal(tracker.update('ㅎ', '한국'), 'key')
  assert.equal(tracker.update('하', '한국'), 'key')
  assert.equal(tracker.update('한', '한국'), 'key')
  assert.equal(tracker.update('한', '한국'), null)
  assert.equal(tracker.update('한ㄱ', '한국'), 'key')
  assert.equal(tracker.update('한구', '한국'), 'key')
  assert.equal(tracker.update('한국', '한국'), 'key')
  assert.equal(tracker.update('한국', '한국'), null)
  tracker.reset()
  assert.equal(tracker.update('한', '하나'), 'key')
  assert.equal(tracker.update('하ㄴ', '하나'), null)
  assert.equal(tracker.update('하나', '하나'), 'key')
  assert.equal(tracker.update('하ㄴ', '하나'), null)
  tracker.reset()
  assert.equal(tracker.update('ㅎ', '한'), 'key')
})

test('part sounds distinguish new errors and corrections, including compound vowels and finals', async () => {
  const { createKoreanPartSoundTracker } = await import('../src/features/typing/koreanPartSound.ts')
  const tracker = createKoreanPartSoundTracker()
  assert.equal(tracker.update('ㅎ', '한'), 'key')
  assert.equal(tracker.update('허', '한'), 'error')
  assert.equal(tracker.update('하', '한'), 'key')
  assert.equal(tracker.update('한', '한'), 'key')
  tracker.reset()
  assert.equal(tracker.update('고', '과'), 'key')
  assert.equal(tracker.update('과', '과'), 'key')
  tracker.reset()
  assert.equal(tracker.update('갑', '값'), 'key')
  assert.equal(tracker.update('값', '값'), 'key')
  assert.equal(tracker.update('값', '값'), null)
})
