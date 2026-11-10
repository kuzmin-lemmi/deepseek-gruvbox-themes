/**
 * The seven shipped Gruvbox themes and the mapping from the original palette
 * onto DeepSeek Harness `--dsw-*` alias tokens.
 *
 * A theme definition is one `ThemeDefinition` for `ctx.theme.register`: a
 * color scheme plus a flat token map. The host theme presenter writes every
 * key onto `document.body`, so keys are CSS custom properties.
 */
import { GRUVBOX, withAlpha } from './palette.ts'
import type { HexColor } from './palette.ts'

/** The four Gruvbox flavor families shipped by this plugin. */
export type ThemeFamily = 'hard' | 'medium' | 'soft' | 'whale'

/** A registered theme id. */
export type ThemeId =
  | 'gruvbox-dark-hard'
  | 'gruvbox-dark-medium'
  | 'gruvbox-dark-soft'
  | 'gruvbox-light-hard'
  | 'gruvbox-light-medium'
  | 'gruvbox-light-soft'
  | 'gruvbox-whale'

/** One theme's literal colors, before the alias-token mapping. */
export interface ThemeSpec {
  id: ThemeId
  name: string
  descriptionKey: string
  colorScheme: 'light' | 'dark'
  family: ThemeFamily
  /** Application base background. */
  base: HexColor
  /** Primary raised surface. */
  layer1: HexColor
  /** Secondary nested surface. */
  layer2: HexColor
  /** Third surface level. */
  layer3: HexColor
  /** Overlay and popover background. */
  overlay: HexColor
  /** Sidebar column fill. */
  sidebar: HexColor
  /** Subtle, then stronger borders. */
  border1: HexColor
  border2: HexColor
  border3: HexColor
  border4: HexColor
  /** Primary, secondary, tertiary, caption text. */
  fg1: HexColor
  fg2: HexColor
  fg3: HexColor
  fg4: HexColor
  /** Inactive state and comments. */
  muted: HexColor
  /** Brand accent, its hover shade, a quieter companion, and text on the accent. */
  accent: HexColor
  accentHover: HexColor
  accentQuiet: HexColor
  onAccent: HexColor
  /** Semantic state colors. */
  success: HexColor
  successAlt: HexColor
  successTertiary: HexColor
  warn: HexColor
  warnAlt: HexColor
  warnTertiary: HexColor
  warnLabel: HexColor
  error: HexColor
  errorAlt: HexColor
  info: HexColor
  infoAlt: HexColor
  done: HexColor
  /** Code block background. */
  codeBg: HexColor
}

/** A registered theme plus the literal colors the preview cards need. */
export interface GruvboxTheme {
  id: ThemeId
  name: string
  descriptionKey: string
  colorScheme: 'light' | 'dark'
  family: ThemeFamily
  tokens: Readonly<Record<string, string>>
  preview: {
    base: string
    surface: string
    sidebar: string
    accent: string
    text: string
    /** Four swatches: base, surface, accent, success. */
    swatches: readonly string[]
  }
}

/**
 * Map one theme's literal colors onto the alias layer.
 *
 * The 14 tokens the live Theme provider reports are all covered, plus the
 * surfaces, borders, buttons, menus, scrollbars, Markdown and diff tokens the
 * shipped stylesheets consume, and the Shiki syntax variables that color code
 * blocks. Terminal colors intentionally follow `bg-base`/`label-primary`
 * because the sidebar terminal derives its palette from computed styles.
 *
 * @param spec - the theme's literal colors.
 * @returns every token the theme overrides.
 */
