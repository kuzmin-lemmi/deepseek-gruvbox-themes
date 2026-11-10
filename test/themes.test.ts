import assert from 'node:assert/strict'
import test from 'node:test'
import { contrastRatio } from '../src/shared/palette.ts'
import { GRUVBOX_THEMES, THEMES_BY_ID, THEME_IDS } from '../src/shared/themes.ts'

/** Tokens the live Theme provider reports as theme-overridable. */
const REPORTED_TOKENS = [
  '--dsw-alias-bg-base',
  '--dsw-alias-bg-layer-1',
  '--dsw-alias-bg-layer-2',
  '--dsw-alias-bg-overlay',
  '--dsw-alias-border-l1',
  '--dsw-alias-border-l2',
  '--dsw-alias-brand-primary',
  '--dsw-alias-label-primary',
  '--dsw-alias-label-secondary',
  '--dsw-alias-state-error-primary',
  '--dsw-alias-state-idle-primary',
  '--dsw-alias-state-success-primary',
  '--dsw-alias-state-warn-primary',
  '--dsw-specific-sidebar-fill',
] as const

/** Tokens this plugin promises for each theme, beyond the reported set. */
const EXTRA_REQUIRED = [
  '--dsw-alias-bg-layer-3',
  '--dsw-alias-border-l3',
  '--dsw-alias-border-l4',
  '--dsw-alias-label-tertiary',
  '--dsw-alias-button-primary-fill',
  '--dsw-alias-markdown-code-block',
  '--dsw-alias-markdown-inline-code',
  '--shiki-foreground',
  '--shiki-token-keyword',
  '--dsw-alias-scrollbar-bg-l1',
  '--dsw-alias-toast-bg',
  '--dsw-alias-settings-card-fill',
  '--dsw-specific-sidebar-nav-item-active',
] as const

const EXPECTED: Readonly<Record<string, { base: string; accent: string }>> = {
  'gruvbox-dark-hard': { base: '#1d2021', accent: '#fe8019' },
  'gruvbox-dark-medium': { base: '#282828', accent: '#fabd2f' },
  'gruvbox-dark-soft': { base: '#32302f', accent: '#d3869b' },
  'gruvbox-light-hard': { base: '#f9f5d7', accent: '#9d0006' },
  'gruvbox-light-medium': { base: '#fbf1c7', accent: '#af3a03' },
  'gruvbox-light-soft': { base: '#f2e5bc', accent: '#b57614' },
  'gruvbox-whale': { base: '#282828', accent: '#83a598' },
}

test('seven unique themes are registered in a stable order', () => {
  assert.equal(GRUVBOX_THEMES.length, 7)
  assert.deepEqual([...THEME_IDS], [
    'gruvbox-dark-hard',
    'gruvbox-dark-medium',
    'gruvbox-dark-soft',
    'gruvbox-light-hard',
    'gruvbox-light-medium',
    'gruvbox-light-soft',
    'gruvbox-whale',
  ])
  assert.equal(new Set(THEME_IDS).size, 7)
})

test('each theme keeps its documented Gruvbox base and accent', () => {
  for (const [id, expected] of Object.entries(EXPECTED)) {
    const theme = THEMES_BY_ID[id as keyof typeof THEMES_BY_ID]
    assert.equal(theme.tokens['--dsw-alias-bg-base'], expected.base, `${id} base`)
    assert.equal(theme.tokens['--dsw-alias-brand-primary'], expected.accent, `${id} accent`)
  }
})

test('every theme covers the reported alias tokens and the extended surface', () => {
  for (const theme of GRUVBOX_THEMES) {
    for (const token of [...REPORTED_TOKENS, ...EXTRA_REQUIRED]) {
      assert.ok(theme.tokens[token], `${theme.id} is missing ${token}`)
    }
  }
})

test('token values are non-empty CSS colors or transparent', () => {
  for (const theme of GRUVBOX_THEMES) {
    for (const [token, value] of Object.entries(theme.tokens)) {
      assert.equal(typeof value, 'string', `${theme.id} ${token}`)
      assert.ok(value.length > 0, `${theme.id} ${token} is empty`)
      assert.match(value, /^(#[0-9a-f]{6,8}|transparent)$/u, `${theme.id} ${token} = ${value}`)
    }
  }
})

test('text and state colors stay legible on every theme', () => {
  for (const theme of GRUVBOX_THEMES) {
    const t = theme.tokens
    const base = t['--dsw-alias-bg-base'] as `#${string}`
    const layer1 = t['--dsw-alias-bg-layer-1'] as `#${string}`
    const primary = t['--dsw-alias-label-primary'] as `#${string}`
    const secondary = t['--dsw-alias-label-secondary'] as `#${string}`
    const tertiary = t['--dsw-alias-label-tertiary'] as `#${string}`
    const accent = t['--dsw-alias-brand-primary'] as `#${string}`

    assert.ok(contrastRatio(primary, base) >= 7, `${theme.id} primary/base`)
    assert.ok(contrastRatio(secondary, base) >= 5, `${theme.id} secondary/base`)
    assert.ok(contrastRatio(tertiary, base) >= 3, `${theme.id} tertiary/base`)
    assert.ok(contrastRatio(primary, layer1) >= 5, `${theme.id} primary/layer1`)
    assert.ok(contrastRatio(secondary, layer1) >= 4.5, `${theme.id} secondary/layer1`)
    assert.ok(contrastRatio(accent, base) >= 3, `${theme.id} accent/base`)

    for (const state of ['success', 'warn', 'error'] as const) {
      const color = t[`--dsw-alias-state-${state}-primary`] as `#${string}`
      // State colors are used as fills and indicators as well as text; the
      // readable label tokens above carry the stricter guarantee.
      assert.ok(contrastRatio(color, base) >= 3, `${theme.id} ${state}/base`)
      assert.ok(contrastRatio(color, layer1) >= 2.5, `${theme.id} ${state}/layer1`)
    }

    const inverted = t['--dsw-alias-label-primary-inverted'] as `#${string}`
    const fill = t['--dsw-alias-button-primary-fill'] as `#${string}`
    assert.ok(contrastRatio(inverted, fill) >= 3, `${theme.id} inverted label on primary button`)

    const warnLabel = t['--dsw-alias-state-warn-label'] as `#${string}`
    const warn = t['--dsw-alias-state-warn-primary'] as `#${string}`
    assert.ok(contrastRatio(warnLabel, base) >= 4.5, `${theme.id} warn label on base`)
    assert.ok(contrastRatio(warn, base) >= 3, `${theme.id} warn fill on base`)
  }
})

test('the picker preview points at the theme itself', () => {
  for (const theme of GRUVBOX_THEMES) {
    assert.equal(theme.preview.base, theme.tokens['--dsw-alias-bg-base'])
    assert.equal(theme.preview.surface, theme.tokens['--dsw-alias-bg-layer-1'])
    assert.equal(theme.preview.sidebar, theme.tokens['--dsw-specific-sidebar-fill'])
    assert.equal(theme.preview.accent, theme.tokens['--dsw-alias-brand-primary'])
    assert.equal(theme.preview.text, theme.tokens['--dsw-alias-label-primary'])
    assert.equal(theme.preview.swatches.length, 4)
  }
})
