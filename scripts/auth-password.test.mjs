import test from 'node:test'
import assert from 'node:assert/strict'
import { authCallbackDestination, createPasswordAuth, passwordAuthError, validatePassword } from '../src/features/auth/password.ts'

test('recovery callbacks reach password setting while signup callbacks reach dashboard', () => {
  assert.equal(authCallbackDestination('#access_token=sample&type=recovery'), '/reset-password')
  assert.equal(authCallbackDestination('#access_token=sample&type=signup'), '/dashboard')
  assert.equal(authCallbackDestination('#access_token=sample&type=magiclink'), '/dashboard')
  assert.equal(authCallbackDestination('#error=access_denied&type=recovery'), null)
  assert.equal(authCallbackDestination(''), null)
})

function setup(overrides = {}) {
  const calls = []
  const auth = {
    signInWithPassword: async (input) => { calls.push(['login', input]); return { data: { session: {} }, error: null } },
    signOut: async () => { calls.push(['logout']); return { error: null } },
    signUp: async (input) => { calls.push(['register', input]); return { data: { session: null }, error: null } },
    resetPasswordForEmail: async (...args) => { calls.push(['reset', ...args]); return { error: null } },
    updateUser: async (input) => { calls.push(['update', input]); return { error: null } },
    ...overrides,
  }
  return { api: createPasswordAuth(() => auth, () => 'https://example.invalid/ranking'), auth, calls }
}

test('password sign-in, logout and sign-in again use no email-sending endpoints', async () => {
  const { api, auth, calls } = setup()
  await api.login(' test@example.invalid ', ' sample-password ')
  await auth.signOut()
  await api.login('test@example.invalid', ' sample-password ')
  assert.deepEqual(calls.map(([name]) => name), ['login', 'logout', 'login'])
  assert.deepEqual(calls[0][1], { email: 'test@example.invalid', password: ' sample-password ' })
})

test('registration distinguishes confirmation-required and immediate sessions', async () => {
  const { api, calls } = setup()
  assert.equal(await api.register(' test@example.invalid ', 'sample-password', ' Sample '), false)
  assert.equal(calls[0][1].options.data.display_name, 'Sample')
  assert.equal(calls[0][1].options.emailRedirectTo, 'https://example.invalid/ranking')
  const loggedIn = setup({ signUp: async () => ({ data: { session: {} }, error: null }) })
  assert.equal(await loggedIn.api.register('test@example.invalid', 'sample-password', 'Sample'), true)
})

test('recovery uses the existing allowed callback and password updates do not send email', async () => {
  const { api, calls } = setup()
  await api.requestReset(' test@example.invalid ')
  await api.updatePassword('new-sample-password')
  assert.deepEqual(calls, [['reset', 'test@example.invalid', { redirectTo: 'https://example.invalid/ranking' }], ['update', { password: 'new-sample-password' }]])
})

test('failed sign-in has a Japanese message and email-limit codes are preserved', async () => {
  const { api } = setup({ signInWithPassword: async () => ({ error: { code: 'invalid_credentials' } }), signUp: async () => ({ data: {}, error: { code: 'over_email_send_rate_limit', status: 429 } }) })
  await assert.rejects(api.login('test@example.invalid', 'wrong'), /メールアドレスまたはパスワード/)
  await assert.rejects(api.register('test@example.invalid', 'sample-password', 'Sample'), (error) => error.code === 'over_email_send_rate_limit')
  assert.match(passwordAuthError({ code: 'email_not_confirmed' }), /確認/)
  assert.match(passwordAuthError({ code: 'weak_password' }), /安全性/)
})

test('new-password validation checks length and confirmation without trimming secrets', () => {
  assert.throws(() => validatePassword('short', 'short'), /8〜128/)
  assert.throws(() => validatePassword('a'.repeat(129), 'a'.repeat(129)), /8〜128/)
  assert.throws(() => validatePassword('sample-password', 'sample-password '), /一致/)
  assert.doesNotThrow(() => validatePassword(' sample-password ', ' sample-password '))
})
