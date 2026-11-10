/**
 * Host half of `deepseek-gruvbox-themes`.
 *
 * It owns the durable selection in the profile settings document, paints the
 * first frame before any client plugin runs, and exposes the same operation
 * to the agent as the `gruvbox_theme` tool.
 */
import z from '@deepseek-ai/schemastery'
import { buildBootRows } from '../shared/boot.ts'
import {
  CONFIG_THEME_OPTIONS,
  DEFAULT_SELECTION,
  ENTRY_ID,
  isConfigTheme,
} from '../shared/selection.ts'
import type { ConfigTheme } from '../shared/selection.ts'
import { GRUVBOX_THEMES } from '../shared/themes.ts'
import { resolveDescriptor } from './settings.ts'
import type { SettingsService } from './settings.ts'
import { normalizeToolPatch } from './tool-patch.ts'

/** Profile entry id; the settings namespace is the same string. */
export const PACKAGE_NAME = ENTRY_ID

/** Durable configuration: the chosen theme and the follow-system flag. */
export const Config = z.object({
  theme: z
    .union([...CONFIG_THEME_OPTIONS])
    .default(DEFAULT_SELECTION.theme)
    .volatile(),
  followSystem: z.boolean().default(DEFAULT_SELECTION.followSystem).volatile(),
})

/** A structured index-injection row. */
interface InjectRow {
  kind: 'style' | 'script'
  placement?: 'body'
  text: string
}

/** The part of the Host context this plugin uses. */
interface HostContext {
  fiber?: { entry?: { id?: string; options?: { id?: string } } }
  get(name: string): unknown
  on(event: string, listener: (...args: unknown[]) => void): () => void
  effect(callback: () => (() => void) | void, label?: string): void
}

/** A volatile Config field. */
interface Volatile<T> {
  get(): T
}

/** The validated Host configuration. */
interface HostConfig {
  theme: Volatile<unknown>
  followSystem: Volatile<unknown>
}

/** Tool definition shape accepted by `ctx.tools.register`. */
interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
  output: {
    schema: Record<string, unknown>
    render(args: unknown, value: JsonRecord): { type: 'text'; text: string }[]
  }
  execute(args: unknown): Promise<JsonRecord>
}

type JsonRecord = Record<string, unknown>

/** Read the persisted theme from a live descriptor. */
function readTheme(value: unknown): ConfigTheme | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const theme = (value as JsonRecord).theme
  return isConfigTheme(theme) ? theme : undefined
}

