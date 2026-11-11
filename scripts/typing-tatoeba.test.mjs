import test from 'node:test'
import assert from 'node:assert/strict'
import { selectKoreanBatch } from '../src/api/tatoeba.ts'
import { createKoreanQueue, KOREAN_QUEUE_KEY } from '../src/features/typing/koreanQueue.ts'
import { parseHistory } from '../src/features/typing/history.ts'

const item = id => ({ id, lang: 'kor', text: `오늘도 즐겁게 타자를 연습해요. ${id}`, owner: 'sample-author', license: 'CC BY 2.0 FR', is_unapproved: false })
const batch = (start, count) => selectKoreanBatch({ data: Array.from({ length: count }, (_, index) => item(start + index)) })
function storage() {
  const data = new Map()
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
}

test('filters external sentences to typeable Korean with attribution and removes duplicates', () => {
  const good = item(1)
  const data = [null, good, good, { ...good, id: 0 }, { ...item(2), is_unapproved: true }, { ...item(3), owner: null }, { ...item(4), license: 'PROBLEM' }, { ...item(5), text: '한글과 漢字를 같이 씁니다.' }, { ...item(6), text: '짧다.' }]
  const selected = selectKoreanBatch({ data })
  assert.equal(selected.length, 1)
  assert.deepEqual(selected[0].credit, { sentenceId: 1, author: 'sample-author', license: 'CC BY 2.0 FR' })
  assert.equal(batch(1, 30).length, 20)
  assert.throws(() => selectKoreanBatch({ wrong: [] }))
})

test('serves distinct cached sentences, refills at three remaining, and restores unserved sentences after reload', async () => {
  const memory = storage()
  let calls = 0
  let resolveRefill
  const queue = createKoreanQueue({ storage: () => memory, now: () => 1000, load: async () => {
    calls++
    if (calls === 1) return batch(1, 8)
    return new Promise(resolve => { resolveRefill = resolve })
  } })
  const ids = []
  for (let index = 0; index < 5; index++) ids.push((await queue.next()).credit.sentenceId)
  assert.deepEqual(ids, [1, 2, 3, 4, 5])
  assert.equal(calls, 2)
  resolveRefill([...batch(1, 3), ...batch(9, 8)])
  await new Promise(resolve => setImmediate(resolve))
  queue.dispose()
  let restoredCalls = 0
  const restored = createKoreanQueue({ storage: () => memory, now: () => 1000, load: async () => { restoredCalls++; return [] } })
  assert.equal((await restored.next()).credit.sentenceId, 6)
  assert.equal(restoredCalls, 0)
  restored.dispose()
})

test('offline fallback avoids consecutive repeats, limits retries and recovers after cooldown', async () => {
  let time = 1000, calls = 0
  const queue = createKoreanQueue({ storage: () => { throw new Error('blocked') }, now: () => time, load: async () => {
    calls++
    if (calls === 1) throw new Error('offline')
    return batch(1, 8)
  } })
  const first = await queue.next()
  const second = await queue.next(first.text)
  assert.equal(first.source, 'local')
  assert.notEqual(second.text, first.text)
  assert.equal(calls, 1)
  time += 30001
  assert.equal((await queue.next()).source, 'tatoeba')
  assert.equal(calls, 2)
  queue.dispose()
})

test('expired or corrupt caches are ignored, and disposal aborts an in-flight request', async () => {
  for (const saved of ['{bad', JSON.stringify({ version: 1, expiresAt: 0, queue: batch(1, 5), seen: [] })]) {
    const memory = storage(); memory.setItem(KOREAN_QUEUE_KEY, saved)
    let calls = 0
    const queue = createKoreanQueue({ storage: () => memory, now: () => 1000, load: async () => { calls++; return batch(20, 8) } })
    assert.equal((await queue.next()).credit.sentenceId, 20)
    assert.equal(calls, 1)
    queue.dispose()
  }
  let signal, resolveRequest
  const queue = createKoreanQueue({ storage, load: currentSignal => { signal = currentSignal; return new Promise(resolve => { resolveRequest = resolve }) } })
  const next = queue.next()
  queue.dispose()
  assert.equal(signal.aborted, true)
  resolveRequest(batch(1, 8))
  await assert.rejects(next, /中断/)
})

test('persisted practice history retains sentence attribution', () => {
  const quote = batch(1, 1)[0]
  const result = { id: 'credit', savedAt: '2026-11-11T00:00:00Z', text: quote.text, credit: quote.credit, language: 'ko', cpm: 100, duration: 60, elapsed: 10, wpm: 20, accuracy: 100, mistakes: 0, correct: 10, reason: 'completed' }
  assert.deepEqual(parseHistory(JSON.stringify([result]))[0].credit, quote.credit)
})