export function buildTokens(spec: ThemeSpec): Readonly<Record<string, string>> {
  const dark = spec.colorScheme === 'dark'
  const code = {
    constant: dark ? GRUVBOX.brightPurple : GRUVBOX.fadedPurple,
    string: dark ? GRUVBOX.brightGreen : GRUVBOX.fadedGreen,
    comment: GRUVBOX.gray,
    keyword: dark ? GRUVBOX.brightRed : GRUVBOX.fadedRed,
    parameter: dark ? GRUVBOX.brightYellow : GRUVBOX.fadedYellow,
    function: dark ? GRUVBOX.brightAqua : GRUVBOX.fadedAqua,
    stringExpression: dark ? GRUVBOX.brightGreen : GRUVBOX.fadedGreen,
    punctuation: dark ? GRUVBOX.light4 : GRUVBOX.dark3,
    link: dark ? GRUVBOX.brightBlue : GRUVBOX.fadedBlue,
  }
  return Object.freeze({
    // Surfaces
    '--dsw-alias-bg-base': spec.base,
    '--dsw-alias-bg-layer-1': spec.layer1,
    '--dsw-alias-bg-layer-2': spec.layer2,
    '--dsw-alias-bg-layer-3': spec.layer3,
    '--dsw-alias-bg-overlay': spec.overlay,
    '--dsw-alias-bg-module-platform': spec.layer1,
    '--dsw-alias-bg-skeleton': spec.layer2,
    '--dsw-alias-bg-document-preview': spec.layer1,
    '--dsw-alias-bg-document-selection': withAlpha(spec.accent, 0.35),
    '--dsw-alias-bg-multi-select': withAlpha(spec.accent, 0.18),
    '--dsw-alias-bg-mask-1': '#0000003d',
    '--dsw-alias-bg-mask-2': '#0000001f',
    '--dsw-alias-bg-mask-3': '#0000007a',
    '--dsw-alias-bg-mask-drop': '#0000004d',
    '--dsw-alias-bg-mask-photo': '#000000e0',

    // Borders
    '--dsw-alias-border-l1': spec.border1,
    '--dsw-alias-border-l2': spec.border2,
    '--dsw-alias-border-l3': spec.border3,
    '--dsw-alias-border-l4': spec.border4,
    '--dsw-alias-border-l2-darkmode-thin': spec.border2,
    '--dsw-alias-border-inverted': withAlpha(spec.onAccent, 0.35),
    '--dsw-alias-border-inverted2': withAlpha(spec.onAccent, 0.6),

    // Text
    '--dsw-alias-label-primary': spec.fg1,
    '--dsw-alias-label-secondary': spec.fg2,
    '--dsw-alias-label-tertiary': spec.fg3,
    '--dsw-alias-label-caption': spec.fg4,
    '--dsw-alias-label-dimmed': spec.muted,
    '--dsw-alias-label-primary-dimmed': spec.fg3,
    '--dsw-alias-label-primary-bluish': spec.fg1,
    '--dsw-alias-label-primary-foreground': spec.fg1,
    '--dsw-alias-label-primary-inverted': spec.onAccent,
    '--dsw-alias-label-shimmer': dark ? '#ffffff73' : '#0000004d',
    '--dsw-alias-label-deep-diving': spec.accent,
    '--dsw-alias-label-deep-diving-shimmer': spec.accentHover,
    '--dsw-alias-label-document-preview': spec.fg2,

    // Brand, links, buttons
    '--dsw-alias-brand-primary': spec.accent,
    '--dsw-alias-brand-primary-invert': spec.onAccent,
    '--dsw-alias-brand-text': spec.accent,
    '--dsw-alias-link': spec.info,
    '--dsw-alias-button-primary-fill': spec.accent,
    '--dsw-alias-button-primary-hover': spec.accentHover,
    '--dsw-alias-button-primary-dimmed': withAlpha(spec.accent, 0.22),
    '--dsw-alias-button-contrast-fill': spec.fg1,
    '--dsw-alias-button-elevated-fill': spec.layer2,
    '--dsw-alias-button-floating-fill': spec.layer2,
    '--dsw-alias-button-floating-hover': spec.layer3,
    '--dsw-alias-button-ghost-active-fill': withAlpha(spec.accent, 0.16),
    '--dsw-alias-button-ghost-active-hover': withAlpha(spec.accent, 0.24),
    '--dsw-alias-button-ghost-active-border': spec.accentQuiet,
    '--dsw-alias-button-info-fill': spec.info,
    '--dsw-alias-button-info-hover': spec.infoAlt,
    '--dsw-alias-button-tool-bar-fill': spec.layer1,
    '--dsw-alias-button-tool-bar-fill-invisible': 'transparent',
    '--dsw-alias-button-tool-bar-hover': spec.layer2,

    // States
    '--dsw-alias-state-error-primary': spec.error,
    '--dsw-alias-state-error-secondary': spec.errorAlt,
    '--dsw-alias-state-success-primary': spec.success,
    '--dsw-alias-state-success-secondary': spec.successAlt,
    '--dsw-alias-state-success-tertiary': spec.successTertiary,
    '--dsw-alias-state-warn-primary': spec.warn,
    '--dsw-alias-state-warn-secondary': spec.warnAlt,
    '--dsw-alias-state-warn-tertiary': spec.warnTertiary,
    '--dsw-alias-state-warn-label': spec.warnLabel,
    '--dsw-alias-state-idle-primary': spec.muted,
    '--dsw-alias-state-business-primary': spec.info,
    '--dsw-alias-state-business-tertiary': spec.infoAlt,
    '--dsw-alias-state-done-primary': spec.done,

    // Interaction
    '--dsw-alias-interactive-bg-hover': spec.layer2,
    '--dsw-alias-interactive-bg-hover-accent': withAlpha(spec.accent, 0.16),
    '--dsw-alias-interactive-bg-hover-danger': withAlpha(spec.error, 0.16),
    '--dsw-alias-interactive-bg-hover-solid': spec.layer3,
    '--dsw-alias-interactive-bg-active': spec.layer3,

    // Sidebar, menus, overlays, composer
    '--dsw-specific-sidebar-fill': spec.sidebar,
    '--dsw-specific-sidebar-nav-item-active': spec.layer1,
    '--dsw-specific-sidebar-nav-item-active-accent': spec.accent,
    '--dsw-specific-menu': withAlpha(spec.layer2, 0.96),
    '--dsw-menu-surface-fill': withAlpha(spec.layer2, 0.96),
    '--dsw-alias-menu-group-header-fill': withAlpha(spec.layer1, 0.94),
    '--dsw-alias-menu-icon': spec.fg2,
    '--dsw-specific-bubble': spec.layer1,
    '--dsw-specific-bubble-highlight': spec.layer2,
    '--dsw-specific-input-major': spec.layer1,
    '--dsw-specific-selector': spec.layer1,
    '--dsw-specific-tip': spec.layer3,
    '--dsw-alias-toast-bg': spec.layer3,
    '--dsw-alias-toast-label': spec.fg1,
    '--dsw-alias-tooltip-bg': spec.layer3,
    '--dsw-alias-tooltip-key-bg': spec.layer2,
    '--dsw-alias-turn-trigger-bg': spec.layer1,
    '--dsw-alias-turn-trigger-bg-hover': spec.layer2,
    '--dsw-alias-switch-thumb': spec.fg2,
    '--dsw-alias-settings-card-fill': spec.layer1,
    '--dsw-alias-settings-card-stroke': spec.border3,

    // Scrollbars
    '--dsw-alias-scrollbar-bg-l1': withAlpha(spec.border2, 0.55),
    '--dsw-alias-scrollbar-bg-l2': withAlpha(spec.border3, 0.7),
    '--dsw-alias-scrollbar-hover-l1': spec.border2,
    '--dsw-alias-scrollbar-hover-l2': spec.border3,

    // Markdown, code blocks, diffs
    '--dsw-alias-markdown-code-block': spec.codeBg,
    '--dsw-alias-markdown-code-block-banner': spec.layer2,
    '--dsw-alias-markdown-code-segment-selected': spec.layer3,
    '--dsw-alias-markdown-code-segment-unselected': spec.layer1,
    '--dsw-alias-markdown-inline-code': spec.layer2,
    '--dsw-alias-markdown-placeholder': spec.layer2,
    '--dsw-alias-markdown-tag': spec.layer2,
    '--dsw-alias-markdown-citation': withAlpha(spec.accent, 0.18),
    '--dsw-alias-code-diff-added': withAlpha(spec.success, 0.18),
    '--dsw-alias-code-diff-deleted': withAlpha(spec.error, 0.18),
    '--dsw-alias-file-diff-added-bg': withAlpha(spec.success, 0.16),
    '--dsw-alias-file-diff-added-gutter': withAlpha(spec.success, 0.27),
    '--dsw-alias-file-diff-added-marker': spec.success,
    '--dsw-alias-file-diff-deleted-bg': withAlpha(spec.error, 0.16),
    '--dsw-alias-file-diff-deleted-gutter': withAlpha(spec.error, 0.27),
    '--dsw-alias-file-diff-deleted-marker': spec.error,

    // Shiki syntax highlighting (the shiki.css variables are body-level)
    '--shiki-foreground': spec.fg1,
    '--shiki-background': spec.codeBg,
    '--shiki-token-constant': code.constant,
    '--shiki-token-string': code.string,
    '--shiki-token-comment': code.comment,
    '--shiki-token-keyword': code.keyword,
    '--shiki-token-parameter': code.parameter,
    '--shiki-token-function': code.function,
    '--shiki-token-string-expression': code.stringExpression,
    '--shiki-token-punctuation': code.punctuation,
    '--shiki-token-link': code.link,

    // Onboarding accent (first-run surfaces)
    '--dsw-alias-onboarding-accent': spec.accent,
  })
}

