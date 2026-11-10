import test from 'node:test'
import assert from 'node:assert/strict'
import { localDateKey, monthCells, groupResultsByDay } from '../src/features/typing/calendar.ts'

test('month layout handles leap years, six-week months and year boundaries', () => {
  assert.equal(monthCells(2024, 1).filter(Boolean).length, 29)
  assert.equal(monthCells(2025, 1).filter(Boolean).length, 28)
  assert.equal(monthCells(2026, 7).length, 42)
  assert.equal(monthCells(2026, 10).indexOf(1), 0)
  assert.deepEqual(monthCells(2026, 12), monthCells(2027, 0))
  assert.deepEqual(monthCells(2026, -1), monthCells(2025, 11))
})

test('groups ISO timestamps by local day and sorts records newest first', () => {
  const early = new Date(2026, 10, 10, 0, 1)
  const late = new Date(2026, 10, 10, 23, 59)
  const tomorrow = new Date(2026, 10, 11, 0, 0)
  assert.equal(localDateKey(early), '2026-11-10')
  const groups = groupResultsByDay([
    { id: 'early', savedAt: early.toISOString() },
    { id: 'tomorrow', savedAt: tomorrow.toISOString() },
    { id: 'late', savedAt: late.toISOString() },
    { id: 'invalid', savedAt: 'invalid' },
  ])
  assert.deepEqual(groups.get('2026-11-10').map((result) => result.id), ['late', 'early'])
  assert.equal(groups.get('2026-11-11').length, 1)
  assert.equal(groups.size, 2)
  assert.equal(groupResultsByDay([]).size, 0)
})
