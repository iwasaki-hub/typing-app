import test from 'node:test'
import assert from 'node:assert/strict'
import { chartResults, chartSpeed, speedCeiling } from '../src/features/typing/chart.ts'

const result = (id, language, day, wpm = 40, cpm = 120) => ({ id, language, savedAt: `2026-11-${day}T09:00:00Z`, wpm, cpm })

test('chart separates language units, treats legacy records as English and sorts newest window chronologically', () => {
  const records = [result('new', 'en', '11'), result('korean', 'ko', '10'), result('old', undefined, '08'), result('middle', 'en', '09')]
  assert.deepEqual(chartResults(records, 'en', 2).map(item => item.id), ['middle', 'new'])
  assert.deepEqual(chartResults(records, 'en', 100).map(item => item.id), ['old', 'middle', 'new'])
  assert.deepEqual(chartResults(records, 'ko', 30).map(item => item.id), ['korean'])
  assert.equal(records[0].id, 'new')
  assert.equal(chartSpeed(records[0]), 40)
  assert.equal(chartSpeed(records[1]), 120)
})

test('empty, single and zero results have a nonzero chart domain; maximum value fits', () => {
  assert.deepEqual(chartResults([], 'en', 30), [])
  assert.equal(speedCeiling([]), 10)
  assert.equal(speedCeiling([result('zero', 'en', '11', 0)]), 10)
  assert.equal(speedCeiling([result('one', 'en', '11', 43)]), 50)
  assert.equal(speedCeiling([result('one', 'ko', '11', 43, 203)]), 210)
  assert.equal(chartResults([result('one', 'en', '11')], 'en', 30).length, 1)
})
