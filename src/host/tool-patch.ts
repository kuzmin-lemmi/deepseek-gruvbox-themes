/**
 * Normalize the agent tool's arguments into a settings patch.
 *
 * Kept separate from the tool definition so the rules are unit-testable
 * without a Host context: in particular, choosing the built-in theme must
 * clear `followSystem` instead of leaving a stale true behind.
 */
import { CONFIG_THEME_OPTIONS, isConfigTheme } from '../shared/selection.ts'
import type { ConfigTheme } from '../shared/selection.ts'

/** A settings patch accepted by `settings.update`. */
export interface ToolPatch {
  theme: ConfigTheme
  followSystem?: boolean
}

/** Result of normalizing one tool call. */
export type ToolPatchResult =
  | { ok: true; patch: ToolPatch }
  | { ok: false; message: string }

/**
 * Turn `action` and the model-supplied fields into one settings patch.
 *
 * @param action - the tool action.
 * @param input - the raw tool arguments.
 * @returns the patch, or a message explaining why the call is invalid.
 */
export function normalizeToolPatch(action: string, input: Record<string, unknown>): ToolPatchResult {
  if (action === 'reset') {
    return { ok: true, patch: { theme: 'default', followSystem: false } }
  }
  if (action !== 'set') {
    return { ok: false, message: `Unknown action "${action}". Use status, list, set, or reset.` }
  }
  const theme = input.theme
  if (!isConfigTheme(theme)) {
    return { ok: false, message: `"theme" must be one of: ${CONFIG_THEME_OPTIONS.join(', ')}.` }
  }
  if (theme === 'default') {
    // The standard theme has no Gruvbox layer, so a lingering follow flag is
    // meaningless and must not be persisted.
    return { ok: true, patch: { theme, followSystem: false } }
  }
  if (typeof input.followSystem === 'boolean') {
    return { ok: true, patch: { theme, followSystem: input.followSystem } }
  }
  return { ok: true, patch: { theme } }
}
