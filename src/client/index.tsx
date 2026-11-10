/**
 * Client half of `deepseek-gruvbox-themes`.
 *
 * The plugin does not register third-party theme ids: the host theme schema
 * only persists `light`/`dark`/`system`, and adopting a third-party id would be
 * reverted by the theme service's own settings reconciliation. Instead the
 * selection picks one of those three base preferences and stacks a token layer
 * through `ctx.theme.overrideTokens`. With `followSystem`, the host keeps the
 * `system` preference and switches schemes itself, while the layer already
 * carries both palettes — so automatic light/dark needs no media listener here.
 *
 * The selection is read from and written to the profile settings document via
 * `ctx.configForms`, the documented client-side settings transport. It survives
 * a restart without browser storage or direct profile-file edits.
 */
import type { ComponentType } from 'react'
import {
  BOOT_GLOBAL,
  DEFAULT_SELECTION,
  ENTRY_ID,
  isBuiltInPreference,
  isConfigTheme,
  normalizeSelection,
  resolveOverride,
} from '../shared/selection.ts'
import type { BuiltInPreference, ConfigTheme, SelectionConfig } from '../shared/selection.ts'
import { DICTIONARIES, SETTINGS_NS } from './locales.ts'
import { makePickerRow } from './row.tsx'
import type { PickerRowProps, Translate } from './row.tsx'
import { createPickerStore } from './store.ts'
import type { PickerStatus } from './store.ts'
import { PICKER_CSS } from './styles.ts'

/** Theme snapshot fields this plugin reads. */
interface ThemeSnapshot {
  preference: string
  active: { id: string; colorScheme: 'light' | 'dark'; tokens: Record<string, string> }
}

/** The theme extension point documented by `@deepseek-ai/dsh-client-ui-theme`. */
interface ThemeService {
  getTheme(): ThemeSnapshot
  setTheme(id: string): void
  overrideTokens(
    source: string,
    tokens: Record<string, { light: string; dark: string }>,
  ): () => void
}

/** One slot entry registration. */
interface SlotRegistry {
  inject(name: string, factory: () => unknown): () => void
  register(entry: Record<string, unknown>, component: ComponentType<PickerRowProps>): unknown
}

/** Locale service face used by the row. */
interface LocaleService {
  register(namespace: string, dictionaries: Record<string, Record<string, string>>): () => void
  bind(namespace: string): Translate
}

/** One settings form snapshot. */
interface FormSnapshot {
  status: string
  value: unknown
  writable: boolean
}

/** One settings form write. */
interface ConfigForm {
  getSnapshot(): FormSnapshot
  subscribe(listener: () => void): () => void
  set(field: string, value: unknown): Promise<boolean>
  mutate?(ops: readonly { op: 'set'; path: string[]; value: unknown }[]): Promise<boolean>
}

/** The settings transport service (`ctx.configForms`). */
interface ConfigFormsService {
  get(namespace: string): ConfigForm
}

/** The browser context surface this plugin uses. */
interface ClientContext {
  effect(callback: () => (() => void) | void, label?: string): void
  on(event: string, listener: (payload: unknown) => void): () => void
  get(name: string): unknown
  theme: ThemeService
  slots: SlotRegistry
  locale: LocaleService
}

/** Services required before `apply` runs. */
export const inject = ['theme', 'slots', 'locale'] as const

/** Read the Host-injected selection, if the page carries one. */
function readBootSelection(): SelectionConfig | null {
  const raw = (globalThis as Record<string, unknown>)[BOOT_GLOBAL]
  if (typeof raw !== 'object' || raw === null) return null
  return normalizeSelection(raw)
}

/** Map a persistence result to the row's status text. */
function statusAfterWrite(accepted: boolean): PickerStatus {
  return accepted ? 'saved' : 'failed'
}

