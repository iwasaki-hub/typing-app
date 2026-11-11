import test from 'node:test'
import assert from 'node:assert/strict'
import { countryRound } from '../src/features/learning/countries.ts'
import { householdRound } from '../src/features/learning/household.ts'
import { shopRound } from '../src/features/learning/shops.ts'
import { learningReducer, newLearningSession } from '../src/features/learning/session.ts'
import { createLearningHistory, createLearningRecorder, learningStats, splitPracticeResults } from '../src/features/learning/history.ts'
import { createHistoryStore, parseHistory } from '../src/features/typing/history.ts'
import { isRankingEligible } from '../src/features/typing/ranking.ts'

function complete(order, mode = 'guide') {
  let state = newLearningSession(order, mode)
  for (const item of order) {
    state = learningReducer(state, { type: 'input', value: item.english })
    state = learningReducer(state, { type: 'next' })
  }
  return state
}
const date = '2026-11-11T10:00:00.000Z'
function memoryStorage() {
  const memory = new Map()
  return { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) }
}

test('all three lesson types save a complete round and preserve bilingual questions and mode', () => {
  for (const [kind, order] of [['countries', countryRound('all')], ['household', householdRound('kitchen')], ['shops', shopRound('burgers')]]) {
    assert.equal(createLearningHistory(newLearningSession(order, 'quiz'), kind, 'category', 'unfinished', date), null)
    const result = createLearningHistory(complete(order, 'quiz'), kind, 'category', kind, date)
    assert.equal(result.learning.activity, kind)
    assert.equal(result.learning.mode, 'quiz')
    assert.equal(result.learning.items.length, order.length)
    assert.equal(result.learning.items[0].ko, order[0].ko)
    assert.deepEqual(learningStats(result.learning), { total: order.length, correct: order.length, independent: order.length, hints: 0, mistakes: 0, skipped: 0 })
    assert.deepEqual(parseHistory(JSON.stringify([result])), [result])
    assert.equal(isRankingEligible(result), false)
    assert.ok(Buffer.byteLength(JSON.stringify(result)) < 16000)
  }
})

test('hints, skips, corrected mistakes and review rounds retain meaningful lesson counts', () => {
  const order = householdRound('kitchen').slice(0, 3)
  let state = newLearningSession(order, 'quiz')
  state = learningReducer(state, { type: 'hint' })
  state = learningReducer(state, { type: 'input', value: order[0].english })
  state = learningReducer(state, { type: 'next' })
  state = learningReducer(state, { type: 'skip' })
  state = learningReducer(state, { type: 'next' })
  state = learningReducer(state, { type: 'input', value: 'zzz' })
  state = learningReducer(state, { type: 'input', value: order[2].english })
  state = learningReducer(state, { type: 'next' })
  const result = createLearningHistory(state, 'household', 'キッチン', 'mixed', date)
  assert.deepEqual(learningStats(result.learning), { total: 3, correct: 2, independent: 0, hints: 1, skipped: 1, mistakes: 1 })
  assert.equal(result.accuracy, 67)
  const saved = []
  const record = createLearningRecorder(result => saved.push(result))
  record(state, 'household', 'キッチン')
  record(state, 'household', 'キッチン')
  assert.equal(saved.length, 1)
  record(complete([order[2]], 'quiz'), 'household', 'キッチン')
  assert.equal(saved.length, 2)
  assert.notEqual(saved[0].id, saved[1].id)
})

test('learning records restore, sync-merge, stay separate from typing statistics, and clear together', () => {
  const storage = memoryStorage()
  const first = createHistoryStore(() => storage, 'account:alice')
  const result = createLearningHistory(complete(shopRound('coffee')), 'shops', 'コーヒーショップ', 'shop-result', date)
  first.save(result)
  const restored = createHistoryStore(() => storage, 'account:alice')
  assert.deepEqual(restored.getSnapshot().results, [result])
  const typing = { id: 'typing', savedAt: date, text: 'Hello world', duration: 60, elapsed: 20, wpm: 40, accuracy: 98, mistakes: 1, correct: 10, reason: 'completed' }
  restored.merge([result, typing])
  restored.merge([result, typing])
  assert.equal(restored.getSnapshot().results.length, 2)
  const grouped = splitPracticeResults(restored.getSnapshot().results)
  assert.deepEqual(grouped.typing, [typing])
  assert.deepEqual(grouped.learning, [result])
  assert.deepEqual(createHistoryStore(() => storage, 'account:bob').getSnapshot().results, [])
  restored.discardBefore('2026-11-12T00:00:00Z')
  assert.deepEqual(restored.getSnapshot().results, [])
  restored.save(result)
  restored.clear()
  assert.deepEqual(createHistoryStore(() => storage, 'account:alice').getSnapshot().results, [])
})

test('malformed learning metadata is rejected without losing valid older typing records', () => {
  const valid = createLearningHistory(complete(countryRound('asia')), 'countries', 'アジア', 'country', date)
  const invalid = [null, {}, { ...valid.learning, activity: 'unknown' }, { ...valid.learning, items: [] },
    { ...valid.learning, items: [{ ...valid.learning.items[0], mistakes: -1 }] }]
  for (const learning of invalid) assert.deepEqual(parseHistory(JSON.stringify([{ ...valid, learning }])), [])
  const { learning: _learning, ...legacy } = valid
  assert.equal(parseHistory(JSON.stringify([legacy])).length, 1)
})
