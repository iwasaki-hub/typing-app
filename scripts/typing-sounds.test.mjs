import test from 'node:test'
import assert from 'node:assert/strict'
import { isSoundPreset, playTypingSound, soundPresets } from '../src/features/typing/sounds.ts'

function audioMock() {
  const oscillators = [], gains = []
  const param = () => ({ setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} })
  return {
    currentTime: 10, destination: {}, oscillators, gains,
    createOscillator() {
      const oscillator = { frequency: param(), connect() {}, disconnect() { this.disconnected = true }, start(time) { this.started = time }, stop(time) { this.stopped = time } }
      oscillators.push(oscillator)
      return oscillator
    },
    createGain() {
      const gain = { gain: param(), connect() {}, disconnect() { this.disconnected = true } }
      gains.push(gain)
      return gain
    },
  }
}

test('every sound kind schedules finite notes and disconnects its audio nodes', () => {
  for (const preset of Object.keys(soundPresets)) {
    for (const kind of ['key', 'error', 'complete']) {
      const audio = audioMock()
      playTypingSound(audio, preset, kind, 0.25)
      assert.equal(audio.oscillators.length, kind === 'complete' ? 3 : 1)
      audio.oscillators.forEach((oscillator, index) => {
        assert.ok(oscillator.started >= audio.currentTime)
        assert.ok(oscillator.stopped > oscillator.started && oscillator.stopped < audio.currentTime + 1)
        oscillator.onended()
        assert.equal(oscillator.disconnected, true)
        assert.equal(audio.gains[index].disconnected, true)
      })
    }
  }
})

test('muted or invalid volume creates no audio nodes and stored preset IDs are validated', () => {
  for (const volume of [0, -1, NaN, Infinity]) {
    const audio = audioMock()
    playTypingSound(audio, 'classic', 'key', volume)
    assert.equal(audio.oscillators.length, 0)
  }
  assert.equal(isSoundPreset('soft'), true)
  for (const value of [null, 'unknown', 'toString', '__proto__']) assert.equal(isSoundPreset(value), false)
})
