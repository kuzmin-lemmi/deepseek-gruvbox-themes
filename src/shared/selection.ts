/**
 * Selection model shared by both halves of the plugin and by the picker.
 *
 * The Host owns the durable value (its Config), the Client renders and writes
 * it through `ctx.configForms`, and the boot script carries it into the page
 * before any plugin loads. Keeping the rules here means the Host and the
 * Client cannot disagree about what a stored value means.
 */
import { THEME_IDS, THEMES_BY_ID } from './themes.ts'
import type { ThemeFamily, ThemeId } from './themes.ts'

/** A persisted theme choice: one of the seven themes, or the built-in theme. */
export type ConfigTheme = ThemeId | 'default'

/** Values accepted by the Host Config and the picker. */
export const CONFIG_THEME_OPTIONS: readonly ConfigTheme[] = Object.freeze(['default', ...THEME_IDS])

/** Theme applied when the plugin has never been configured. */
export const DEFAULT_THEME: ThemeId = 'gruvbox-dark-medium'

/** Profile entry id; also the settings namespace and package name. */
export const ENTRY_ID = 'deepseek-gruvbox-themes'

/** Durable selection shape stored in the `deepseek-gruvbox-themes` entry. */
export interface SelectionConfig {
  theme: ConfigTheme
  followSystem: boolean
}

/** Defaults used by the Host schema and the Client fallback. */
export const DEFAULT_SELECTION: Readonly<SelectionConfig> = Object.freeze({
  theme: DEFAULT_THEME,
  followSystem: false,
})

/** Built-in theme preferences owned by `ui-theme`. */
export type BuiltInPreference = 'light' | 'dark' | 'system'

/** Per-token light/dark values for one override layer. */
export type TokenModes = Record<string, { light: string; dark: string }>

/** The base preference and the token layer a selection asks for. */
export interface ResolvedOverride {
  preference: BuiltInPreference
  modes: TokenModes
}

/** Repeat one token map into both scheme slots. */
function fixedModes(tokens: Readonly<Record<string, string>>): TokenModes {
  return Object.fromEntries(
    Object.entries(tokens).map(([name, value]) => [name, { light: value, dark: value }]),
  )
}

/**
 * Resolve a selection into the built-in base preference plus the token layer
 * that should sit on top of it.
 *
 * Working through `overrideTokens` instead of registering third-party theme
 * ids keeps the durable preference inside the built-in `light`/`dark`/`system`
 * schema: the host keeps owning the base scheme, and our layer only replaces
 * colors. With `followSystem`, the `system` preference makes the host switch
 * schemes and our layer already carries both palettes, so no media listener is
 * needed on the client.
 *
 * @param theme - the persisted choice.
 * @param followSystem - whether the OS scheme selects light or dark.
 * @returns the layer to apply, or `null` for the built-in theme.
 */
export function resolveOverride(theme: ConfigTheme, followSystem: boolean): ResolvedOverride | null {
  if (theme === 'default') return null
  const fixed = THEMES_BY_ID[theme]
  if (!followSystem) {
    return { preference: fixed.colorScheme, modes: fixedModes(fixed.tokens) }
  }
  if (fixed.family === 'whale') {
    return { preference: 'dark', modes: fixedModes(fixed.tokens) }
  }
  const light = THEMES_BY_ID[`gruvbox-light-${fixed.family}` as ThemeId]
  const dark = THEMES_BY_ID[`gruvbox-dark-${fixed.family}` as ThemeId]
  const modes: TokenModes = {}
  for (const [name, value] of Object.entries(dark.tokens)) {
    modes[name] = { light: light.tokens[name] ?? value, dark: value }
  }
  return { preference: 'system', modes }
}

/** Built-in theme preferences owned by `ui-theme`. */
export function isBuiltInPreference(value: unknown): value is BuiltInPreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

/**
 * The value stored in the `ui-theme` settings namespace, read from an unknown
 * settings section.
 *
 * @param value - the `ui-theme` form value.
 * @returns the durable built-in preference, or `null` while unknown.
 */
export function readBuiltInPreference(value: unknown): BuiltInPreference | null {
  if (typeof value !== 'object' || value === null) return null
  const preference = (value as Record<string, unknown>).preference
  return isBuiltInPreference(preference) ? preference : null
}
/** Whether a value is one of this plugin's registered theme ids. */
export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value)
}

/** Whether a value can be persisted as the theme choice. */
export function isConfigTheme(value: unknown): value is ConfigTheme {
  return value === 'default' || isThemeId(value)
}

/** The family a theme belongs to; Whale has no light counterpart. */
export function familyOf(id: ThemeId): ThemeFamily {
  return THEMES_BY_ID[id].family
}

/**
 * Resolve the theme id that should be active right now.
 *
 * `default` means "leave the built-in theme alone". With `followSystem`, the
 * requested family decides the scheme; Whale stays dark because it has no
 * light counterpart.
 *
 * @param theme - the persisted choice.
 * @param followSystem - whether to follow the OS color scheme.
 * @param scheme - the OS color scheme.
 * @returns a registered theme id, or `null` for the built-in theme.
 */
export function resolveThemeId(
  theme: ConfigTheme,
  followSystem: boolean,
  scheme: 'light' | 'dark',
): ThemeId | null {
  if (theme === 'default') return null
  if (!followSystem) return theme
  const family = familyOf(theme)
  if (family === 'whale') return 'gruvbox-whale'
  return `gruvbox-${scheme}-${family}` as ThemeId
}

/**
 * Narrow untrusted settings or boot data to a selection.
 *
 * Unknown themes and non-boolean flags fall back to the defaults instead of
 * throwing: a plugin update may remove a theme while an old value is still on
 * disk.
 *
 * @param value - raw settings section or boot payload.
 * @returns a complete, valid selection.
 */
export function normalizeSelection(value: unknown): SelectionConfig {
  const record = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  const theme = isConfigTheme(record.theme) ? record.theme : DEFAULT_SELECTION.theme
  const followSystem = typeof record.followSystem === 'boolean' ? record.followSystem : DEFAULT_SELECTION.followSystem
  return { theme, followSystem }
}

/** The global the Host boot script writes before any client plugin runs. */
export const BOOT_GLOBAL = '__DSH_GRUVBOX_THEMES__'

/** Version of the boot payload; a future shape can migrate. */
export const BOOT_VERSION = 1

/** Payload the Host embeds into the page. */
export interface BootPayload extends SelectionConfig {
  version: typeof BOOT_VERSION
}