/** Build the tool that shares the settings operation with the agent. */
function createThemeTool(ctx: HostContext, settings: SettingsService): ToolDefinition {
  const fail = (message: string): JsonRecord => ({ ok: false, message })
  return {
    name: 'gruvbox_theme',
    description:
      'Read or change the DeepSeek Harness color theme among the seven installed Gruvbox themes. The selection is saved in the profile settings, applies to connected Web clients immediately, and survives restart. Use action "status" to read it, "list" to see themes, "set" to choose one, and "reset" to return to the built-in theme.',
    parameters: {
      action: {
        type: 'string',
        required: true,
        enum: ['status', 'list', 'set', 'reset'],
        description: 'status reads the saved choice; list returns the installed themes; set chooses a theme; reset returns to the built-in theme.',
      },
      theme: {
        type: 'string',
        enum: [...CONFIG_THEME_OPTIONS],
        description: 'Theme id for action "set". "default" restores the built-in theme and clears follow-system.',
      },
      followSystem: {
        type: 'boolean',
        description: 'When true, the light or dark member of the chosen family follows the operating system scheme. Whale stays dark.',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        required: ['ok', 'message'],
        properties: {
          ok: { type: 'boolean' },
          message: { type: 'string' },
          namespace: { type: 'string' },
          theme: { type: 'string' },
          followSystem: { type: 'boolean' },
          themes: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['id', 'name', 'colorScheme', 'family'],
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                colorScheme: { type: 'string' },
                family: { type: 'string' },
              },
            },
          },
        },
      },
      render: (_args, value) => [{ type: 'text', text: String(value.message ?? '') }],
    },
    async execute(args: unknown): Promise<JsonRecord> {
      const input = typeof args === 'object' && args !== null ? (args as JsonRecord) : {}
      const action = typeof input.action === 'string' ? input.action : 'status'
      const descriptor = resolveDescriptor(ctx.fiber, settings)

      if (descriptor === undefined) {
        return fail(
          `The "${PACKAGE_NAME}" settings entry is not served by this profile, so the theme cannot be saved.`,
        )
      }
      const namespace = descriptor.ns

      if (action === 'status') {
        return {
          ok: true,
          message: `Theme: ${String(readTheme(descriptor.value) ?? 'unknown')}; follow system: ${String((descriptor.value as JsonRecord | undefined)?.followSystem ?? false)}.`,
          namespace,
          theme: String(readTheme(descriptor.value) ?? ''),
          followSystem: Boolean((descriptor.value as JsonRecord | undefined)?.followSystem),
        }
      }

      if (action === 'list') {
        return {
          ok: true,
          message: GRUVBOX_THEMES.map((theme) => `${theme.id} (${theme.name})`).join(', '),
          namespace,
          themes: GRUVBOX_THEMES.map((theme) => ({
            id: theme.id,
            name: theme.name,
            colorScheme: theme.colorScheme,
            family: theme.family,
          })),
        }
      }

      if (action !== 'set' && action !== 'reset') {
        return fail(`Unknown action "${action}". Use status, list, set, or reset.`)
      }

      const normalized = normalizeToolPatch(action, input)
      if (!normalized.ok) return fail(normalized.message)
      const patch = normalized.patch

      try {
        await settings.update(namespace, { ...patch }, descriptor.revision)
      } catch (error) {
        return fail(
          `The theme was not saved: ${error instanceof Error ? error.message : String(error)}`,
        )
      }

      const updated = resolveDescriptor(ctx.fiber, settings)?.value as JsonRecord | undefined
      const theme = readTheme(updated) ?? patch.theme
      const followSystem = Boolean(updated?.followSystem ?? patch.followSystem)
      return {
        ok: true,
        message: theme === 'default'
          ? 'Restored the built-in theme.'
          : `Applied ${theme}${followSystem ? ' (following the system scheme)' : ''}; the choice is saved in the profile settings.`,
        namespace,
        theme,
        followSystem,
      }
    },
  }
}

/**
 * Register the settings page policy, first-paint injection, and the agent tool.
 *
 * Both services are read with `ctx.get` so the plugin still paints the page in
 * a composition without the tool registry or the settings service.
 *
 * @param ctx - Host plugin context.
 * @param config - validated volatile configuration.
 */
export function apply(ctx: HostContext, config: HostConfig): void {
  const settings = ctx.get('settings') as SettingsService | undefined
  if (settings !== undefined) {
    ctx.effect(
      () => settings.configure({ auto: false }, ctx.fiber),
      'gruvbox-themes: settings page policy',
    )
  }

  ctx.on('webserver/index-inject', (...args: unknown[]) => {
    const table = args[0] as InjectRow[] | undefined
    if (!Array.isArray(table)) return
    const theme = config.theme.get()
    const followSystem = config.followSystem.get() === true
    if (!isConfigTheme(theme)) return
    table.push(...buildBootRows(theme, followSystem))
  })

  const tools = ctx.get('tools') as { register(definition: ToolDefinition): () => void } | undefined
  if (tools !== undefined && settings !== undefined) {
    ctx.effect(() => {
      try {
        return tools.register(createThemeTool(ctx, settings))
      } catch (error) {
        // The picker keeps working without the tool; report the regression
        // instead of taking the whole plugin down.
        console.error('deepseek-gruvbox-themes: could not register gruvbox_theme', error)
        return () => {}
      }
    }, 'gruvbox-themes: theme tool')
  }
}
