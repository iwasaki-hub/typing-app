import test from 'node:test'
import assert from 'node:assert/strict'
import { validateReview } from '../src/features/reviews/review.ts'

const valid = { display_name: 'テスト', rating: 5, title: '練習しやすい', comment: '短い時間でも気軽に練習できます。' }
test('review trims text, counts Unicode characters and keeps multiline comments', () => {
  assert.equal(validateReview({ ...valid, display_name: ' 名前 ', comment: '  とても便利なアプリです。\n毎日練習します。  ' }).comment, 'とても便利なアプリです。\n毎日練習します。')
  assert.equal(validateReview({ ...valid, display_name: '😀'.repeat(20) }).display_name.length, 40)
  assert.throws(() => validateReview({ ...valid, display_name: '😀'.repeat(21) }), /表示名/)
})
test('review requires valid stars, bounded nonempty fields and excludes control characters', () => {
  for (const rating of [0, 6, 1.5, NaN, '5']) assert.throws(() => validateReview({ ...valid, rating }), /評価/)
  for (const title of ['   ', 'あ'.repeat(61), '見出し\n改行']) assert.throws(() => validateReview({ ...valid, title }))
  for (const comment of ['短い', 'あ'.repeat(501), '十分長いコメントですが\u0000制御文字']) assert.throws(() => validateReview({ ...valid, comment }))
  assert.throws(() => validateReview({ ...valid, display_name: '' }), /表示名/)
  assert.equal(validateReview({ ...valid, rating: 1, comment: 'あ'.repeat(500) }).comment.length, 500)
})