/**
 * Mount the override layer, the saved selection, and the picker row.
 *
 * @param ctx - Client plugin context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = ENTRY_ID
    style.textContent = PICKER_CSS
    document.head.append(style)
    return () => {
      style.remove()
    }
  }, 'gruvbox-themes: picker styles')

  ctx.effect(
    () => ctx.locale.register(SETTINGS_NS, DICTIONARIES),
    'gruvbox-themes: picker locale',
  )

  const configForms = ctx.get('configForms') as ConfigFormsService | undefined
  let form: ConfigForm | undefined
  try {
    form = configForms?.get(ENTRY_ID)
  } catch {
    form = undefined
  }

  const initial = readBootSelection() ?? DEFAULT_SELECTION
  const store = createPickerStore({
    theme: initial.theme,
    followSystem: initial.followSystem,
    activeId: null,
    status: form === undefined ? 'unavailable' : 'idle',
    writable: false,
    ready: false,
  })

  /** The base preference the active override requires, or `null` without one. */
  let desiredPreference: BuiltInPreference | null = null
  /** The disposer of the active override layer; replaced on every apply. */
  let override: (() => void) | undefined
  /** Suppresses our own `theme/change` events while applying. */
  let applying = false

  const removeOverride = (): void => {
    override?.()
    override = undefined
  }

  ctx.effect(
    () => () => {
      removeOverride()
    },
    'gruvbox-themes: remove override on unload',
  )

  const applySelection = (selection: SelectionConfig): void => {
    const resolved = resolveOverride(selection.theme, selection.followSystem)
    if (resolved === null) {
      removeOverride()
      desiredPreference = null
      store.update({ activeId: null })
      return
    }
    applying = true
    try {
      if (ctx.theme.getTheme().preference !== resolved.preference) {
        ctx.theme.setTheme(resolved.preference)
      }
      override = ctx.theme.overrideTokens(ENTRY_ID, resolved.modes)
      desiredPreference = resolved.preference
    } catch {
      store.update({ status: 'failed' })
      return
    } finally {
      applying = false
    }
    store.update({ activeId: selection.theme === 'default' ? null : selection.theme })
  }

  const persist = async (patch: Partial<SelectionConfig>): Promise<void> => {
    if (form === undefined) {
      store.update({ status: 'unavailable' })
      return
    }
    const snapshot = form.getSnapshot()
    if (snapshot.status === 'unavailable') {
      store.update({ status: 'unavailable' })
      return
    }
    if (snapshot.status !== 'ready') {
      store.update({ status: 'pending' })
      return
    }
    if (!snapshot.writable) {
      store.update({ status: 'readonly' })
      return
    }
    const ops = (Object.entries(patch) as [keyof SelectionConfig, unknown][])
      .filter(([, value]) => value !== undefined)
      .map(([field, value]) => ({ op: 'set' as const, path: [field], value }))
    if (ops.length === 0) return
    store.update({ status: 'saving' })
    try {
      const accepted = form.mutate !== undefined
        ? await form.mutate(ops)
        : await (async () => {
            let ok = true
            for (const op of ops) ok = (await form!.set(op.path[0] as string, op.value)) && ok
            return ok
          })()
      store.update({ status: statusAfterWrite(accepted) })
    } catch {
      store.update({ status: 'failed' })
    }
  }

  const relinquish = (): void => {
    removeOverride()
    desiredPreference = null
    store.update({ theme: 'default', followSystem: false, activeId: null, status: 'idle' })
    void persist({ theme: 'default', followSystem: false })
  }

  const select = (theme: ConfigTheme): void => {
    if (!isConfigTheme(theme)) return
    if (theme === store.getSnapshot().theme) return
    const followSystem = store.getSnapshot().followSystem
    store.update({ theme, status: 'idle' })
    applySelection({ theme, followSystem })
    void persist({ theme })
  }

  const follow = (value: boolean): void => {
    const current = store.getSnapshot()
    if (current.theme === 'default' || current.followSystem === value) return
    store.update({ followSystem: value, status: 'idle' })
    applySelection({ theme: current.theme, followSystem: value })
    void persist({ followSystem: value })
  }

  const reset = (): void => {
    removeOverride()
    desiredPreference = null
    store.update({ theme: 'default', followSystem: false, activeId: null, status: 'idle' })
    void persist({ theme: 'default', followSystem: false })
  }

  const adoptForm = (): void => {
    if (form === undefined) return
    const snapshot = form.getSnapshot()
    store.update({ writable: snapshot.writable })
    if (snapshot.status === 'unavailable') {
      store.update({ status: 'unavailable' })
      return
    }
    if (snapshot.status !== 'ready' || snapshot.value === undefined) return
    const next = normalizeSelection(snapshot.value)
    store.update({ ready: true })
    const current = store.getSnapshot()
    if (next.theme !== current.theme || next.followSystem !== current.followSystem) {
      store.update({ theme: next.theme, followSystem: next.followSystem })
      applySelection(next)
    }
  }

  ctx.effect(() => ctx.on('theme/change', (payload) => {
    if (applying) return
    const preference = (payload as ThemeSnapshot).preference
    if (desiredPreference === null) return
    if (preference === desiredPreference) return
    // The base preference no longer matches the layer we installed: the user
    // picked another Appearance value (or another theme plugin took over).
    // Drop our override and let the built-in theme own the application.
    if (isBuiltInPreference(preference)) {
      relinquish()
      return
    }
    removeOverride()
    desiredPreference = null
    store.update({ activeId: null })
  }), 'gruvbox-themes: external theme changes')

  if (form !== undefined) {
    const initialSnapshot = form.getSnapshot()
    if (initialSnapshot.status === 'unavailable') store.update({ status: 'unavailable' })
    store.update({ writable: initialSnapshot.writable })
  }

  applySelection(initial)

  if (form !== undefined) {
    ctx.effect(() => form!.subscribe(adoptForm), 'gruvbox-themes: settings adoption')
    adoptForm()
  }

  const translate = ctx.locale.bind(SETTINGS_NS)
  const Row = makePickerRow({
    store,
    actions: { select, follow, reset },
    translate,
  })
  ctx.slots.inject('settings.general.item', () => ctx.slots.register(
    {
      name: 'settings.general.item',
      id: 'gruvbox-themes',
      order: 11.5,
      locale: SETTINGS_NS,
    },
    Row,
  ))
}
