import assert from 'node:assert/strict'
import test from 'node:test'
import { GRUVBOX, contrastRatio } from '../src/shared/palette.ts'

test('the original Gruvbox anchors keep their upstream values', () => {
  assert.equal(GRUVBOX.dark0Hard, '#1d2021')
  assert.equal(GRUVBOX.dark0, '#282828')
  assert.equal(GRUVBOX.dark0Soft, '#32302f')
  assert.equal(GRUVBOX.light0Hard, '#f9f5d7')
  assert.equal(GRUVBOX.light0, '#fbf1c7')
  assert.equal(GRUVBOX.light0Soft, '#f2e5bc')
  assert.equal(GRUVBOX.brightOrange, '#fe8019')
  assert.equal(GRUVBOX.brightAqua, '#8ec07c')
  assert.equal(GRUVBOX.brightBlue, '#83a598')
})

test('contrastRatio is symmetric and bounded', () => {
  assert.equal(contrastRatio('#000000', '#ffffff'), 21)
  assert.equal(contrastRatio('#ffffff', '#000000'), 21)
  assert.equal(contrastRatio('#777777', '#777777'), 1)
})

test('Gruvbox text colors clear WCAG AA on their own backgrounds', () => {
  assert.ok(contrastRatio(GRUVBOX.light1, GRUVBOX.dark0Hard) >= 4.5)
  assert.ok(contrastRatio(GRUVBOX.dark1, GRUVBOX.light0Hard) >= 4.5)
})
