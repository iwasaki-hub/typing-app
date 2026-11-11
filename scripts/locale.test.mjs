import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { translate, parseUiLocale, UI_LOCALE_KEY } from '../src/features/locale/translate.ts'
import { ko } from '../src/features/locale/ko.ts'

test('Japanese and Korean labels, interpolation and stored errors translate without altering supplied user data', () => {
  assert.equal(translate('ja', '次の問題'), '次の問題')
  assert.equal(translate('ko', '次の問題'), '다음 문제')
  assert.equal(translate('ko', '{0} さん、おかえりなさい。', ['ホーム']), 'ホーム님, 다시 오신 것을 환영해요.')
  assert.equal(translate('ko', '再送まで 25秒'), '재전송까지 25초')
  assert.equal(translate('ko', '接続できませんでした（HTTP 429）。URL と公開用キーを確認してください。'), '연결하지 못했습니다(HTTP 429). URL과 공개 키를 확인하세요.')
  assert.equal(translate('ko', 'An unknown server error'), 'An unknown server error')
  assert.equal(parseUiLocale('ko'), 'ko')
  assert.equal(parseUiLocale('invalid'), 'ja')
})

test('every literal UI translation key has a Korean entry, including accessibility labels', () => {
  const files = fs.readdirSync('src', { recursive: true }).filter(file => file.endsWith('.tsx'))
  const keys = new Set()
  for (const file of files) {
    const source = ts.createSourceFile(file, fs.readFileSync(path.join('src', file), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(source) === 't' && ts.isStringLiteral(node.arguments[0])) keys.add(node.arguments[0].text)
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  assert.ok(keys.size > 200)
  for (const key of keys) assert.ok(ko[key], `Missing Korean translation: ${key}`)
})

test('display language persists separately from practice settings and tolerates blocked storage', async () => {
  const memory = new Map([['typing-app:language:v1', '"en"'], ['typing-app:theme:v1', 'calm']])
  globalThis.window = { localStorage: { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) } }
  const store = await import('../src/features/locale/store.ts')
  assert.equal(store.getUiLocale(), 'ja')
  let changes = 0
  const unsubscribe = store.subscribeLocale(() => changes++)
  store.setUiLocale('ko')
  assert.equal(store.getUiLocale(), 'ko')
  assert.equal(store.getFormattingLocale(), 'ko-KR')
  assert.equal(memory.get(UI_LOCALE_KEY), 'ko')
  const reloaded = await import('../src/features/locale/store.ts?reload')
  assert.equal(reloaded.getUiLocale(), 'ko')
  assert.equal(memory.get('typing-app:language:v1'), '"en"')
  assert.equal(memory.get('typing-app:theme:v1'), 'calm')
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked') } })
  assert.doesNotThrow(() => store.setUiLocale('ja'))
  assert.equal(store.getUiLocale(), 'ja')
  assert.equal(changes, 2)
  unsubscribe()
  delete globalThis.window
})