/** Shared dark color assignment for the three dark flavors and Whale. */
function darkSpec(
  id: ThemeId,
  name: string,
  descriptionKey: string,
  family: ThemeFamily,
  colors: {
    base: HexColor
    layer1: HexColor
    layer2: HexColor
    layer3: HexColor
    sidebar: HexColor
    accent: HexColor
    accentHover: HexColor
    accentQuiet: HexColor
  },
): ThemeSpec {
  return {
    id,
    name,
    descriptionKey,
    colorScheme: 'dark',
    family,
    base: colors.base,
    layer1: colors.layer1,
    layer2: colors.layer2,
    layer3: colors.layer3,
    overlay: colors.layer2,
    sidebar: colors.sidebar,
    border1: GRUVBOX.dark1,
    border2: GRUVBOX.dark2,
    border3: GRUVBOX.dark3,
    border4: GRUVBOX.dark4,
    fg1: GRUVBOX.light1,
    fg2: GRUVBOX.light2,
    fg3: GRUVBOX.light3,
    fg4: GRUVBOX.light4,
    muted: GRUVBOX.gray,
    accent: colors.accent,
    accentHover: colors.accentHover,
    accentQuiet: colors.accentQuiet,
    onAccent: GRUVBOX.dark0Hard,
    success: GRUVBOX.brightGreen,
    successAlt: GRUVBOX.neutralGreen,
    successTertiary: GRUVBOX.neutralAqua,
    warn: GRUVBOX.brightYellow,
    warnAlt: GRUVBOX.neutralYellow,
    warnTertiary: GRUVBOX.fadedYellow,
    warnLabel: GRUVBOX.brightYellow,
    error: GRUVBOX.brightRed,
    errorAlt: GRUVBOX.neutralRed,
    info: GRUVBOX.brightBlue,
    infoAlt: GRUVBOX.neutralBlue,
    done: GRUVBOX.brightPurple,
    codeBg: GRUVBOX.dark0Hard,
  }
}

