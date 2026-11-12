import test from 'node:test'
import assert from 'node:assert/strict'
import { travelCategories, travelPhrases, travelRound } from '../src/features/learning/travel.ts'
import { isLearningInput, newLearningSession, learningReducer } from '../src/features/learning/session.ts'
import { createLearningHistory, learningStats } from '../src/features/learning/history.ts'
import { parseHistory } from '../src/features/typing/history.ts'
import { ko } from '../src/features/locale/ko.ts'

test('five travel situations each have six unique bilingual, typeable phrases', () => {
  assert.equal(Object.keys(travelCategories).length, 5)
  assert.equal(travelPhrases.length, 30)
  assert.equal(new Set(travelPhrases.map(item => item.id)).size, 30)
  assert.equal(new Set(travelPhrases.map(item => item.english)).size, 30)
  const original = travelPhrases.map(item => item.id)
  for (const [category, metadata] of Object.entries(travelCategories)) {
    assert.ok(ko[metadata.label] && metadata.ja && metadata.ko && metadata.emoji)
    const round = travelRound(category, () => .5)
    assert.equal(round.length, 6)
    assert.equal(new Set(round.map(item => item.id)).size, 6)
    for (const item of round) {
      assert.equal(item.category, category)
      assert.ok(item.ja && item.ko && item.english.length <= 64)
      assert.ok(isLearningInput(item.english, item))
      let state = newLearningSession([item], 'guide')
      for (let i = 1; i <= item.english.length; i++) state = learningReducer(state, { type: 'input', value: item.english.slice(0, i).toLowerCase() })
      assert.equal(state.feedback, 'correct', item.english)
      assert.equal(state.answers[0].mistakes, 0)
    }
  }
  assert.deepEqual(travelPhrases.map(item => item.id), original)
})

test('travel accepts punctuation, rejects non-English input, and preserves stricter word input', () => {
  const phrase = travelPhrases.find(item => item.english.includes("I'd"))
  assert.ok(isLearningInput(phrase.english, phrase))
  assert.equal(isLearningInput('日本語', phrase), false)
  assert.equal(isLearningInput('x'.repeat(65), phrase), false)
  assert.equal(isLearningInput('hello?', { english: 'hello' }), false)
  assert.equal(isLearningInput('hello?', { english: 'hello', inputKind: 'brand' }), false)
  const partial = learningReducer(newLearningSession([phrase], 'quiz'), { type: 'input', value: phrase.english.slice(0, -1) })
  assert.equal(partial.feedback, 'none')
  assert.equal(partial.answers.length, 0)
})

test('completed travel rounds restore through existing history with activity and category', () => {
  const round = travelRound('restaurant')
  let state = newLearningSession(round, 'quiz')
  for (const item of round) {
    state = learningReducer(state, { type: 'input', value: item.english })
    state = learningReducer(state, { type: 'next' })
  }
  const result = createLearningHistory(state, 'travel', travelCategories.restaurant.label, 'travel-test', new Date().toISOString())
  assert.deepEqual(learningStats(result.learning), { total: 6, correct: 6, independent: 6, hints: 0, skipped: 0, mistakes: 0 })
  assert.deepEqual(parseHistory(JSON.stringify([result])), [result])
  assert.equal(result.learning.activity, 'travel')
  assert.ok(Buffer.byteLength(JSON.stringify(result)) < 16000)
})
