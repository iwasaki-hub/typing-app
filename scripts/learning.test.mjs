import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { countries, countryRound, normalizeCountryAnswer, regionLabels } from '../src/features/learning/countries.ts'
import { learningReducer, newLearningSession } from '../src/features/learning/session.ts'
import { householdWords, householdCategories, householdRound } from '../src/features/learning/household.ts'
import { ko } from '../src/features/locale/ko.ts'
import { AUTO_ADVANCE_DELAY, scheduleLearningAdvance } from '../src/features/learning/autoAdvance.ts'

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

test('household categories each contain eight unique bilingual words with translated category labels', () => {
  assert.equal(householdWords.length, 40)
  assert.equal(new Set(householdWords.map(word => word.id)).size, 40)
  assert.equal(new Set(householdWords.map(word => word.english)).size, 40)
  const original = householdWords.map(word => word.id)
  for (const [key, category] of Object.entries(householdCategories)) {
    const round = householdRound(key, () => 0.5)
    assert.equal(round.length, 8)
    assert.equal(new Set(round.map(word => word.id)).size, 8)
    assert.ok(round.every(word => word.category === key && word.ja && word.ko && word.emoji))
    assert.ok(ko[category.label])
    for (const word of round) assert.match(word.english, /^[a-z ]{1,64}$/)
  }
  assert.deepEqual(householdWords.map(word => word.id), original)
})

test('shared lesson logic scores household words and preserves skipped, hinted and mistaken words for review', () => {
  const order = householdRound('kitchen', () => 0.5)
  let state = newLearningSession(order, 'quiz')
  for (let index = 0; index < order.length; index++) {
    if (index === 0) state = learningReducer(state, { type: 'hint' })
    if (index === 1) {
      state = learningReducer(state, { type: 'input', value: 'wrong' })
      state = learningReducer(state, { type: 'check' })
    }
    if (index === 2) state = learningReducer(state, { type: 'skip' })
    else {
      state = learningReducer(state, { type: 'input', value: `  ${order[index].english.toUpperCase().replaceAll(' ', '   ')}  ` })
      state = learningReducer(state, { type: 'check' })
      assert.equal(state.feedback, 'correct')
    }
    state = learningReducer(state, { type: 'next' })
  }
  assert.equal(state.finished, true)
  assert.equal(state.answers.length, 8)
  const review = state.answers.filter(answer => answer.hinted || answer.skipped || answer.mistakes).map(answer => answer.item)
  assert.deepEqual(review, order.slice(0, 3))
  const retry = learningReducer(state, { type: 'reset', order: review, mode: 'quiz' })
  assert.equal(retry.order.length, 3)
  assert.equal(retry.index, 0)
  assert.equal(retry.hinted, false)
  assert.deepEqual(retry.answers, [])
})

test('country and household answers complete on the final letter without submitting, only once', () => {
  for (const item of [countries[0], countries.find(country => country.code === 'kr'), householdWords.find(word => word.id === 'vacuum-cleaner')]) {
    let state = newLearningSession([item], 'quiz')
    for (let length = 1; length <= item.english.length; length++) {
      state = learningReducer(state, { type: 'input', value: item.english.slice(0, length).toUpperCase() })
      assert.equal(state.feedback, length === item.english.length ? 'correct' : 'none')
    }
    assert.equal(state.answers.length, 1)
    assert.equal(learningReducer(state, { type: 'check' }), state)
    assert.equal(learningReducer(state, { type: 'input', value: item.english }), state)
  }
})

test('a corrected typo remains marked for review even when Enter is never pressed', () => {
  let state = newLearningSession([countries[0]], 'quiz')
  state = learningReducer(state, { type: 'input', value: 'Jx' })
  state = learningReducer(state, { type: 'input', value: 'J' })
  state = learningReducer(state, { type: 'input', value: 'Japan' })
  assert.equal(state.feedback, 'correct')
  assert.equal(state.answers[0].mistakes, 1)
})

test('automatic advance clears the answer for the next item and finishes the last item', async () => {
  let state = newLearningSession(countries.slice(0, 2), 'guide')
  state = learningReducer(state, { type: 'input', value: countries[0].english })
  scheduleLearningAdvance(state, action => { state = learningReducer(state, action) })
  await new Promise(resolve => setTimeout(resolve, AUTO_ADVANCE_DELAY + 30))
  assert.equal(state.index, 1)
  assert.equal(state.input, '')
  state = learningReducer(state, { type: 'input', value: countries[1].english })
  scheduleLearningAdvance(state, action => { state = learningReducer(state, action) })
  await new Promise(resolve => setTimeout(resolve, AUTO_ADVANCE_DELAY + 30))
  assert.equal(state.finished, true)
  assert.equal(state.answers.length, 2)
})