/** Shared light color assignment for the three light flavors. */
function lightSpec(
  id: ThemeId,
  name: string,
  descriptionKey: string,
  family: ThemeFamily,
  colors: {
    base: HexColor
    layer1: HexColor
    layer2: HexColor
    layer3: HexColor
    sidebar: HexColor
    accent: HexColor
    accentHover: HexColor
    accentQuiet: HexColor
  },
): ThemeSpec {
  return {
    id,
    name,
    descriptionKey,
    colorScheme: 'light',
    family,
    base: colors.base,
    layer1: colors.layer1,
    layer2: colors.layer2,
    layer3: colors.layer3,
    overlay: colors.layer1,
    sidebar: colors.sidebar,
    border1: GRUVBOX.light1,
    border2: GRUVBOX.light2,
    border3: GRUVBOX.light3,
    border4: GRUVBOX.light4,
    fg1: GRUVBOX.dark1,
    fg2: GRUVBOX.dark2,
    fg3: GRUVBOX.dark3,
    fg4: GRUVBOX.dark4,
    muted: GRUVBOX.gray,
    accent: colors.accent,
    accentHover: colors.accentHover,
    accentQuiet: colors.accentQuiet,
    onAccent: GRUVBOX.light0Hard,
    success: GRUVBOX.fadedGreen,
    successAlt: GRUVBOX.neutralGreen,
    successTertiary: GRUVBOX.fadedAqua,
    warn: GRUVBOX.fadedYellow,
    warnAlt: GRUVBOX.neutralYellow,
    warnTertiary: GRUVBOX.fadedOrange,
    warnLabel: GRUVBOX.fadedOrange,
    error: GRUVBOX.fadedRed,
    errorAlt: GRUVBOX.neutralRed,
    info: GRUVBOX.fadedBlue,
    infoAlt: GRUVBOX.neutralBlue,
    done: GRUVBOX.fadedPurple,
    codeBg: colors.layer2,
  }
}

