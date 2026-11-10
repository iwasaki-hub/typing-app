import test from 'node:test'
import assert from 'node:assert/strict'
import { createHistoryStore, HISTORY_KEY, parseHistory } from '../src/features/typing/history.ts'

const result = (id) => ({ id, savedAt: '2026-11-10T09:00:00.000Z', text: 'Small steps, every day.', duration: 60, elapsed: 20, wpm: 12, accuracy: 95, mistakes: 1, correct: 20, reason: 'completed' })
function memoryStorage() {
  const data = new Map()
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) }
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

test('account caches stay separate and merge two devices without duplicates or losing local results', () => {
  const memory = memoryStorage()
  const guest = createHistoryStore(() => memory)
  const alice = createHistoryStore(() => memory, 'account:alice')
  const bob = createHistoryStore(() => memory, 'account:bob')
  guest.save(result('guest'))
  alice.save(result('offline'))
  bob.save(result('bob'))
  alice.merge([{ ...result('remote'), savedAt: '2026-11-11T09:00:00.000Z' }, result('offline')])
  alice.merge(alice.getSnapshot().results)
  assert.deepEqual(alice.getSnapshot().results.map(item => item.id), ['remote', 'offline'])
  assert.deepEqual(createHistoryStore(() => memory, 'account:alice').getSnapshot().results, alice.getSnapshot().results)
  assert.deepEqual(bob.getSnapshot().results.map(item => item.id), ['bob'])
  assert.deepEqual(guest.getSnapshot().results.map(item => item.id), ['guest'])
})

test('cloud merge caps the newest records at 100 and ignores corrupt entries', () => {
  const memory = memoryStorage()
  const store = createHistoryStore(() => memory, 'account:test')
  const records = Array.from({ length: 110 }, (_, index) => ({ ...result(String(index)), savedAt: new Date(1700000000000 + index * 1000).toISOString() }))
  store.merge([...records, { ...result('bad'), accuracy: 200 }])
  assert.equal(store.getSnapshot().results.length, 100)
  assert.equal(store.getSnapshot().results[0].id, '109')
  assert.equal(store.getSnapshot().results.at(-1).id, '10')
})

test('clear removes only the current account storage key and notifies list and calendar subscribers', () => {
  const memory = memoryStorage()
  const store = createHistoryStore(() => memory, 'account:alice')
  store.save(result('alice'))
  memory.setItem(HISTORY_KEY, JSON.stringify([result('guest')]))
  memory.setItem('account:bob', JSON.stringify([result('bob')]))
  memory.setItem('typing-app:theme:v1', 'calm')
  let updates = 0
  store.subscribe(() => updates++)
  store.clear()
  assert.equal(memory.getItem('account:alice'), null)
  assert.deepEqual(store.getSnapshot().results, [])
  assert.equal(updates, 1)
  assert.equal(JSON.parse(memory.getItem(HISTORY_KEY))[0].id, 'guest')
  assert.equal(JSON.parse(memory.getItem('account:bob'))[0].id, 'bob')
  assert.equal(memory.getItem('typing-app:theme:v1'), 'calm')
  assert.deepEqual(createHistoryStore(() => memory, 'account:alice').getSnapshot().results, [])
})

test('deletion cutoff discards cached old records but keeps later practice results', () => {
  const memory = memoryStorage()
  const store = createHistoryStore(() => memory)
  store.save(result('old'))
  store.save({ ...result('new'), savedAt: '2026-11-11T09:00:00.000Z' })
  store.discardBefore('2026-11-10T09:00:00.000Z')
  assert.deepEqual(store.getSnapshot().results.map(item => item.id), ['new'])
  assert.deepEqual(createHistoryStore(() => memory).getSnapshot().results.map(item => item.id), ['new'])
})

test('clear reports localStorage failure and retains the current visible history', () => {
  const memory = memoryStorage()
  memory.setItem(HISTORY_KEY, JSON.stringify([result('saved')]))
  const store = createHistoryStore(() => ({ ...memory, removeItem: () => { throw new Error('blocked') } }))
  store.getSnapshot()
  assert.throws(() => store.clear(), /削除できません/)
  assert.equal(store.getSnapshot().results[0].id, 'saved')
})
