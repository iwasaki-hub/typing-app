import test from 'node:test'
import assert from 'node:assert/strict'
import { readSetting, writeSetting, isLanguage, isDuration, isEnabled, isVolume } from '../src/features/typing/settings.ts'

test('settings restore valid values, reject corrupt data and tolerate unavailable storage', () => {
  const values = new Map()
  globalThis.window = { localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } }
  for (const [key, value, fallback, valid] of [['language', 'ko', 'en', isLanguage], ['duration', 120, 60, isDuration], ['enabled', true, false, isEnabled], ['volume', 0, 0.25, isVolume]]) {
    assert.equal(readSetting(key, fallback, valid), fallback)
    writeSetting(key, value)
    assert.equal(readSetting(key, fallback, valid), value)
    values.set(key, '{invalid')
    assert.equal(readSetting(key, fallback, valid), fallback)
  }
  assert.equal(isLanguage('ja'), false)
  assert.equal(isDuration(10), false)
  assert.equal(isEnabled('false'), false)
  for (const value of [-1, 2, null, '0.5', Infinity, NaN]) assert.equal(isVolume(value), false)
  Object.defineProperty(globalThis.window, 'localStorage', { get() { throw new Error('blocked') } })
  assert.equal(readSetting('duration', 60, isDuration), 60)
  assert.doesNotThrow(() => writeSetting('duration', 120))
  delete globalThis.window
})
