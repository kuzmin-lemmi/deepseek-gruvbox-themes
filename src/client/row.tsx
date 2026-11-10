/**
 * The Gruvbox picker row.
 *
 * Previews are drawn from each theme's literal colors, so a card stays
 * readable even while the application is wearing another palette. Row chrome
 * uses host tokens only.
 */
import { useSyncExternalStore } from 'react'
import type { ComponentType } from 'react'
import type { ConfigTheme } from '../shared/selection.ts'
import { GRUVBOX_THEMES } from '../shared/themes.ts'
import type { GruvboxTheme } from '../shared/themes.ts'
import type { PickerStore } from './store.ts'

/** Translation function supplied by the locale service. */
export type Translate = (key: string) => string

/** Props the settings slot passes to a row. */
export interface PickerRowProps {
  t?: Translate
}

/** Writes the row can perform. */
export interface PickerRowActions {
  select(theme: ConfigTheme): void
  follow(value: boolean): void
  reset(): void
}

/** Inputs captured by the row component. */
export interface PickerRowOptions {
  store: PickerStore
  actions: PickerRowActions
  translate: Translate
}

/** One preview card. */
function ThemeCard({
  theme,
  selected,
  t,
  onSelect,
}: {
  theme: GruvboxTheme
  selected: boolean
  t: Translate
  onSelect: () => void
}) {
  const preview = theme.preview
  const scheme = theme.family === 'whale'
    ? t('badge.darkOnly')
    : theme.colorScheme === 'light'
      ? t('badge.light')
      : t('badge.dark')
  return (
    <button
      type="button"
      className={`dsh-gruvbox-card${selected ? ' dsh-gruvbox-cardSelected' : ''}`}
      aria-pressed={selected}
      aria-label={`${theme.name}. ${t(theme.descriptionKey)}`}
      onClick={onSelect}
    >
      <span className="dsh-gruvbox-shot" style={{ background: preview.base }}>
        <span className="dsh-gruvbox-shotSide" style={{ background: preview.sidebar }}>
          <i style={{ background: preview.accent }} />
          <i style={{ background: preview.text, opacity: 0.34 }} />
          <i style={{ background: preview.text, opacity: 0.24 }} />
          <i style={{ background: preview.text, opacity: 0.24 }} />
        </span>
        <span className="dsh-gruvbox-shotMain">
          <span className="dsh-gruvbox-shotBar" style={{ background: preview.surface }}>
            <i style={{ background: preview.text, opacity: 0.55 }} />
            <i style={{ background: preview.accent }} />
          </span>
          <span className="dsh-gruvbox-shotLine" style={{ background: preview.text, opacity: 0.74 }} />
          <span
            className="dsh-gruvbox-shotLine dsh-gruvbox-shotLineShort"
            style={{ background: preview.text, opacity: 0.4 }}
          />
          <span className="dsh-gruvbox-shotCode" style={{ background: preview.surface }}>
            <i style={{ background: preview.accent, width: '42%' }} />
            <i style={{ background: preview.text, opacity: 0.5, width: '58%' }} />
            <i style={{ background: preview.text, opacity: 0.32, width: '34%' }} />
          </span>
        </span>
        {selected && (
          <span className="dsh-gruvbox-check" style={{ background: preview.accent, color: preview.base }} aria-hidden="true">
            ✓
          </span>
        )}
      </span>
      <span className="dsh-gruvbox-cardMeta">
        <span className="dsh-gruvbox-cardName">{theme.name}</span>
        <span className="dsh-gruvbox-cardTag">{scheme}</span>
      </span>
      <span className="dsh-gruvbox-cardDesc">{t(theme.descriptionKey)}</span>
      <span className="dsh-gruvbox-swatches" aria-hidden="true">
        {preview.swatches.map((color) => (
          <i key={color} style={{ background: color }} />
        ))}
      </span>
    </button>
  )
}

/**
 * Build the row component for one plugin instance.
 *
 * @param options - store, write actions, and the fallback translator.
 * @returns the React component registered into `settings.general.item`.
 */
export function makePickerRow(options: PickerRowOptions): ComponentType<PickerRowProps> {
  const { store, actions, translate } = options
  return function GruvboxPickerRow(props: PickerRowProps) {
    const t = props.t ?? translate
    const state = useSyncExternalStore(store.subscribe, store.getSnapshot)
    const standard = state.theme === 'default' && !state.followSystem
    const status = state.theme === 'default' && state.status === 'idle' ? 'standard' : state.status
    const error = status === 'failed' || status === 'readonly' || status === 'unavailable' || status === 'unsupported'
    const statusText = status === 'idle' ? '' : t(`state.${status}`)
    return (
      <div className="dsh-gruvbox-row">
        <div className="dsh-gruvbox-head">
          <span className="dsh-gruvbox-title">{t('row.title')}</span>
          <span className="dsh-gruvbox-desc">{t('row.description')}</span>
        </div>
        <div className="dsh-gruvbox-grid" role="group" aria-label={t('row.title')}>
          {GRUVBOX_THEMES.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              selected={state.theme === theme.id}
              t={t}
              onSelect={() => actions.select(theme.id)}
            />
          ))}
        </div>
        <div className="dsh-gruvbox-controls">
          <div className="dsh-gruvbox-follow">
            <button
              type="button"
              role="switch"
              aria-checked={state.followSystem}
              aria-labelledby="dsh-gruvbox-follow-label"
              aria-describedby="dsh-gruvbox-follow-desc"
              className="dsh-gruvbox-switch"
              disabled={state.theme === 'default'}
              onClick={() => actions.follow(!state.followSystem)}
            >
              <span className="dsh-gruvbox-switchThumb" />
            </button>
            <span className="dsh-gruvbox-followText">
              <span className="dsh-gruvbox-followLabel" id="dsh-gruvbox-follow-label">
                {t('follow.label')}
              </span>
              <span className="dsh-gruvbox-followDesc" id="dsh-gruvbox-follow-desc">
                {t('follow.description')}
              </span>
            </span>
          </div>
          <button
            type="button"
            className="dsh-gruvbox-reset"
            onClick={() => actions.reset()}
            disabled={standard}
            title={t('reset.description')}
          >
            {t('reset.label')}
          </button>
        </div>
        {statusText !== '' && (
          <span
            className={`dsh-gruvbox-status${error ? ' dsh-gruvbox-statusError' : ''}`}
            role="status"
            aria-live="polite"
          >
            {statusText}
          </span>
        )}
      </div>
    )
  }
}
