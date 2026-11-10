import assert from 'node:assert/strict'
import test from 'node:test'
import { BOOT_GLOBAL } from '../src/shared/selection.ts'
import { buildBootRows } from '../src/shared/boot.ts'

test('the built-in theme emits only the selection payload', () => {
  const rows = buildBootRows('default', false)
  assert.equal(rows.length, 1)
  assert.equal(rows[0]?.kind, 'script')
  assert.match(rows[0]?.text ?? '', /"theme":"default"/u)
  assert.match(rows[0]?.text ?? '', /delete document\.documentElement\.dataset\.gruvboxTheme/u)
})

test('a fixed dark theme paints its background and declares a dark scheme', () => {
  const rows = buildBootRows('gruvbox-dark-hard', false)
  assert.equal(rows.length, 2)
  assert.equal(rows[0]?.kind, 'style')
  assert.match(rows[0]?.text ?? '', /color-scheme:dark/u)
  assert.match(rows[0]?.text ?? '', /#1d2021/u)
  assert.equal(rows[1]?.kind, 'script')
  assert.equal(rows[1]?.placement, 'body')
  assert.match(rows[1]?.text ?? '', new RegExp(`window\\.${BOOT_GLOBAL}=`, 'u'))
  assert.match(rows[1]?.text ?? '', /"theme":"gruvbox-dark-hard"/u)
})

test('follow-system emits a media query and carries the family', () => {
  const rows = buildBootRows('gruvbox-dark-soft', true)
  const style = rows[0]?.text ?? ''
  assert.match(style, /color-scheme:light dark/u)
  assert.match(style, /@media\(prefers-color-scheme:dark\)/u)
  assert.match(style, /#f2e5bc/u)
  assert.match(style, /#32302f/u)
  assert.match(rows[1]?.text ?? '', /"followSystem":true/u)
})

test('Whale keeps a dark scheme even while following the system', () => {
  const rows = buildBootRows('gruvbox-whale', true)
  assert.match(rows[0]?.text ?? '', /color-scheme:dark/u)
  assert.doesNotMatch(rows[0]?.text ?? '', /prefers-color-scheme/u)
})

test('the boot payload cannot close the script element', () => {
  const rows = buildBootRows('gruvbox-light-hard', false)
  assert.doesNotMatch(rows[1]?.text ?? '', /<\/script/iu)
  assert.doesNotMatch(rows[1]?.text ?? '', /</u)
})
