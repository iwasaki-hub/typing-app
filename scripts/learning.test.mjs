import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { countries, countryRound, normalizeCountryAnswer, regionLabels } from '../src/features/learning/countries.ts'
import { learningReducer, newLearningSession } from '../src/features/learning/session.ts'

test('twenty unique bilingual countries have local flags and valid regions; rounds never repeat a country', () => {
  assert.equal(countries.length, 20)
  assert.equal(new Set(countries.map(country => country.code)).size, 20)
  for (const country of countries) {
    assert.match(country.english, /^[A-Za-z ]+$/)
    assert.ok(country.ja && country.ko && regionLabels[country.region])
    assert.ok(fs.readFileSync(`public/flags/${country.code}.svg`, 'utf8').includes('<svg'))
  }
  const original = countries.map(country => country.code)
  for (const region of ['all', ...Object.keys(regionLabels)]) {
    const round = countryRound(region, () => 0.5)
    assert.equal(round.length, Math.min(10, countries.filter(country => region === 'all' || country.region === region).length))
    assert.equal(new Set(round.map(country => country.code)).size, round.length)
    assert.ok(round.every(country => region === 'all' || country.region === region))
  }
  assert.deepEqual(countries.map(country => country.code), original)
})

test('case and repeated spaces are accepted while wrong attempts remain marked for review', () => {
  const korea = countries.find(country => country.code === 'kr')
  let state = newLearningSession([korea], 'quiz')
  assert.equal(learningReducer(state, { type: 'check' }), state)
  assert.equal(learningReducer(state, { type: 'next' }), state)
  state = learningReducer(state, { type: 'input', value: 'Wrong' })
  state = learningReducer(state, { type: 'check' })
  assert.equal(state.feedback, 'incorrect')
  assert.equal(state.answers.length, 0)
  state = learningReducer(state, { type: 'input', value: '  SOUTH   KOREA  ' })
  state = learningReducer(state, { type: 'check' })
  assert.equal(state.feedback, 'correct')
  assert.equal(state.answers[0].mistakes, 1)
  assert.equal(learningReducer(state, { type: 'check' }), state)
  state = learningReducer(state, { type: 'next' })
  assert.equal(state.finished, true)
  assert.equal(normalizeCountryAnswer(' New   Zealand '), 'new zealand')
})

test('hints and skipped countries are recorded, input and completion reset between rounds', () => {
  let state = newLearningSession(countries.slice(0, 2), 'quiz')
  state = learningReducer(state, { type: 'hint' })
  state = learningReducer(state, { type: 'skip' })
  assert.equal(state.answers[0].hinted, true)
  assert.equal(state.answers[0].skipped, true)
  state = learningReducer(state, { type: 'next' })
  assert.equal(state.index, 1)
  assert.equal(state.hinted, false)
  assert.equal(state.input, '')
  assert.equal(learningReducer(state, { type: 'input', value: '한국어' }), state)
  state = learningReducer(state, { type: 'input', value: 'South Korea' })
  state = learningReducer(state, { type: 'check' })
  assert.equal(state.answers.length, 2)
  state = learningReducer(state, { type: 'next' })
  assert.equal(state.finished, true)
  assert.equal(learningReducer(state, { type: 'skip' }), state)
  state = learningReducer(state, { type: 'reset', order: [countries[0]], mode: 'guide' })
  assert.equal(state.finished, false)
  assert.equal(state.mode, 'guide')
  assert.deepEqual(state.answers, [])
})