/** Every shipped theme, in picker order. */
export const GRUVBOX_THEMES: readonly GruvboxTheme[] = Object.freeze([
  {
    ...darkSpec('gruvbox-dark-hard', 'Gruvbox Dark Hard', 'themes.darkHard', 'hard', {
      base: GRUVBOX.dark0Hard,
      layer1: GRUVBOX.dark0,
      layer2: GRUVBOX.dark0Soft,
      layer3: GRUVBOX.dark1,
      sidebar: GRUVBOX.dark0Hard,
      accent: GRUVBOX.brightOrange,
      accentHover: GRUVBOX.neutralOrange,
      accentQuiet: GRUVBOX.neutralYellow,
    }),
  },
  {
    ...darkSpec('gruvbox-dark-medium', 'Gruvbox Dark Medium', 'themes.darkMedium', 'medium', {
      base: GRUVBOX.dark0,
      layer1: GRUVBOX.dark0Soft,
      layer2: GRUVBOX.dark1,
      layer3: GRUVBOX.dark2,
      sidebar: GRUVBOX.dark0Hard,
      accent: GRUVBOX.brightYellow,
      accentHover: GRUVBOX.neutralYellow,
      accentQuiet: GRUVBOX.brightOrange,
    }),
  },
  {
    ...darkSpec('gruvbox-dark-soft', 'Gruvbox Dark Soft', 'themes.darkSoft', 'soft', {
      base: GRUVBOX.dark0Soft,
      layer1: GRUVBOX.dark1,
      layer2: GRUVBOX.dark2,
      layer3: GRUVBOX.dark3,
      sidebar: GRUVBOX.dark0,
      accent: GRUVBOX.brightPurple,
      accentHover: GRUVBOX.neutralPurple,
      accentQuiet: GRUVBOX.brightBlue,
    }),
  },
  {
    ...lightSpec('gruvbox-light-hard', 'Gruvbox Light Hard', 'themes.lightHard', 'hard', {
      base: GRUVBOX.light0Hard,
      layer1: GRUVBOX.light0,
      layer2: GRUVBOX.light0Soft,
      layer3: GRUVBOX.light1,
      sidebar: GRUVBOX.light0,
      accent: GRUVBOX.fadedRed,
      accentHover: GRUVBOX.neutralRed,
      accentQuiet: GRUVBOX.fadedOrange,
    }),
  },
  {
    ...lightSpec('gruvbox-light-medium', 'Gruvbox Light Medium', 'themes.lightMedium', 'medium', {
      base: GRUVBOX.light0,
      layer1: GRUVBOX.light0Soft,
      layer2: GRUVBOX.light1,
      layer3: GRUVBOX.light2,
      sidebar: GRUVBOX.light0Soft,
      accent: GRUVBOX.fadedOrange,
      accentHover: GRUVBOX.neutralOrange,
      accentQuiet: GRUVBOX.fadedYellow,
    }),
  },
  {
    ...lightSpec('gruvbox-light-soft', 'Gruvbox Light Soft', 'themes.lightSoft', 'soft', {
      base: GRUVBOX.light0Soft,
      layer1: GRUVBOX.light1,
      layer2: GRUVBOX.light2,
      layer3: GRUVBOX.light3,
      sidebar: GRUVBOX.light1,
      accent: GRUVBOX.fadedYellow,
      accentHover: GRUVBOX.neutralYellow,
      accentQuiet: GRUVBOX.fadedOrange,
    }),
  },
  {
    ...darkSpec('gruvbox-whale', 'Gruvbox Whale Edition', 'themes.whale', 'whale', {
      base: GRUVBOX.dark0,
      layer1: GRUVBOX.dark0Soft,
      layer2: GRUVBOX.dark1,
      layer3: GRUVBOX.dark2,
      sidebar: GRUVBOX.dark0Hard,
      accent: GRUVBOX.brightBlue,
      accentHover: GRUVBOX.neutralBlue,
      accentQuiet: GRUVBOX.brightAqua,
    }),
  },
].map((spec) => {
  const tokens = buildTokens(spec)
  return Object.freeze({
    id: spec.id,
    name: spec.name,
    descriptionKey: spec.descriptionKey,
    colorScheme: spec.colorScheme,
    family: spec.family,
    tokens,
    preview: Object.freeze({
      base: spec.base,
      surface: spec.layer1,
      sidebar: spec.sidebar,
      accent: spec.accent,
      text: spec.fg1,
      swatches: Object.freeze([spec.base, spec.layer1, spec.accent, spec.success]),
    }),
  })
}))

/** Theme ids in picker order. */
export const THEME_IDS: readonly ThemeId[] = Object.freeze(GRUVBOX_THEMES.map((theme) => theme.id))

/** Theme lookup by id. */
export const THEMES_BY_ID: Readonly<Record<ThemeId, GruvboxTheme>> = Object.freeze(
  Object.fromEntries(GRUVBOX_THEMES.map((theme) => [theme.id, theme])) as Record<ThemeId, GruvboxTheme>,
)
