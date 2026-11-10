/**
 * Generate palette previews for the README and docs.
 *
 * These are generated illustrations, not screenshots of the running app. Each
 * one is drawn from the same theme definitions the plugin registers, so the
 * colors cannot drift from the shipped tokens.
 *
 * Usage: node scripts/previews.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { GRUVBOX_THEMES } from '../src/shared/themes.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'docs', 'previews')

/**
 * Escape text for SVG.
 * @param {string} value
 * @returns {string}
 */
function esc(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

/**
 * Render one theme preview.
 * @param {(typeof GRUVBOX_THEMES)[number]} theme
 * @returns {string}
 */
function previewSvg(theme) {
  const t = theme.tokens
  const base = t['--dsw-alias-bg-base']
  const layer1 = t['--dsw-alias-bg-layer-1']
  const layer2 = t['--dsw-alias-bg-layer-2']
  const sidebar = t['--dsw-specific-sidebar-fill']
  const border = t['--dsw-alias-border-l2']
  const border3 = t['--dsw-alias-border-l3']
  const text = t['--dsw-alias-label-primary']
  const text2 = t['--dsw-alias-label-secondary']
  const text3 = t['--dsw-alias-label-tertiary']
  const accent = t['--dsw-alias-brand-primary']
  const onAccent = t['--dsw-alias-label-primary-inverted']
  const codeBg = t['--dsw-alias-markdown-code-block']
  const success = t['--dsw-alias-state-success-primary']
  const warn = t['--dsw-alias-state-warn-primary']
  const error = t['--dsw-alias-state-error-primary']
  const quote = theme.descriptionKey

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 580" width="720" height="580" role="img" aria-label="${esc(theme.name)} preview">
  <rect width="720" height="580" fill="${base}"/>
  <rect x="24" y="24" width="672" height="392" rx="18" fill="${layer1}" stroke="${border}"/>
  <rect x="40" y="40" width="180" height="360" rx="12" fill="${sidebar}" stroke="${border}"/>
  <circle cx="58" cy="64" r="6" fill="${accent}"/>
  <text x="72" y="69" fill="${text}" font-family="Segoe UI, system-ui, sans-serif" font-size="14" font-weight="600">DeepSeek</text>
  <text x="58" y="100" fill="${text2}" font-family="Segoe UI, system-ui, sans-serif" font-size="12">Assistant</text>
  <rect x="52" y="112" width="140" height="30" rx="8" fill="${layer2}"/>
  <text x="64" y="132" fill="${accent}" font-family="Segoe UI, system-ui, sans-serif" font-size="12">+ Новый чат</text>
  <text x="56" y="172" fill="${text3}" font-family="Segoe UI, system-ui, sans-serif" font-size="11">История</text>
  <rect x="52" y="184" width="128" height="8" rx="4" fill="${text3}" opacity="0.34"/>
  <rect x="52" y="202" width="104" height="8" rx="4" fill="${text3}" opacity="0.24"/>
  <rect x="52" y="220" width="118" height="8" rx="4" fill="${text3}" opacity="0.24"/>
  <text x="56" y="262" fill="${text3}" font-family="Segoe UI, system-ui, sans-serif" font-size="11">Плагины</text>
  <rect x="52" y="274" width="112" height="8" rx="4" fill="${text3}" opacity="0.24"/>
  <rect x="52" y="292" width="92" height="8" rx="4" fill="${text3}" opacity="0.24"/>
  <rect x="52" y="352" width="140" height="30" rx="8" fill="${layer2}" stroke="${border3}"/>
  <text x="64" y="372" fill="${text3}" font-family="Segoe UI, system-ui, sans-serif" font-size="12">Сообщение…</text>
  <text x="236" y="69" fill="${text}" font-family="Segoe UI, system-ui, sans-serif" font-size="14" font-weight="600">Assistant</text>
  <circle cx="662" cy="64" r="4" fill="${accent}"/>
  <rect x="416" y="92" width="248" height="44" rx="12" fill="${accent}"/>
  <text x="432" y="119" fill="${onAccent}" font-family="Segoe UI, system-ui, sans-serif" font-size="13">Напиши функцию</text>
  <rect x="248" y="156" width="330" height="126" rx="10" fill="${codeBg}" stroke="${border}"/>
  <text x="262" y="178" fill="${text3}" font-family="Cascadia Code, Consolas, monospace" font-size="11"># Python</text>
  <text x="262" y="202" fill="${text2}" font-family="Cascadia Code, Consolas, monospace" font-size="13"><tspan fill="${text3}">def</tspan> <tspan fill="${accent}">hello</tspan>():</text>
  <text x="276" y="226" fill="${text2}" font-family="Cascadia Code, Consolas, monospace" font-size="13"><tspan fill="${text3}">return</tspan> <tspan fill="${success}">"Hello"</tspan></text>
  <rect x="248" y="300" width="416" height="58" rx="14" fill="${layer1}" stroke="${border3}"/>
  <text x="264" y="334" fill="${text3}" font-family="Segoe UI, system-ui, sans-serif" font-size="13">Сообщение…</text>
  <path d="M636 320l14 9-14 9z" fill="${accent}"/>
  <text x="26" y="458" fill="${text}" font-family="Segoe UI, system-ui, sans-serif" font-size="22" font-weight="600">${esc(theme.name)}</text>
  <text x="26" y="484" fill="${text3}" font-family="Segoe UI, system-ui, sans-serif" font-size="13">${esc(quote)} · ${theme.colorScheme}</text>
  <g font-family="Segoe UI, system-ui, sans-serif" font-size="10">
    ${[base, layer1, accent, success, warn, error]
      .map((color, index) => {
        const x = 26 + index * 92
        return `<rect x="${x}" y="502" width="78" height="24" rx="6" fill="${color}" stroke="${border3}"/><text x="${x}" y="544" fill="${text3}">${color}</text>`
      })
      .join('\n    ')}
  </g>
</svg>
`
}

/**
 * Build the HTML gallery.
 * @param {readonly (typeof GRUVBOX_THEMES)[number][]} themes
 * @returns {string}
 */
function galleryHtml(themes) {
  const cards = themes
    .map(
      (theme) => `<article>
      <img src="${theme.id}.svg" alt="${esc(theme.name)} preview" width="720" height="580">
      <h2>${esc(theme.name)}</h2>
      <p>${esc(theme.id)}</p>
    </article>`,
    )
    .join('\n')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>deepseek-gruvbox-themes previews</title>
<style>
  body { margin: 0; padding: 32px; background: #151515; color: #ebdbb2; font-family: system-ui, sans-serif; }
  h1 { font-size: 24px; font-weight: 600; }
  p { color: #a89984; }
  main { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px; }
  article { background: #1d2021; border: 1px solid #3c3836; border-radius: 14px; padding: 12px; }
  img { display: block; width: 100%; height: auto; border-radius: 10px; }
  h2 { margin: 12px 4px 2px; font-size: 16px; }
  article p { margin: 0 4px 4px; font-size: 12px; }
</style>
</head>
<body>
<h1>Gruvbox themes for DeepSeek Harness</h1>
<p>Generated palette previews. These are not screenshots of the application.</p>
<main>
${cards}
</main>
</body>
</html>
`
}

await mkdir(outDir, { recursive: true })
await Promise.all(GRUVBOX_THEMES.map((theme) => writeFile(join(outDir, `${theme.id}.svg`), previewSvg(theme))))
await writeFile(join(outDir, 'index.html'), galleryHtml(GRUVBOX_THEMES))
await writeFile(
  join(outDir, 'themes.json'),
  JSON.stringify(
    GRUVBOX_THEMES.map((theme) => ({
      id: theme.id,
      name: theme.name,
      colorScheme: theme.colorScheme,
      family: theme.family,
      base: theme.tokens['--dsw-alias-bg-base'],
      layer1: theme.tokens['--dsw-alias-bg-layer-1'],
      layer2: theme.tokens['--dsw-alias-bg-layer-2'],
      sidebar: theme.tokens['--dsw-specific-sidebar-fill'],
      border: theme.tokens['--dsw-alias-border-l2'],
      text: theme.tokens['--dsw-alias-label-primary'],
      text2: theme.tokens['--dsw-alias-label-secondary'],
      text3: theme.tokens['--dsw-alias-label-tertiary'],
      accent: theme.tokens['--dsw-alias-brand-primary'],
      onAccent: theme.tokens['--dsw-alias-label-primary-inverted'],
      codeBg: theme.tokens['--dsw-alias-markdown-code-block'],
      success: theme.tokens['--dsw-alias-state-success-primary'],
      warn: theme.tokens['--dsw-alias-state-warn-primary'],
      error: theme.tokens['--dsw-alias-state-error-primary'],
    })),
    null,
    2,
  ),
)
console.log(`wrote ${GRUVBOX_THEMES.length} previews to docs/previews`)
