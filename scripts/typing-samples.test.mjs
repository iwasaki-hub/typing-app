import test from 'node:test'
import assert from 'node:assert/strict'
import { practiceSamples } from '../src/features/typing/samples.ts'
import { formatResultSpeed, parseHistory } from '../src/features/typing/history.ts'
import { isRankingEligible } from '../src/features/typing/ranking.ts'

test('each language has fifteen unique, normalized local examples including five longer passages', () => {
  for (const [language, samples] of Object.entries(practiceSamples)) {
    assert.equal(samples.length, 15)
    assert.equal(new Set(samples).size, 15)
    assert.equal(samples.slice(10).filter((text) => text.length >= (language === 'en' ? 90 : 45) && text.length <= 180).length, 5)
    for (const text of samples) {
      assert.equal(text, text.normalize('NFC'))
      assert.ok(text.length > 0)
      assert.match(text, language === 'en' ? /^[\x20-\x7e]+$/ : /^[\x20-\x7e\uac00-\ud7a3]+$/)
    }
  }
})

test('Korean history restores CPM and stays out of the English leaderboard; old records remain readable', () => {
  const result = { id: 'korean', savedAt: new Date().toISOString(), language: 'ko', text: practiceSamples.ko[0], duration: 60, elapsed: 10, correct: practiceSamples.ko[0].length, attempts: practiceSamples.ko[0].length, mistakes: 0, accuracy: 100, wpm: 30, cpm: 150, reason: 'completed' }
  const restored = parseHistory(JSON.stringify([result]))
  assert.equal(restored.length, 1)
  assert.equal(formatResultSpeed(restored[0]), '150 CPM')
  assert.equal(isRankingEligible(restored[0]), false)
  const { language, cpm, ...legacy } = result
  assert.equal(language, 'ko')
  assert.equal(cpm, 150)
  assert.equal(formatResultSpeed(parseHistory(JSON.stringify([legacy]))[0]), '30 WPM')
})
