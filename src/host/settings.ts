/**
 * Settings-namespace resolution for the Host half.
 *
 * The namespace is the profile entry id, not a shape of the configuration
 * value: another plugin may legitimately have `theme` and `followSystem`
 * fields, and matching it would write this plugin's selection into that
 * plugin's section.
 */
import { ENTRY_ID } from '../shared/selection.ts'

/** One live settings descriptor, narrowed to what this plugin reads. */
export interface SettingsDescriptor {
  ns: string
  value: unknown
  revision: number
}

/** The part of the Host settings service this plugin uses. */
export interface SettingsService {
  configure(presentation: { auto?: boolean }, owner: unknown): () => void
  describe(): SettingsDescriptor[]
  update(ns: string, patch: Record<string, unknown>, expectedRevision?: number): Promise<void>
}

/** The Loader entry fields this plugin reads. */
export interface EntryLike {
  id?: string
  options?: { id?: string }
}

/** The owning fiber face used for entry identity. */
export interface FiberLike {
  entry?: EntryLike
}

/**
 * Find this plugin's settings namespace by entry identity only.
 *
 * Loader ids can be prefixed (`include:<id>`), so both the full and the
 * stripped id are checked. There is deliberately no value-shape fallback.
 *
 * @param fiber - the plugin's fiber, if the Loader exposes one.
 * @param settings - the settings service (only `describe` is used).
 * @returns this plugin's descriptor, or `undefined` when the entry is absent.
 */
export function resolveDescriptor(
  fiber: FiberLike | undefined,
  settings: Pick<SettingsService, 'describe'>,
): SettingsDescriptor | undefined {
  const descriptors = settings.describe()
  const candidates = new Set<string>([ENTRY_ID])
  const entry = fiber?.entry
  if (typeof entry?.id === 'string' && entry.id.length > 0) candidates.add(entry.id)
  if (typeof entry?.options?.id === 'string' && entry.options.id.length > 0) {
    candidates.add(entry.options.id)
  }
  for (const candidate of candidates) {
    for (const ns of [candidate, candidate.replace(/^include:/u, '')]) {
      const match = descriptors.find((descriptor) => descriptor.ns === ns)
      if (match !== undefined) return match
    }
  }
  return undefined
}
