import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveDescriptor } from '../src/host/settings.ts'
import { normalizeToolPatch } from '../src/host/tool-patch.ts'

/** A settings service stub that only answers `describe`. */
function settingsWith(...descriptors: ReturnType<typeof descriptor>[]) {
  return { describe: () => descriptors }
}

/** One settings descriptor. */
function descriptor(ns: string, value: unknown, revision = 1) {
  return { ns, value, revision }
}

const OUR_ENTRY = 'deepseek-gruvbox-themes'
const OURS = descriptor(OUR_ENTRY, { theme: 'gruvbox-whale', followSystem: false }, 7)
const FOREIGN = descriptor('another-theme-plugin', { theme: 'gruvbox-dark-medium', followSystem: true }, 3)

test('resolution picks this plugin by entry id, not by a matching value shape', () => {
  const resolved = resolveDescriptor({ entry: { id: OUR_ENTRY } }, settingsWith(FOREIGN, OURS))
  assert.equal(resolved, OURS)
})

test('a same-shaped section from another plugin is never selected when ours is absent', () => {
  const resolved = resolveDescriptor({ entry: { id: OUR_ENTRY } }, settingsWith(FOREIGN))
  assert.equal(resolved, undefined)
})

test('resolution strips the Loader include prefix', () => {
  const resolved = resolveDescriptor(
    { entry: { id: `include:${OUR_ENTRY}` } },
    settingsWith(OURS),
  )
  assert.equal(resolved, OURS)
})

test('resolution falls back to the package namespace without a fiber', () => {
  const resolved = resolveDescriptor(undefined, settingsWith(FOREIGN, OURS))
  assert.equal(resolved, OURS)
})

test('the default theme clears a stale follow-system flag', () => {
  assert.deepEqual(normalizeToolPatch('set', { theme: 'default', followSystem: true }), {
    ok: true,
    patch: { theme: 'default', followSystem: false },
  })
  assert.deepEqual(normalizeToolPatch('set', { theme: 'default' }), {
    ok: true,
    patch: { theme: 'default', followSystem: false },
  })
})

test('set keeps an explicit follow flag for a real theme', () => {
  assert.deepEqual(normalizeToolPatch('set', { theme: 'gruvbox-light-soft', followSystem: true }), {
    ok: true,
    patch: { theme: 'gruvbox-light-soft', followSystem: true },
  })
})

test('set omits followSystem when the caller did not supply it', () => {
  assert.deepEqual(normalizeToolPatch('set', { theme: 'gruvbox-dark-hard' }), {
    ok: true,
    patch: { theme: 'gruvbox-dark-hard' },
  })
})

test('reset clears both fields', () => {
  assert.deepEqual(normalizeToolPatch('reset', {}), {
    ok: true,
    patch: { theme: 'default', followSystem: false },
  })
})

test('invalid themes and actions are rejected', () => {
  const invalid = normalizeToolPatch('set', { theme: 'nord' })
  assert.equal(invalid.ok, false)
  if (!invalid.ok) assert.match(invalid.message, /must be one of/u)

  const unknown = normalizeToolPatch('toggle', {})
  assert.equal(unknown.ok, false)
  if (!unknown.ok) assert.match(unknown.message, /Unknown action/u)
})
