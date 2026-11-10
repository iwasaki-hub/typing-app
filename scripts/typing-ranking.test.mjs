import test from 'node:test'
import assert from 'node:assert/strict'
import { isRankingEligible } from '../src/features/typing/ranking.ts'

const result = { id: 'test', savedAt: new Date().toISOString(), text: 'Small steps, every day.', duration: 60, elapsed: 10, wpm: 28, accuracy: 96, correct: 23, attempts: 24, mistakes: 1, reason: 'completed' }
test('completed and timed out sessions qualify; manual stops and legacy results do not', () => {
  assert.equal(isRankingEligible(result), true)
  assert.equal(isRankingEligible({ ...result, reason: 'timeout', elapsed: 60, correct: 10 }), true)
  assert.equal(isRankingEligible({ ...result, reason: 'stopped' }), false)
  assert.equal(isRankingEligible({ ...result, attempts: undefined }), false)
})
test('invalid timings, speeds, counts and completion states are excluded', () => {
  for (const change of [{ elapsed: 4.9 }, { elapsed: 61 }, { elapsed: NaN }, { wpm: 301 }, { correct: 21 }, { attempts: 1 }, { attempts: 10001 }, { mistakes: -1 }, { duration: 45 }, { reason: 'timeout', elapsed: 59 }]) {
    assert.equal(isRankingEligible({ ...result, ...change }), false, JSON.stringify(change))
  }
})
