/**
 * Pre-plugin palette injection.
 *
 * The Host appends these rows to `webserver/index-inject`. They run after the
 * built-in theme bootstrap, so the first paint already uses the selected
 * Gruvbox background and the native `color-scheme`, and the Client can read
 * the saved choice without waiting for the settings RPC.
 */
import { BOOT_GLOBAL, BOOT_VERSION, resolveThemeId } from './selection.ts'
import type { ConfigTheme } from './selection.ts'
import { THEMES_BY_ID } from './themes.ts'

/** One structured index row the web server renders into the page. */
export interface BootRow {
  kind: 'style' | 'script'
  placement?: 'body'
  text: string
}

/**
 * Build the style and script rows for one saved selection.
 *
 * The payload script is always emitted, including for the built-in theme, so
 * the Client can tell "the user reset to the standard theme" apart from "no
 * saved selection". Only a real Gruvbox choice adds the color style.
 *
 * @param theme - the persisted choice.
 * @param followSystem - whether the OS scheme selects light or dark.
 * @returns rows in execution order.
 */
export function buildBootRows(theme: ConfigTheme, followSystem: boolean): BootRow[] {
  const payload = JSON.stringify({
    version: BOOT_VERSION,
    theme,
    followSystem,
  }).replaceAll('<', '\\u003c')
  const script: BootRow = {
    kind: 'script',
    placement: 'body',
    text: `window.${BOOT_GLOBAL}=${payload};`,
  }
  if (theme === 'default') {
    return [
      {
        ...script,
        text: `${script.text}delete document.documentElement.dataset.gruvboxTheme;`,
      },
    ]
  }
  const resolved = resolveThemeId(theme, followSystem, 'dark')
  if (resolved === null) return [script]
  const fixed = THEMES_BY_ID[resolved]
  const style = followSystem && fixed.family !== 'whale'
    ? (() => {
        const light = THEMES_BY_ID[resolveThemeId(theme, true, 'light') ?? resolved]
        return `:root{color-scheme:light dark}body{background-color:${light.preview.base};--dsh-boot-bg:${light.preview.base}}@media(prefers-color-scheme:dark){body{background-color:${fixed.preview.base};--dsh-boot-bg:${fixed.preview.base}}}`
      })()
    : `:root{color-scheme:${fixed.colorScheme}}body{background-color:${fixed.preview.base};--dsh-boot-bg:${fixed.preview.base}}`

  return [
    { kind: 'style', text: style },
    {
      ...script,
      text: `${script.text}document.documentElement.dataset.gruvboxTheme=${JSON.stringify(fixed.id)};`,
    },
  ]
}
