/**
 * A tiny external store for the picker.
 *
 * The row reads it through `useSyncExternalStore`, so the plugin does not need
 * a Client package that may change between Harness releases. Snapshots are
 * replaced on every change, which is exactly what React requires.
 */
import type { ConfigTheme } from '../shared/selection.ts'
import type { ThemeId } from '../shared/themes.ts'

/** Status text the row shows under the grid. */
export type PickerStatus =
  | 'idle'
  | 'saving'
  | 'saved'
  | 'pending'
  | 'failed'
  | 'readonly'
  | 'unavailable'
  | 'standard'
  | 'unsupported'

/** Everything the row renders. */
export interface PickerState {
  theme: ConfigTheme
  followSystem: boolean
  /** The registered theme currently applied, or `null` for the built-in theme. */
  activeId: ThemeId | null
  status: PickerStatus
  writable: boolean
  ready: boolean
}

/** Read/write face of the store. */
export interface PickerStore {
  getSnapshot(): PickerState
  subscribe(listener: () => void): () => void
  update(patch: Partial<PickerState>): void
}

/**
 * Create the store with one immutable initial snapshot.
 *
 * @param initial - starting state.
 * @returns the store.
 */
export function createPickerStore(initial: PickerState): PickerStore {
  let state = Object.freeze({ ...initial })
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    update(patch) {
      const next = Object.freeze({ ...state, ...patch })
      if (
        next.theme === state.theme &&
        next.followSystem === state.followSystem &&
        next.activeId === state.activeId &&
        next.status === state.status &&
        next.writable === state.writable &&
        next.ready === state.ready
      ) {
        return
      }
      state = next
      for (const listener of [...listeners]) listener()
    },
  }
}