test('reset, cleanup and skipped answers cannot trigger an unwanted automatic question change', async () => {
  let state = newLearningSession(countries.slice(0, 2), 'guide')
  state = learningReducer(state, { type: 'input', value: countries[0].english })
  const cancel = scheduleLearningAdvance(state, () => assert.fail('Cancelled callback ran'))
  cancel()
  const oldOrder = state.order
  const oldIndex = state.index
  state = learningReducer(state, { type: 'reset', order: countries.slice(2, 4), mode: 'quiz' })
  state = learningReducer(state, { type: 'input', value: state.order[0].english })
  assert.equal(learningReducer(state, { type: 'next', expectedOrder: oldOrder, expectedIndex: oldIndex }), state)
  const skipped = learningReducer(newLearningSession(countries.slice(0, 2), 'quiz'), { type: 'skip' })
  scheduleLearningAdvance(skipped, () => assert.fail('Skipped question advanced automatically'))
  await new Promise(resolve => setTimeout(resolve, AUTO_ADVANCE_DELAY + 30))
})

 test('all practice countries have valid globe locations and cardinal directions project correctly', async () => {
  const { countryLocations, globePoint } = await import('../src/features/learning/locations.ts')
  assert.equal(Object.keys(countryLocations).length, countries.length)
  for (const country of countries) {
    const [lat, lon] = countryLocations[country.code]
    assert.ok(lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180)
    assert.ok(Math.abs(Math.hypot(...globePoint(lat, lon)) - 1) < 1e-10)
  }
  assert.deepEqual(globePoint(0, 0), [0, 0, 1])
  assert.ok(Math.abs(globePoint(0, 90)[0] - 1) < 1e-10)
  assert.ok(Math.abs(globePoint(90, 0)[1] - 1) < 1e-10)
  const borders = JSON.parse(fs.readFileSync('public/maps/country-borders.json', 'utf8'))
  assert.deepEqual(Object.keys(borders).sort(), countries.map(country => country.code).sort())
  for (const rings of Object.values(borders)) {
    assert.ok(rings.length > 0)
    for (const ring of rings) {
      assert.ok(ring.length >= 4)
      assert.deepEqual(ring[0], ring.at(-1))
      for (const [lon, lat] of ring) assert.ok(Number.isFinite(lon) && Number.isFinite(lat) && Math.abs(lon) <= 180 && Math.abs(lat) <= 90)
    }
  }
  const map = JSON.parse(fs.readFileSync('public/maps/land.geojson', 'utf8'))
  assert.ok(map.features.length > 0)
  assert.ok(map.features.every(feature => ['Polygon', 'MultiPolygon'].includes(feature.geometry.type)))
})

test('shop categories include logos and punctuation-aware answers without changing other lessons', async () => {
  const { shopWords, shopCategories, shopRound } = await import('../src/features/learning/shops.ts')
  assert.equal(shopWords.length, 20)
  assert.equal(new Set(shopWords.map(word => word.id)).size, 20)
  for (const [category, metadata] of Object.entries(shopCategories)) {
    assert.ok(ko[metadata.label])
    const round = shopRound(category, () => .5)
    assert.equal(round.length, 4)
    assert.equal(new Set(round.map(word => word.id)).size, 4)
    for (const word of round) {
      assert.equal(word.category, category)
      const image = fs.readFileSync('public' + word.logo)
      assert.ok(image.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || image.subarray(0, 3).equals(Buffer.from([255,216,255])) || image.toString().includes('<svg'), word.id)
      let state = newLearningSession([word], 'guide')
      for (let index = 1; index <= word.english.length; index++) state = learningReducer(state, { type: 'input', value: word.english.slice(0, index) })
      assert.equal(state.feedback, 'correct', word.english)
      assert.equal(state.answers.length, 1)
      assert.equal(state.answers[0].mistakes, 0)
    }
  }
  const country = newLearningSession([countries[0]], 'guide')
  assert.equal(learningReducer(country, { type: 'input', value: "Japan'" }), country)
})
