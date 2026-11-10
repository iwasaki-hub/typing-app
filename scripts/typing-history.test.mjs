import test from 'node:test'
import assert from 'node:assert/strict'
import { createHistoryStore, HISTORY_KEY, parseHistory } from '../src/features/typing/history.ts'

const result = (id) => ({ id, savedAt: '2026-11-10T09:00:00.000Z', text: 'Small steps, every day.', duration: 60, elapsed: 20, wpm: 12, accuracy: 95, mistakes: 1, correct: 20, reason: 'completed' })
function memoryStorage() {
  const data = new Map()
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
}

test('persists results and restores them in a new store', () => {
  const storage = memoryStorage()
  const store = createHistoryStore(() => storage)
  store.save(result('first'))
  assert.equal(createHistoryStore(() => storage).getSnapshot().results[0].id, 'first')
})

test('deduplicates IDs, puts newest first and caps history at 100', () => {
  const store = createHistoryStore(() => memory)
  const memory = memoryStorage()
  for (let i = 0; i < 105; i++) store.save(result(String(i)))
  store.save(result('104'))
  assert.equal(store.getSnapshot().results.length, 100)
  assert.equal(store.getSnapshot().results[0].id, '104')
  assert.equal(store.getSnapshot().results.at(-1).id, '5')
})

test('handles invalid and unavailable storage without throwing', () => {
  const store = createHistoryStore(() => { throw new Error('SecurityError') })
  assert.doesNotThrow(() => store.getSnapshot())
  assert.doesNotThrow(() => store.save(result('test')))
  assert.match(store.getSnapshot().error, /保存できません/)
  const storage = memoryStorage()
  storage.setItem(HISTORY_KEY, '{broken')
  assert.equal(createHistoryStore(() => storage).getSnapshot().results.length, 0)
})

test('rejects invalid entries and reports quota failures', () => {
  assert.deepEqual(parseHistory(JSON.stringify([{ ...result('bad'), accuracy: 200 }, result('ok')])), [result('ok')])
  const storage = memoryStorage()
  storage.setItem(HISTORY_KEY, JSON.stringify([result('existing')]))
  const store = createHistoryStore(() => ({ ...storage, setItem: () => { throw new Error('QuotaExceeded') } }))
  store.getSnapshot()
  store.save(result('new'))
  assert.equal(store.getSnapshot().results[0].id, 'existing')
  assert.match(store.getSnapshot().error, /保存できません/)
})

test('notifies subscribers and refreshes results saved by another tab', () => {
  const storage = memoryStorage()
  const store = createHistoryStore(() => storage)
  let updates = 0
  const unsubscribe = store.subscribe(() => updates++)
  storage.setItem(HISTORY_KEY, JSON.stringify([result('other-tab')]))
  store.refresh()
  assert.equal(updates, 1)
  assert.equal(store.getSnapshot().results[0].id, 'other-tab')
  unsubscribe()
})
