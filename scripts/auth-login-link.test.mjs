import test from 'node:test'
import assert from 'node:assert/strict'
import { createLoginLinkSender, loginLinkFailure, LOGIN_RESEND_KEY } from '../src/features/auth/loginLink.ts'

function setup(send = async () => {}) {
  let clock = 1_000_000
  const values = new Map()
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
  const options = { send, getStorage: () => storage, now: () => clock }
  return { sender: createLoginLinkSender(options), reload: () => createLoginLinkSender(options), values, advance: (ms) => { clock += ms } }
}

test('successful sends persist the cooldown through reload and allow the same email after expiry', async () => {
  const emails = []
  const state = setup(async (email) => { emails.push(email) })
  await state.sender.send(' test@example.invalid ')
  const reloaded = state.reload()
  await assert.rejects(reloaded.send('test@example.invalid'), /待機/)
  assert.deepEqual(emails, ['test@example.invalid'])
  assert.equal(state.values.size, 1)
  assert.match(state.values.get(LOGIN_RESEND_KEY), /^\d+$/)
  state.advance(60_000)
  await reloaded.send('test@example.invalid')
  assert.equal(emails.length, 2)
})

test('project email limits show a Japanese explanation and suppress immediate retries', async () => {
  let calls = 0
  const state = setup(async () => { calls++; throw { code: 'over_email_send_rate_limit', status: 429 } })
  await assert.rejects(state.sender.send('test@example.invalid'), /送信上限/)
  await assert.rejects(state.sender.send('other@example.invalid'), /待機/)
  assert.equal(calls, 1)
  assert.ok(state.sender.getRetryAt() > 0)
})

test('concurrent clicks send once', async () => {
  let complete
  let calls = 0
  const state = setup(() => { calls++; return new Promise((resolve) => { complete = resolve }) })
  const first = state.sender.send('test@example.invalid')
  await assert.rejects(state.sender.send('test@example.invalid'), /送信中/)
  complete()
  await first
  assert.equal(calls, 1)
})

test('storage denial still enforces in-memory cooldown; corrupt deadlines do not lock out login', async () => {
  const sender = createLoginLinkSender({ send: async () => {}, getStorage: () => { throw new Error('denied') }, now: () => 1000 })
  await sender.send('test@example.invalid')
  assert.equal(sender.getRetryAt(), 61000)
  await assert.rejects(sender.send('test@example.invalid'), /待機/)
  const state = setup()
  for (const invalid of ['NaN', 'Infinity', '-1', '999999999999999']) {
    state.values.set(LOGIN_RESEND_KEY, invalid)
    assert.equal(state.sender.getRetryAt(), 0)
  }
})

test('non-rate failures remain retryable and error codes map to distinct messages', async () => {
  const state = setup(async () => { throw new Error('Failed to fetch') })
  await assert.rejects(state.sender.send('test@example.invalid'), /通信環境/)
  assert.equal(state.sender.getRetryAt(), 0)
  assert.match(loginLinkFailure({ status: 429 }).message, /リクエスト/)
  assert.match(loginLinkFailure({ code: 'email_address_not_authorized' }).message, /管理者/)
  assert.match(loginLinkFailure({ code: 'email_address_invalid' }).message, /形式/)
})
