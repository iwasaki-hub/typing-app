import test from 'node:test'
import assert from 'node:assert/strict'
import { practiceActivities } from '../src/features/practice/activities.ts'
import { ko } from '../src/features/locale/ko.ts'

test('practice entries have unique IDs and nested routes, with page loaders and translated menu text', () => {
  assert.equal(new Set(practiceActivities.map(item => item.id)).size, practiceActivities.length)
  assert.equal(new Set(practiceActivities.map(item => item.path)).size, practiceActivities.length)
  for (const item of practiceActivities) {
    assert.equal(item.path, `/practice/${item.id}`)
    assert.ok(item.Page && item.icon)
    for (const text of [item.title, item.description, item.category]) assert.ok(ko[text], `Missing Korean menu text: ${text}`)
  }
  assert.ok(practiceActivities.some(item => item.path === '/practice/sentences'))
  assert.ok(practiceActivities.some(item => item.path === '/practice/countries'))
})
