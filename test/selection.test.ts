import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CONFIG_THEME_OPTIONS,
  DEFAULT_SELECTION,
  isConfigTheme,
  isThemeId,
  normalizeSelection,
  readBuiltInPreference,
  resolveOverride,
  resolveThemeId,
  shouldRelinquish,
} from '../src/shared/selection.ts'

test('the default selection is the first working dark theme', () => {
  assert.deepEqual(DEFAULT_SELECTION, { theme: 'gruvbox-dark-medium', followSystem: false })
  assert.equal(CONFIG_THEME_OPTIONS.length, 8)
  assert.equal(CONFIG_THEME_OPTIONS[0], 'default')
})

test('isThemeId accepts only registered ids', () => {
  assert.equal(isThemeId('gruvbox-whale'), true)
  assert.equal(isThemeId('gruvbox-dark-medium'), true)
  assert.equal(isThemeId('default'), false)
  assert.equal(isThemeId('nord'), false)
  assert.equal(isThemeId(42), false)
  assert.equal(isConfigTheme('default'), true)
  assert.equal(isConfigTheme('gruvbox-light-soft'), true)
  assert.equal(isConfigTheme(''), false)
})

test('a fixed choice does not follow the system scheme', () => {
  assert.equal(resolveThemeId('gruvbox-dark-hard', false, 'light'), 'gruvbox-dark-hard')
  assert.equal(resolveThemeId('gruvbox-light-soft', false, 'dark'), 'gruvbox-light-soft')
})

test('follow-system picks the same family in the system scheme', () => {
  assert.equal(resolveThemeId('gruvbox-dark-medium', true, 'light'), 'gruvbox-light-medium')
  assert.equal(resolveThemeId('gruvbox-light-medium', true, 'dark'), 'gruvbox-dark-medium')
  assert.equal(resolveThemeId('gruvbox-dark-hard', true, 'light'), 'gruvbox-light-hard')
  assert.equal(resolveThemeId('gruvbox-light-soft', true, 'dark'), 'gruvbox-dark-soft')
})

test('Whale has no light counterpart and stays dark', () => {
  assert.equal(resolveThemeId('gruvbox-whale', true, 'light'), 'gruvbox-whale')
  assert.equal(resolveThemeId('gruvbox-whale', true, 'dark'), 'gruvbox-whale')
})

test('the built-in theme is not overridden', () => {
  assert.equal(resolveThemeId('default', false, 'light'), null)
  assert.equal(resolveThemeId('default', true, 'dark'), null)
})

test('normalizeSelection repairs stale or malformed values', () => {
  assert.deepEqual(normalizeSelection(null), DEFAULT_SELECTION)
  assert.deepEqual(normalizeSelection({ theme: 'nord', followSystem: 'yes' }), DEFAULT_SELECTION)
  assert.deepEqual(normalizeSelection({ theme: 'gruvbox-whale', followSystem: true }), {
    theme: 'gruvbox-whale',
    followSystem: true,
  })
  assert.deepEqual(normalizeSelection({ theme: 'default' }), { theme: 'default', followSystem: false })
})

test('a fixed theme forces its own scheme and repeats the palette in both slots', () => {
  const resolved = resolveOverride('gruvbox-dark-medium', false)
  assert.ok(resolved)
  assert.equal(resolved.preference, 'dark')
  assert.deepEqual(resolved.modes['--dsw-alias-bg-base'], {
    light: '#282828',
    dark: '#282828',
  })

  const light = resolveOverride('gruvbox-light-hard', false)
  assert.ok(light)
  assert.equal(light.preference, 'light')
  assert.deepEqual(light.modes['--dsw-alias-bg-base'], {
    light: '#f9f5d7',
    dark: '#f9f5d7',
  })
})

test('follow-system builds one two-palette layer over the system preference', () => {
  const resolved = resolveOverride('gruvbox-light-soft', true)
  assert.ok(resolved)
  assert.equal(resolved.preference, 'system')
  assert.deepEqual(resolved.modes['--dsw-alias-bg-base'], {
    light: '#f2e5bc',
    dark: '#32302f',
  })
  assert.deepEqual(resolved.modes['--dsw-alias-state-error-primary'], {
    light: '#9d0006',
    dark: '#fb4934',
  })
  assert.ok(Object.keys(resolved.modes).length > 100)
})

test('every override token carries two string values', () => {
  for (const theme of ['gruvbox-dark-hard', 'gruvbox-light-hard', 'gruvbox-whale'] as const) {
    const resolved = resolveOverride(theme, true)
    assert.ok(resolved)
    for (const [name, modes] of Object.entries(resolved.modes)) {
      assert.equal(typeof modes.light, 'string', `${theme} ${name} light`)
      assert.equal(typeof modes.dark, 'string', `${theme} ${name} dark`)
      assert.ok(modes.light.length > 0)
      assert.ok(modes.dark.length > 0)
    }
  }
})

test('Whale forces a dark base even while following the system', () => {
  const resolved = resolveOverride('gruvbox-whale', true)
  assert.ok(resolved)
  assert.equal(resolved.preference, 'dark')
  assert.deepEqual(resolved.modes['--dsw-alias-brand-primary'], {
    light: '#83a598',
    dark: '#83a598',
  })
})

test('the standard theme installs no override', () => {
  assert.equal(resolveOverride('default', false), null)
  assert.equal(resolveOverride('default', true), null)
})

test('readBuiltInPreference narrows a settings section', () => {
  assert.equal(readBuiltInPreference({ preference: 'dark' }), 'dark')
  assert.equal(readBuiltInPreference({ preference: 'light' }), 'light')
  assert.equal(readBuiltInPreference({ preference: 'system' }), 'system')
  assert.equal(readBuiltInPreference({ preference: 'nord' }), null)
  assert.equal(readBuiltInPreference({}), null)
  assert.equal(readBuiltInPreference(null), null)
})

test('only a different built-in preference relinquishes the Gruvbox layer', () => {
  assert.equal(shouldRelinquish('dark', 'light'), true)
  assert.equal(shouldRelinquish('light', 'system'), true)
  assert.equal(shouldRelinquish('system', 'dark'), true)
  assert.equal(shouldRelinquish('dark', 'dark'), false)
  assert.equal(shouldRelinquish('system', 'system'), false)
  assert.equal(shouldRelinquish('dark', 'gruvbox-whale'), false)
  assert.equal(shouldRelinquish(null, 'light'), false)
})
