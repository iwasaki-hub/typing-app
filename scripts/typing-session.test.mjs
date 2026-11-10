import test from 'node:test'
import assert from 'node:assert/strict'
import { newSession, sessionReducer, sessionMetrics } from '../src/features/typing/session.ts'

const input = (state, value, now, text = 'hello', duration = 30) => sessionReducer(state, { type: 'input', value, text, now, duration })

test('starts on first character and calculates WPM from correct characters', () => {
  let state = input(newSession(), 'h', 1000)
  assert.equal(state.status, 'running')
  assert.equal(state.startedAt, 1000)
  for (const [index, value] of ['he', 'hel', 'hell', 'hello'].entries()) state = input(state, value, 2000 + index * 1000)
  assert.equal(state.reason, 'completed')
  assert.equal(state.elapsed, 4)
  assert.equal(sessionMetrics(state, 'hello').wpm, 15)
})

test('correcting a mistake retains it in accuracy and attempts', () => {
  let state = input(newSession(), 'x', 1000)
  state = input(state, '', 2000)
  state = input(state, 'h', 3000)
  const metrics = sessionMetrics(state, 'hello')
  assert.equal(state.mistakes, 1)
  assert.equal(state.attempts, 2)
  assert.equal(metrics.accuracy, 50)
  assert.equal(metrics.progress, 20)
})

test('timeout uses elapsed clock time even when timer ticks were delayed', () => {
  const state = input(newSession(), 'h', 1000)
  const timedOut = sessionReducer(state, { type: 'tick', now: 45000, duration: 30 })
  assert.equal(timedOut.reason, 'timeout')
  assert.equal(timedOut.elapsed, 30)
  assert.equal(input(state, 'he', 31000).input, 'h')
})

test('ignores pasted, non-ASCII and middle replacements', () => {
  const ready = newSession()
  assert.equal(input(ready, 'hello', 1000), ready)
  assert.equal(input(ready, 'あ', 1000), ready)
  const state = input(ready, 'h', 1000)
  assert.equal(input(state, 'a', 2000), state)
})

test('finished sessions cannot change until reset', () => {
  const state = input(newSession(), 'h', 1000)
  const stopped = sessionReducer(state, { type: 'stop', now: 2500, duration: 30 })
  assert.equal(stopped.reason, 'stopped')
  assert.equal(input(stopped, 'he', 3000), stopped)
  assert.deepEqual(sessionReducer(stopped, { type: 'reset' }), newSession())
})

test('empty sessions do not produce NaN or infinite metrics', () => {
  assert.deepEqual(sessionMetrics(newSession(), 'hello'), { correct: 0, progress: 0, accuracy: 100, wpm: 0 })
})
