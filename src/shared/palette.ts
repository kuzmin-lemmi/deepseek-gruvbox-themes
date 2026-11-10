/**
 * The original Gruvbox palette (morhetz/gruvbox) and small color helpers.
 *
 * Nothing in this module knows about DeepSeek Harness; the theme definitions
 * in `themes.ts` map these colors onto `--dsw-*` design tokens.
 */

/** Official Gruvbox colors, by their upstream names. */
export const GRUVBOX = Object.freeze({
  dark0Hard: '#1d2021',
  dark0: '#282828',
  dark0Soft: '#32302f',
  dark1: '#3c3836',
  dark2: '#504945',
  dark3: '#665c54',
  dark4: '#7c6f64',
  gray: '#928374',
  light0Hard: '#f9f5d7',
  light0: '#fbf1c7',
  light0Soft: '#f2e5bc',
  light1: '#ebdbb2',
  light2: '#d5c4a1',
  light3: '#bdae93',
  light4: '#a89984',
  brightRed: '#fb4934',
  brightGreen: '#b8bb26',
  brightYellow: '#fabd2f',
  brightBlue: '#83a598',
  brightPurple: '#d3869b',
  brightAqua: '#8ec07c',
  brightOrange: '#fe8019',
  neutralRed: '#cc241d',
  neutralGreen: '#98971a',
  neutralYellow: '#d79921',
  neutralBlue: '#458588',
  neutralPurple: '#b16286',
  neutralAqua: '#689d6a',
  neutralOrange: '#d65d0e',
  fadedRed: '#9d0006',
  fadedGreen: '#79740e',
  fadedYellow: '#b57614',
  fadedBlue: '#076678',
  fadedPurple: '#8f3f71',
  fadedAqua: '#427b58',
  fadedOrange: '#af3a03',
} as const)

/** A `#rrggbb` color string. */
export type HexColor = `#${string}`

/**
 * Append an alpha channel to a six-digit hex color.
 *
 * @param color - six-digit hex color.
 * @param alpha - opacity from 0 to 1.
 * @returns an eight-digit hex color.
 */
export function withAlpha(color: HexColor, alpha: number): string {
  const clamped = Math.max(0, Math.min(1, alpha))
  const byte = Math.round(clamped * 255)
    .toString(16)
    .padStart(2, '0')
  return `${color}${byte}` as HexColor
}

/**
 * Linear sRGB mix of two colors.
 *
 * Used for the few places where a palette accent needs to move toward another
 * palette tone (for example, a link color that must clear a contrast target on
 * a light surface) while staying inside the Gruvbox family.
 *
 * @param from - starting color.
 * @param to - target color.
 * @param weight - share of `to` from 0 to 1.
 * @returns the mixed color.
 */
export function mixHex(from: HexColor, to: HexColor, weight: number): HexColor {
  const clamped = Math.max(0, Math.min(1, weight))
  const channels = [1, 3, 5].map((offset) => {
    const a = Number.parseInt(from.slice(offset, offset + 2), 16)
    const b = Number.parseInt(to.slice(offset, offset + 2), 16)
    return Math.round(a * (1 - clamped) + b * clamped)
      .toString(16)
      .padStart(2, '0')
  })
  return `#${channels.join('')}` as HexColor
}

/** WCAG relative luminance of a six-digit hex color. */
export function luminance(color: HexColor): number {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16) / 255)
  const [r, g, b] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * WCAG contrast ratio between two opaque colors.
 *
 * @param foreground - text or icon color.
 * @param background - surface color.
 * @returns a ratio from 1 to 21.
 */
export function contrastRatio(foreground: HexColor, background: HexColor): number {
  const a = luminance(foreground)
  const b = luminance(background)
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}
